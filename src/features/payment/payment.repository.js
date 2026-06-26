import prisma from "@/lib/prisma";

const getClient = (db = prisma) => db;

export const createPayment = async (db, data) => {
  return getClient(db).payment.create({ data });
};

export const updatePaymentByOrderId = async (db, orderId, data) => {
  return getClient(db).payment.updateMany({
    where: { order_id: BigInt(orderId) },
    data,
  });
};

export const updatePaymentByRazorpayOrderId = async (db, razorpayOrderId, data) => {
  return getClient(db).payment.updateMany({
    where: { razorpay_order_id: razorpayOrderId },
    data,
  });
};

export const findPaymentByOrderId = async (orderId) => {
  return prisma.payment.findFirst({
    where: { order_id: BigInt(orderId) },
    orderBy: { created_at: "desc" },
  });
};

export const findPaymentByRazorpayOrderId = async (razorpayOrderId) => {
  return prisma.payment.findFirst({
    where: { razorpay_order_id: razorpayOrderId },
    orderBy: { created_at: "desc" },
  });
};

export const deletePaymentsByOrderId = async (db, orderId) => {
  return getClient(db).payment.deleteMany({
    where: { order_id: BigInt(orderId) },
  });
};
