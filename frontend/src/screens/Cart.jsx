import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuCalendarDays, LuTrash2 } from "react-icons/lu";
import { useCart, useDispatchCart } from "../components/ContextReducer";
import Navigationbar from "../components/Navigationbar";
import Footer from "../components/Footer";

const getNext14Days = () => {
  const days = [];
  const now = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);

    days.push({
      value: [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-"),

      day: date.toLocaleDateString("en-IN", {
        weekday: "short",
      }),

      date: date.toLocaleDateString("en-IN", {
        day: "numeric",
      }),

      month: date.toLocaleDateString("en-IN", {
        month: "short",
      }),

      isToday: i === 0,
    });
  }

  return days;
};

const TIME_SLOTS = Array.from({ length: 12 }, (_, index) => {
  const hour = index + 9;

  const displayHour = hour > 12 ? hour - 12 : hour;
  const period = hour >= 12 ? "PM" : "AM";

  return {
    value: `${String(hour).padStart(2, "0")}:00`,
    label: `${displayHour}:00 ${period}`,
  };
});

const getAvailableTimeSlots = (dateValue) => {
  const now = new Date();

  const todayValue = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");

  // Future dates get every slot
  if (dateValue !== todayValue) {
    return TIME_SLOTS;
  }

  // Today — remove slots that have already passed
  return TIME_SLOTS.filter((slot) => {
    const [hours, minutes] = slot.value.split(":").map(Number);

    const slotTime = new Date(now);
    slotTime.setHours(hours, minutes, 0, 0);

    return slotTime > now;
  });
};

export default function Cart() {
  const data = useCart();
  const dispatch = useDispatchCart();
  const navigate = useNavigate();

  const [bookingDetails, setBookingDetails] = useState({});
  const [openProfessional] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [availability, setAvailability] = useState({});
  const [checkingAvailability, setCheckingAvailability] = useState({});

  useEffect(() => {
    const resetCheckoutState = () => {
      setIsCheckingOut(false);
    };

    window.addEventListener("pageshow", resetCheckoutState);

    return () => {
      window.removeEventListener("pageshow", resetCheckoutState);
    };
  }, []);

  const totalPrice = useMemo(() => {
    return data.reduce((total, item) => {
      const price = Number(item.price) || 0;
      return total + price;
    }, 0);
  }, [data]);

  const discount = totalPrice * 0.2;
  const finalPrice = totalPrice - discount;

  const updateBooking = (index, field, value) => {
    setBookingDetails((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value,
      },
    }));
  };

  const removeService = (item) => {
    dispatch({
      type: "REMOVE",
      itemId: item._id,
    });

    setBookingDetails((prev) => {
      const updated = { ...prev };
      delete updated[data.indexOf(item)];
      return updated;
    });
  };

  const isBookingComplete = data.every((_, index) => {
    const booking = bookingDetails[index];
    const availabilityData = availability[index];

    return booking?.date && booking?.time && availabilityData?.date === booking.date && availabilityData?.time === booking.time && availabilityData?.available === true;
  });

  const hasUnavailableSlot = data.some((_, index) => {
    const booking = bookingDetails[index];
    const availabilityData = availability[index];

    return booking?.date && booking?.time && availabilityData?.date === booking.date && availabilityData?.time === booking.time && availabilityData?.available === false;
  });

  const checkAvailability = async (index, date, time) => {
    const item = data[index];

    if (!item?.serviceId || !date || !time) {
      return false;
    }

    const key = `${index}-${date}-${time}`;

    setCheckingAvailability((prev) => ({
      ...prev,
      [key]: true,
    }));

    try {
      const API_BASE_URL =
        window.location.hostname === "localhost" || window.location.hostname === "192.168.0.107" ? `http://${window.location.hostname}:5000` : "https://dwaarper.onrender.com";

      const response = await fetch(
        `${API_BASE_URL}/api/professionals/available?serviceId=${encodeURIComponent(item.serviceId)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`,
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Unable to check availability.");
      }

      const professionals = result.professionals || [];

      setAvailability((prev) => ({
        ...prev,
        [index]: {
          date,
          time,
          available: professionals.length > 0,
          count: professionals.length,
          professionals,
        },
      }));

      return professionals.length > 0;
    } catch (error) {
      console.error("Availability check error:", error);

      setAvailability((prev) => ({
        ...prev,
        [index]: {
          date,
          time,
          available: false,
          count: 0,
          professionals: [],
          error: true,
        },
      }));

      return false;
    } finally {
      setCheckingAvailability((prev) => ({
        ...prev,
        [key]: false,
      }));
    }
  };

  const handleProceed = async () => {
    if (!isBookingComplete || isCheckingOut) return;

    setIsCheckingOut(true);

    try {
      const availabilityChecks = await Promise.all(
        data.map((item, index) => {
          const booking = bookingDetails[index];

          return checkAvailability(index, booking.date, booking.time);
        }),
      );

      if (availabilityChecks.some((available) => !available)) {
        alert("One or more selected slots are no longer available. Please choose another time.");

        setIsCheckingOut(false);
        return;
      }
    } catch (error) {
      setIsCheckingOut(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login before checkout.");
        navigate("/login");
        return;
      }

      const API_BASE_URL =
        window.location.hostname === "localhost" || window.location.hostname === "192.168.0.107" ? `http://${window.location.hostname}:5000` : "https://dwaarper.onrender.com";

      // Get the currently logged-in user's details
      const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });

      const userData = await userResponse.json();

      if (!userResponse.ok || !userData.success || !userData.user?.email) {
        throw new Error("Unable to get your account information.");
      }

      // Prepare products with booking details
      const products = data.map((item, index) => ({
        id: item.id,
        serviceId: item.serviceId,
        name: item.name,
        img: item.img,
        service: item.service,
        price: Number(item.price) || 0,

        booking: {
          date: bookingDetails[index]?.date || null,
          time: bookingDetails[index]?.time || null,
          professional: bookingDetails[index]?.professional || null,
        },
      }));

      // Save cart data for Success.jsx
      localStorage.setItem("cartData", JSON.stringify(products));

      // Create Stripe Checkout Session through backend
      const response = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products,
          email: userData.user.email,
          order_date: new Date().toLocaleDateString("en-IN"),
        }),
      });

      const session = await response.json();

      if (!response.ok || !session.id || !session.url) {
        throw new Error(session.error || "Unable to create Stripe checkout session.");
      }

      // Redirect directly to Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      console.error("Checkout Error:", error);
      alert(error.message || "Something went wrong during checkout.");
      setIsCheckingOut(false);
    }
  };

  if (data.length === 0) {
    return (
      <>
        <Navigationbar />

        <main className="min-h-screen flex items-center bg-black px-5 py-24 text-white">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
              <LuCalendarDays size={26} className="text-white/50" />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">No bookings yet</h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/40">Add a service to your booking and choose a date and time that works for you.</p>

            <Link to="/services" className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90">
              Browse Services
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigationbar />

      <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-black  text-white">
        <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 pb-20 pt-24 sm:pt-32">
          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Booking</p>
            <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">Booking Summary</h1>

                <p className="mt-2 text-sm text-white/40">Choose a date and time for each service before checkout.</p>
              </div>

              <div className="text-sm text-white/40">
                {data.length} {data.length === 1 ? "service" : "services"}
              </div>
            </div>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Services */}
            <div className="space-y-5">
              {data.map((item, index) => {
                const booking = bookingDetails[index] || {};

                return (
                  <article
                    key={`${item.id}-${item.service}`}
                    className={`relative min-w-0 max-w-full overflow-visible rounded-3xl border border-white/[0.07] bg-white/[0.025] ${openProfessional === index ? "z-40" : "z-0"}`}
                  >
                    {/* Service header */}
                    <div className="flex min-w-0 gap-3 p-4 sm:gap-4 sm:p-6">
                      <img src={item.img} alt={item.name} className="h-20 w-20 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-28" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-base font-semibold text-white sm:text-lg">{item.name}</h2>

                            <p className="mt-1 text-xs text-white/40">{item.service}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeService(item)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-400/10 bg-red-400/[0.06] text-red-400/70 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-400"
                            aria-label={`Remove ${item.name}`}
                          >
                            <LuTrash2 size={15} />
                          </button>
                        </div>

                        <p className="mt-4 text-lg font-semibold">₹{Number(item.price).toLocaleString("en-IN")}</p>
                      </div>
                    </div>

                    {/* Booking controls */}
                    <div className="border-t border-white/[0.06] p-4 sm:p-6">
                      <div className="mb-5">
                        <p className="text-xs font-medium text-white/70">Select your slot</p>

                        <p className="mt-1 text-xs text-white/30">This slot applies only to this service.</p>
                      </div>

                      <div className="grid w-full min-w-0 gap-6 sm:grid-cols-2 sm:gap-4">
                        {/* Date */}
                        <div className="min-w-0">
                          <div className="relative">
                            <div>
                              <label className="mb-3 block text-[11px] font-medium uppercase tracking-wider text-white/30">Choose date</label>

                              <div className="booking-scrollbar flex w-full min-w-0 gap-2 overflow-x-auto pb-2">
                                {getNext14Days()
                                  .filter((date) => getAvailableTimeSlots(date.value).length > 0)
                                  .map((date) => {
                                    const booking = bookingDetails[index] || {};
                                    const selected = booking.date === date.value;

                                    return (
                                      <button
                                        key={date.value}
                                        type="button"
                                        onClick={() => {
                                          updateBooking(index, "date", date.value);
                                          updateBooking(index, "time", null);

                                          setAvailability((prev) => ({
                                            ...prev,
                                            [index]: null,
                                          }));
                                        }}
                                        className={`min-w-[62px] shrink-0 rounded-2xl border px-2 py-2 text-center transition ${selected ? "border-white/20 bg-white text-black" : "border-white/[0.07] bg-white/[0.035] text-white/60 hover:border-white/15 hover:bg-white/[0.06]"}`}
                                      >
                                        <span className="block text-[10px] font-medium uppercase">{date.isToday ? "Today" : date.day}</span>

                                        <span className="mt-1 block text-lg font-semibold">{date.date}</span>

                                        <span className="block text-[10px] text-current opacity-50">{date.month}</span>
                                      </button>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Time */}
                        <div className="min-w-0">
                          <label className="mb-3 block text-[11px] font-medium uppercase tracking-wider text-white/30">Choose time</label>
                          <div className="booking-scrollbar grid w-full min-w-0 max-h-[80px] grid-cols-2 gap-2 overflow-y-auto pr-2 sm:grid-cols-4">
                            {!bookingDetails[index]?.date ? (
                              <p className="col-span-full py-4 text-center text-xs text-white/25">Select a date first</p>
                            ) : (
                              getAvailableTimeSlots(bookingDetails[index].date).map((slot) => {
                                const booking = bookingDetails[index] || {};
                                const selected = booking.time === slot.value;
                                const slotUnavailable =
                                  selected && availability[index]?.date === booking.date && availability[index]?.time === slot.value && availability[index]?.available === false;

                                return (
                                  <button
                                    key={slot.value}
                                    type="button"
                                    disabled={slotUnavailable}
                                    onClick={async () => {
                                      const selectedDate = booking.date;

                                      updateBooking(index, "time", slot.value);

                                      await checkAvailability(index, selectedDate, slot.value);
                                    }}
                                    className={`rounded-xl border px-2 py-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:border-red-400/20 disabled:bg-red-400/[0.08] disabled:text-red-300/60 ${selected ? "border-white/20 bg-white text-black" : "border-white/[0.07] bg-white/[0.035] text-white/55 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"}`}
                                  >
                                    {slot.label}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Professional availability */}
                      <div className="mt-6">
                        <label className="mb-3 block text-[11px] font-medium uppercase tracking-wider text-white/30">Professional availability</label>

                        {!booking.date || !booking.time ? (
                          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-4">
                            <p className="text-sm font-medium text-white/70">Select a date and time</p>

                            <p className="mt-1 text-xs text-white/30">We'll find an available professional for your selected slot.</p>
                          </div>
                        ) : checkingAvailability[`${index}-${booking.date}-${booking.time}`] ? (
                          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-4">
                            <p className="text-sm font-medium text-white/70">Checking availability...</p>

                            <p className="mt-1 text-xs text-white/30">Finding professionals available for this slot.</p>
                          </div>
                        ) : availability[index]?.available ? (
                          <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.03] px-4 py-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-sm font-medium text-white/80">Professional available</p>

                                <p className="mt-1 text-xs text-white/35">Availability confirmed for this slot.</p>
                              </div>

                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-black">✓</div>
                            </div>

                            <p className="mt-3 text-[11px] text-cyan-300/60">A professional will be assigned automatically after payment.</p>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.04] px-4 py-4">
                            <p className="text-sm font-medium text-red-300/80">No professional available</p>

                            <p className="mt-1 text-xs text-red-300/40">All professionals for this service are unavailable at this date and time. Please choose another slot.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Summary */}
            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">Summary</p>
                <h2 className="mt-2 text-xl font-semibold">Your booking</h2>
                <div className="my-6 space-y-4">
                  {data.map((item, index) => (
                    <div key={`${item.id}-${item.service}-summary`} className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white/70">{item.name}</p>

                        <p className="mt-1 truncate text-xs text-white/30">{item.service}</p>

                        {bookingDetails[index]?.date && bookingDetails[index]?.time && (
                          <p className="mt-1 text-[11px] text-white/30">
                            {bookingDetails[index].date} · {bookingDetails[index].time}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 text-sm text-white/70">₹{Number(item.price).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/[0.07] pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/40">Subtotal</span>

                    <span className="text-sm text-white/70">₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/40">Discount (20%)</span>

                    <span className="text-sm text-green-400">-₹{discount.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                    <span className="text-sm font-medium text-white/60">Final Price</span>

                    <span className="text-xl font-semibold text-white">₹{finalPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleProceed}
                  disabled={!isBookingComplete || isCheckingOut}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
                >
                  {isCheckingOut ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                      <span>Processing...</span>
                    </>
                  ) : isBookingComplete ? (
                    "Proceed to Checkout"
                  ) : hasUnavailableSlot ? (
                    "Choose an available slot"
                  ) : (
                    "Select all slots"
                  )}
                </button>
                <p className="mt-4 text-center text-[11px] leading-5 text-white/25">Each service requires its own date and time slot.</p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
