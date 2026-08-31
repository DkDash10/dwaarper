import { useEffect, useRef } from "react";
import { LuStar } from "react-icons/lu";
import gsap from "gsap";
import CardShell from "./CardShell";

export default function RatingCard() {
  const cardRef = useRef(null);

  const ratingRef = useRef(null);
  const starsRef = useRef([]);
  const barsRef = useRef([]);
  const percentagesRef = useRef([]);
  const footerRef = useRef(null);
  const glowRef = useRef(null);
  const testimonialRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;

    if (!card) return;

    const ctx = gsap.context(() => {
      const bars = barsRef.current.filter(Boolean);
      const percentages = percentagesRef.current.filter(Boolean);
      const stars = starsRef.current.filter(Boolean);

      // Initial states
      gsap.set(ratingRef.current, {
        textContent: "0.0",
      });

      gsap.set(stars, {
        scale: 0.7,
        opacity: 0,
      });

      gsap.set(bars, {
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.set(percentages, {
        opacity: 0,
        x: 8,
      });

      gsap.set(testimonialRef.current, {
        opacity: 0,
        y: 8,
      });

      gsap.set(footerRef.current, {
        opacity: 0,
        y: 8,
      });

      const rating = {
        value: 0,
      };

      const timeline = gsap.timeline({
        paused: true,
      });

      /*
       * 4.9 COUNT
       */

      timeline.to(rating, {
        value: 4.9,
        duration: 1,
        ease: "power2.out",

        onUpdate() {
          if (ratingRef.current) {
            ratingRef.current.textContent = rating.value.toFixed(1);
          }
        },
      });

      /*
       * STARS
       */

      timeline.to(
        stars,
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          stagger: 0.08,
          ease: "back.out(1.7)",
        },
        "-=0.45",
      );

      /*
       * RATING BARS
       */

      timeline.to(
        bars,
        {
          scaleX: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
        },
        "-=0.1",
      );

      /*
       * PERCENTAGES
       */

      timeline.to(
        percentages,
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          stagger: 0.08,
          ease: "power2.out",
        },
        "-=0.45",
      );

      timeline.to(
        testimonialRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.15",
      );

      /*
       * FOOTER
       */

      timeline.to(
        footerRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
        },
        "-=0.2",
      );

      /*
       * VIEWPORT
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
       * MOUSE TILT
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

  const ratings = [
    { stars: 5, percentage: 92 },
    { stars: 4, percentage: 6 },
    { stars: 3, percentage: 1 },
    { stars: 2, percentage: 0 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <CardShell ref={cardRef} className="relative h-[320px] overflow-hidden p-7">
      {/* Glow */}

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

        <p className="text-xs font-semibold uppercase tracking-[.25em] text-cyan-300">CUSTOMER RATING</p>

        {/* Rating summary */}

        <div className="mt-6 flex items-end gap-5">
          <div>
            <div ref={ratingRef} className="text-6xl font-bold leading-none text-white">
              0.0
            </div>

            <p className="mt-2 text-xs text-white/40">Average rating</p>
          </div>

          <div className="pb-1">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <LuStar
                  key={index}
                  ref={(el) => {
                    starsRef.current[index] = el;
                  }}
                  size={17}
                  className="fill-cyan-300 text-cyan-300"
                />
              ))}
            </div>

            <p className="mt-2 text-[10px] text-white/35">Based on customer reviews</p>
          </div>
        </div>

        {/* Rating Distribution */}

        <div className="mt-7 space-y-2.5">
          {ratings.map((rating, index) => (
            <div key={rating.stars} className="flex items-center gap-3">
              {/* Star number */}

              <span className="w-3 text-[10px] font-medium text-white/50">{rating.stars}</span>

              <LuStar size={11} className="fill-white/30 text-white/30" />

              {/* Bar */}

              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  ref={(el) => {
                    barsRef.current[index] = el;
                  }}
                  className="
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-cyan-400
                    to-blue-500
                  "
                  style={{
                    width: `${rating.percentage}%`,
                  }}
                />
              </div>

              {/* Percentage */}

              <span
                ref={(el) => {
                  percentagesRef.current[index] = el;
                }}
                className="w-8 text-right text-[10px] font-medium text-white/45"
              >
                {rating.percentage}%
              </span>
            </div>
          ))}
        </div>

        {/* Featured Testimonial */}

        <div className="mt-5 mb-4 border-t border-white/[0.08] pt-4" ref={testimonialRef}>
          <div className="flex gap-3">
            {/* Quote mark */}

            <div className="text-xl leading-none text-cyan-300/60">“</div>

            <div className="min-w-0">
              <p className="text-[11px] leading-4 text-white/65">Super smooth booking experience. The professional arrived exactly on time.</p>

              {/* <div className="mt-2 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-cyan-400" />

                <span className="text-[9px] font-medium uppercase tracking-[.12em] text-white/35">Verified customer</span>
              </div> */}
            </div>
          </div>
        </div>

        {/* Footer */}

        <div ref={footerRef} className="mt-auto flex items-center justify-between">
          <p className="text-xs text-white/40">
            Rated by <span className="font-semibold text-white">12,000+</span> homeowners
          </p>

          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,.7)]" />
        </div>
      </div>
    </CardShell>
  );
}
