import * as orderRepository from "./order.repository";
import { countProducts } from "../product/product.repository";
import { countUsers } from "../auth/auth.repository";

/**
 * Fetch all orders.
 */
export const getAllOrders = async (filters = {}) => {
  return orderRepository.findAllOrders(filters);
};

/**
 * Fetch a single order by ID.
 */
export const getOrderById = async (id) => {
  const order = await orderRepository.findOrderById(id);
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
};

/**
 * Update the status of an order and record history.
 */
export const updateOrderStatus = async (id, status, remarks = "", changedByUserId = null) => {
  const order = await orderRepository.findOrderById(id);
  if (!order) {
    throw new Error("Order not found");
  }

  // 1. Perform update
  const updatedOrder = await orderRepository.updateOrder(id, { status });

  // 2. Create history log
  await orderRepository.createStatusHistory({
    order_id: id,
    status,
    changed_by: changedByUserId,
    remarks: remarks || `Order status updated to ${status}`,
  });

  return updatedOrder;
};

/**
 * Calculate dashboard sales summary metrics.
 */
export const getDashboardStats = async () => {
  const totalRevenue = await orderRepository.sumRevenue();
  const totalOrders = await orderRepository.countOrders();
  const totalProducts = await countProducts();
  const totalUsers = await countUsers();
  return {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalUsers,
  };
};

/**
 * Calculate order summary (subtotal, shipping, GST, discount, grand total).
 */
export const getOrderSummary = async (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Items are required to calculate summary");
  }

  const { findProductById } = await import("../product/product.repository");
  let subtotal = 0;
  let gst = 0;
  const processedItems = [];

  for (const item of items) {
    const product = await findProductById(item.product_id);
    if (!product) {
      throw new Error(`Product not found: ${item.product_id}`);
    }
    if (!product.is_active) {
      throw new Error(`Product is currently inactive: ${product.name}`);
    }
    if (product.quantity < item.quantity) {
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }

    const price = parseFloat(product.price);
    const gstRate = parseFloat(product.gst || 0);
    const itemTotal = price * item.quantity;
    const itemGst = parseFloat(((itemTotal * gstRate) / 100).toFixed(2));
    subtotal += itemTotal;
    gst += itemGst;

    processedItems.push({
      product_id: product.id.toString(),
      product_name: product.name,
      product_price: price,
      gst_rate: gstRate,
      gst_amount: itemGst,
      quantity: item.quantity,
      total_price: itemTotal,
    });
  }

  // 1. Calculate shipping: Free shipping on orders >= $50, else $5 flat rate
  const shipping = subtotal >= 50 ? 0.00 : 5.00;

  // 2. Calculate GST from the GST percentage stored on each product.
  gst = parseFloat(gst.toFixed(2));

  // 3. Calculate discount: 0.00 for now
  const discount = 0.00;

  // 4. Calculate grand total
  const grandTotal = parseFloat((subtotal + shipping + gst - discount).toFixed(2));

  return {
    subtotal,
    shipping,
    gst,
    tax: gst,
    discount,
    grand_total: grandTotal,
    items: processedItems,
  };
};

/**
 * Create a new order for a user.
 */
export const createOrder = async (userId, addressId, items) => {
  // 1. Verify address exists and belongs to user
  const prisma = (await import("@/lib/prisma")).default;
  const address = await prisma.address.findUnique({
    where: { id: BigInt(addressId) }
  });

  if (!address || address.user_id.toString() !== userId.toString()) {
    throw new Error("Invalid or missing shipping address");
  }

  // 2. Recalculate order summary (recomputes subtotal, shipping, GST, discount, grand_total, processes items)
  const summary = await getOrderSummary(items);

  // 3. Generate unique order number (format: VEDA-YYYYMMDD-RANDOM)
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `VEDA-${today}-${rand}`;

  // 4. Create order using repository (runs inside transaction, decrements stock)
  return orderRepository.createOrder({
    user_id: userId,
    address_id: addressId,
    order_number: orderNumber,
    subtotal: summary.subtotal,
    shipping_charge: summary.shipping,
    gst: summary.gst,
    total_amount: summary.grand_total, // stores Grand Total (subtotal + shipping + GST - discount)
    items: summary.items
  });
};
