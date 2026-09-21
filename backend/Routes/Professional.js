const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const Professional = require("../models/Professional");
const Order = require("../models/Orders");

// =========================================================
// ACTIVE BOOKING STATUSES
// =========================================================

const ACTIVE_BOOKING_STATUSES = ["confirmed", "assigning", "assigned", "on_the_way", "arrived", "in_progress"];

// =========================================================
// DATE / TIME HELPERS
// =========================================================

const parseDateTime = (date, time) => {
  if (!date || !time) return null;

  const parsed = new Date(`${date}T${time}:00`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getBookingEnd = (start, duration = 60) => {
  return new Date(start.getTime() + Number(duration || 60) * 60 * 1000);
};

const parseTimeToMinutes = (time) => {
  if (!time || typeof time !== "string") {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
};

// =========================================================
// GET AVAILABLE PROFESSIONALS
// =========================================================
//
// Returns professionals who:
//
// 1. are active
// 2. provide the selected service
// 3. are working on the selected day
// 4. can complete the entire booking within working hours
// 5. do not have an overlapping active booking
//
// =========================================================

router.get("/professionals/available", async (req, res) => {
  try {
    const { serviceId, date, time } = req.query;

    // -------------------------------------------------------
    // VALIDATE INPUT
    // -------------------------------------------------------

    if (!serviceId || !date || !time) {
      return res.status(400).json({
        success: false,
        error: "serviceId, date and time are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid service ID",
      });
    }

    // -------------------------------------------------------
    // REQUESTED BOOKING INTERVAL
    // -------------------------------------------------------

    const requestedStart = parseDateTime(date, time);

    if (!requestedStart) {
      return res.status(400).json({
        success: false,
        error: "Invalid date or time",
      });
    }

    // -------------------------------------------------------
    // CURRENT SERVICE DURATION
    // -------------------------------------------------------
    //
    // Your booking system currently defaults to 60 minutes.
    //
    // If you later store a different duration per service,
    // this can be changed to read that value from service_data.
    //
    // -------------------------------------------------------

    const requestedDuration = 60;

    const requestedEnd = getBookingEnd(requestedStart, requestedDuration);

    // =======================================================
    // FIND PROFESSIONALS WHO PROVIDE THIS SERVICE
    // =======================================================

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

    // =======================================================
    // DETERMINE DAY OF WEEK
    // =======================================================

    const selectedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid date",
      });
    }

    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    const dayName = days[selectedDate.getDay()];

    // =======================================================
    // FILTER BY WORKING HOURS
    // =======================================================

    const scheduledProfessionals = professionals.filter((professional) => {
      const schedule = professional.schedule?.[dayName];

      if (!schedule || schedule.available !== true) {
        return false;
      }

      const professionalStart = parseTimeToMinutes(schedule.start);

      const professionalEnd = parseTimeToMinutes(schedule.end);

      const requestedStartMinutes = parseTimeToMinutes(time);

      if (professionalStart === null || professionalEnd === null || requestedStartMinutes === null) {
        return false;
      }

      // Booking must start during working hours.
      if (requestedStartMinutes < professionalStart) {
        return false;
      }

      // Entire booking must finish before working hours end.
      const requestedEndMinutes = requestedStartMinutes + requestedDuration;

      if (requestedEndMinutes > professionalEnd) {
        return false;
      }

      return true;
    });

    if (!scheduledProfessionals.length) {
      return res.json({
        success: true,
        professionals: [],
      });
    }

    // =======================================================
    // LOAD EXISTING ORDERS
    // =======================================================

    const orderDocuments = await Order.find({
      "order_data.0": { $exists: true },
    }).lean();

    // =======================================================
    // FIND PROFESSIONALS WITH OVERLAPPING BOOKINGS
    // =======================================================

    const bookedProfessionalIds = new Set();
    let unassignedMatchingBookings = 0;

    for (const orderDocument of orderDocuments) {
      for (const orderArray of orderDocument.order_data || []) {
        if (!Array.isArray(orderArray) || !orderArray.length) {
          continue;
        }

        const bookingHeader = orderArray[0];

        if (!bookingHeader) {
          continue;
        }

        // ---------------------------------------------------
        // Only active bookings occupy professionals.
        // ---------------------------------------------------

        if (!ACTIVE_BOOKING_STATUSES.includes(bookingHeader.status)) {
          continue;
        }

        // ---------------------------------------------------
        // Check every service inside this booking.
        // ---------------------------------------------------

        for (const item of orderArray.slice(1)) {
          if (!item?.booking) {
            continue;
          }

          const booking = item.booking;

          // A cancelled service must release its slot even when the parent
          // booking still contains other active services.
          if (booking.status === "cancelled") {
            continue;
          }

          const existingDate = booking.date || bookingHeader.Order_date;
          const existingTime = booking.time;
          const existingServiceId = item.serviceId || item.id;

          if (bookingHeader.paymentStatus === "paid" && !booking.professionalId && String(existingServiceId) === String(serviceId) && existingDate === date && existingTime) {
            const existingStart = parseDateTime(existingDate, existingTime);
            const existingDuration = Number(booking.duration) || 60;

            if (existingStart && requestedStart < getBookingEnd(existingStart, existingDuration) && requestedEnd > existingStart) {
              unassignedMatchingBookings += 1;
            }

            continue;
          }

          if (!booking.professionalId) {
            continue;
          }

          // -------------------------------------------------
          // IMPORTANT:
          // Use service-level date first.
          //
          // This prevents one booking containing multiple
          // services on different dates from blocking the
          // wrong date.
          // -------------------------------------------------

          if (!existingDate || !existingTime) {
            continue;
          }

          // -------------------------------------------------
          // Build existing booking interval.
          // -------------------------------------------------

          const existingStart = parseDateTime(existingDate, existingTime);

          if (!existingStart) {
            continue;
          }

          const existingDuration = Number(booking.duration) || 60;

          const existingEnd = getBookingEnd(existingStart, existingDuration);

          // -------------------------------------------------
          // Check whether this booking overlaps the requested
          // time.
          //
          // requestedStart < existingEnd
          // &&
          // requestedEnd > existingStart
          // -------------------------------------------------

          const overlaps = requestedStart < existingEnd && requestedEnd > existingStart;

          if (!overlaps) {
            continue;
          }

          bookedProfessionalIds.add(booking.professionalId.toString());
        }
      }
    }

    // =======================================================
    // REMOVE BUSY PROFESSIONALS
    // =======================================================

    const availableProfessionals = scheduledProfessionals.filter((professional) => !bookedProfessionalIds.has(professional._id.toString()));
    const capacityAvailableProfessionals = availableProfessionals.slice(Math.min(unassignedMatchingBookings, availableProfessionals.length));

    // =======================================================
    // RETURN FRONTEND DATA
    // =======================================================

    const result = capacityAvailableProfessionals.map((professional) => ({
      id: professional._id,
      name: professional.name,
      profileImage: professional.profileImage || "",
      rating: professional.rating || 0,
      totalReviews: professional.totalReviews || 0,
      completedJobs: professional.completedJobs || 0,
      experience: professional.experience || 0,
      verified: professional.verified || false,
      location: professional.location || "",
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

// =========================================================
// GET PROFESSIONAL BY ID
// Used for displaying an already-assigned professional
// =========================================================

router.get("/professionals/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid professional ID",
      });
    }

    const professional = await Professional.findById(id).lean();

    if (!professional) {
      return res.status(404).json({
        success: false,
        error: "Professional not found",
      });
    }

    return res.json({
      success: true,
      professional: {
        id: professional._id,
        name: professional.name,
        profileImage: professional.profileImage || "",
        rating: professional.rating || 0,
        totalReviews: professional.totalReviews || 0,
        completedJobs: professional.completedJobs || 0,
        experience: professional.experience || 0,
        verified: professional.verified || false,
        location: professional.location || "",
      },
    });
  } catch (error) {
    console.error("Error fetching professional:", error);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

module.exports = router;
