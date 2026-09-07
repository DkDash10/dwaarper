const mongoose = require("mongoose");

const { Schema } = mongoose;

const workingDaySchema = new Schema(
  {
    start: {
      type: String,
      default: "09:00",
    },
    end: {
      type: String,
      default: "20:00",
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const professionalSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // Existing service_data MongoDB _ids
    services: [
      {
        type: Schema.Types.ObjectId,
        required: true,
      },
    ],

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    completedJobs: {
      type: Number,
      default: 0,
    },

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    active: {
      type: Boolean,
      default: true,
    },

    schedule: {
      monday: {
        type: workingDaySchema,
        default: () => ({}),
      },

      tuesday: {
        type: workingDaySchema,
        default: () => ({}),
      },

      wednesday: {
        type: workingDaySchema,
        default: () => ({}),
      },

      thursday: {
        type: workingDaySchema,
        default: () => ({}),
      },

      friday: {
        type: workingDaySchema,
        default: () => ({}),
      },

      saturday: {
        type: workingDaySchema,
        default: () => ({}),
      },

      sunday: {
        type: workingDaySchema,
        default: () => ({
          available: false,
        }),
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Professional", professionalSchema);
