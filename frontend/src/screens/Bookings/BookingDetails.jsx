import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { LuArrowLeft, LuCalendarDays, LuCheck, LuClock3, LuMapPin, LuShieldCheck, LuUserRound, LuChevronRight, LuLoaderCircle, LuCircleAlert } from "react-icons/lu";
import Navigationbar from "../../components/Navigationbar";
import Footer from "../../components/Footer";

const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "192.168.0.107" ? `http://${window.location.hostname}:5000` : "https://dwaarper.onrender.com";

const BookingDetails = () => {
  const { orderId, serviceIndex } = useParams();
  const location = useLocation();
  const hasInitialBooking = Boolean(location.state?.booking);

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [professionalData, setProfessionalData] = useState(null);

  const [loading, setLoading] = useState(!hasInitialBooking);

  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  // =========================================================
  // FETCH BOOKING
  // =========================================================

  useEffect(() => {
    let isMounted = true;

    const fetchBooking = async (showLoading = false) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please login to view this booking.");
        }

        // Get authenticated user
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

        // Get all bookings
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
          throw new Error(result?.error || "Failed to load booking.");
        }

        const allBookings = result?.orderData?.order_data || [];

        const matchingBookings = allBookings.filter((item) => String(item.orderId) === String(orderId));

        if (matchingBookings.length === 0) {
          throw new Error("Booking not found.");
        }

        const selectedService = matchingBookings.find((item) => Number(item.serviceIndex) === Number(serviceIndex));

        if (!selectedService) {
          throw new Error("Service booking not found.");
        }

        if (isMounted) {
          setBooking(selectedService);
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching booking:", error);

        if (isMounted) {
          setError(error.message);
        }
      } finally {
        if (showLoading && isMounted) {
          setLoading(false);
        }
      }
    };

    /*
     * If booking was passed from MyBookings, render immediately.
     * Then fetch again so the page gets the latest backend status.
     */
    fetchBooking(!hasInitialBooking);

    // Refresh status every 30 seconds
    const interval = setInterval(() => {
      fetchBooking(false);
    }, 5 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [hasInitialBooking, orderId, serviceIndex]);

  // =========================================================
  // FETCH ASSIGNED PROFESSIONAL
  // =========================================================

  useEffect(() => {
    let isMounted = true;

    const fetchProfessional = async () => {
      const currentBooking = Array.isArray(booking) ? booking[0] : booking;

      const professionalId = currentBooking?.booking?.professionalId;

      if (!professionalId) {
        if (isMounted) {
          setProfessionalData(null);
        }

        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/professionals/${professionalId}`);

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result?.error || "Unable to load professional.");
        }

        if (isMounted) {
          setProfessionalData(result.professional);
        }
      } catch (error) {
        console.error("Error fetching assigned professional:", error);

        if (isMounted) {
          setProfessionalData(null);
        }
      }
    };

    fetchProfessional();

    return () => {
      isMounted = false;
    };
  }, [booking]);

  const bookings = useMemo(() => {
    if (!booking) return [];

    return Array.isArray(booking) ? booking : [booking];
  }, [booking]);

  const primaryBooking = bookings[0];

  const storedProfessional = primaryBooking?.booking?.professional;

  const professional = professionalData || (storedProfessional && typeof storedProfessional === "object" ? storedProfessional : null);

  const professionalName = professional?.name || (typeof storedProfessional === "string" ? storedProfessional : primaryBooking?.booking?.professionalName) || null;

  const professionalRating = professional?.rating ?? null;

  const professionalJobs = professional?.completedJobs ?? null;

  const professionalReviews = professional?.totalReviews ?? null;

  const professionalImage = professional?.profileImage || null;

  const professionalExperience = professional?.experience ?? null;

  const professionalVerified = professional?.verified ?? false;

  const bookingDate = primaryBooking?.booking?.date || primaryBooking?.date || null;

  const bookingTime = primaryBooking?.booking?.time || null;

  // =========================================================
  // REAL STATUS
  // =========================================================

  const status = primaryBooking?.status || "confirmed";

  const statusInfo = {
    confirmed: {
      label: "Confirmed",
      headerLabel: "BOOKING CONFIRMED",
      title: "Your booking is confirmed",
      description: "Your payment has been verified. We are preparing your service.",
    },

    assigning: {
      label: "Finding professional",
      headerLabel: "FINDING PROFESSIONAL",
      title: "Finding your professional",
      description: "We're finding an available professional for your booking.",
    },

    assigned: {
      label: "Professional assigned",
      headerLabel: "PROFESSIONAL ASSIGNED",
      title: "Your professional is assigned",
      description: "Everything is ready for your scheduled service.",
    },

    on_the_way: {
      label: "On the way",
      headerLabel: "PROFESSIONAL ON THE WAY",
      title: "Your professional is on the way",
      description: "Your professional is heading to your service location.",
    },

    arrived: {
      label: "Professional arrived",
      headerLabel: "PROFESSIONAL ARRIVED",
      title: "Your professional has arrived",
      description: "Your professional has reached your service location.",
    },

    in_progress: {
      label: "Service in progress",
      headerLabel: "SERVICE IN PROGRESS",
      title: "Your service is in progress",
      description: "Your professional is currently working on your service.",
    },

    completed: {
      label: "Completed",
      headerLabel: "SERVICE COMPLETED",
      title: "Your service is completed",
      description: "Your service has been completed. We hope you had a great experience.",
    },

    cancelled: {
      label: "Cancelled",
      headerLabel: "BOOKING CANCELLED",
      title: "Your booking was cancelled",
      description: "This booking is no longer active.",
    },
  }[status] || {
    label: "Confirmed",
    headerLabel: "BOOKING CONFIRMED",
    title: "Your booking is confirmed",
    description: "Your booking details are available below.",
  };

  // =========================================================
  // TIMELINE STATE
  // =========================================================

  const statusOrder = ["confirmed", "assigned", "on_the_way", "arrived", "in_progress", "completed"];

  const currentStatusIndex = status === "assigning" ? 0 : statusOrder.indexOf(status);

  const isStepCompleted = (stepStatus) => {
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (status === "assigning") {
      return stepStatus === "confirmed";
    }

    return stepIndex !== -1 && currentStatusIndex > stepIndex;
  };

  const isStepActive = (stepStatus) => {
    if (status === "assigning") {
      return stepStatus === "confirmed";
    }

    return status === stepStatus;
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "Time unavailable";

    const [hours, minutes] = time.split(":").map(Number);

    const parsed = new Date();

    parsed.setHours(hours, minutes || 0, 0, 0);

    return parsed.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const totalPrice = bookings.reduce((total, item) => total + Number(item.price || 0), 0);

  const canCancel = ["confirmed", "assigning", "assigned"].includes(status);

  const handleCancelBooking = async () => {
    try {
      setCancelling(true);
      setCancelError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login to cancel this booking.");
      }

      const response = await fetch(`${API_BASE_URL}/api/cancel-booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({
          bookingId: primaryBooking.orderId,
          serviceIndex: Number(serviceIndex),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Unable to cancel booking.");
      }

      // Immediately update the visible booking
      setBooking((currentBooking) => {
        if (!currentBooking) return currentBooking;

        const current = Array.isArray(currentBooking) ? currentBooking : [currentBooking];

        return current.map((item) => {
          if (String(item.orderId) !== String(primaryBooking.orderId) || Number(item.serviceIndex) !== Number(serviceIndex)) {
            return item;
          }

          return {
            ...item,
            status: "cancelled",
          };
        });
      });

      setShowCancelModal(false);
    } catch (error) {
      console.error("Cancel booking error:", error);

      setCancelError(error.message || "Unable to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      setReviewError(null);

      if (!reviewRating) {
        setReviewError("Please select a rating.");
        return;
      }

      setSubmittingReview(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login to submit your review.");
      }

      const response = await fetch(`${API_BASE_URL}/api/submit-review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({
          bookingId: primaryBooking.orderId,
          serviceIndex: Number(serviceIndex),
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Unable to submit your review.");
      }

      setExistingReview(result.review);
      setReviewSubmitted(true);

      setTimeout(() => {
        setShowReviewModal(false);
        setReviewSubmitted(false);
        setReviewRating(0);
        setReviewHover(0);
        setReviewComment("");
      }, 3000);
    } catch (error) {
      console.error("Review submission error:", error);
      setReviewError(error.message || "Unable to submit your review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchExistingReview = async () => {
      if (!primaryBooking?.orderId || status !== "completed") {
        return;
      }

      try {
        setLoadingReview(true);

        const token = localStorage.getItem("token");

        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/my-review?bookingId=${encodeURIComponent(primaryBooking.orderId)}&serviceIndex=${Number(serviceIndex)}`, {
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result?.error || "Unable to load review.");
        }

        if (isMounted) {
          setExistingReview(result.review);
        }
      } catch (error) {
        console.error("Error fetching existing review:", error);

        if (isMounted) {
          setExistingReview(null);
        }
      } finally {
        if (isMounted) {
          setLoadingReview(false);
        }
      }
    };

    fetchExistingReview();

    return () => {
      isMounted = false;
    };
  }, [booking, status, serviceIndex, primaryBooking?.orderId]);

  if (loading) {
    return (
      <>
        <Navigationbar />

        <main className="min-h-screen bg-[#080808] px-5 py-28 text-white">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-center py-32 text-center">
            <LuLoaderCircle className="h-7 w-7 animate-spin text-white/50" />

            <p className="mt-5 text-sm text-white/40">Loading your booking...</p>
          </div>
        </main>
      </>
    );
  }

  if (error || !primaryBooking) {
    return (
      <>
        <Navigationbar />

        <main className="min-h-screen bg-[#080808] px-5 py-28 text-white">
          <div className="mx-auto flex max-w-xl flex-col items-center py-28 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
              <LuCircleAlert className="h-7 w-7 text-white/40" />
            </div>

            <h1 className="mt-6 text-2xl font-semibold tracking-tight">Booking not found</h1>

            <p className="mt-3 text-sm leading-6 text-white/35">{error || "We couldn't find this booking."}</p>

            <Link to="/mybookings" className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90">
              Back to My Bookings
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigationbar />

      <main className="relative min-h-screen overflow-hidden bg-[#080808] px-5 pb-24 pt-28 text-white">
        {/* Subtle ambient glow */}
        <div className="pointer-events-none absolute left-1/2 top-40 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-400/[0.025] blur-[130px]" />

        <div className="relative mx-auto max-w-7xl">
          {/* Back */}
          <Link to="/mybookings" className="group inline-flex items-center gap-2 text-xs text-white/35 transition hover:text-white/70">
            <LuArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
            Back to My Bookings
          </Link>

          {/* Header */}
          <div className="mt-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300/70">{statusInfo.headerLabel}</p>

            <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">{statusInfo.title}</h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">{statusInfo.description}</p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.05] px-3.5 py-2 text-[11px] text-cyan-300/70">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                {statusInfo.label}
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.5fr_0.85fr]">
            {/* Left */}
            <div className="space-y-5">
              {/* Booking summary */}
              <section className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-7">
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/70">YOUR SERVICE</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">{primaryBooking.name || "Home Service"}</h2>

                    <p className="mt-1 text-sm text-white/35">{primaryBooking.service || "Professional home service"}</p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-right">
                    <p className="text-[9px] uppercase tracking-wider text-white/25">Booking ID</p>

                    <p className="mt-1 font-mono text-[11px] text-cyan-300/75">#{primaryBooking.orderId}</p>
                  </div>
                </div>

                {/* Date / time */}
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/25">
                      <LuCalendarDays className="h-3.5 w-3.5 text-cyan-300/70" />
                      Date
                    </div>

                    <p className="mt-3 text-sm font-medium text-white/80">{formatDate(bookingDate)}</p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/25">
                      <LuClock3 className="h-3.5 w-3.5 text-cyan-300/70" />
                      Time
                    </div>

                    <p className="mt-3 text-sm font-medium text-white/80">{formatTime(bookingTime)}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="mt-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/25">
                    <LuMapPin className="h-3.5 w-3.5 text-cyan-300/70" />
                    Service location
                  </div>

                  <p className="mt-3 text-sm font-medium text-white/75">Your saved service address</p>

                  <p className="mt-1 text-xs text-white/30">Exact address will be used for this booking.</p>
                </div>
              </section>

              {/* Services */}
              {bookings.length > 1 && (
                <section className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/70">SERVICES</p>

                  <div className="mt-5 space-y-3">
                    {bookings.map((item, index) => (
                      <div key={`${item.orderId}-${index}`} className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">
                          {item.img ? <img src={item.img} alt={item.name} className="h-full w-full object-cover" /> : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white/75">{item.name}</p>

                          <p className="mt-1 text-xs text-white/30">{item.service}</p>
                        </div>

                        <p className="text-sm font-medium">₹{Number(item.price || 0).toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Booking progress */}
              <section className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/70">BOOKING STATUS</p>
                    <h2 className="mt-2 text-xl font-semibold">Your service journey</h2>
                  </div>

                  <LuShieldCheck className="h-6 w-6 text-cyan-300/70" />
                </div>

                <div className="mt-7 space-y-0">
                  <StatusStep active={isStepActive("confirmed")} completed={isStepCompleted("confirmed")} title="Booking confirmed" description="Your payment has been verified." />

                  <StatusStep
                    active={isStepActive("assigned")}
                    completed={isStepCompleted("assigned")}
                    title="Professional assigned"
                    description={
                      professionalName
                        ? `${professionalName} is assigned to your booking.`
                        : status === "assigning"
                          ? "We're finding an available professional for your booking."
                          : "Your professional will be shown here."
                    }
                  />

                  <StatusStep
                    active={isStepActive("on_the_way")}
                    completed={isStepCompleted("on_the_way")}
                    title="On the way"
                    description={status === "on_the_way" ? "Your professional is heading to your location." : "Updates will appear as your booking progresses."}
                  />

                  <StatusStep
                    active={isStepActive("arrived")}
                    completed={isStepCompleted("arrived")}
                    title="Professional arrived"
                    description={status === "arrived" ? "Your professional has reached your location." : "This step will update when your professional arrives."}
                  />

                  <StatusStep
                    active={isStepActive("in_progress")}
                    completed={isStepCompleted("in_progress")}
                    title="Service in progress"
                    description={status === "in_progress" ? "Your professional is currently working on your service." : "This step will update when the service starts."}
                  />

                  <StatusStep
                    active={isStepActive("completed")}
                    completed={status === "completed"}
                    title="Service completed"
                    description="Rate your professional after the service."
                    last
                  />
                </div>
              </section>
            </div>

            {/* Right */}
            <div className="space-y-5">
              {/* Professional */}
              <section className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/70">PROFESSIONAL</p>

                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-300/20 bg-cyan-300/[0.06]">
                    {professionalImage ? (
                      <img src={professionalImage} alt={professionalName || "Professional"} className="h-full w-full object-cover" />
                    ) : (
                      <LuUserRound className="h-6 w-6 text-cyan-300/70" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-white">{professionalName || "Professional assigned"}</h2>

                    {professionalVerified && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-cyan-300/70">
                        <LuShieldCheck className="h-3.5 w-3.5" />
                        Verified Professional
                      </div>
                    )}

                    {!professional && <p className="mt-1 text-xs text-white/30">Loading professional details...</p>}
                  </div>
                </div>

                {professional && (
                  <>
                    {/* Rating / Jobs / Experience */}
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
                        <p className="text-[9px] uppercase tracking-wider text-white/25">Rating</p>

                        <p className="mt-1 text-sm font-semibold">★ {professionalRating || "New"}</p>

                        {professionalReviews > 0 && <p className="mt-1 text-[10px] text-white/25">{professionalReviews} reviews</p>}
                      </div>

                      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
                        <p className="text-[9px] uppercase tracking-wider text-white/25">Jobs</p>

                        <p className="mt-1 text-sm font-semibold">{professionalJobs || 0}</p>
                      </div>

                      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
                        <p className="text-[9px] uppercase tracking-wider text-white/25">Experience</p>

                        <p className="mt-1 text-sm font-semibold">{professionalExperience ? `${professionalExperience} yrs` : "—"}</p>
                      </div>

                      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
                        <p className="text-[9px] uppercase tracking-wider text-white/25">Scheduled</p>

                        <p className="mt-1 text-sm font-semibold text-white/80">{formatDate(bookingDate)}</p>

                        <p className="mt-1 text-[10px] text-white/30">{formatTime(bookingTime)}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Future actions */}
                <div className="mt-5 space-y-2">
                  <button
                    type="button"
                    disabled
                    className="flex w-full cursor-not-allowed items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3.5 text-left opacity-50"
                  >
                    <span>
                      <span className="block text-sm font-medium">Contact professional</span>

                      <span className="mt-1 block text-[10px] text-white/30">Available once contact is enabled</span>
                    </span>

                    <LuChevronRight className="h-4 w-4" />
                  </button>

                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => {
                        setCancelError(null);
                        setShowCancelModal(true);
                      }}
                      className="flex w-full items-center justify-center rounded-2xl border border-red-400/15 bg-red-400/[0.04] px-4 py-3.5 text-sm font-medium text-red-300/80 transition hover:border-red-400/25 hover:bg-red-400/[0.08] hover:text-red-300"
                    >
                      Cancel booking
                    </button>
                  )}
                </div>
              </section>

              {/* Payment */}
              <section className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/70">PAYMENT</p>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-white/30">Total paid</p>

                    <p className="mt-1 text-2xl font-semibold tracking-tight">₹{totalPrice.toLocaleString("en-IN")}</p>
                  </div>

                  <div className="rounded-full border border-cyan-400/15 bg-cyan-400/[0.05] px-3 py-1.5 text-[10px] text-cyan-300/75">Paid</div>
                </div>

                <div className="mt-5 border-t border-white/[0.07] pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/30">Services</span>

                    <span className="text-white/65">{bookings.length}</span>
                  </div>
                </div>
              </section>

              {/* Review */}
              {status === "completed" && (
                <section className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/70">YOUR EXPERIENCE</p>

                  {loadingReview ? (
                    <div className="mt-5">
                      <p className="text-sm text-white/40">Loading your review...</p>
                    </div>
                  ) : existingReview ? (
                    <>
                      <h2 className="mt-2 text-xl font-semibold">Your review</h2>

                      <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= existingReview.rating ? "text-yellow-300" : "text-white/15"}>
                              ★
                            </span>
                          ))}
                        </div>

                        <p className="mt-3 text-sm leading-6 text-white/65">
                          {existingReview.comment ? `"${existingReview.comment}"` : "You submitted a rating without a written comment."}
                        </p>

                        <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-white/20">Review submitted</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="mt-2 text-xl font-semibold">How was your service?</h2>

                      <p className="mt-2 text-xs leading-5 text-white/35">Rate your professional and share your experience with other Dwaarper customers.</p>

                      <button
                        type="button"
                        onClick={() => {
                          setReviewError(null);
                          setShowReviewModal(true);
                        }}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
                      >
                        Rate your professional
                        <LuChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#111] p-7 shadow-2xl">
            <div>
              <h3 className="text-xl font-semibold text-white">Cancel this booking?</h3>

              <p className="mt-2 text-sm leading-relaxed text-white/45">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            </div>

            {cancelError && (
              <div className="mt-5 rounded-2xl border border-red-500/10 bg-red-500/[0.04] px-4 py-3">
                <p className="text-xs leading-5 text-red-300/80">{cancelError}</p>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelError(null);
                }}
                disabled={cancelling}
                className="w-full rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/70 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Keep
              </button>

              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="w-full rounded-full bg-red-500 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto"
              >
                {cancelling ? "Cancelling..." : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 px-5 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] border border-white/[0.08] bg-[#111] p-6 shadow-2xl sm:p-7">
            {!reviewSubmitted ? (
              <>
                {/* Header */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/70">YOUR EXPERIENCE</p>

                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Rate your professional</h3>

                  <p className="mt-2 text-sm leading-6 text-white/35">How was your experience with {professionalName || "your professional"}?</p>
                </div>

                {/* Stars */}
                <div className="mt-7 flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (reviewHover || reviewRating);

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHover(star)}
                        onMouseLeave={() => setReviewHover(0)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.025] text-2xl transition hover:scale-105"
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      >
                        <span className={active ? "text-yellow-300" : "text-white/20"}>★</span>
                      </button>
                    );
                  })}
                </div>

                {reviewRating > 0 && (
                  <p className="mt-3 text-center text-xs text-white/35">
                    {reviewRating === 1 && "We'll do better."}
                    {reviewRating === 2 && "Thanks for your feedback."}
                    {reviewRating === 3 && "Thanks for your feedback."}
                    {reviewRating === 4 && "Glad you had a good experience."}
                    {reviewRating === 5 && "We're glad you loved the service."}
                  </p>
                )}

                {/* Comment */}
                <div className="mt-7">
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">Your experience</label>

                  <textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    placeholder="Tell us about your experience..."
                    maxLength={1000}
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-cyan-300/20"
                  />
                </div>

                {/* Error */}
                {reviewError && (
                  <div className="mt-4 rounded-2xl border border-red-500/10 bg-red-500/[0.04] px-4 py-3">
                    <p className="text-xs leading-5 text-red-300/80">{reviewError}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewModal(false);
                      setReviewError(null);
                    }}
                    disabled={submittingReview}
                    className="w-full rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={!reviewRating || submittingReview}
                    className="w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </>
            ) : (
              <div className="relative overflow-hidden py-6 text-center sm:py-8">
                {/* Ambient success glow */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/[0.045] blur-[80px]" />

                <div className="relative">
                  {/* Success icon */}
                  <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.055] shadow-[0_15px_40px_rgba(0,0,0,0.35)]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-300 text-black">
                      <LuCheck className="h-6 w-6 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* Brand */}
                  <span className="mt-7 block text-[10px] font-bold tracking-[0.25em] text-white/35">DWAARPER</span>

                  {/* Heading */}
                  <h3 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.035em] text-white sm:text-[32px]">Review submitted</h3>

                  {/* Description */}
                  <p className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-white/45">
                    Thanks for sharing your experience with <span className="text-white/70">{professionalName || "your professional"}</span>.
                  </p>

                  {/* Review preview */}
                  <div className="mx-auto mt-7 max-w-[340px] rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left">
                    {/* Stars */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= (existingReview?.rating || reviewRating) ? "text-yellow-300" : "text-white/15"}>
                          ★
                        </span>
                      ))}
                    </div>

                    {/* Comment */}
                    {(existingReview?.comment || reviewComment.trim()) && (
                      <p className="mt-3 text-sm leading-6 text-white/60">"{existingReview?.comment || reviewComment.trim()}"</p>
                    )}

                    {/* Status */}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />

                      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">Review received</span>
                    </div>
                  </div>

                  {/* Done */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewModal(false);
                      setReviewSubmitted(false);
                      setReviewRating(0);
                      setReviewHover(0);
                      setReviewComment("");
                    }}
                    className="mt-7 inline-flex min-w-[180px] items-center justify-center rounded-full bg-white px-6 py-3 text-[13px] font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_12px_30px_rgba(255,255,255,.12)]"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const StatusStep = ({ active = false, completed = false, title, description, last = false }) => {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${completed ? "border-cyan-300 bg-cyan-300 text-black" : active ? "border-cyan-300/50 bg-cyan-300/[0.08] text-cyan-300" : "border-white/10 bg-white/[0.025] text-white/20"}`}
        >
          {completed ? <LuCheck className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
        </div>

        {!last && <div className={`mt-1 h-12 w-px ${completed ? "bg-cyan-300/40" : "bg-white/[0.08]"}`} />}
      </div>

      <div className="pb-5">
        <p className={`text-sm font-medium ${active || completed ? "text-white/80" : "text-white/30"}`}>{title}</p>

        <p className="mt-1 text-xs leading-5 text-white/25">{description}</p>
      </div>
    </div>
  );
};

export default BookingDetails;
