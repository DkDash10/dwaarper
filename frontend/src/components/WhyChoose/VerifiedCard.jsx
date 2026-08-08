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
    <CardShell ref={cardRef} className="h-[560px] bg-[#141414]">
      <div className="flex h-full">
        {/* LEFT */}

        <div className="flex w-[58%] flex-col p-8">
          <span className="text-xs font-semibold uppercase tracking-[.28em] text-cyan-300">VERIFIED PROFESSIONAL</span>

          <div className="mt-8 flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-3xl font-bold text-black">R</div>

            <div>
              <h3 className="text-3xl font-bold text-white">Rahul Sharma</h3>

              <p className="mt-1 text-white/60">Plumbing Specialist</p>

              <div className="mt-3 flex items-center gap-2 text-cyan-300">
                <LuStar fill="currentColor" />

                <span>4.9 Rating</span>

                <span className="text-white/40">•</span>

                <span>1,250 Jobs</span>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            {["Police Verified", "Identity Verified", "Skill Certified", "Background Checked"].map((item) => (
              <div key={item} className="verify-item flex items-center gap-3">
                <LuBadgeCheck className="text-cyan-300" />

                <span className="text-white/70">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Customer Satisfaction</span>

              <span className="text-cyan-300">98%</span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div ref={progressRef} className="h-full w-[98%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="progress-shine" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className="relative flex flex-1 items-center justify-center">
          <div ref={glowRef} className="absolute h-64 w-64 rounded-full bg-cyan-500/10 blur-[90px]" />

          <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10">
            <div
              ref={shieldRef}
              className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_60px_rgba(34,211,238,.35)]"
            >
              <LuShieldCheck size={54} className="relative z-10 text-black" />
            </div>
          </div>

          <div ref={statusRef} className="absolute bottom-16 flex items-center gap-2 rounded-full border border-cyan-400/20 bg-[#151515] px-5 py-2">
            <LuCircle size={10} className="fill-green-400 text-green-400" />

            <span className="text-sm text-white">Available Today</span>
          </div>
        </div>
      </div>
    </CardShell>
  );
}
