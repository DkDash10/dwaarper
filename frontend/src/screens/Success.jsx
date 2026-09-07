import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TbShoppingCartCheck } from "react-icons/tb";
import { useDispatchCart } from "../components/ContextReducer";

const Success = () => {
  const navigate = useNavigate();
  const dispatch = useDispatchCart();

  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const sessionId = new URLSearchParams(
          window.location.search
        ).get("session_id");

        const token = localStorage.getItem("token");

        if (!sessionId || !token) {
          console.error("Missing session ID or authentication token.");
          setStatus("error");
          return;
        }

        const API_BASE_URL =
          window.location.hostname === "localhost"
            ? "http://localhost:5000"
            : "https://dwaarper.onrender.com";

        // Get authenticated user
        const userResponse = await fetch(
          `${API_BASE_URL}/api/auth/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "auth-token": token,
            },
          }
        );

        const userResult = await userResponse.json();

        if (!userResponse.ok || !userResult?.user?.email) {
          throw new Error("Unable to retrieve authenticated user.");
        }

        // Verify Stripe payment
        const response = await fetch(
          `${API_BASE_URL}/api/verify-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId,
              email: userResult.user.email,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error || "Payment verification failed."
          );
        }

        console.log("Payment Verified:", result);

        // Clear cart only after successful verification
        dispatch({ type: "DROP" });

        // Remove temporary checkout data
        localStorage.removeItem("cartData");

        setStatus("success");

        setTimeout(() => {
          navigate("/");
        }, 1800);
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("error");
      }
    };

    confirmPayment();
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center px-5 py-10 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-white/[0.035] rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[500px]">
        <div className="rounded-[28px] border border-white/[0.09] bg-[#111111]/90 backdrop-blur-2xl px-7 sm:px-12 py-12 sm:py-14 text-center shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
          
          {/* Loading */}
          {status === "loading" && (
            <>
              <div className="mx-auto mb-7 w-[74px] h-[74px] rounded-full border border-white/[0.1] bg-white/[0.045] flex items-center justify-center">
                <div className="w-7 h-7 rounded-full border-2 border-white/15 border-t-white/80 animate-spin" />
              </div>

              <span className="block mb-3 text-[10px] font-bold tracking-[0.25em] text-white/35">
                DWAARPER
              </span>

              <h1 className="text-[28px] sm:text-[36px] leading-tight tracking-[-0.035em] font-semibold">
                Confirming your payment
              </h1>

              <p className="mt-4 text-sm leading-7 text-white/50 max-w-[380px] mx-auto">
                We're securely verifying your payment and placing
                your service order.
              </p>

              <div className="inline-flex items-center gap-2 mt-7 px-4 py-2 rounded-full border border-white/[0.07] bg-white/[0.035] text-[11px] text-white/40">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                Processing securely
              </div>
            </>
          )}

          {/* Success */}
          {status === "success" && (
            <>
              <div className="mx-auto mb-7 w-[74px] h-[74px] rounded-full border border-white/[0.1] bg-white/[0.055] flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.35)]">
                <TbShoppingCartCheck className="w-9 h-9 stroke-[1.5]" />
              </div>

              <span className="block mb-3 text-[10px] font-bold tracking-[0.25em] text-white/35">
                DWAARPER
              </span>

              <h1 className="text-[29px] sm:text-[36px] leading-tight tracking-[-0.035em] font-semibold">
                Payment successful
              </h1>

              <p className="mt-4 text-sm leading-7 text-white/50 max-w-[380px] mx-auto">
                Your service order has been successfully placed.
                Your professional will take care of the rest.
              </p>

              <div className="inline-flex items-center gap-2 mt-7 px-4 py-2 rounded-full border border-white/[0.07] bg-white/[0.035] text-[11px] text-white/55">
                <span className="text-xs">✓</span>
                Order confirmed
              </div>

              <Link
                to="/"
                className="mt-7 inline-flex items-center justify-center min-w-[180px] px-6 py-3 rounded-full bg-white text-black text-[13px] font-semibold transition-all duration-300 hover:bg-white/90 hover:-translate-y-0.5"
              >
                Back to home
              </Link>
            </>
          )}

          {/* Error */}
          {status === "error" && (
            <>
              <div className="mx-auto mb-7 w-[74px] h-[74px] rounded-full border border-white/[0.1] bg-white/[0.045] flex items-center justify-center">
                <span className="text-2xl font-medium">!</span>
              </div>

              <span className="block mb-3 text-[10px] font-bold tracking-[0.25em] text-white/35">
                DWAARPER
              </span>

              <h1 className="text-[27px] sm:text-[34px] leading-tight tracking-[-0.035em] font-semibold">
                We couldn't confirm the payment
              </h1>

              <p className="mt-4 text-sm leading-7 text-white/50 max-w-[390px] mx-auto">
                Your payment could not be verified right now.
                Please return to your cart and try again.
              </p>

              <div className="flex flex-col items-center gap-3 mt-7">
                <Link
                  to="/cart"
                  className="w-full sm:w-auto min-w-[180px] inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-black text-[13px] font-semibold transition-all duration-300 hover:bg-white/90 hover:-translate-y-0.5"
                >
                  Return to cart
                </Link>

                <Link
                  to="/"
                  className="w-full sm:w-auto min-w-[180px] inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/[0.1] bg-white/[0.035] text-white/70 text-[13px] font-medium transition-all duration-300 hover:bg-white/[0.07] hover:-translate-y-0.5"
                >
                  Back to home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Success;