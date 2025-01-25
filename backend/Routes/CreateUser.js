const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require('dotenv').config();

router.post(
  "/createuser",
  [
    body("name")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters long"),
    body("location")
      .isLength({ min: 3 })
      .withMessage("Location must be at least 3 characters long"),
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
  ],
  async (req, res) => {
    const { name, location, email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      // Generate salt and hash the password
      const salt = await bcrypt.genSalt(12);
      let secPassword = await bcrypt.hash(password, salt);

      // Create a new user
      user = await User.create({
        name,
        location,
        email,
        password: secPassword,
      });

      const data = {
        user: {
          id: user.id,
        }
      };

      const authToken = jwt.sign(data, process.env.JWT_SECRET);
      res.json({ success: true, authToken: authToken });
    } catch (error) {
      console.error("Error while creating user:", error);
      res.json({ success: false });
    }
  }
);

router.post(
  "/loginuser",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let email = req.body.email;
    try {
      let userData = await User.findOne({ email });
      if (!userData) {
        return res.status(400).json({ errors: "Email not found" });
      }

      const passwordMatch = await bcrypt.compare(req.body.password, userData.password);
      if (!passwordMatch) {
        return res.status(400).json({ errors: "Incorrect password" });
      }

      const data = {
        user: {
          id: userData.id,
        }
      };
      
      const authToken = jwt.sign(data, process.env.JWT_SECRET);

      return res.json({ success: true, authToken: authToken });
    } catch (error) {
      console.error("Error while checking user:", error);
      res.json({ success: false });
    }
  }
);

module.exports = router;
