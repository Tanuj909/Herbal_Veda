import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth";
import { createOnlinePaymentIntent } from "@/features/payment/payment.service";

export const POST = withAuth()(async (req) => {
  try {
    const user = req.user;
    const body = await req.json();
    const { address_id, items } = body;

    if (!address_id) {
      return errorResponse("Shipping address (address_id) is required", 400);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse("Order items are required and must be an array", 400);
    }

    const result = await createOnlinePaymentIntent(user.id, address_id, items);

    return successResponse(
      {
        order: result.order,
        razorpay_order: result.razorpay_order,
        summary: result.summary,
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
      "Razorpay order created successfully",
      201
    );
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
