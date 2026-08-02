import { LuBadgeCheck, LuCalendarDays, LuClock3, LuMapPin, LuArrowRight } from "react-icons/lu";
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

export default function SuccessScreen({ active }) {
  const iconRef = useRef(null);
  const headingRef = useRef(null);
  const cardRef = useRef(null);
  const progressRef = useRef(null);
  const buttonRef = useRef(null);

  const timelineRef = useRef(null);
  const progressFillRef = useRef(null);

  const reset = () => {
    timelineRef.current?.kill();

    const elements = [iconRef.current, headingRef.current, cardRef.current, progressRef.current, buttonRef.current].filter(Boolean);

    gsap.set(progressFillRef.current, {
      width: "0%",
    });

    gsap.set(elements, {
      opacity: 0,
      y: 24,
    });

    gsap.set(iconRef.current, {
      scale: 0.6,
    });

    gsap.set(buttonRef.current, {
      scale: 0.96,
    });
  };

  const playAnimation = () => {
    timelineRef.current?.kill();

    const tl = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });

    timelineRef.current = tl;

    tl.to(iconRef.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.55,
      ease: "back.out(1.8)",
    })

      .to(
        headingRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
        },
        "-=.2",
      )

      .to(
        cardRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
        },
        "-=.15",
      )

      .to(
        progressRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
        },
        "-=.15",
      )

      .fromTo(
        progressFillRef.current,
        {
          width: "0%",
        },
        {
          width: "66%",
          duration: 0.9,
          ease: "power2.out",
        },
      )

      .to(
        buttonRef.current,
        {
          opacity: 1,
          scale: 1.04,
          y: 0,
          duration: 0.3,
        },
        "-=.15",
      )

      .to(buttonRef.current, {
        scale: 1,
        duration: 0.2,
      })

      .call(() => {
        gsap.to(iconRef.current, {
          scale: 1.03,
          duration: 1.8,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      });
  };

  useLayoutEffect(() => {
    if (!active) {
      reset();
      return;
    }

    reset();

    requestAnimationFrame(() => {
      playAnimation();
    });

    return () => {
      timelineRef.current?.kill();
    };
  }, [active]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0b0b0b]">
      {/* Glow */}

      <div className="absolute left-1/2 top-24 h-52 w-52 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />

      {/* Success Icon */}

      <div ref={iconRef} className="relative mt-[4.5rem] flex justify-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500">
            <LuBadgeCheck size={42} className="text-black" />
          </div>
        </div>
      </div>

      {/* Heading */}

      <div ref={headingRef} className="relative mt-6 px-8 text-center">
        <h2 className="text-xl font-semibold text-white">Booking Confirmed</h2>

        <p className="text-sm mt-2 leading-5 text-white/55">Your professional has been scheduled successfully. We'll notify you before arrival.</p>
      </div>

      {/* Booking Card */}

      <div ref={cardRef} className="relative mt-6 px-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-white/40">Booking ID</span>

            <span className="font-medium text-cyan-300">#DW24871</span>
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-4">
              <LuCalendarDays className="text-cyan-300" />

              <span className="text-white">26 June 2026</span>
            </div>

            <div className="flex items-center gap-4">
              <LuClock3 className="text-cyan-300" />

              <span className="text-white">12:00 PM</span>
            </div>

            <div className="flex items-center gap-4">
              <LuMapPin className="text-cyan-300" />

              <span className="text-white">Mumbai, Maharashtra</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}

      <div ref={progressRef} className="mt-3 px-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-white/40">Professional Status</span>

          <span className="text-cyan-300">On the way</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div ref={progressFillRef} className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
        </div>
      </div>

      {/* CTA */}

      <div ref={buttonRef} className="mt-6 px-6">
        <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 font-semibold text-black shadow-[0_20px_60px_rgba(34,211,238,.35)]">
          Track Professional
          <LuArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
