const express = require("express");
const router = express.Router();

const Cart = require("../models/Cart");
const fetchUser = require("../middleware/fetchUser");

// =====================================================
// GET USER CART
// =====================================================

router.get("/", fetchUser, async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user.id,
    });

    // If user doesn't have a cart yet,
    // return an empty cart instead of an error.
    if (!cart) {
      return res.json({
        success: true,
        cart: {
          items: [],
        },
      });
    }

    res.json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch cart",
    });
  }
});


// =====================================================
// ADD SERVICE TO CART
// =====================================================

router.post("/add", fetchUser, async (req, res) => {
  try {
    const {
      serviceId,
      name,
      img,
      service,
      price,
    } = req.body;

    if (!serviceId || !name || !service || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Service information is incomplete",
      });
    }

    let cart = await Cart.findOne({
      user: req.user.id,
    });

    // Create cart if user doesn't have one
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
      });
    }

    // Check if exact service option already exists
    const existingItem = cart.items.find(
      (item) =>
        item.serviceId === String(serviceId) &&
        item.service === service
    );

    if (existingItem) {
      return res.status(200).json({
        success: true,
        message: "Service already in cart",
        cart,
      });
    }

    cart.items.push({
      serviceId: String(serviceId),
      name,
      img: img || "",
      service,
      price: Number(price),
      booking: {
        date: null,
        time: null,
        professional: null,
      },
    });

    await cart.save();

    res.json({
      success: true,
      message: "Service added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add cart error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add service to cart",
    });
  }
});


// =====================================================
// UPDATE CART ITEM
// Used for date / time / professional
// =====================================================

router.put("/item/:itemId", fetchUser, async (req, res) => {
  try {
    const { itemId } = req.params;

    const {
      date,
      time,
      professional,
    } = req.body;

    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Update only the fields that were provided
    if (date !== undefined) {
      item.booking.date = date;
    }

    if (time !== undefined) {
      item.booking.time = time;
    }

    if (professional !== undefined) {
      item.booking.professional = professional;
    }

    await cart.save();

    res.json({
      success: true,
      message: "Cart item updated",
      cart,
    });
  } catch (error) {
    console.error("Update cart item error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update cart item",
    });
  }
});


// =====================================================
// REMOVE ONE ITEM
// =====================================================

router.delete("/item/:itemId", fetchUser, async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    item.deleteOne();

    await cart.save();

    res.json({
      success: true,
      message: "Service removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove cart item error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to remove service",
    });
  }
});


// =====================================================
// CLEAR CART
// Used after successful checkout
// =====================================================

router.delete("/clear", fetchUser, async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      {
        user: req.user.id,
      },
      {
        $set: {
          items: [],
        },
      }
    );

    res.json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to clear cart",
    });
  }
});


module.exports = router;