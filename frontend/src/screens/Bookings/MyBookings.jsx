import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock3, ChevronLeft, ChevronRight, PackageCheck, CircleAlert, Loader2, MapPin } from "lucide-react";
import Navigationbar from "../../components/Navigationbar";
import Footer from "../../components/Footer";

const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "192.168.0.107" ? `http://${window.location.hostname}:5000` : "https://dwaarper.onrender.com";

const MyBookings = () => {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ORDERS_PER_PAGE = 5;

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async (showLoading = false) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError(null);

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please login to view your bookings.");
        }

        // Get authenticated user's email
        const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        });

        const userResult = await userResponse.json();

        if (!userResponse.ok || !userResult?.user?.email) {
          throw new Error("Unable to retrieve your account.");
        }

        // Get bookings
        const response = await fetch(`${API_BASE_URL}/api/order-data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userResult.user.email,
            timeFilter: "all",
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Failed to load bookings.");
        }

        if (isMounted) {
          setOrders(result?.orderData?.order_data || []);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);

        if (isMounted) {
          setError(error.message);
        }
      } finally {
        if (showLoading && isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial load
    fetchOrders(true);

    // Refresh booking status every 30 seconds
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 30 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  /*
   * Booking date is the actual service date.
   * order.date is currently the date on which the order was created.
   */
  const getBookingDate = (order) => {
    return order?.booking?.date || order?.date || null;
  };

  const getBookingTime = (order) => {
    return order?.booking?.time || null;
  };

  const getProfessional = (order) => {
    return order?.booking?.professional || null;
  };

  const getOrderCreatedDate = (order) => {
    return order?.orderCreatedAt || order?.createdAt || order?.orderDate || order?.Order_date || order?.date || null;
  };

  const isCompleted = (order) => {
    return order?.status === "completed";
  };

  const isUpcoming = useCallback((order) => {
    if (isCompleted(order)) return false;

    const bookingDate = getBookingDate(order);

    if (!bookingDate) return true;

    const bookingTime = getBookingTime(order);

    const dateTime = new Date(`${bookingDate}${bookingTime ? `T${bookingTime}` : "T23:59:59"}`);

    return dateTime >= new Date();
  }, []);

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (activeFilter === "upcoming") {
      filtered = filtered.filter(isUpcoming);
    }

    if (activeFilter === "completed") {
      filtered = filtered.filter(isCompleted);
    }

    if (activeFilter === "cancelled") {
      filtered = filtered.filter((order) => order?.status === "cancelled");
    }

    // Latest order placed first
    filtered.sort((a, b) => {
      const dateA = new Date(getOrderCreatedDate(a) || "1970-01-01");
      const dateB = new Date(getOrderCreatedDate(b) || "1970-01-01");

      return dateB - dateA;
    });

    return filtered;
  }, [orders, activeFilter, isUpcoming]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const formatDate = (date) => {
    if (!date) return "Date not available";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "Time not available";

    const [hours, minutes] = time.split(":").map(Number);

    if (Number.isNaN(hours)) return time;

    const date = new Date();
    date.setHours(hours, minutes || 0, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // =========================================================
  // REAL BOOKING STATUS
  // =========================================================

  const getStatus = (order) => {
    const status = order?.status;

    switch (status) {
      case "confirmed":
        return {
          label: "Confirmed",
          className: "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300",
        };

      case "assigning":
        return {
          label: "Finding professional",
          className: "border-amber-400/20 bg-amber-400/[0.07] text-amber-300",
        };

      case "assigned":
        return {
          label: "Professional assigned",
          className: "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300",
        };

      case "on_the_way":
        return {
          label: "On the way",
          className: "border-blue-400/20 bg-blue-400/[0.07] text-blue-300",
        };

      case "arrived":
        return {
          label: "Professional arrived",
          className: "border-violet-400/20 bg-violet-400/[0.07] text-violet-300",
        };

      case "in_progress":
        return {
          label: "Service in progress",
          className: "border-orange-400/20 bg-orange-400/[0.07] text-orange-300",
        };

      case "completed":
        return {
          label: "Completed",
          className: "border-white/10 bg-white/[0.05] text-white/60",
        };

      case "cancelled":
        return {
          label: "Cancelled",
          className: "border-red-400/20 bg-red-400/[0.07] text-red-300",
        };

      default:
        return {
          label: "Confirmed",
          className: "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300",
        };
    }
  };

  if (loading) {
    return (
      <>
        <Navigationbar />

        <main className="min-h-screen bg-[#080808] px-5 py-24 text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-center py-28 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-white/50" />

            <p className="mt-5 text-sm text-white/40">Loading your bookings...</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigationbar />

        <main className="min-h-screen bg-[#080808] px-5 py-24 text-white">
          <div className="mx-auto flex max-w-xl flex-col items-center justify-center py-28 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
              <CircleAlert className="h-7 w-7 text-white/45" />
            </div>

            <h1 className="mt-6 text-2xl font-semibold tracking-tight">We couldn't load your bookings</h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/40">{error}</p>

            <Link to="/login" className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90">
              Login
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigationbar />

      <main className="min-h-screen bg-[#080808] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20 pt-24 sm:pt-32">
          {/* Header */}
          <div className="mb-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300/70">DWAARPER BOOKINGS</p>

            <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">My Bookings</h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">Everything you've booked with DwaarPer, all in one place.</p>
              </div>

              <Link
                to="/services"
                className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-medium text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                Book a service
              </Link>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="mb-7 flex w-fit items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.025] p-1">
            {[
              ["upcoming", "Upcoming"],
              ["completed", "Completed"],
              ["cancelled", "Cancelled"],
              ["all", "All bookings"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveFilter(value)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${activeFilter === value ? "bg-white text-black shadow-sm" : "text-white/40 hover:text-white/75"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Empty state */}
          {filteredOrders.length === 0 ? (
            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <PackageCheck className="h-7 w-7 text-white/35" />
              </div>

              <h2 className="mt-6 text-xl font-semibold tracking-tight">
                {activeFilter === "upcoming"
                  ? "No upcoming bookings"
                  : activeFilter === "completed"
                    ? "No completed bookings"
                    : activeFilter === "cancelled"
                      ? "No cancelled bookings"
                      : "No bookings yet"}
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/35">
                {activeFilter === "upcoming"
                  ? "When you book a service, your upcoming appointments will appear here."
                  : activeFilter === "completed"
                    ? "Completed services will appear here after your professional finishes the job."
                    : activeFilter === "cancelled"
                      ? "Cancelled bookings will appear here."
                      : "Book your first home service with DwaarPer."}
              </p>

              <Link to="/services" className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90">
                Browse Services
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedOrders.map((order, index) => {
                const status = getStatus(order);
                const professional = getProfessional(order);

                return (
                  <div
                    key={`${order.orderId || "order"}-${index}`}
                    className="group overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.025] transition duration-300 hover:border-white/[0.13] hover:bg-white/[0.035]"
                  >
                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                      {/* Service image */}
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] sm:h-24 sm:w-24">
                        {order.img ? (
                          <img src={order.img} alt={order.name || "Service"} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <PackageCheck className="h-6 w-6 text-white/20" />
                          </div>
                        )}
                      </div>

                      {/* Main information */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start gap-3">
                          <div>
                            <h2 className="truncate text-base font-semibold text-white/90 sm:text-lg">{order.name || "Service"}</h2>

                            <p className="mt-1 text-xs text-white/35">{order.service || "Home service"}</p>
                          </div>
                        </div>

                        {/* Booking details */}
                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                          <div className="flex items-center gap-2 text-xs text-white/45">
                            <CalendarDays className="h-3.5 w-3.5 text-cyan-300/70" />
                            {formatDate(getBookingDate(order))}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-white/45">
                            <Clock3 className="h-3.5 w-3.5 text-cyan-300/70" />
                            {formatTime(getBookingTime(order))}
                          </div>

                          {professional && (
                            <div className="flex items-center gap-2 text-xs text-white/45">
                              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/70" />
                              {typeof professional === "string" ? professional : professional.name || "Professional assigned"}
                            </div>
                          )}
                        </div>

                        {/* Booking ID */}
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className={`rounded-full border px-3 py-1.5 text-[10px] font-medium ${status.className}`}>{status.label}</span>

                          <span className="text-[10px] uppercase tracking-wider text-white/20">Booking ID</span>

                          <span className="font-mono text-[10px] text-cyan-300/65">#{order.orderId || "—"}</span>

                          {getOrderCreatedDate(order) && <span className="text-[10px] text-white/25">Booked on {formatDate(getOrderCreatedDate(order))}</span>}
                        </div>
                      </div>

                      {/* Price + action */}
                      <div className="flex items-center justify-between gap-5 border-t border-white/[0.07] pt-4 sm:w-[150px] sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-white/25">Total</p>

                          <p className="mt-1 text-base font-semibold">₹{Number(order.price || 0).toLocaleString("en-IN")}</p>
                        </div>

                        <Link
                          to={`/mybookings/${order.orderId}/${order.serviceIndex}`}
                          state={{ booking: order }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-white/65 transition hover:bg-white hover:text-black"
                        >
                          View booking
                          <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {filteredOrders.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className="text-[11px] text-white/25">
                Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1}
                {"–"}
                {Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} bookings
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-9 items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 text-xs font-medium text-white/55 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;

                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 min-w-9 rounded-full border px-3 text-xs font-medium transition ${
                          currentPage === page ? "border-white bg-white text-black" : "border-white/[0.08] bg-white/[0.025] text-white/45 hover:bg-white/[0.07] hover:text-white"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-9 items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 text-xs font-medium text-white/55 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Bottom note */}
          {filteredOrders.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-2 text-center text-[11px] text-white/20">
              <MapPin className="h-3.5 w-3.5" />
              Your booking details will appear here as your service progresses.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default MyBookings;
