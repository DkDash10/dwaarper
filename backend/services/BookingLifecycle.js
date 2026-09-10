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

  // Booking date/time is stored in IST.
  // Explicit timezone prevents Render/UTC server differences.
  const value = new Date(`${date}T${time}:00+05:30`);

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

const isProfessionalWorking = (professional, date, time, duration = 60) => {
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

      for (const item of orderArray.slice(1)) {
        const booking = item?.booking;

        if (!booking?.professionalId) {
          continue;
        }

        // Cancelled bookings do not block a professional.
        if (booking.status === "cancelled") {
          continue;
        }

        // Completed bookings do not block a professional.
        if (booking.status === "completed") {
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
// GET AGGREGATE ORDER STATUS
// =========================================================

const getAggregateStatus = (orderArray) => {
  if (!Array.isArray(orderArray) || orderArray.length <= 1) {
    return "pending";
  }

  const header = orderArray[0];

  const serviceItems = orderArray.slice(1).filter((item) => item?.booking);

  if (!serviceItems.length) {
    return header?.status || "pending";
  }

  const statuses = serviceItems.map((item) => item.booking.status || header?.status || "pending");

  const allCancelled = statuses.every((status) => status === "cancelled");

  if (allCancelled) {
    return "cancelled";
  }

  const allFinished = statuses.every((status) => status === "completed" || status === "cancelled");

  if (allFinished) {
    return "completed";
  }

  // Highest active stage wins.
  const priority = ["in_progress", "arrived", "on_the_way", "assigned", "assigning", "confirmed"];

  for (const status of priority) {
    if (statuses.includes(status)) {
      return status;
    }
  }

  return header?.status || "pending";
};

// =========================================================
// UPDATE ORDER HEADER STATUS
// =========================================================

const updateOrderHeaderStatus = async (email, bookingId) => {
  const order = await Order.findOne({
    email,
  }).lean();

  if (!order) {
    return;
  }

  const orderArray = order.order_data?.find((array) => Array.isArray(array) && array[0] && String(array[0].id) === String(bookingId));

  if (!orderArray) {
    return;
  }

  const newHeaderStatus = getAggregateStatus(orderArray);

  const currentHeaderStatus = orderArray[0]?.status;

  if (currentHeaderStatus === newHeaderStatus) {
    return;
  }

  await Order.updateOne(
    {
      email,
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
        "order_data.$[booking].0.status": newHeaderStatus,
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

        // Only paid orders waiting for assignment.
        if (bookingHeader.paymentStatus !== "paid") {
          continue;
        }

        // We check the individual services below.
        let changedAnything = false;

        for (let index = 1; index < orderArray.length; index++) {
          const item = orderArray[index];

          if (!item?.booking) {
            continue;
          }

          const booking = item.booking;

          const serviceStatus = booking.status || bookingHeader.status || "assigning";

          // -------------------------------------------------
          // Cancelled services NEVER get reassigned.
          // -------------------------------------------------

          if (serviceStatus === "cancelled") {
            continue;
          }

          // -------------------------------------------------
          // Completed services NEVER get reassigned.
          // -------------------------------------------------

          if (serviceStatus === "completed") {
            continue;
          }

          // -------------------------------------------------
          // Already has professional
          // -------------------------------------------------

          if (booking.professionalId) {
            if (booking.status !== "assigned") {
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
                    [`order_data.$[booking].${index}.booking.status`]: "assigned",
                  },
                },
                {
                  arrayFilters: [
                    {
                      "booking.0.id": bookingHeader.id,
                      [`booking.${index}.booking.professionalId`]: { $exists: true },
                    },
                  ],
                },
              );

              if (result.modifiedCount) {
                changedAnything = true;
              }
            }

            continue;
          }

          // -------------------------------------------------
          // Need service information
          // -------------------------------------------------

          const serviceId = item.serviceId || item.id;

          const date = booking.date || bookingHeader.Order_date;

          const time = booking.time;

          const duration = Number(booking.duration) || 60;

          if (!serviceId || !date || !time) {
            continue;
          }

          // -------------------------------------------------
          // Find professional for THIS service
          // -------------------------------------------------

          const professional = await findAvailableProfessional({
            serviceId,
            date,
            time,
            duration,
            allOrders: orders,
          });

          // -------------------------------------------------
          // No professional available
          // -------------------------------------------------

          if (!professional) {
            if (booking.status !== "assigning") {
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
                    [`order_data.$[booking].${index}.booking.status`]: "assigning",
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
                changedAnything = true;
              }
            }

            continue;
          }

          // -------------------------------------------------
          // Assign professional
          // -------------------------------------------------

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

                [`order_data.$[booking].${index}.booking.status`]: "assigned",
              },
            },
            {
              arrayFilters: [
                {
                  "booking.0.id": bookingHeader.id,
                  [`booking.${index}.booking.professionalId`]: { $exists: false },
                },
              ],
            },
          );

          if (result.modifiedCount) {
            changedAnything = true;

            console.log(`Professional ${professional.name} assigned to service ${index - 1} of booking ${bookingHeader.id}`);

            // Update our in-memory snapshot so another
            // service in this same lifecycle run sees
            // this professional as occupied.
            booking.professionalId = professional._id;

            booking.professionalName = professional.name;

            booking.status = "assigned";
          }
        }

        // ---------------------------------------------------
        // Update aggregate header only after services
        // ---------------------------------------------------

        if (changedAnything) {
          await updateOrderHeaderStatus(order.email, bookingHeader.id);
        }
      }
    }
  } catch (error) {
    console.error("Booking assignment error:", error);
  }
};

// =========================================================
// AUTOMATIC BOOKING LIFECYCLE
// TEMPORARY UNTIL PROFESSIONAL DASHBOARD IS BUILT
// =========================================================

const updateBookingStatuses = async () => {
  try {
    const orders = await Order.find({}).lean();

    const now = new Date();

    for (const order of orders) {
      for (const orderArray of order.order_data || []) {
        if (!Array.isArray(orderArray) || orderArray.length <= 1) {
          continue;
        }

        const bookingHeader = orderArray[0];

        if (!bookingHeader) {
          continue;
        }

        // ---------------------------------------------------
        // Process EVERY SERVICE independently
        // ---------------------------------------------------

        for (let index = 1; index < orderArray.length; index++) {
          const serviceItem = orderArray[index];

          if (!serviceItem?.booking) {
            continue;
          }

          const booking = serviceItem.booking;

          const currentStatus = booking.status || bookingHeader.status || "assigned";

          // Cancelled and completed services
          // are finished.
          if (["cancelled", "completed"].includes(currentStatus)) {
            continue;
          }

          // A professional must be assigned.
          if (!booking.professionalId) {
            continue;
          }

          // -------------------------------------------------
          // BOOKING TIME
          // -------------------------------------------------

          const bookingDate = booking.date || bookingHeader.Order_date;

          const bookingTime = booking.time;

          const duration = Number(booking.duration) || 60;

          const bookingStart = parseDateTime(bookingDate, bookingTime);

          if (!bookingStart) {
            continue;
          }

          // -------------------------------------------------
          // LIFECYCLE TIMES
          // -------------------------------------------------

          const oneHourBefore = new Date(bookingStart.getTime() - 60 * 60 * 1000);

          // 5 minutes after scheduled time
          const serviceStart = new Date(bookingStart.getTime() + 5 * 60 * 1000);

          const bookingEnd = new Date(bookingStart.getTime() + duration * 60 * 1000);

          // -------------------------------------------------
          // DETERMINE NEXT STATUS
          // -------------------------------------------------

          let nextStatus = null;
          let timestampField = null;

          /*
           * Always check the latest stage first.
           *
           * Example:
           *
           * Booking: 2:00 PM
           * Server checked at 11:00 PM
           * → completed
           *
           * It will NOT get stuck on on_the_way.
           */

          if (now >= bookingEnd) {
            nextStatus = "completed";
            timestampField = "completedAt";
          } else if (now >= serviceStart) {
            nextStatus = "in_progress";
            timestampField = "startedAt";
          } else if (now >= bookingStart) {
            nextStatus = "arrived";
            timestampField = "arrivedAt";
          } else if (now >= oneHourBefore) {
            nextStatus = "on_the_way";
            timestampField = "onTheWayAt";
          }

          if (!nextStatus) {
            continue;
          }

          if (currentStatus === nextStatus) {
            continue;
          }

          // -------------------------------------------------
          // UPDATE ONLY THIS SERVICE
          // -------------------------------------------------

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
                [`order_data.$[booking].${index}.booking.status`]: nextStatus,

                [`order_data.$[booking].${index}.booking.${timestampField}`]: now,
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
            console.log(`Booking ${bookingHeader.id}, service ${index - 1}: ${currentStatus} → ${nextStatus}`);

            // Keep our local snapshot current.
            booking.status = nextStatus;
          }
        }

        // ---------------------------------------------------
        // Recalculate aggregate order status
        // ---------------------------------------------------

        await updateOrderHeaderStatus(order.email, bookingHeader.id);
      }
    }
  } catch (error) {
    console.error("Booking lifecycle status error:", error);
  }
};

// =========================================================
// RUN ALL BOOKING JOBS
// =========================================================

const runBookingLifecycle = async () => {
  await assignPendingBookings();
  await updateBookingStatuses();
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
