const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      index: true,
    },

    serviceIndex: {
      type: Number,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// One review per user per service booking
reviewSchema.index(
  {
    bookingId: 1,
    serviceIndex: 1,
    userId: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Review", reviewSchema);
