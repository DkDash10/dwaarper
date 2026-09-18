import { useEffect, useRef } from "react";
import { LuHouse, LuMapPin, LuStar } from "react-icons/lu";
import gsap from "gsap";
import CardShell from "./CardShell";

export default function ArrivalCard() {
  const cardRef = useRef(null);

  const routeRef = useRef(null);
  const markerRef = useRef(null);
  const homeRef = useRef(null);
  const etaRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const route = routeRef.current;
    const marker = markerRef.current;

    if (!card || !route || !marker) return;

    const ctx = gsap.context(() => {
      /*
       * -----------------------------------------
       * INITIAL STATE
       * -----------------------------------------
       */

      const pathLength = route.getTotalLength();

      const markerProgress = {
        length: 0,
      };

      /*
       * Get the exact starting point of the SVG path
       */
      const startPoint = route.getPointAtLength(0);

      /*
       * Route starts hidden
       */
      gsap.set(route, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });

      /*
       * Marker starts exactly on the pin,
       * but remains invisible.
       */
      gsap.set(marker, {
        opacity: 0,
        scale: 0.6,
        attr: {
          cx: startPoint.x,
          cy: startPoint.y,
        },
      });

      gsap.set(homeRef.current, {
        scale: 1,
      });

      gsap.set(etaRef.current, {
        textContent: "30",
      });

      /*
       * -----------------------------------------
       * MARKER POSITION
       * -----------------------------------------
       */

      const updateMarker = () => {
        const point = route.getPointAtLength(markerProgress.length);

        gsap.set(marker, {
          attr: {
            cx: point.x,
            cy: point.y,
          },
        });
      };

      /*
       * -----------------------------------------
       * RESET
       * -----------------------------------------
       */

      const resetAnimation = () => {
        markerProgress.length = 0;

        gsap.set(route, {
          strokeDashoffset: pathLength,
        });

        gsap.set(marker, {
          opacity: 0,
          scale: 0.6,
          attr: {
            cx: startPoint.x,
            cy: startPoint.y,
          },
        });

        gsap.set(homeRef.current, {
          scale: 1,
        });

        gsap.set(etaRef.current, {
          textContent: "30",
        });
      };

      /*
       * -----------------------------------------
       * MAIN TIMELINE
       * -----------------------------------------
       */

      const timeline = gsap.timeline({
        paused: true,
      });

      /*
       * ROUTE
       *
       * Draw the route first.
       */
      timeline.to(route, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: "power2.inOut",
      });

      /*
       * MARKER
       *
       * The marker appears and starts moving
       * in the SAME tween.
       *
       * This prevents:
       * appear → disappear → appear → move
       */
      timeline.to(markerProgress, {
        length: pathLength,
        duration: 2.4,
        ease: "power1.inOut",

        onStart: () => {
          /*
           * Make absolutely sure the marker
           * starts at the beginning of the route.
           */
          markerProgress.length = 0;
          updateMarker();

          gsap.to(marker, {
            opacity: 1,
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
            overwrite: true,
          });
        },

        onUpdate: updateMarker,

        onComplete: () => {
          /*
           * Destination pulse
           */
          gsap.fromTo(
            homeRef.current,
            {
              scale: 1,
            },
            {
              scale: 1.12,
              duration: 0.25,
              repeat: 1,
              yoyo: true,
              ease: "power2.out",
            },
          );
        },
      });

      /*
       * -----------------------------------------
       * ETA COUNTDOWN
       * -----------------------------------------
       */

      timeline.to(
        { value: 30 },
        {
          value: 12,
          duration: 2.4,
          ease: "none",

          onUpdate() {
            const value = Math.round(this.targets()[0].value);

            if (etaRef.current) {
              etaRef.current.textContent = value;
            }
          },
        },
        "<",
      );

      /*
       * -----------------------------------------
       * VIEWPORT CONTROL
       * -----------------------------------------
       */

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            /*
             * Always start from a clean state.
             */
            resetAnimation();

            timeline.restart();
          } else {
            /*
             * Stop immediately and reset.
             *
             * This prevents the marker from reversing
             * and then appearing from an incorrect position.
             */
            timeline.pause(0);

            resetAnimation();
          }
        },
        {
          threshold: 0.45,
        },
      );

      observer.observe(card);

      /*
       * -----------------------------------------
       * MOUSE TILT
       * -----------------------------------------
       */

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

      /*
       * -----------------------------------------
       * CLEANUP
       * -----------------------------------------
       */

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
    <CardShell ref={cardRef} className="h-[267px] overflow-hidden">
      {/* Cursor-follow glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[70px] sm:h-48 sm:w-48 sm:blur-[90px]"
      />

      <div className="relative flex h-full flex-col p-5 sm:p-7">
        {/* Header */}
        <span className="text-[10px] font-semibold uppercase tracking-[.3em] text-cyan-300 sm:text-[11px]">FAST ARRIVAL</span>

        <div className="mt-3 flex items-start justify-between gap-3 sm:mt-4">
          <h3 className="min-w-0 text-xl font-bold leading-tight text-white sm:text-2xl">Professional Assigned</h3>

          <div className="flex shrink-0 items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 sm:px-3">
            <LuStar size={12} className="fill-cyan-300 text-cyan-300 sm:h-[14px] sm:w-[14px]" />

            <span className="text-xs text-white sm:text-sm">4.9</span>
          </div>
        </div>

        {/* Route */}
        <div className="relative mt-6 translate-y-[2px] sm:mt-8 sm:translate-y-0">
          <svg className="w-full overflow-visible" viewBox="0 0 420 80" fill="none">
            {/* Base route */}
            <path
              d="
                M30 38
                C120 -5
                300 -5
                390 38
              "
              stroke="rgba(255,255,255,.08)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Animated route */}
            <path
              ref={routeRef}
              d="
                M30 38
                C120 -5
                300 -5
                390 38
              "
              stroke="#22d3ee"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Moving marker */}
            <circle ref={markerRef} r="7" fill="#22d3ee" stroke="white" strokeWidth="2" />
          </svg>

          {/* Start */}
          <div className="absolute left-0 top-[38px] -translate-y-1/2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/20 bg-[#171717] sm:h-10 sm:w-10">
              <LuMapPin size={15} className="text-cyan-300 sm:h-4 sm:w-4" />
            </div>
          </div>

          {/* Home */}
          <div ref={homeRef} className="absolute right-0 top-[38px] -translate-y-1/2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#171717] sm:h-10 sm:w-10">
              <LuHouse size={15} className="text-white sm:h-4 sm:w-4" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-end justify-between gap-3">
          {/* ETA */}
          <div>
            <div className="text-2xl font-bold text-white sm:text-3xl">
              <span ref={etaRef}>30</span>

              <span className="ml-1.5 text-sm font-medium text-white/60 sm:ml-2 sm:text-lg">mins away</span>
            </div>
          </div>

          {/* Tracking */}
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 sm:px-4 sm:py-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,.7)]" />

            <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-cyan-300 sm:text-xs">Tracking Active</span>
          </div>
        </div>
      </div>
    </CardShell>
  );
}
