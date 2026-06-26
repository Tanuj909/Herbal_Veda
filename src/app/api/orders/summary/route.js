import { successResponse, errorResponse } from "@/lib/response";
import * as orderService from "@/features/order/order.service";
import { withAuth } from "@/lib/auth";

/**
 * POST /api/orders/summary
 * Protected endpoint to fetch detailed order cost summary before checkout.
 * Receives [{ product_id, quantity }] and returns subtotal, shipping, GST, discount, and grand total.
 */
export const POST = withAuth()(async (req) => {
  try {
    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse("Order items are required and must be a non-empty array", 400);
    }

    const summary = await orderService.getOrderSummary(items);
    return successResponse(summary, "Order summary calculated successfully");
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
