import { successResponse, errorResponse } from "@/lib/response";
import * as orderService from "@/features/order/order.service";
import { withAuth } from "@/lib/auth";

/**
 * GET /api/orders
 * Protected endpoint to fetch orders list.
 * Admins/SuperAdmins view all orders; Customers only view their own.
 */
export const GET = withAuth()(async (req) => {
  try {
    const user = req.user;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filters = {};
    if (status) {
      filters.status = status;
    }

    // Role check: If not admin/super_admin, force filtering by user's own ID
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      filters.user_id = user.id;
    } else {
      // Admin can filter by customer user_id if passed
      const customerId = searchParams.get("user_id");
      if (customerId) {
        filters.user_id = customerId;
      }
    }

    const orders = await orderService.getAllOrders(filters);
    return successResponse(orders, "Orders retrieved successfully");
  } catch (error) {
    return errorResponse(error.message, 500);
  }
});

/**
 * POST /api/orders
 * Protected endpoint to place a new order.
 */
export const POST = withAuth()(async (req) => {
  try {
    const user = req.user;
    const body = await req.json();
    const { address_id, items, payment_method = "COD" } = body;

    if (!address_id) {
      return errorResponse("Shipping address (address_id) is required", 400);
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse("Order items are required and must be an array", 400);
    }

    if (String(payment_method).toUpperCase() === "ONLINE") {
      return errorResponse("Use /api/payments/create-order for online payments", 400);
    }

    const order = await orderService.createOrder(user.id, address_id, items, "COD");

    return successResponse(order, "Order placed successfully", 201);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
