const express = require("express");
const router = express.Router();

const Order = require("../models/Orders");
const User = require("../models/User");
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

module.exports = router;
