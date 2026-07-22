const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fetchUser = require("../middleware/fetchUser");

require("dotenv").config();

// =======================
// SIGNUP
// =======================
router.post(
  "/signup",
  [
    body("name")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters long"),

    body("email").isEmail().withMessage("Enter a valid email"),

    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
  ],
  async (req, res) => {
    const { name, email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        name,
        email,
        password: secPassword,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, process.env.JWT_SECRET);

      res.json({
        success: true,
        authToken,
        isProfileComplete: user.isProfileComplete,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false });
    }
  },
);

// =======================
// LOGIN
// =======================
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);

      if (user.authProvider === "google") {
        return res.status(400).json({
          message: "Please login using Google",
        });
      }

      if (!passwordCompare) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, process.env.JWT_SECRET);

      res.json({
        success: true,
        authToken,
        isProfileComplete: user.isProfileComplete,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false });
    }
  },
);

// =======================
// COMPLETE PROFILE
// =======================
router.post("/complete-profile", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const { location, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        location,
        phone,
        address,
        isProfileComplete: true,
      },
      { new: true },
    );

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// =======================
// GET LOCATION (UNCHANGED)
// =======================
router.post("/getlocation", async (req, res) => {
  try {
    const { lat, long } = req.body.latlong;

    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`;
    const response = await fetch(url);
    const data = await response.json();

    const location = `${data.locality || ""}, ${data.city || ""}, ${data.principalSubdivision || ""} ${data.postcode || ""}`;

    res.send({ location });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Server Error" });
  }
});

// GOOGLE LOGIN
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// CALLBACK
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const data = {
      user: {
        id: req.user.id,
      },
    };

    const token = jwt.sign(data, process.env.JWT_SECRET);

    // redirect to frontend
    res.redirect(
      `http://localhost:3000/google-success?token=${token}&profileComplete=${req.user.isProfileComplete}`,
    );
  },
);

router.get("/me", fetchUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email location phone address isProfileComplete"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;
