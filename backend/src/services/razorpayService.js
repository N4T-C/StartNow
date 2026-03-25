const crypto = require("crypto");

let Razorpay = null;
try {
  // Optional dependency for future paid flow. Works in mock mode even if not installed.
  Razorpay = require("razorpay");
} catch {
  Razorpay = null;
}

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || !Razorpay) {
    return null;
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

async function createOrder({ amountInPaise, receipt, notes }) {
  const client = getRazorpayClient();

  if (!client) {
    return {
      mode: "mock",
      orderId: `mock_order_${Date.now()}`,
      currency: "INR",
      amount: amountInPaise,
      receipt,
      notes,
    };
  }

  const order = await client.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    notes,
  });

  return {
    mode: "live",
    orderId: order.id,
    currency: order.currency,
    amount: order.amount,
    receipt: order.receipt,
    notes: order.notes,
  };
}

function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
  return expected === razorpaySignature;
}

module.exports = { createOrder, verifyPaymentSignature };
