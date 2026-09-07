const Professional = require("../models/Professional");
const Order = require("../models/Orders");

// =========================================================
// CONFIG
// =========================================================

const JOB_INTERVAL = 30 * 1000; // 30 seconds

const ACTIVE_STATUSES = ["confirmed", "assigning", "assigned", "on_the_way", "arrived", "in_progress"];

// =========================================================
// TIME HELPERS
// =========================================================

const parseDateTime = (date, time) => {
  if (!date || !time) return null;

  const value = new Date(`${date}T${time}:00`);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return value;
};

const parseTimeToMinutes = (time) => {
  if (!time || !time.includes(":")) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

const getBookingEndTime = (time, duration = 60) => {
  const startMinutes = parseTimeToMinutes(time);

  if (startMinutes === null) {
    return null;
  }

  return startMinutes + Number(duration || 60);
};

// =========================================================
// PROFESSIONAL WORKING HOURS
// =========================================================

const isProfessionalWorking = (professional, date, time, duration) => {
  const selectedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(selectedDate.getTime())) {
    return false;
  }

  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  const dayName = days[selectedDate.getDay()];

  const schedule = professional.schedule?.[dayName];

  if (!schedule || schedule.available !== true) {
    return false;
  }

  const requestedStart = parseTimeToMinutes(time);

  const requestedEnd = getBookingEndTime(time, duration);

  const professionalStart = parseTimeToMinutes(schedule.start);

  const professionalEnd = parseTimeToMinutes(schedule.end);

  if (requestedStart === null || requestedEnd === null || professionalStart === null || professionalEnd === null) {
    return false;
  }

  // Entire booking must fit inside working hours.
  return requestedStart >= professionalStart && requestedEnd <= professionalEnd;
};

// =========================================================
// GET BOOKING INTERVAL
// =========================================================

const getBookingInterval = (bookingHeader, serviceItem) => {
  const date = serviceItem?.booking?.date || bookingHeader?.Order_date;

  const time = serviceItem?.booking?.time;

  const duration = Number(serviceItem?.booking?.duration) || 60;

  const start = parseDateTime(date, time);

  if (!start) {
    return null;
  }

  const end = new Date(start.getTime() + duration * 60 * 1000);

  return {
    start,
    end,
    date,
    time,
    duration,
  };
};

// =========================================================
// CHECK PROFESSIONAL BOOKING CONFLICT
// =========================================================

const isProfessionalBooked = (professionalId, requestedStart, requestedEnd, allOrders) => {
  const professionalIdString = professionalId.toString();

  for (const order of allOrders) {
    for (const orderArray of order.order_data || []) {
      if (!Array.isArray(orderArray) || !orderArray.length) {
        continue;
      }

      const bookingHeader = orderArray[0];

      if (!bookingHeader) {
        continue;
      }

      if (!ACTIVE_STATUSES.includes(bookingHeader.status)) {
        continue;
      }

      for (const item of orderArray.slice(1)) {
        const booking = item?.booking;

        if (!booking?.professionalId) {
          continue;
        }

        if (booking.professionalId.toString() !== professionalIdString) {
          continue;
        }

        const interval = getBookingInterval(bookingHeader, item);

        if (!interval) {
          continue;
        }

        // Overlap test:
        //
        // requestedStart < existingEnd
        // AND
        // requestedEnd > existingStart
        //

        if (requestedStart < interval.end && requestedEnd > interval.start) {
          return true;
        }
      }
    }
  }

  return false;
};

// =========================================================
// FIND AVAILABLE PROFESSIONAL
// =========================================================

const findAvailableProfessional = async ({ serviceId, date, time, duration, allOrders }) => {
  if (!serviceId || !date || !time) {
    return null;
  }

  const professionals = await Professional.find({
    active: true,
    services: serviceId,
  }).lean();

  if (!professionals.length) {
    return null;
  }

  const requestedStart = parseDateTime(date, time);

  if (!requestedStart) {
    return null;
  }

  const requestedEnd = new Date(requestedStart.getTime() + Number(duration || 60) * 60 * 1000);

  for (const professional of professionals) {
    // Working hours
    if (!isProfessionalWorking(professional, date, time, duration)) {
      continue;
    }

    // Existing booking conflict
    const alreadyBooked = isProfessionalBooked(professional._id, requestedStart, requestedEnd, allOrders);

    if (alreadyBooked) {
      continue;
    }

    return professional;
  }

  return null;
};

// =========================================================
// AUTO ASSIGN BOOKINGS
// =========================================================

const assignPendingBookings = async () => {
  try {
    const orders = await Order.find({}).lean();

    if (!orders.length) {
      return;
    }

    for (const order of orders) {
      for (const orderArray of order.order_data || []) {
        if (!Array.isArray(orderArray) || !orderArray.length) {
          continue;
        }

        const bookingHeader = orderArray[0];

        if (!bookingHeader) {
          continue;
        }

        // Only unpaid/assigned bookings are ignored.
        if (bookingHeader.status !== "assigning") {
          continue;
        }

        if (bookingHeader.paymentStatus !== "paid") {
          continue;
        }

        let allAssigned = true;

        // -------------------------------------------------
        // Try to assign each service
        // -------------------------------------------------

        for (const item of orderArray.slice(1)) {
          if (!item?.booking) {
            continue;
          }

          // Already assigned
          if (item.booking.professionalId) {
            continue;
          }

          const serviceId = item.serviceId || item.id;

          const date = item.booking.date || bookingHeader.Order_date;

          const time = item.booking.time;

          const duration = Number(item.booking.duration) || 60;

          if (!serviceId || !date || !time) {
            allAssigned = false;
            continue;
          }

          const professional = await findAvailableProfessional({
            serviceId,
            date,
            time,
            duration,
            allOrders: orders,
          });

          if (!professional) {
            allAssigned = false;
            continue;
          }

          // ------------------------------------------------
          // Assign professional
          // ------------------------------------------------

          item.booking.professionalId = professional._id;

          item.booking.professionalName = professional.name;
        }

        // -------------------------------------------------
        // If everything is assigned
        // -------------------------------------------------

        if (allAssigned) {
          const now = new Date();

          // Update the booking header locally
          orderArray[0].status = "assigned";
          orderArray[0].professionalAssignedAt = now;

          // Save the complete order_data array in ONE update.
          // This avoids MongoDB path conflicts with nested array updates.
          const updatedOrderData = order.order_data.map((existingArray) => {
            if (Array.isArray(existingArray) && existingArray.some((item) => item.id === bookingHeader.id)) {
              return orderArray;
            }

            return existingArray;
          });

          const result = await Order.updateOne(
            {
              email: order.email,
              order_data: {
                $elemMatch: {
                  $elemMatch: {
                    id: bookingHeader.id,
                  },
                },
              },
            },
            {
              $set: {
                order_data: updatedOrderData,
              },
            },
          );

          if (result.modifiedCount) {
            console.log(`Professional assigned to booking ${bookingHeader.id}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Booking assignment error:", error);
  }
};

// =========================================================
// MOVE ASSIGNED → ON THE WAY
// =========================================================

const updateOnTheWayBookings = async () => {
  try {
    const orders = await Order.find({}).lean();

    const now = new Date();

    for (const order of orders) {
      for (const orderArray of order.order_data || []) {
        if (!Array.isArray(orderArray) || !orderArray.length) {
          continue;
        }

        const bookingHeader = orderArray[0];

        if (!bookingHeader) {
          continue;
        }

        if (bookingHeader.status !== "assigned") {
          continue;
        }

        const firstService = orderArray[1];

        if (!firstService?.booking) {
          continue;
        }

        const bookingDate = firstService.booking.date || bookingHeader.Order_date;

        const bookingTime = firstService.booking.time;

        const bookingStart = parseDateTime(bookingDate, bookingTime);

        if (!bookingStart) {
          continue;
        }

        const oneHourBefore = new Date(bookingStart.getTime() - 60 * 60 * 1000);

        if (now < oneHourBefore) {
          continue;
        }

        // Don't move bookings that are already
        // past their scheduled time without
        // being assigned correctly.
        if (now >= bookingStart) {
          continue;
        }

        const result = await Order.updateOne(
          {
            email: order.email,

            order_data: {
              $elemMatch: {
                $elemMatch: {
                  id: bookingHeader.id,
                },
              },
            },
          },
          {
            $set: {
              "order_data.$[booking].0.status": "on_the_way",

              "order_data.$[booking].0.onTheWayAt": now,
            },
          },
          {
            arrayFilters: [
              {
                booking: {
                  $elemMatch: {
                    id: bookingHeader.id,
                  },
                },
              },
            ],
          },
        );

        if (result.modifiedCount) {
          console.log(`Booking ${bookingHeader.id} is now on the way`);
        }
      }
    }
  } catch (error) {
    console.error("On-the-way scheduler error:", error);
  }
};

// =========================================================
// RUN ALL BOOKING JOBS
// =========================================================

const runBookingLifecycle = async () => {
  await assignPendingBookings();
  await updateOnTheWayBookings();
};

// =========================================================
// START JOB
// =========================================================

const startBookingLifecycle = () => {
  console.log("Booking lifecycle worker started.");

  // Run immediately after server starts.
  runBookingLifecycle();

  // Then every 30 seconds.
  setInterval(runBookingLifecycle, JOB_INTERVAL);
};

module.exports = {
  startBookingLifecycle,
};
