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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const salt = await bcrypt.genSalt(12);
    let secPassword = await bcrypt.hash(req.body.password, salt);

    try {
      await User.create({
        name: req.body.name,
        location: req.body.location,
        email: req.body.email,
        password: secPassword, 
      });
      res.json({ success: true });
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
