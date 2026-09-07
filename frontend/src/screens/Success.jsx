import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TbShoppingCartCheck } from "react-icons/tb";
import { useDispatchCart } from "../components/ContextReducer";

const Success = () => {
  const navigate = useNavigate();
  const dispatch = useDispatchCart();

  // Prevent payment verification from being called more than once
  const verificationStarted = useRef(false);

  const [status, setStatus] = useState("loading");
  const [bookingId, setBookingId] = useState(null);
  const [countdown, setCountdown] = useState(5);

  // =========================================================
  // VERIFY PAYMENT
  // =========================================================

  useEffect(() => {
    // IMPORTANT:
    // React StrictMode can run effects more than once in development.
    // This prevents duplicate payment verification requests.
    if (verificationStarted.current) return;

    verificationStarted.current = true;

    const confirmPayment = async () => {
      try {
        const sessionId = new URLSearchParams(window.location.search).get("session_id");

        const token = localStorage.getItem("token");

        if (!sessionId || !token) {
          console.error("Missing session ID or authentication token.");
          setStatus("error");
          return;
        }

        const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://dwaarper.onrender.com";

        // ---------------------------------------------------------
        // Get authenticated user
        // ---------------------------------------------------------

        const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        });

        const userResult = await userResponse.json();

        if (!userResponse.ok || !userResult?.user?.email) {
          throw new Error("Unable to retrieve authenticated user.");
        }

        // ---------------------------------------------------------
        // Verify Stripe payment
        // ---------------------------------------------------------

        const response = await fetch(`${API_BASE_URL}/api/verify-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            email: userResult.user.email,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result?.error || "Payment verification failed.");
        }

        console.log("Payment Verified:", result);

        // ---------------------------------------------------------
        // Store booking ID returned by backend
        // ---------------------------------------------------------

        if (!result.bookingId) {
          throw new Error("Booking ID was not returned.");
        }

        setBookingId(result.bookingId);

        // ---------------------------------------------------------
        // Clear cart only after successful verification
        // ---------------------------------------------------------

        dispatch({ type: "DROP" });

        // Remove temporary checkout data
        localStorage.removeItem("cartData");

        setStatus("success");
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("error");
      }
    };

    confirmPayment();
  }, [dispatch]);

  // =========================================================
  // AUTO REDIRECT
  // =========================================================

  useEffect(() => {
    if (status !== "success" || !bookingId) return;

    let remaining = 5;

    setCountdown(remaining);

    const timer = setInterval(() => {
      remaining -= 1;

      if (remaining <= 0) {
        clearInterval(timer);

        navigate(`/mybookings/${bookingId}/0`, {
          replace: true,
        });

        return;
      }

      setCountdown(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [status, bookingId, navigate]);

  // =========================================================
  // GO TO BOOKING
  // =========================================================

  const goToBooking = () => {
    if (!bookingId) return;

    navigate(`/mybookings/${bookingId}/0`, {
      replace: true,
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-5 py-10 text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.035] blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[500px]">
        <div className="rounded-[28px] border border-white/[0.09] bg-[#111111]/90 px-7 py-12 text-center shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:px-12 sm:py-14">
          {/* =====================================================
              LOADING
          ===================================================== */}

          {status === "loading" && (
            <>
              <div className="mx-auto mb-7 flex h-[74px] w-[74px] items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.045]">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-white/80" />
              </div>

              <span className="mb-3 block text-[10px] font-bold tracking-[0.25em] text-white/35">DWAARPER</span>

              <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.035em] sm:text-[36px]">Confirming your payment</h1>

              <p className="mx-auto mt-4 max-w-[380px] text-sm leading-7 text-white/50">We're securely verifying your payment and placing your service order.</p>

              <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.035] px-4 py-2 text-[11px] text-white/40">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60" />
                Processing securely
              </div>
            </>
          )}

          {/* =====================================================
              SUCCESS
          ===================================================== */}

          {status === "success" && (
            <>
              <div className="mx-auto mb-7 flex h-[74px] w-[74px] items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.055] shadow-[0_15px_40px_rgba(0,0,0,0.35)]">
                <TbShoppingCartCheck className="h-9 w-9 stroke-[1.5]" />
              </div>

              <span className="mb-3 block text-[10px] font-bold tracking-[0.25em] text-white/35">DWAARPER</span>

              <h1 className="text-[29px] font-semibold leading-tight tracking-[-0.035em] sm:text-[36px]">Payment successful</h1>

              <p className="mx-auto mt-4 max-w-[380px] text-sm leading-7 text-white/50">
                Your service order has been successfully placed. Your professional will take care of the rest.
              </p>

              {/* Order confirmed */}
              <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.035] px-4 py-2 text-[11px] text-white/55">
                <span className="text-xs">✓</span>
                Order confirmed
              </div>

              {/* Booking ID */}
              {bookingId && <p className="mt-4 font-mono text-[10px] text-white/25">#{bookingId}</p>}

              {/* View booking */}
              <button
                type="button"
                onClick={goToBooking}
                className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-[13px] font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_12px_30px_rgba(255,255,255,.12)] sm:w-auto sm:min-w-[210px]"
              >
                View your booking
              </button>

              {/* Countdown */}
              <p className="mt-5 text-[11px] text-white/30">
                Taking you to your booking in <span className="font-medium text-white/55">{countdown}s</span>
              </p>
            </>
          )}

          {/* =====================================================
              ERROR
          ===================================================== */}

          {status === "error" && (
            <>
              <div className="mx-auto mb-7 flex h-[74px] w-[74px] items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.045]">
                <span className="text-2xl font-medium">!</span>
              </div>

              <span className="mb-3 block text-[10px] font-bold tracking-[0.25em] text-white/35">DWAARPER</span>

              <h1 className="text-[27px] font-semibold leading-tight tracking-[-0.035em] sm:text-[34px]">We couldn't confirm the payment</h1>

              <p className="mx-auto mt-4 max-w-[390px] text-sm leading-7 text-white/50">Your payment could not be verified right now. Please return to your cart and try again.</p>

              <div className="mt-7 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="inline-flex w-full min-w-[180px] items-center justify-center rounded-full bg-white px-6 py-3 text-[13px] font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 sm:w-auto"
                >
                  Return to cart
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex w-full min-w-[180px] items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.035] px-6 py-3 text-[13px] font-medium text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07] sm:w-auto"
                >
                  Back to home
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Success;
