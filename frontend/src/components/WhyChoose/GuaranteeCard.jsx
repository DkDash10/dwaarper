import { useEffect, useRef } from "react";
import { LuBadgeCheck, LuCheck, LuShieldCheck } from "react-icons/lu";
import gsap from "gsap";
import CardShell from "./CardShell";

export default function GuaranteeCard() {
  const cardRef = useRef(null);

  const ringRef = useRef(null);
  const numberRef = useRef(null);
  const itemsRef = useRef([]);
  const badgeRef = useRef(null);
  const footerRef = useRef(null);
  const glowRef = useRef(null);
  const protectionRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;

    if (!card) return;

    const ctx = gsap.context(() => {
      const items = itemsRef.current.filter(Boolean);

      const circumference = 2 * Math.PI * 62;

      /*
       * Initial state
       */

      gsap.set(ringRef.current, {
        strokeDasharray: circumference,
        strokeDashoffset: circumference,
      });

      gsap.set(numberRef.current, {
        textContent: "0%",
      });

      gsap.set(items, {
        opacity: 0,
        x: -10,
      });

      gsap.set(badgeRef.current, {
        scale: 0.7,
        opacity: 0,
      });

      gsap.set(protectionRef.current, {
        opacity: 0,
        y: 12,
        scale: 0.98,
      });

      gsap.set(footerRef.current, {
        opacity: 0,
        y: 8,
      });

      /*
       * Main timeline
       */

      const progress = {
        value: 0,
      };

      const timeline = gsap.timeline({
        paused: true,
      });

      // Ring
      timeline.to(ringRef.current, {
        strokeDashoffset: circumference * 0.02,
        duration: 1.2,
        ease: "power2.out",
      });

      // Number
      timeline.to(
        progress,
        {
          value: 98,
          duration: 1.2,
          ease: "power2.out",

          onUpdate() {
            if (numberRef.current) {
              numberRef.current.textContent = `${Math.round(progress.value)}%`;
            }
          },
        },
        "<",
      );

      // Guarantee points
      timeline.to(
        items,
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          stagger: 0.12,
          ease: "power2.out",
        },
        "-=0.25",
      );

      // Badge
      timeline.to(
        badgeRef.current,
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
        },
        "-=0.1",
      );

      // Protection panel
      timeline.to(
        protectionRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: "power3.out",
        },
        "-=0.05",
      );

      // Footer
      timeline.to(
        footerRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        },
        "-=0.15",
      );

      /*
       * Viewport
       */

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

      /*
       * Mouse tilt
       */

      const handleMouseMove = (event) => {
        const rect = card.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rotateY = (x / rect.width - 0.5) * 4;

        const rotateX = -(y / rect.height - 0.5) * 4;

        gsap.to(card, {
          rotateX,
          rotateY,
          transformPerspective: 1200,
          duration: 0.18,
          ease: "power2.out",
          overwrite: "auto",
        });

        gsap.to(glowRef.current, {
          x: (x - rect.width / 2) * 0.1,
          y: (y - rect.height / 2) * 0.1,
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

  const guarantees = ["Quality Guaranteed", "Verified Professionals", "Secure Payments", "Support When Needed"];

  return (
    <CardShell ref={cardRef} className="relative h-[320px] overflow-hidden p-5 sm:p-7">
      {/* Glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute left-1/2 top-1/3 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[70px] sm:h-40 sm:w-40 sm:blur-[80px]"
      />

      <div className="relative z-10 flex h-full min-w-0 flex-col">
        {/* Header */}
        <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-cyan-300 sm:text-xs">GUARANTEE</p>

        {/* Main Ring */}
        <div className="mt-3 flex items-center justify-center sm:mt-5">
          <div className="relative h-[92px] w-[92px] sm:h-[118px] sm:w-[118px]">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140" fill="none">
              {/* Background */}
              <circle cx="70" cy="70" r="62" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />

              {/* Progress */}
              <circle ref={ringRef} cx="70" cy="70" r="62" stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" />
            </svg>

            {/* Number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span ref={numberRef} className="text-2xl font-bold text-white sm:text-3xl">
                0%
              </span>

              <span className="mt-0.5 text-[8px] uppercase tracking-[.12em] text-white/40 sm:mt-1 sm:text-[9px]">Satisfaction</span>
            </div>
          </div>
        </div>

        {/* Guarantee points */}
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:mt-5 sm:gap-x-5 sm:gap-y-2">
          {guarantees.map((item, index) => (
            <div
              key={item}
              ref={(el) => {
                itemsRef.current[index] = el;
              }}
              className="flex min-w-0 items-center gap-1.5 sm:gap-2"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 sm:h-6 sm:w-6">
                <LuCheck size={10} className="text-cyan-300 sm:h-3 sm:w-3" />
              </div>

              <span className="truncate text-[9px] text-white/50 sm:text-[12px]">{item}</span>
            </div>
          ))}
        </div>

        {/* Protection */}
        <div ref={protectionRef} className="mt-3 sm:mt-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 sm:h-10 sm:w-10">
                <LuShieldCheck size={17} className="text-cyan-300 sm:h-5 sm:w-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-white sm:text-[14px]">Every booking is protected</p>

                <p className="mt-0.5 truncate text-[8px] text-white/35 sm:text-[10px]">From booking to service completion</p>
              </div>
            </div>

            <span className="shrink-0 text-[9px] font-semibold text-cyan-300 sm:text-[10px]">100%</span>
          </div>

          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06] sm:mt-3">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
          </div>
        </div>

        {/* Footer */}
        <div ref={footerRef} className="mt-4 sm:mt-auto flex items-center justify-between">
          <span className="text-[8px] uppercase tracking-[.16em] text-white/30 sm:text-[9px] sm:tracking-[.18em]">DwaarPer Promise</span>

          <div ref={badgeRef} className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/10 sm:h-7 sm:w-7">
            <LuBadgeCheck size={15} className="text-cyan-300 sm:h-[17px] sm:w-[17px]" />
          </div>
        </div>
      </div>
    </CardShell>
  );
}
