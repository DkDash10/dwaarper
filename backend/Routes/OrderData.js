const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/Orders");
const User = require("../models/User");
const Professional = require("../models/Professional");
const Review = require("../models/Review");
const fetchUser = require("../middleware/fetchUser");

// =========================================================
// GET ORDER DATA
// =========================================================

router.post("/order-data", async (req, res) => {
  try {
    const { email, timeFilter } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const orderData = await Order.findOne({
      email,
    }).lean();

    if (!orderData || !orderData.order_data) {
      return res.json({
        orderData: {
          order_data: [],
        },
      });
    }

    // =====================================================
    // FLATTEN EACH SERVICE INTO ITS OWN BOOKING
    // =====================================================

    let allOrders = orderData.order_data.flatMap((orderArray) => {
      if (!Array.isArray(orderArray) || orderArray.length === 0) {
        return [];
      }

      const dateInfo = orderArray[0];

      if (!dateInfo) {
        return [];
      }

      return orderArray.slice(1).map((serviceInfo, serviceIndex) => ({
        ...serviceInfo,

        // Service-specific date
        date: serviceInfo?.booking?.date || dateInfo.Order_date || null,

        // Original order creation time
        orderCreatedAt: dateInfo.orderCreatedAt || null,

        // IMPORTANT:
        // Always use service status first.
        status: serviceInfo?.booking?.status || dateInfo.status || "pending",

        // Main order ID
        orderId: dateInfo.id,

        // Individual service index
        serviceIndex,
      }));
    });

    // =====================================================
    // TIME FILTER
    // =====================================================

    if (timeFilter && timeFilter !== "all") {
      const today = new Date();
      let filterDate = new Date();

      switch (timeFilter) {
        case "month":
          filterDate.setMonth(today.getMonth() - 1);
          break;

        case "3months":
          filterDate.setMonth(today.getMonth() - 3);
          break;

        case "6months":
          filterDate.setMonth(today.getMonth() - 6);
          break;

        case "year":
          filterDate.setFullYear(today.getFullYear() - 1);
          break;

        default:
          break;
      }

      allOrders = allOrders.filter((order) => new Date(order.date) >= filterDate);
    }

    // =====================================================
    // LATEST ORDER FIRST
    // =====================================================

    allOrders.sort((a, b) => {
      const dateA = new Date(a.orderCreatedAt || a.date || 0);

      const dateB = new Date(b.orderCreatedAt || b.date || 0);

      return dateB - dateA;
    });

    return res.json({
      orderData: {
        email: orderData.email,
        order_data: allOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching order data:", error);

    return res.status(500).json({
      error: "Server Error",
      message: error.message,
    });
  }
});

// =========================================================
// CANCEL ONE SERVICE BOOKING
// =========================================================

router.post("/cancel-booking", fetchUser, async (req, res) => {
  try {
    const { bookingId, serviceIndex } = req.body;

    console.log("Cancel booking request:", bookingId, "serviceIndex:", serviceIndex);

    // ===================================================
    // VALIDATE BOOKING ID
    // ===================================================

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: "Booking ID is required.",
      });
    }

    // ===================================================
    // VALIDATE SERVICE INDEX
    // ===================================================

    const parsedServiceIndex = Number(serviceIndex);

    if (!Number.isInteger(parsedServiceIndex) || parsedServiceIndex < 0) {
      return res.status(400).json({
        success: false,
        error: "A valid service index is required.",
      });
    }

    // ===================================================
    // GET AUTHENTICATED USER
    // ===================================================

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Authentication information is missing.",
      });
    }

    const user = await User.findById(req.user.id).select("email");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User account not found.",
      });
    }

    if (!user.email) {
      return res.status(401).json({
        success: false,
        error: "Your account does not have an email address.",
      });
    }

    // ===================================================
    // FIND USER'S ORDER
    // ===================================================

    const order = await Order.findOne({
      email: user.email,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "No booking record was found for your account.",
      });
    }

    // ===================================================
    // FIND EXACT ORDER
    // ===================================================

    let targetOrderArray = null;

    for (const orderArray of order.order_data || []) {
      if (!Array.isArray(orderArray) || orderArray.length === 0) {
        continue;
      }

      const header = orderArray[0];

      if (header && String(header.id) === String(bookingId)) {
        targetOrderArray = orderArray;
        break;
      }
    }

    if (!targetOrderArray) {
      return res.status(404).json({
        success: false,
        error: "Booking not found in your account.",
      });
    }

    // ===================================================
    // FIND EXACT SERVICE
    //
    // serviceIndex 0 = first service
    // serviceIndex 1 = second service
    // serviceIndex 2 = third service
    //
    // orderArray[0] = booking header
    // orderArray[1] = service 0
    // orderArray[2] = service 1
    // orderArray[3] = service 2
    // ===================================================

    const serviceArrayIndex = parsedServiceIndex + 1;

    const serviceItem = targetOrderArray[serviceArrayIndex];

    if (!serviceItem) {
      return res.status(404).json({
        success: false,
        error: "Selected service booking was not found.",
      });
    }

    // ===================================================
    // CURRENT SERVICE STATUS
    // ===================================================

    const currentStatus = serviceItem?.booking?.status || targetOrderArray[0]?.status || "pending";

    console.log(`Booking ${bookingId}, service ${parsedServiceIndex}, current status: ${currentStatus}`);

    // ===================================================
    // CHECK CANCELLATION ELIGIBILITY
    // ===================================================

    const cancellableStatuses = ["confirmed", "assigning", "assigned"];

    if (!cancellableStatuses.includes(currentStatus)) {
      let message = "This service can no longer be cancelled.";

      switch (currentStatus) {
        case "on_the_way":
          message = "This service cannot be cancelled because the professional is already on the way.";
          break;

        case "arrived":
          message = "This service cannot be cancelled because the professional has arrived.";
          break;

        case "in_progress":
          message = "This service cannot be cancelled because the service is already in progress.";
          break;

        case "completed":
          message = "A completed service cannot be cancelled.";
          break;

        case "cancelled":
          message = "This service has already been cancelled.";
          break;
      }

      return res.status(400).json({
        success: false,
        error: message,
      });
    }

    // ===================================================
    // CANCEL ONLY THIS SERVICE
    //
    // IMPORTANT:
    // Atomic MongoDB update.
    // No order.save().
    // ===================================================

    const serviceStatusPath = `order_data.$[booking].${serviceArrayIndex}.booking.status`;

    const updateResult = await Order.updateOne(
      {
        email: user.email,

        order_data: {
          $elemMatch: {
            $elemMatch: {
              id: bookingId,
            },
          },
        },
      },
      {
        $set: {
          [serviceStatusPath]: "cancelled",
        },
      },
      {
        arrayFilters: [
          {
            "booking.0.id": bookingId,

            [`booking.${serviceArrayIndex}.booking.status`]: {
              $in: cancellableStatuses,
            },
          },
        ],
      },
    );

    // ===================================================
    // CHECK WHETHER UPDATE ACTUALLY HAPPENED
    // ===================================================

    if (updateResult.modifiedCount === 0) {
      // Re-read the service to determine
      // whether another process changed it.
      const latestOrder = await Order.findOne({
        email: user.email,
      }).lean();

      const latestOrderArray = latestOrder?.order_data?.find((array) => Array.isArray(array) && array[0] && String(array[0].id) === String(bookingId));

      const latestService = latestOrderArray?.[serviceArrayIndex];

      const latestStatus = latestService?.booking?.status;

      if (latestStatus === "cancelled") {
        return res.json({
          success: true,
          message: "Service booking was already cancelled.",
          bookingId,
          serviceIndex: parsedServiceIndex,
          status: "cancelled",
        });
      }

      return res.status(400).json({
        success: false,
        error: "This service can no longer be cancelled.",
      });
    }

    console.log(`Service ${parsedServiceIndex} in booking ${bookingId} cancelled successfully for ${user.email}`);

    // ===================================================
    // UPDATE HEADER ONLY IF ALL SERVICES ARE CANCELLED
    // ===================================================

    const latestOrder = await Order.findOne({
      email: user.email,
    }).lean();

    const latestOrderArray = latestOrder?.order_data?.find((array) => Array.isArray(array) && array[0] && String(array[0].id) === String(bookingId));

    if (latestOrderArray) {
      const serviceStatuses = latestOrderArray
        .slice(1)
        .filter((item) => item?.booking)
        .map((item) => item.booking.status || latestOrderArray[0]?.status || "pending");

      const allCancelled = serviceStatuses.length > 0 && serviceStatuses.every((status) => status === "cancelled");

      if (allCancelled) {
        await Order.updateOne(
          {
            email: user.email,
            order_data: {
              $elemMatch: {
                $elemMatch: {
                  id: bookingId,
                },
              },
            },
          },
          {
            $set: {
              "order_data.$[booking].0.status": "cancelled",
            },
          },
          {
            arrayFilters: [
              {
                "booking.0.id": bookingId,
              },
            ],
          },
        );
      }
    }

    // ===================================================
    // RESPONSE
    // ===================================================

    return res.json({
      success: true,
      message: "Service booking cancelled successfully.",
      bookingId,
      serviceIndex: parsedServiceIndex,
      status: "cancelled",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      error: "Server error while cancelling booking.",
      message: error.message,
    });
  }
});

// =========================================================
// SUBMIT PROFESSIONAL REVIEW
// =========================================================

router.post("/submit-review", fetchUser, async (req, res) => {
  try {
    const { bookingId, serviceIndex, rating, comment } = req.body;

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: "Booking ID is required.",
      });
    }

    const parsedServiceIndex = Number(serviceIndex);

    if (!Number.isInteger(parsedServiceIndex) || parsedServiceIndex < 0) {
      return res.status(400).json({
        success: false,
        error: "A valid service index is required.",
      });
    }

    const parsedRating = Number(rating);

    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5.",
      });
    }

    // -------------------------------------------------------
    // AUTHENTICATED USER
    // -------------------------------------------------------

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Authentication information is missing.",
      });
    }

    const user = await User.findById(req.user.id).select("_id email");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User account not found.",
      });
    }

    if (!user.email) {
      return res.status(401).json({
        success: false,
        error: "Your account does not have an email address.",
      });
    }

    // -------------------------------------------------------
    // FIND USER ORDER
    // -------------------------------------------------------

    const order = await Order.findOne({
      email: user.email,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Booking not found.",
      });
    }

    // -------------------------------------------------------
    // FIND EXACT BOOKING
    // -------------------------------------------------------

    const targetOrderArray = (order.order_data || []).find((orderArray) => Array.isArray(orderArray) && orderArray[0] && String(orderArray[0].id) === String(bookingId));

    if (!targetOrderArray) {
      return res.status(404).json({
        success: false,
        error: "Booking not found.",
      });
    }

    // -------------------------------------------------------
    // FIND EXACT SERVICE
    // -------------------------------------------------------

    const serviceArrayIndex = parsedServiceIndex + 1;

    const serviceItem = targetOrderArray[serviceArrayIndex];

    if (!serviceItem?.booking) {
      return res.status(404).json({
        success: false,
        error: "Service booking not found.",
      });
    }

    const booking = serviceItem.booking;

    // -------------------------------------------------------
    // SERVICE MUST BE COMPLETED
    // -------------------------------------------------------

    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        error: "You can review the professional after the service is completed.",
      });
    }

    // -------------------------------------------------------
    // PROFESSIONAL MUST EXIST
    // -------------------------------------------------------

    if (!booking.professionalId) {
      return res.status(400).json({
        success: false,
        error: "No professional is associated with this booking.",
      });
    }

    // -------------------------------------------------------
    // RESOLVE PROFESSIONAL
    // -------------------------------------------------------

    let professional = null;

    const professionalIdValue = String(booking.professionalId || "").trim();

    if (!professionalIdValue) {
      return res.status(400).json({
        success: false,
        error: "No professional is associated with this booking.",
      });
    }

    // New bookings should contain a MongoDB ObjectId.
    if (mongoose.Types.ObjectId.isValid(professionalIdValue)) {
      professional = await Professional.findById(professionalIdValue).select("_id name rating totalReviews completedJobs");
    } else {
      // -----------------------------------------------------
      // BACKWARD COMPATIBILITY
      // -----------------------------------------------------
      // Older bookings may contain a slug such as:
      // "sameer-patil"
      //
      // Convert that slug back to the professional's name.
      // -----------------------------------------------------

      const professionalName = professionalIdValue.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

      professional = await Professional.findOne({
        name: professionalName,
      }).select("_id name rating totalReviews completedJobs");
    }

    if (!professional) {
      return res.status(404).json({
        success: false,
        error: "The assigned professional could not be found.",
      });
    }

    // -------------------------------------------------------
    // CHECK FOR EXISTING REVIEW
    // -------------------------------------------------------

    const existingReview = await Review.findOne({
      bookingId: String(bookingId),
      serviceIndex: parsedServiceIndex,
      userId: user._id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        error: "You have already reviewed this service.",
        review: existingReview,
      });
    }

    // -------------------------------------------------------
    // CREATE REVIEW
    // -------------------------------------------------------

    const review = await Review.create({
      bookingId: String(bookingId),
      serviceIndex: parsedServiceIndex,
      userId: user._id,
      professionalId: professional._id,
      rating: parsedRating,
      comment: String(comment || "").trim(),
    });

    // -------------------------------------------------------
    // RECALCULATE PROFESSIONAL RATING
    // -------------------------------------------------------

    const reviewStats = await Review.aggregate([
      {
        $match: {
          professionalId: professional._id,
        },
      },
      {
        $group: {
          _id: "$professionalId",
          totalReviews: {
            $sum: 1,
          },
          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);

    const stats = reviewStats[0];

    const totalReviews = stats?.totalReviews || 0;

    const averageRating = stats?.averageRating ? Number(stats.averageRating.toFixed(1)) : 0;

    // -------------------------------------------------------
    // UPDATE PROFESSIONAL
    // -------------------------------------------------------

    await Professional.updateOne(
      {
        _id: professional._id,
      },
      {
        $set: {
          rating: averageRating,
          totalReviews,
        },
      },
    );

    console.log(`Review submitted successfully | Professional: ${professional.name} | Rating: ${parsedRating}`);

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review,
      professional: {
        id: professional._id,
        name: professional.name,
        rating: averageRating,
        totalReviews,
      },
    });
  } catch (error) {
    // IMPORTANT:
    // Log the REAL Mongo/Mongoose error on the backend.
    console.error("====================================");
    console.error("SUBMIT REVIEW ERROR");
    console.error("====================================");
    console.error("Message:", error.message);
    console.error("Name:", error.name);
    console.error("Code:", error.code);
    console.error("Stack:", error.stack);
    console.error("====================================");

    // Duplicate index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "You have already reviewed this service.",
      });
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Invalid review data.",
        details: Object.values(error.errors).map((item) => item.message),
      });
    }

    return res.status(500).json({
      success: false,
      error: "Server error while submitting review.",
      message: error.message,
    });
  }
});

// =========================================================
// GET USER REVIEW FOR A BOOKING
// =========================================================

router.get("/my-review", fetchUser, async (req, res) => {
  try {
    const { bookingId, serviceIndex } = req.query;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: "Booking ID is required.",
      });
    }

    const parsedServiceIndex = Number(serviceIndex);

    if (!Number.isInteger(parsedServiceIndex) || parsedServiceIndex < 0) {
      return res.status(400).json({
        success: false,
        error: "A valid service index is required.",
      });
    }

    const review = await Review.findOne({
      bookingId: String(bookingId),
      serviceIndex: parsedServiceIndex,
      userId: req.user.id,
    }).lean();

    return res.json({
      success: true,
      hasReview: Boolean(review),
      review: review || null,
    });
  } catch (error) {
    console.error("Get review error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to load review.",
    });
  }
});

module.exports = router;
