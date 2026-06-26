import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth";
import { finalizeOnlinePayment } from "@/features/payment/payment.service";

export const POST = withAuth()(async (req) => {
  try {
    const user = req.user;
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse("Razorpay payment verification data is incomplete", 400);
    }

    const order = await finalizeOnlinePayment({
      userId: user.id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return successResponse(order, "Payment verified successfully");
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
