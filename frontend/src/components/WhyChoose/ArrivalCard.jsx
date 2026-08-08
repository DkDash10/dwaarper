import { useEffect, useRef } from "react";
import { LuHouse, LuMapPin, LuStar, LuCircle } from "react-icons/lu";
import gsap from "gsap";
import CardShell from "./CardShell";

export default function ArrivalCard() {
  const cardRef = useRef(null);

  const routeRef = useRef(null);
  const markerRef = useRef(null);
  const homeRef = useRef(null);
  const liveRef = useRef(null);
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

      gsap.set(route, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });

      gsap.set(marker, {
        opacity: 0,
        scale: 0.6,
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

      const markerProgress = {
        length: 0,
      };

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
       * MAIN TIMELINE
       * -----------------------------------------
       */

      const timeline = gsap.timeline({
        paused: true,
      });

      timeline
        // Route appears
        .to(route, {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: "power2.inOut",
        })

        // Marker appears
        .to(
          marker,
          {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: "back.out(2)",
          },
          "-=0.65",
        )

        // Marker travels
        .to(
          markerProgress,
          {
            length: pathLength,
            duration: 2.4,
            ease: "power1.inOut",

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
          },
          "-=0.15",
        )

        // ETA countdown
        .to(
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
       * LIVE DOT
       * -----------------------------------------
       */

      const livePulse = gsap.to(liveRef.current, {
        scale: 1.35,
        opacity: 0.55,
        duration: 0.9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        paused: true,
      });

      /*
       * -----------------------------------------
       * INTERSECTION OBSERVER
       * -----------------------------------------
       */

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            timeline.restart();
            livePulse.play();
          } else {
            timeline.reverse();
            livePulse.pause();
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

        livePulse.kill();
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

      <div className="relative flex h-full flex-col p-7">
        {/* Header */}

        <span className="text-[11px] font-semibold uppercase tracking-[.3em] text-cyan-300">FAST ARRIVAL</span>

        <div className="mt-4 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">Professional Assigned</h3>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1">
            <LuStar size={14} className="fill-cyan-300 text-cyan-300" />

            <span className="text-sm text-white">4.9</span>
          </div>
        </div>

        {/* Route */}

        <div className="relative mt-8">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/20 bg-[#171717]">
              <LuMapPin size={16} className="text-cyan-300" />
            </div>
          </div>

          {/* Home */}

          <div ref={homeRef} className="absolute right-0 top-[38px] -translate-y-1/2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#171717]">
              <LuHouse size={16} className="text-white" />
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold text-white">
              <span ref={etaRef}>30</span>

              <span className="ml-2 text-lg font-medium text-white/60">mins away</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-green-400/20 bg-green-500/10 px-4 py-2">
            <LuCircle ref={liveRef} size={10} className="fill-green-400 text-green-400" />

            <span className="text-sm text-white">Live Dispatch</span>
          </div>
        </div>
      </div>
    </CardShell>
  );
}
