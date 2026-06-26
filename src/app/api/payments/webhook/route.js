import { successResponse, errorResponse } from "@/lib/response";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { handleWebhookEvent } from "@/features/payment/payment.service";

export const POST = async (req) => {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    const rawBody = await req.text();

    if (!signature) {
      return errorResponse("Missing Razorpay webhook signature", 400);
    }

    if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
      return errorResponse("Invalid Razorpay webhook signature", 400);
    }

    const payload = JSON.parse(rawBody);
    await handleWebhookEvent({
      event: payload.event,
      payload,
    });

    return successResponse(null, "Webhook processed successfully");
  } catch (error) {
    return errorResponse(error.message, 400);
  }
};
