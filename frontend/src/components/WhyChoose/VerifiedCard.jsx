import { LuBadgeCheck, LuShieldCheck, LuStar, LuCircle } from "react-icons/lu";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import CardShell from "./CardShell";

export default function VerifiedCard() {
  const cardRef = useRef(null);
  const shieldRef = useRef(null);
  const glowRef = useRef(null);
  const statusRef = useRef(null);
  const progressRef = useRef(null);

  useLayoutEffect(() => {
    const card = cardRef.current;

    if (!card) return;

    const onMove = (e) => {
      const rect = card.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateY = (x / rect.width - 0.5) * 10;
      const rotateX = -(y / rect.height - 0.5) * 10;

      gsap.to(card, {
        rotateX,
        rotateY,
        transformPerspective: 1400,
        duration: 0.18,
        ease: "power2.out",
        overwrite: "auto",
      });

      gsap.to(glowRef.current, {
        x: (x - rect.width / 2) * 0.22,
        y: (y - rect.height / 2) * 0.22,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
      });

      gsap.to([shieldRef.current, glowRef.current, statusRef.current], {
        x: 0,
        y: 0,
        duration: 0.6,
      });
    };

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);

    const onEnter = () => {
      gsap.fromTo(
        ".verify-item",
        {
          x: -16,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        },
      );
    };

    card.addEventListener("mouseenter", onEnter);

    const onCardEnter = () => {
      gsap.to(shieldRef.current, {
        scale: 1.06,
        duration: 0.25,
        ease: "power2.out",
      });
    };

    const onCardLeave = () => {
      gsap.to(shieldRef.current, {
        scale: 1,
        duration: 0.25,
        ease: "power2.out",
      });
    };

    card.addEventListener("mouseenter", onCardEnter);
    card.addEventListener("mouseleave", onCardLeave);

    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
      card.removeEventListener("mouseenter", onEnter);
      card.removeEventListener("mouseenter", onCardEnter);
      card.removeEventListener("mouseleave", onCardLeave);
    };
  }, []);

  useLayoutEffect(() => {
    gsap.to(progressRef.current, {
      boxShadow: "0 0 18px rgba(34,211,238,.45)",
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <CardShell ref={cardRef} className="h-auto bg-[#141414] lg:h-full">
      <div className="flex h-full justify-between flex-col p-6 sm:p-8">
        {/* NAME / PROFESSIONAL — FULL WIDTH */}
        <div className="w-full">
          <span className="text-[10px] font-semibold uppercase tracking-[.25em] text-cyan-300 sm:text-xs">VERIFIED PROFESSIONAL</span>

          <div className="mt-8 flex items-center gap-5">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-2xl sm:3xl font-bold text-black">
              R
            </div>

            <div className="min-w-0">
              <h3 className="text-xl font-bold text-white sm:text-3xl">Rahul Sharma</h3>

              <p className="mt-1 text-xs text-white/60 sm:text-base">Plumbing Specialist</p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-cyan-300 sm:text-base">
                <LuStar fill="currentColor" />

                <span>4.9 Rating</span>

                <span className="text-white/40">•</span>

                <span>1,250 Jobs</span>
              </div>
            </div>
          </div>
        </div>

        {/* VERIFIED + SHIELD — FLEX BETWEEN */}
        <div className="mt-10 flex items-center justify-between gap-8 lg:flex-1">
          {/* VERIFIED LIST */}
          <div className="space-y-4">
            {["Police Verified", "Identity Verified", "Skill Certified", "Background Checked"].map((item) => (
              <div key={item} className="verify-item flex items-center gap-3">
                <LuBadgeCheck className="shrink-0 text-cyan-300" />

                <span className="text-xs text-white/70 sm:text-base">{item}</span>
              </div>
            ))}
          </div>
          {/* SHIELD */}
          <div className="relative flex shrink-0 items-center justify-center">
            <div ref={glowRef} className="absolute h-48 w-48 rounded-full bg-cyan-500/10 blur-[70px] sm:h-64 sm:w-64 sm:blur-[90px]" />

            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 sm:h-36 sm:w-36">
              <div
                ref={shieldRef}
                className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_60px_rgba(34,211,238,.35)] sm:h-24 sm:w-24"
              >
                <LuShieldCheck size={44} className="relative z-10 text-black sm:size-[54px]" />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM — SATISFACTION + AVAILABLE TODAY */}
        <div className="mt-8 flex items-end justify-between gap-6 sm:gap-12 lg:mt-auto">
          {/* SATISFACTION */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-white/60 sm:text-base">Customer Satisfaction</span>

              <span className="text-sm text-cyan-300 sm:text-base">98%</span>
            </div>

            <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div ref={progressRef} className="h-full w-[98%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />

              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="progress-shine" />
              </div>
            </div>
          </div>
          {/* AVAILABLE */}
          <div ref={statusRef} className="flex shrink-0 items-center gap-2 rounded-full border border-cyan-400/20 bg-[#151515] px-4 py-2 sm:px-5">
            <LuCircle size={10} className="fill-green-400 text-green-400" />

            <span className="whitespace-nowrap text-xs text-white sm:text-sm">Available Today</span>
          </div>
        </div>
      </div>
    </CardShell>
  );
}
