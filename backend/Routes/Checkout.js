const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Orders");
const mongoose = require('mongoose');

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { products, email, order_date } = req.body;

    // Generate a MongoDB compatible ID
    const orderId = new mongoose.Types.ObjectId();

    // Prepare order data with the MongoDB ID
    const newOrderData = [{
      Order_date: order_date,
      id: orderId.toString(), // Convert ObjectId to string
      status: 'pending'
    }, ...products.map(product => ({
      ...product,
      orderId: orderId.toString() // Add the order ID reference to products
    }))];

    // Check if user exists
    let existingOrder = await Order.findOne({ email });

    if (!existingOrder) {
      // Create new order document
      existingOrder = await Order.create({
        email: email,
        order_data: [newOrderData],
        status: "pending",
      });
    } else {
      // Add to existing order document
      await Order.findOneAndUpdate(
        { email: email },
        { $push: { order_data: newOrderData } }
      );
    }

    // Create Stripe checkout session
    const discountPercentage = 0.2;
    const BASE_CLIENT_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://dwaarper-wow5.onrender.com';
    const line_items = products.map((product) => ({
      price_data: {
        currency: "INR",
        product_data: { 
          name: product.name, 
          images: [product.img] 
        },
        unit_amount: Math.round((product.price - product.price * discountPercentage) * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_email: email,
      shipping_address_collection: { allowed_countries: ["IN"] },
      metadata: { 
        order_id: orderId.toString(),
        email: email
      },
    success_url: `${BASE_CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_CLIENT_URL}/cancel?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error processing order:", error);
    res.status(500).send("Server Error");
  }
});

// Add a route to verify payment success
router.post("/verify-payment", async (req, res) => {
  const { sessionId } = req.body;

  try {
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const orderId = session.metadata.order_id;
      const email = session.metadata.email;

      // Update order status to completed
      await Order.findOneAndUpdate(
        { 
          email,
          "order_data": {
            $elemMatch: {
              $elemMatch: {
                "id": orderId
              }
            }
          }
        },
        {
          $set: {
            "order_data.$[outer].$[inner].status": "completed"
          }
        },
        {
          arrayFilters: [
            { "outer": { $exists: true } },
            { "inner.id": orderId }
          ]
        }
      );

      return res.json({ 
        success: true, 
        message: "Payment verified and order completed successfully!" 
      });
    } else {
      return res.status(400).json({ error: "Payment not successful" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ error: "Error verifying payment" });
  }
})

router.post("/cancel-payment", async (req, res) => {
  try {
    const { sessionId, email } = req.body;

    if (!email || !sessionId) {
      return res.status(400).json({ error: "Email and sessionId are required" });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const orderId = session.metadata?.order_id;
    if (!orderId) {
      return res.status(400).json({ error: "No order found in session metadata" });
    }

    // Find the order
    const userOrder = await Order.findOne({ email });
    // console.log("Original order structure:", JSON.stringify(userOrder, null, 2));

    if (!userOrder) {
      return res.status(404).json({ error: "User order not found" });
    }

    // Remove the entire order array that contains the matching order ID
    const updatedOrderData = userOrder.order_data.filter(orderArray => {
      // Check if this array contains our target order ID
      const hasOrderId = orderArray.some(item => item.id === orderId || item.orderId === orderId);
      // Keep this array only if it doesn't contain our target order
      return !hasOrderId;
    });

    // Update the document
    const updateResult = await Order.findOneAndUpdate(
      { email },
      { $set: { order_data: updatedOrderData } },
      { new: true }
    );

    // If no orders left, delete the document
    if (!updateResult || updateResult.order_data.length === 0) {
      await Order.deleteOne({ email });
      // console.log("Deleted empty order document");
    }

    return res.json({ success: true, message: "Order successfully canceled" });
  } catch (error) {
    // console.error("Error canceling order:", error);
    return res.status(500).json({ error: "Error canceling order: " + error.message });
  }
});


module.exports = router;