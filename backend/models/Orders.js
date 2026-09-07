const mongoose = require("mongoose");

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    // Main booking/order ID
    id: {
      type: String,
      required: true,
    },

    // Scheduled service date
    Order_date: {
      type: String,
      required: true,
    },

    // ---------------------------------------------------
    // BOOKING STATUS
    // ---------------------------------------------------
    //
    // confirmed
    // assigning
    // assigned
    // on_the_way
    // arrived
    // in_progress
    // completed
    // cancelled
    //
    status: {
      type: String,
      enum: ["pending", "confirmed", "assigning", "assigned", "on_the_way", "arrived", "in_progress", "completed", "cancelled"],
      default: "pending",
    },

    // Stripe payment information
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
    },

    stripeSessionId: {
      type: String,
      default: null,
    },

    // ---------------------------------------------------
    // PROFESSIONAL
    // ---------------------------------------------------

    professionalId: {
      type: Schema.Types.ObjectId,
      ref: "Professional",
      default: null,
    },

    professionalName: {
      type: String,
      default: null,
    },

    professionalAssignedAt: {
      type: Date,
      default: null,
    },

    // ---------------------------------------------------
    // BOOKING TIMING
    // ---------------------------------------------------

    bookingTime: {
      type: String,
      default: null,
    },

    duration: {
      type: Number,
      default: 60,
      min: 1,
    },

    // ---------------------------------------------------
    // STATUS TIMESTAMPS
    // ---------------------------------------------------

    confirmedAt: {
      type: Date,
      default: null,
    },

    assigningAt: {
      type: Date,
      default: null,
    },

    onTheWayAt: {
      type: Date,
      default: null,
    },

    arrivedAt: {
      type: Date,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  },
);

// ---------------------------------------------------------
// ORDER SCHEMA
// ---------------------------------------------------------

const orderSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    order_data: {
      type: [
        {
          type: [Schema.Types.Mixed],
          required: true,
        },
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
