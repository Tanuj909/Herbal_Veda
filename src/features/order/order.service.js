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
