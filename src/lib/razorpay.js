import crypto from "crypto";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

export const getRazorpayConfig = () => {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!keyId || !keySecret || !webhookSecret) {
    throw new Error("Razorpay environment variables are not configured");
  }

  return { keyId, keySecret, webhookSecret };
};

export const createRazorpayOrder = async ({ amount, currency = "INR", receipt, notes = {} }) => {
  const { keyId, keySecret } = getRazorpayConfig();

  const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount,
      currency,
      receipt,
      payment_capture: 1,
      notes,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.description || data?.error?.message || "Failed to create Razorpay order");
  }

  return data;
};

export const verifyRazorpaySignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const { keySecret } = getRazorpayConfig();
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  return expectedSignature === razorpay_signature;
};

export const verifyRazorpayWebhookSignature = (rawBody, razorpaySignature) => {
  const { webhookSecret } = getRazorpayConfig();

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  return expectedSignature === razorpaySignature;
};
