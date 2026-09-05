const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      default: null,
    },

    time: {
      type: String,
      default: null,
    },

    professional: {
      id: {
        type: String,
        default: null,
      },

      name: {
        type: String,
        default: null,
      },

      rating: {
        type: Number,
        default: null,
      },

      jobs: {
        type: String,
        default: null,
      },
    },
  },
  { _id: false }
);

const cartItemSchema = new mongoose.Schema(
  {
    serviceId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    img: {
      type: String,
      default: "",
    },

    service: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    booking: {
      type: bookingSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", cartSchema);