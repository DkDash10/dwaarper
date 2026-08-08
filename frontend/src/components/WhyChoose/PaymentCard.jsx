import { useEffect, useRef } from "react";
import { LuShieldCheck } from "react-icons/lu";
import gsap from "gsap";
import CardShell from "./CardShell";

export default function PaymentCard() {
  const cardRef = useRef(null);

  const paymentRef = useRef(null);
  const shieldRef = useRef(null);
  const protectedRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;

    if (!card) return;

    const ctx = gsap.context(() => {
      // Initial state
      gsap.set(paymentRef.current, {
        y: 20,
        opacity: 0,
      });

      gsap.set(shieldRef.current, {
        scale: 0.7,
        opacity: 0,
      });

      gsap.set(protectedRef.current, {
        y: 8,
        opacity: 0,
      });

      // Main entrance timeline
      const timeline = gsap.timeline({
        paused: true,
      });

      timeline
        // Payment panel appears
        .to(paymentRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
        })

        // Shield appears
        .to(
          shieldRef.current,
          {
            scale: 1,
            opacity: 1,
            duration: 0.45,
            ease: "back.out(1.7)",
          },
          "-=0.25",
        )

        // Protected text
        .to(
          protectedRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.35,
            ease: "power2.out",
          },
          "-=0.15",
        );

      // Replay when entering / reset when leaving
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            timeline.restart();
          } else {
            timeline.pause(0);
          }
        },
        {
          threshold: 0.45,
        },
      );

      observer.observe(card);

      // Mouse interaction
      const handleMouseMove = (event) => {
        const rect = card.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rotateY = (x / rect.width - 0.5) * 5;

        const rotateX = -(y / rect.height - 0.5) * 5;

        gsap.to(card, {
          rotateX,
          rotateY,
          transformPerspective: 1200,
          duration: 0.18,
          ease: "power2.out",
          overwrite: "auto",
        });

        gsap.to(glowRef.current, {
          x: (x - rect.width / 2) * 0.12,
          y: (y - rect.height / 2) * 0.12,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.4,
          ease: "power2.out",
        });

        gsap.to(glowRef.current, {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        });
      };

      card.addEventListener("mousemove", handleMouseMove);

      card.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        observer.disconnect();

        card.removeEventListener("mousemove", handleMouseMove);

        card.removeEventListener("mouseleave", handleMouseLeave);

        timeline.kill();
      };
    }, card);

    return () => ctx.revert();
  }, []);

  return (
    <CardShell ref={cardRef} className="relative h-[267px] overflow-hidden p-7">
      {/* Cursor-follow glow */}
      <div
        ref={glowRef}
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-48
          w-48
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-cyan-500/10
          blur-[90px]
        "
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}

        <p className="text-xs font-semibold uppercase tracking-[.25em] text-cyan-300">PAYMENTS</p>

        <h3 className="mt-3 text-2xl font-semibold text-white">Secure Checkout</h3>

        {/* Payment panel */}

        <div
          ref={paymentRef}
          className="
            relative
            mt-7
            rounded-3xl
            border
            border-white/10
            bg-[#151515]
            p-5
          "
        >
          {/* Top row */}

          <div className="flex items-center justify-between">
            <span className="text-sm tracking-[.18em] text-white/70">**** **** **** 4582</span>

            <div
              ref={shieldRef}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-cyan-500/10
              "
            >
              <LuShieldCheck size={18} className="text-cyan-300" />
            </div>
          </div>

          {/* Payment amount */}

          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[.2em] text-white/35">Payment</p>

              <p className="mt-1 text-xl font-semibold text-white">₹799</p>
            </div>

            <div
              ref={protectedRef}
              className="
                rounded-full
                border
                border-green-400/20
                bg-green-500/10
                px-3
                py-1
                text-[10px]
                font-medium
                text-green-300
              "
            >
              Protected
            </div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}
