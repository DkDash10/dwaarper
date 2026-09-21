const Professional = require("../models/Professional");
const Order = require("../models/Orders");

// =========================================================
// CONFIG
// =========================================================

const JOB_INTERVAL = 5 * 1000;

const ACTIVE_STATUSES = ["confirmed", "assigning", "assigned", "on_the_way", "arrived", "in_progress"];

let lifecycleRunning = false;

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

  return requestedStart >= professionalStart && requestedEnd <= professionalEnd;
};

// =========================================================
// BOOKING INTERVAL
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
  };
};

// =========================================================
// CHECK PROFESSIONAL CONFLICT
// =========================================================

const isProfessionalBooked = (professionalId, requestedStart, requestedEnd, allOrders) => {
  const professionalIdString = String(professionalId);

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

        if (booking.status === "cancelled") {
          continue;
        }

        if (String(booking.professionalId) !== professionalIdString) {
          continue;
        }

        const interval = getBookingInterval(bookingHeader, item);

        if (!interval) {
          continue;
        }

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

  const available = [];

  for (const professional of professionals) {
    // Working hours
    if (!isProfessionalWorking(professional, date, time, duration)) {
      continue;
    }

    // Existing booking
    const alreadyBooked = isProfessionalBooked(professional._id, requestedStart, requestedEnd, allOrders);

    if (alreadyBooked) {
      continue;
    }

    available.push(professional);
  }

  if (!available.length) {
    return null;
  }

  // Random assignment
  const randomIndex = Math.floor(Math.random() * available.length);

  return available[randomIndex];
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
        if (!Array.isArray(orderArray) || orderArray.length <= 1) {
          continue;
        }

        const bookingHeader = orderArray[0];

        if (!bookingHeader) {
          continue;
        }

        // Only paid bookings need assignment. Include assigned headers so a
        // partially assigned multi-service booking can finish on a later run.
        // Only paid bookings need assignment. Include "confirmed" so a
        // freshly-paid booking actually enters the assignment flow, and
        // "assigned" so a partially assigned multi-service booking can
        // finish on a later run.
        if (bookingHeader.paymentStatus !== "paid" || !["confirmed", "assigning", "assigned"].includes(bookingHeader.status)) {
          continue;
        }

        for (let index = 1; index < orderArray.length; index++) {
          const item = orderArray[index];

          if (!item?.booking) {
            continue;
          }

          const booking = item.booking;

          if (booking.status === "cancelled") {
            continue;
          }

          // Already assigned
          if (booking.professionalId) {
            continue;
          }

          const serviceId = item.serviceId || item.id;

          const date = booking.date || bookingHeader.Order_date;

          const time = booking.time;

          const duration = Number(booking.duration) || 60;

          if (!serviceId || !date || !time) {
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
            // Don't spam the terminal.
            // Only print a useful message.
            console.log(`[Booking] ${bookingHeader.id} — no professional available for ${date} ${time}`);

            continue;
          }

          // ------------------------------------------------
          // PROFESSIONAL OBJECT
          // ------------------------------------------------

          const professionalData = {
            id: professional._id,
            name: professional.name,
            profileImage: professional.profileImage || "",
            rating: professional.rating || 0,
            totalReviews: professional.totalReviews || 0,
            completedJobs: professional.completedJobs || 0,
            experience: professional.experience || 0,
            verified: professional.verified || false,
            location: professional.location || "",
          };

          // ------------------------------------------------
          // SAVE EVERYTHING
          // ------------------------------------------------

          const allServicesAssigned = orderArray.slice(1).every((serviceItem, serviceOffset) => {
            if (!serviceItem?.booking) {
              return true;
            }

            return Boolean(serviceItem.booking.professionalId) || serviceOffset === index - 1;
          });

          const nextBookingStatus = allServicesAssigned ? "assigned" : "assigning";

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
                [`order_data.$[booking].${index}.booking.professionalId`]: professional._id,

                [`order_data.$[booking].${index}.booking.professionalName`]: professional.name,

                [`order_data.$[booking].${index}.booking.professional`]: professionalData,

                [`order_data.$[booking].${index}.booking.status`]: "assigned",

                "order_data.$[booking].0.status": nextBookingStatus,

                "order_data.$[booking].0.professionalAssignedAt": new Date(),
              },
            },
            {
              arrayFilters: [
                {
                  "booking.0.id": bookingHeader.id,

                  [`booking.${index}.booking.professionalId`]: {
                    $in: [null],
                  },
                },
              ],
            },
          );

          if (result.modifiedCount) {
            // Keep the current run's snapshot in sync so another service in
            // this booking cannot receive the same professional and slot.
            booking.professionalId = professional._id;
            booking.professionalName = professional.name;
            booking.professional = professionalData;
            booking.status = "assigned";
            bookingHeader.status = nextBookingStatus;

            console.log(`[Booking] ${bookingHeader.id}`);

            console.log(`[Assignment] ${professional.name} assigned`);
          } else {
            console.log(`[Assignment] ${bookingHeader.id} was changed before ${professional.name} could be assigned`);
          }
        }
      }
    }
  } catch (error) {
    console.error("[Booking Lifecycle Error]", error);
  }
};

// =========================================================
// ASSIGNED → ON THE WAY
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

        if (!bookingHeader || bookingHeader.status !== "assigned") {
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
                "booking.0.id": bookingHeader.id,
              },
            ],
          },
        );

        if (result.modifiedCount) {
          console.log(`[Booking] ${bookingHeader.id} → on_the_way`);
        }
      }
    }
  } catch (error) {
    console.error("[On The Way Error]", error);
  }
};

// =========================================================
// RUN LIFECYCLE
// =========================================================

const runBookingLifecycle = async () => {
  if (lifecycleRunning) {
    return;
  }

  lifecycleRunning = true;

  try {
    await assignPendingBookings();

    await updateOnTheWayBookings();
  } catch (error) {
    console.error("[Lifecycle Error]", error);
  } finally {
    lifecycleRunning = false;
  }
};

// =========================================================
// START
// =========================================================

const startBookingLifecycle = () => {
  console.log("Booking lifecycle worker started.");

  // Run immediately
  runBookingLifecycle();

  // Then every 30 seconds
  setInterval(runBookingLifecycle, JOB_INTERVAL);
};

module.exports = {
  startBookingLifecycle,
  runBookingLifecycle,
};
