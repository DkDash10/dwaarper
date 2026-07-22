const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String },

  location: { type: String, default: "" },

  phone: { type: String, default: "" },

  address: {
    type: String,
    default: "",
  },
  
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },

  googleId: {
    type: String,
    default: "",
  },

  isProfileComplete: {
    type: Boolean,
    default: false,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
