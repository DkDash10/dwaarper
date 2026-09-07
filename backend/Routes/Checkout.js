const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Orders");
const mongoose = require("mongoose");

// =========================================================
// HELPERS
// =========================================================

const findBookingIndex = (orderData, orderId) => {
  return orderData.findIndex((items) => Array.isArray(items) && items.some((item) => item && item.id === orderId));
};

// =========================================================
// CREATE STRIPE CHECKOUT SESSION
// =========================================================

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { products, email, order_date } = req.body;

    if (!products || !products.length) {
      return res.status(400).json({
        success: false,
        error: "No products provided",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const orderId = new mongoose.Types.ObjectId();
    const orderIdString = orderId.toString();

    // -----------------------------------------------------
    // BOOKING HEADER
    // -----------------------------------------------------

    const bookingHeader = {
      Order_date: order_date,
      id: orderIdString,
      orderCreatedAt: new Date(),

      status: "pending",
      paymentStatus: "pending",

      stripeSessionId: null,

      confirmedAt: null,
      assigningAt: null,
      professionalAssignedAt: null,
      onTheWayAt: null,
      arrivedAt: null,
      startedAt: null,
      completedAt: null,
    };

    // -----------------------------------------------------
    // SERVICE ITEMS
    // -----------------------------------------------------

    const serviceItems = products.map((product) => {
      const professional = product.booking?.professional || null;

      return {
        ...product,

        orderId: orderIdString,

        booking: {
          ...(product.booking || {}),

          date: product.booking?.date || order_date,
          time: product.booking?.time || null,

          professionalId: professional?.id || null,
          professionalName: professional?.name || null,

          // Keep duration available for future scheduling.
          duration: Number(product.booking?.duration) || 60,
        },
      };
    });

    const newOrderData = [bookingHeader, ...serviceItems];

    // -----------------------------------------------------
    // SAVE ORDER
    // -----------------------------------------------------

    const existingOrder = await Order.findOne({ email });

    if (!existingOrder) {
      await Order.create({
        email,
        order_data: [newOrderData],
      });
    } else {
      await Order.findOneAndUpdate(
        { email },
        {
          $push: {
            order_data: newOrderData,
          },
        },
      );
    }

    // =====================================================
    // STRIPE
    // =====================================================

    const discountPercentage = 0.2;

    const BASE_CLIENT_URL = req.headers.host?.includes("localhost") ? "http://localhost:3000" : "https://dwaarper-wow5.onrender.com";

    const line_items = products.map((product) => ({
      price_data: {
        currency: "INR",

        product_data: {
          name: product.name,
          images: product.img ? [product.img] : [],
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

      shipping_address_collection: {
        allowed_countries: ["IN"],
      },

      metadata: {
        order_id: orderIdString,
        email,
      },

      success_url: `${BASE_CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${BASE_CLIENT_URL}/cancel?session_id={CHECKOUT_SESSION_ID}`,
    });

    // -----------------------------------------------------
    // ATOMICALLY SAVE STRIPE SESSION ID
    // -----------------------------------------------------

    const updateResult = await Order.updateOne(
      {
        email,
        order_data: {
          $elemMatch: {
            $elemMatch: {
              id: orderIdString,
            },
          },
        },
      },
      {
        $set: {
          "order_data.$[booking].0.stripeSessionId": session.id,
        },
      },
      {
        arrayFilters: [
          {
            booking: {
              $elemMatch: {
                id: orderIdString,
              },
            },
          },
        ],
      },
    );

    if (!updateResult.matchedCount) {
      console.error("Booking created but Stripe session ID could not be saved:", orderIdString);
    }

    return res.json({
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error processing checkout:", error);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

// =========================================================
// VERIFY PAYMENT
// =========================================================

router.post("/verify-payment", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: "Session ID is required",
    });
  }

  try {
    // -----------------------------------------------------
    // GET STRIPE SESSION
    // -----------------------------------------------------

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        error: "Payment not successful",
      });
    }

    const orderId = session.metadata?.order_id;

    const email = session.metadata?.email;

    if (!orderId || !email) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment metadata",
      });
    }

    // -----------------------------------------------------
    // FIND ORDER
    // -----------------------------------------------------

    const order = await Order.findOne({ email }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    const bookingArray = order.order_data.find((items) => Array.isArray(items) && items.some((item) => item && item.id === orderId));

    if (!bookingArray) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // -----------------------------------------------------
    // IDEMPOTENCY CHECK
    //
    // If Stripe verification is called twice for the same
    // session, don't try to process the payment again.
    // -----------------------------------------------------

    const bookingHeader = bookingArray[0];

    if (bookingHeader?.paymentStatus === "paid" && bookingHeader?.stripeSessionId === sessionId) {
      console.log(`Payment already verified for booking ${orderId}`);

      return res.json({
        success: true,
        status: bookingHeader.status || "assigned",
        bookingId: orderId,
        message: "Payment was already verified.",
      });
    }

    // -----------------------------------------------------
    // CHECK PROFESSIONAL SELECTION
    // -----------------------------------------------------

    const serviceItems = bookingArray.slice(1);

    if (!serviceItems.length) {
      return res.status(400).json({
        success: false,
        error: "No services found in booking",
      });
    }

    const allServicesAssigned = serviceItems.every((item) => item?.booking?.professionalId);

    const newStatus = allServicesAssigned ? "assigned" : "assigning";

    const now = new Date();

    // -----------------------------------------------------
    // CREATE UPDATED BOOKING ARRAY
    //
    // Each service gets its own status.
    // -----------------------------------------------------

    const updatedBookingArray = bookingArray.map((item, index) => {
      // ---------------------------------------------
      // BOOKING HEADER
      // ---------------------------------------------

      if (index === 0) {
        return {
          ...item,

          status: newStatus,

          paymentStatus: "paid",

          stripeSessionId: sessionId,

          confirmedAt: now,

          ...(allServicesAssigned
            ? {
                professionalAssignedAt: now,
              }
            : {
                assigningAt: now,
              }),
        };
      }

      // ---------------------------------------------
      // SERVICE
      // ---------------------------------------------

      if (!item || !item.booking) {
        return item;
      }

      const professionalId = item.booking?.professionalId;

      return {
        ...item,

        booking: {
          ...item.booking,

          status: professionalId ? "assigned" : "assigning",
        },
      };
    });

    // -----------------------------------------------------
    // IMPORTANT:
    //
    // Use atomic findOneAndUpdate instead of .save().
    //
    // This avoids Mongoose VersionError when the lifecycle
    // worker modifies the same order at the same time.
    // -----------------------------------------------------

    const updateResult = await Order.findOneAndUpdate(
      {
        email,

        order_data: {
          $elemMatch: {
            $elemMatch: {
              id: orderId,
            },
          },
        },
      },
      {
        $set: {
          "order_data.$[booking]": updatedBookingArray,
        },
      },
      {
        arrayFilters: [
          {
            booking: {
              $elemMatch: {
                id: orderId,
              },
            },
          },
        ],

        new: true,
      },
    );

    if (!updateResult) {
      return res.status(404).json({
        success: false,
        error: "Booking could not be updated",
      });
    }

    console.log(`Payment verified successfully for booking ${orderId}`);

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    return res.json({
      success: true,
      status: newStatus,
      bookingId: orderId,

      message: allServicesAssigned ? "Payment verified and professionals assigned." : "Payment verified. Finding professionals.",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);

    return res.status(500).json({
      success: false,
      error: "Error verifying payment",
    });
  }
});

// =========================================================
// CANCEL PAYMENT
// =========================================================

router.post("/cancel-payment", async (req, res) => {
  try {
    const { sessionId, email } = req.body;

    if (!email || !sessionId) {
      return res.status(400).json({
        error: "Email and sessionId are required",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(400).json({
        error: "Invalid session ID",
      });
    }

    const orderId = session.metadata?.order_id;

    if (!orderId) {
      return res.status(400).json({
        error: "No order found in session metadata",
      });
    }

    const userOrder = await Order.findOne({ email }).lean();

    if (!userOrder) {
      return res.status(404).json({
        error: "User order not found",
      });
    }

    const updatedOrderData = userOrder.order_data.filter((orderArray) => {
      const hasOrderId = orderArray.some((item) => item?.id === orderId || item?.orderId === orderId);

      return !hasOrderId;
    });

    const updateResult = await Order.findOneAndUpdate(
      { email },
      {
        $set: {
          order_data: updatedOrderData,
        },
      },
      {
        new: true,
      },
    );

    if (!updateResult || updateResult.order_data.length === 0) {
      await Order.deleteOne({ email });
    }

    return res.json({
      success: true,
      message: "Order successfully canceled",
    });
  } catch (error) {
    console.error("Error canceling order:", error);

    return res.status(500).json({
      error: "Error canceling order: " + error.message,
    });
  }
});

module.exports = router;
