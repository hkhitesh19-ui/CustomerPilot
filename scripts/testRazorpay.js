require('dotenv').config({ path: '.env' });
const Razorpay = require('razorpay');

console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "Exists" : "Missing");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testOrder() {
  try {
    const options = {
      amount: 4999 * 100, // amount in paise
      currency: "INR",
      receipt: `rcpt_test_${Date.now().toString().slice(-6)}`,
      notes: {
        merchantId: "test_merchant",
        planId: "growth_180",
      },
    };

    const order = await razorpay.orders.create(options);
    console.log("Order created successfully:", order);
  } catch (err) {
    console.error("Razorpay SDK Error:", err);
  }
}

testOrder();
