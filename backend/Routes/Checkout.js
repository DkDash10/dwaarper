const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Orders");

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { products, customerDetails } = req.body;

    // Step 1: Prepare the line items for Stripe checkout
    const discountPercentage = 0.2; // 20% discount
    const line_items = products.map((product) => {
      const discountedPrice = product.price - (product.price * discountPercentage); // Apply discount

      return {
        price_data: {
          currency: "INR",
          product_data: {
            name: product.name,
            images: [product.img],
          },
          unit_amount: Math.round(discountedPrice * 100), // Convert to cents
        },
        quantity: 1,
      };
    });

    // Step 2: Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_email: customerDetails.email,
      shipping_address_collection: {
        allowed_countries: ["IN"], // Allow only Indian addresses
      },
      metadata: {
        customer_name: customerDetails.name, // Store customer name in metadata
        customer_address: customerDetails.address, // Store customer address in metadata
        order_data: JSON.stringify(req.body.order_data), // Pass order data as metadata
        order_date: req.body.order_date, // Pass order date as metadata
      },
      success_url: "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/cancel",
    });

    // Respond with the session ID for Stripe redirection
    res.json({ id: session.id });
  } catch (error) {
    console.error("Error processing order or creating Stripe session:", error);
    res.status(500).send("Server Error");
  }
});

router.post("/verify-payment", async (req, res) => {
  const { sessionId, order_data, email } = req.body;

  if (!email) {
    console.log("Missing email in request body");
    return res.status(400).json({ error: "Email is required" });
  }

  if (!order_data || order_data.length === 0) {
    console.log("Missing order_data in request body");
    return res.status(400).json({ error: "Order data is required" });
  }

  try {
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Retrieved session:", session);

    // Check if the payment was successful
    if (session.payment_status === "paid") {
      const orderDate = session.metadata.order_date;

      if (!orderDate) {
        console.error("Missing order_date in session metadata");
        return res.status(400).json({ error: "Missing order_date in session metadata" });
      }

      // Add the order_date to each item in order_data
      let newOrderData = order_data.map(item => ({
        ...item,
        Order_date: orderDate,
      }));

      console.log("Final Order Data to Save:", newOrderData);

      // Find the user by email
      let userOrder = await Order.findOne({ email });

      if (!userOrder) {
        // If no user found, create a new order entry
        console.log("Creating new order for email:", email);
        await Order.create({
          email: email,
          order_data: newOrderData,
        });
      } else {
        // Check if the exact order already exists (deep comparison of order_data)
        const orderExists = userOrder.order_data.some(order => {
          return JSON.stringify(order) === JSON.stringify(newOrderData[0]); // Compare the first item from newOrderData
        });

        if (!orderExists) {
          console.log("Adding new order to existing user:", email);
          // Add the new order to the user's data if it doesn't already exist
          await Order.findOneAndUpdate(
            { email: email },
            { $push: { order_data: { $each: newOrderData } } }
          );
        } else {
          console.log("Order already exists for user, skipping save.");
        }
      }

      // Send success response
      return res.json({ success: true, message: "Payment verified and order placed successfully!" });
    } else {
      console.log("Payment not successful, status:", session.payment_status);
      return res.status(400).json({ error: "Payment not successful" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).send("Error verifying payment");
  }
});


module.exports = router;

