import prisma from "@/lib/prisma";
import * as orderService from "@/features/order/order.service";
import * as orderRepository from "@/features/order/order.repository";
import * as paymentRepository from "./payment.repository";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/lib/razorpay";

const generateOrderNumber = () => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `VEDA-${today}-${rand}`;
};

const ensureAddressBelongsToUser = async (userId, addressId) => {
  const address = await prisma.address.findUnique({
    where: { id: BigInt(addressId) },
  });

  if (!address || address.user_id.toString() !== userId.toString()) {
    throw new Error("Invalid or missing shipping address");
  }

  return address;
};

export const createOnlinePaymentIntent = async (userId, addressId, items) => {
  await ensureAddressBelongsToUser(userId, addressId);
  const summary = await orderService.getOrderSummary(items);
  const orderNumber = generateOrderNumber();

  const razorpayOrder = await createRazorpayOrder({
    amount: Math.round(summary.grand_total * 100),
    currency: "INR",
    receipt: orderNumber,
    notes: {
      user_id: userId.toString(),
      address_id: addressId.toString(),
      order_number: orderNumber,
    },
  });

  const order = await orderRepository.createOrder({
    user_id: userId,
    address_id: addressId,
    order_number: orderNumber,
    subtotal: summary.subtotal,
    shipping_charge: summary.shipping,
    gst: summary.gst,
    total_amount: summary.grand_total,
    payment_method: "ONLINE",
    payment_status: "PENDING",
    razorpay_order_id: razorpayOrder.id,
    items: summary.items,
  });

  return {
    order,
    razorpay_order: razorpayOrder,
    summary,
  };
};

export const finalizeOnlinePayment = async ({
  userId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  if (!verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature })) {
    throw new Error("Invalid payment signature");
  }

  const payment = await paymentRepository.findPaymentByRazorpayOrderId(razorpay_order_id);
  if (!payment) {
    throw new Error("Payment record not found");
  }

  const order = await orderRepository.findOrderById(payment.order_id);
  if (!order) {
    throw new Error("Order not found");
  }

  if (userId && order.user_id.toString() !== userId.toString()) {
    throw new Error("You are not allowed to verify this payment");
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    await paymentRepository.updatePaymentByRazorpayOrderId(tx, razorpay_order_id, {
      razorpay_payment_id,
      razorpay_signature,
      status: "SUCCESS",
      paid_at: new Date(),
    });

    await orderRepository.updateOrder(order.id, {
      status: "CONFIRMED",
      payment_status: "SUCCESS",
      payment_method: "ONLINE",
    }, tx);

    await orderRepository.createStatusHistory({
      order_id: order.id,
      status: "CONFIRMED",
      changed_by: userId || order.user_id,
      remarks: "Online payment verified successfully",
    }, tx);

    return orderRepository.findOrderById(order.id);
  });

  return updatedOrder;
};

export const handleWebhookEvent = async ({ event, payload }) => {
  if (event === "payment.captured") {
    const paymentEntity = payload?.payment?.entity;
    if (!paymentEntity?.order_id) return null;

    const payment = await paymentRepository.findPaymentByRazorpayOrderId(paymentEntity.order_id);
    if (!payment) return null;
    const order = await orderRepository.findOrderById(payment.order_id);
    if (!order) return null;

    await prisma.$transaction(async (tx) => {
      await paymentRepository.updatePaymentByRazorpayOrderId(tx, paymentEntity.order_id, {
        razorpay_payment_id: paymentEntity.id,
        status: "SUCCESS",
        paid_at: new Date(),
      });

      await orderRepository.updateOrder(payment.order_id, {
        status: "CONFIRMED",
        payment_status: "SUCCESS",
        payment_method: "ONLINE",
      }, tx);

      await orderRepository.createStatusHistory({
        order_id: payment.order_id,
        status: "CONFIRMED",
        changed_by: order.user_id,
        remarks: "Online payment captured via webhook",
      }, tx);
    });

    return true;
  }

  if (event === "payment.failed") {
    const paymentEntity = payload?.payment?.entity;
    if (!paymentEntity?.order_id) return null;

    const payment = await paymentRepository.findPaymentByRazorpayOrderId(paymentEntity.order_id);
    if (!payment) return null;

    await paymentRepository.updatePaymentByRazorpayOrderId(prisma, paymentEntity.order_id, {
      status: "FAILED",
    });

    await orderRepository.updateOrder(payment.order_id, {
      payment_status: "FAILED",
    }, prisma);

    return true;
  }

  return null;
};
