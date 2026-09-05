import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuCalendarDays, LuTrash2, LuChevronDown } from "react-icons/lu";
import { useCart, useDispatchCart } from "../components/ContextReducer";
import Navigationbar from "../components/Navigationbar";
import Footer from "../components/Footer";

const getNext14Days = () => {
  const days = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const dayNumber = String(date.getDate()).padStart(2, "0");

    days.push({
      value: `${year}-${month}-${dayNumber}`,
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

const RECOMMENDED_PROFESSIONALS = [
  {
    id: "rahul-sharma",
    name: "Rahul Sharma",
    rating: 4.9,
    jobs: "520+",
    verified: true,
  },
  {
    id: "amit-kumar",
    name: "Amit Kumar",
    rating: 4.8,
    jobs: "410+",
    verified: true,
  },
  {
    id: "sameer-patil",
    name: "Sameer Patil",
    rating: 4.7,
    jobs: "380+",
    verified: true,
  },
];

export default function Cart() {
  const data = useCart();
  const dispatch = useDispatchCart();
  const navigate = useNavigate();

  const [bookingDetails, setBookingDetails] = useState({});
  const [openProfessional, setOpenProfessional] = useState(null);

  const totalPrice = useMemo(() => {
    return data.reduce((total, item) => {
      const price = Number(item.price) || 0;
      return total + price;
    }, 0);
  }, [data]);

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
      id: item.id,
      service: item.service,
    });

    setBookingDetails((prev) => {
      const updated = { ...prev };
      delete updated[data.indexOf(item)];
      return updated;
    });
  };

  const isBookingComplete = data.every((_, index) => {
    const booking = bookingDetails[index];

    return booking?.date && booking?.time;
  });

  const handleProceed = () => {
    if (!isBookingComplete) return;

    navigate("/checkout", {
      state: {
        items: data,
        bookingDetails,
      },
    });
  };

  if (data.length === 0) {
    return (
      <>
        <Navigationbar />

        <main className="min-h-[70vh] bg-black px-5 py-24 text-white">
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

      <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-black px-3 pb-16 pt-24 text-white sm:px-6 sm:pb-20 sm:pt-28">
        {" "}
        <div className="mx-auto w-full min-w-0 max-w-7xl">
          {" "}
          {/* Header */}
          <div className="mb-8 sm:mb-10">
            {" "}
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
                    className={`
   relative
  min-w-0
  max-w-full
  overflow-visible
  rounded-3xl
  border
  border-white/[0.07]
  bg-white/[0.025]
  ${openProfessional === index ? "z-40" : "z-0"}
  `}
                  >
                    {/* Service header */}
                    <div className="flex min-w-0 gap-3 p-4 sm:gap-4 sm:p-6">
                      {" "}
                      <img
                        src={item.img}
                        alt={item.name}
                        className="
                         h-20
  w-20
  shrink-0
  rounded-2xl
  object-cover
  sm:h-28
  sm:w-28
                        "
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-base font-semibold text-white sm:text-lg">{item.name}</h2>

                            <p className="mt-1 text-xs text-white/40">{item.service}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeService(item)}
                            className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-red-400/10
                              bg-red-400/[0.06]
                              text-red-400/70
                              transition
                              hover:border-red-400/20
                              hover:bg-red-400/10
                              hover:text-red-400
                            "
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
                        {" "}
                        {/* Date */}
                        <div className="min-w-0">
                          {" "}
                          <div className="relative">
                            <div>
                              <label className="mb-3 block text-[11px] font-medium uppercase tracking-wider text-white/30">Choose date</label>

                              <div className="booking-scrollbar flex w-full min-w-0 gap-2 overflow-x-auto pb-2">
                                {getNext14Days().map((date) => {
                                  const booking = bookingDetails[index] || {};
                                  const selected = booking.date === date.value;

                                  return (
                                    <button
                                      key={date.value}
                                      type="button"
                                      onClick={() => updateBooking(index, "date", date.value)}
                                      className={`
          min-w-[62px]
          shrink-0
          rounded-2xl
          border
          px-2
          py-2
          text-center
          transition
          ${selected ? "border-white/20 bg-white text-black" : "border-white/[0.07] bg-white/[0.035] text-white/60 hover:border-white/15 hover:bg-white/[0.06]"}
        `}
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
                          {" "}
                          <label className="mb-3 block text-[11px] font-medium uppercase tracking-wider text-white/30">Choose time</label>
                          <div className="booking-scrollbar grid w-full min-w-0 max-h-[80px] grid-cols-2 gap-2 overflow-y-auto pr-2 sm:grid-cols-4">
                            {" "}
                            {TIME_SLOTS.map((slot) => {
                              const booking = bookingDetails[index] || {};
                              const selected = booking.time === slot.value;

                              return (
                                <button
                                  key={slot.value}
                                  type="button"
                                  onClick={() => updateBooking(index, "time", slot.value)}
                                  className={`
            rounded-xl
            border
            px-2
            py-3
            text-xs
            font-medium
            transition
            ${selected ? "border-white/20 bg-white text-black" : "border-white/[0.07] bg-white/[0.035] text-white/55 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"}
          `}
                                >
                                  {slot.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Professional */}
                      <div className="mt-6">
                        <label className="mb-3 block text-[11px] font-medium uppercase tracking-wider text-white/30">Professional</label>

                        <div className="relative">
                          {/* Selected professional */}
                          <button
                            type="button"
                            onClick={() => setOpenProfessional(openProfessional === index ? null : index)}
                            className="
        flex
        w-full
        items-center
        justify-between
        rounded-2xl
        border
        border-white/[0.07]
        bg-white/[0.035]
        px-4
        py-4
        text-left
        transition
        hover:border-white/15
      "
                          >
                            <div className="min-w-0">
                              {booking?.professional ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-white/85">{booking.professional.name}</p>

                                    <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/45">Selected</span>
                                  </div>

                                  <p className="mt-1 text-xs text-white/35">
                                    ★ {booking.professional.rating} · {booking.professional.jobs} jobs completed
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm font-medium text-white/80">Our Recommended</p>

                                  <p className="mt-1 text-xs text-white/30">Choose a professional for your selected slot.</p>
                                </>
                              )}
                            </div>

                            <LuChevronDown
                              size={16}
                              className={`
          shrink-0
          text-white/35
          transition-transform
          duration-200
          ${openProfessional === index ? "rotate-180" : ""}
        `}
                            />
                          </button>

                          {/* Dropdown */}
                          {openProfessional === index && (
                            <div
                              className="
  absolute
  left-0
  right-0
 bottom-[calc(100%+8px)]
  z-30
  w-full
  max-w-full
  overflow-hidden
  rounded-2xl
  border
  border-white/[0.08]
  bg-[#111111]
  p-1.5
  shadow-[0_20px_60px_rgba(0,0,0,0.5)]
"
                            >
                              <div className="px-3 pb-2 pt-2">
                                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">Recommended professionals</p>
                              </div>

                              <div className="max-h-[220px] overflow-y-auto booking-scrollbar">
                                {RECOMMENDED_PROFESSIONALS.map((professional) => {
                                  const selected = booking?.professional?.id === professional.id;

                                  return (
                                    <button
                                      key={professional.id}
                                      type="button"
                                      onClick={() => {
                                        updateBooking(index, "professional", professional);

                                        setOpenProfessional(null);
                                      }}
                                      className={`
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-left
                  transition
                  ${selected ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"}
                `}
                                    >
                                      {/* Avatar */}
                                      <div
                                        className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-white/[0.08]
                    text-sm
                    font-semibold
                    text-white/70
                  "
                                      >
                                        {professional.name.charAt(0)}
                                      </div>

                                      {/* Details */}
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                          <p className="min-w-0 truncate text-sm font-medium text-white/80">{professional.name}</p>

                                          {professional.verified && <span className="text-[9px] text-cyan-300/80">Verified</span>}
                                        </div>

                                        <p className="mt-1 text-xs text-white/35">
                                          ★ {professional.rating} · {professional.jobs} jobs completed
                                        </p>
                                      </div>

                                      {/* Selection indicator */}
                                      <div
                                        className={`
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    ${selected ? "border-white bg-white" : "border-white/15"}
                  `}
                                      >
                                        {selected && <span className="h-2 w-2 rounded-full bg-black" />}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Summary */}
            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
                {" "}
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
                <div className="border-t border-white/[0.07] pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/40">Total</span>

                    <span className="text-xl font-semibold text-white">₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleProceed}
                  disabled={!isBookingComplete}
                  className="
                    mt-6
                    w-full
                    rounded-full
                    bg-white
                    px-5
                    py-3.5
                    text-sm
                    font-medium
                    text-black
                    transition
                    hover:bg-white/90
                    disabled:cursor-not-allowed
                    disabled:bg-white/10
                    disabled:text-white/30
                  "
                >
                  {isBookingComplete ? "Proceed to Checkout" : "Select all slots"}
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
