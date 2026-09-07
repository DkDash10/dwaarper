const express = require("express");
const router = express.Router();

const Professional = require("../models/Professional");
const Order = require("../models/Orders");

// ---------------------------------------------------------
// GET AVAILABLE PROFESSIONALS
// ---------------------------------------------------------
// serviceId = MongoDB _id from service_data
// date     = YYYY-MM-DD
// time     = HH:MM
//
// Returns professionals who:
// 1. are active
// 2. provide the selected service
// 3. work on that day/time
// 4. are not already booked for that slot
// ---------------------------------------------------------

router.get("/professionals/available", async (req, res) => {
  try {
    const { serviceId, date, time } = req.query;

    if (!serviceId || !date || !time) {
      return res.status(400).json({
        success: false,
        error: "serviceId, date and time are required",
      });
    }

    // Validate service ID
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid service ID",
      });
    }

    // -----------------------------------------------------
    // Find professionals capable of this service
    // -----------------------------------------------------

    const professionals = await Professional.find({
      active: true,
      services: serviceId,
    }).lean();

    if (!professionals.length) {
      return res.json({
        success: true,
        professionals: [],
      });
    }

    // -----------------------------------------------------
    // Determine day of week
    // -----------------------------------------------------

    const selectedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid date",
      });
    }

    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    const dayName = days[selectedDate.getDay()];

    // -----------------------------------------------------
    // Filter by working schedule
    // -----------------------------------------------------

    const scheduledProfessionals = professionals.filter((professional) => {
      const schedule = professional.schedule?.[dayName];

      if (!schedule || schedule.available !== true) {
        return false;
      }

      return time >= schedule.start && time < schedule.end;
    });

    if (!scheduledProfessionals.length) {
      return res.json({
        success: true,
        professionals: [],
      });
    }

    // -----------------------------------------------------
    // Find bookings for this date/time
    // -----------------------------------------------------
    //
    // IMPORTANT:
    // We don't disable a time just because ONE professional
    // is booked.
    //
    // We remove only the professionals who are booked.
    // -----------------------------------------------------

    const orderDocuments = await Order.find({
      "order_data.0": { $exists: true },
    }).lean();

    const bookedProfessionalIds = new Set();

    for (const orderDocument of orderDocuments) {
      for (const orderArray of orderDocument.order_data || []) {
        if (!Array.isArray(orderArray) || !orderArray.length) {
          continue;
        }

        const bookingInfo = orderArray[0];

        if (!bookingInfo) {
          continue;
        }

        if (bookingInfo.Order_date !== date) {
          continue;
        }

        // Only bookings that occupy the professional
        const activeStatuses = ["confirmed", "assigning", "assigned", "on_the_way", "arrived", "in_progress"];

        if (!activeStatuses.includes(bookingInfo.status)) {
          continue;
        }

        for (const item of orderArray.slice(1)) {
          if (!item) continue;

          if (!item.booking) continue;

          const booking = item.booking;

          if (!booking.professionalId) {
            continue;
          }

          if (booking.time !== time) {
            continue;
          }

          bookedProfessionalIds.add(booking.professionalId.toString());
        }
      }
    }

    // -----------------------------------------------------
    // Remove professionals already booked
    // -----------------------------------------------------

    const availableProfessionals = scheduledProfessionals.filter((professional) => !bookedProfessionalIds.has(professional._id.toString()));

    // -----------------------------------------------------
    // Return only the information frontend needs
    // -----------------------------------------------------

    const result = availableProfessionals.map((professional) => ({
      id: professional._id,
      name: professional.name,
      profileImage: professional.profileImage,
      rating: professional.rating,
      totalReviews: professional.totalReviews,
      completedJobs: professional.completedJobs,
      experience: professional.experience,
      verified: professional.verified,
      location: professional.location,
    }));

    return res.json({
      success: true,
      professionals: result,
    });
  } catch (error) {
    console.error("Error fetching available professionals:", error);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

module.exports = router;
