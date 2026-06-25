import { successResponse, errorResponse } from "@/lib/response";
import * as orderService from "@/features/order/order.service";
import { withAuth } from "@/lib/auth";

/**
 * GET /api/orders/[id]
 * Protected endpoint to fetch detailed order information.
 * Customers can only retrieve their own orders; Admins can retrieve any.
 */
export const GET = withAuth()(async (req, { params }) => {
  try {
    const { id } = await params;
    const user = req.user;
    const order = await orderService.getOrderById(id);

    // Access check: Customer cannot view other people's orders
    if (
      user.role !== "ADMIN" &&
      user.role !== "SUPER_ADMIN" &&
      order.user_id.toString() !== user.id.toString()
    ) {
      return errorResponse("Access denied: You cannot view this order", 403);
    }

    return successResponse(order, "Order details retrieved successfully");
  } catch (error) {
    return errorResponse(error.message, 404);
  }
});

/**
 * PUT /api/orders/[id]
 * Protected endpoint (ADMIN/SUPER_ADMIN only) to update order status.
 */
export const PUT = withAuth(["ADMIN", "SUPER_ADMIN"])(async (req, { params }) => {
  try {
    const { id } = await params;
    const user = req.user;
    const body = await req.json();
    const { status, remarks } = body;

    if (!status) {
      return errorResponse("Order status is required", 400);
    }

    const updatedOrder = await orderService.updateOrderStatus(
      id,
      status,
      remarks,
      user.id
    );

    return successResponse(updatedOrder, "Order status updated successfully");
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
