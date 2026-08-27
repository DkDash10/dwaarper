import { useEffect, useRef } from "react";
import { LuCheck } from "react-icons/lu";
import gsap from "gsap";
import CardShell from "./CardShell";

export default function BookingCard() {
  const cardRef = useRef(null);

  const slotsRef = useRef([]);
  const selectedSlotRef = useRef(null);
  const buttonRef = useRef(null);
  const confirmationRef = useRef(null);
  const bookingContentRef = useRef(null);
  const successRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;

    if (!card) return;

    const ctx = gsap.context(() => {
      const slots = slotsRef.current.filter(Boolean);

      /*
       * -----------------------------------------
       * INITIAL STATE
       * -----------------------------------------
       */

      gsap.set(slots, {
        y: 10,
        opacity: 0,
      });

      gsap.set(selectedSlotRef.current, {
        scale: 1,
      });

      gsap.set(buttonRef.current, {
        y: 8,
        opacity: 0,
      });

      gsap.set(confirmationRef.current, {
        opacity: 0,
      });

      gsap.set(successRef.current, {
        opacity: 0,
        scale: 0.94,
        y: 8,
      });

      /*
       * -----------------------------------------
       * MAIN TIMELINE
       * -----------------------------------------
       */

      const timeline = gsap.timeline({
        paused: true,
      });

      timeline

        // Slots appear one by one
        .to(slots, {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
        })

        // Selected slot gets emphasis
        .to(
          selectedSlotRef.current,
          {
            scale: 1.05,
            duration: 0.25,
            ease: "power2.out",
          },
          "+=0.15",
        )

        .to(selectedSlotRef.current, {
          scale: 1,
          duration: 0.25,
          ease: "power2.out",
        })

        // Button appears
        .to(
          buttonRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power3.out",
          },
          "-=0.1",
        )

        // Confirmation indicator
        .to(
          confirmationRef.current,
          {
            opacity: 1,
            duration: 0.3,
          },
          "-=0.15",
        )

        // Small pause before confirmation
        .to({}, { duration: 0.7 })

        // Button press
        .to(buttonRef.current, {
          scale: 0.96,
          duration: 0.12,
          ease: "power2.out",
        })

        .to(buttonRef.current, {
          scale: 1,
          duration: 0.18,
          ease: "power2.out",
        })

        // Hide booking interface
        .to(bookingContentRef.current, {
          opacity: 0,
          y: -8,
          duration: 0.35,
          ease: "power2.inOut",
        })

        // Show success
        .to(
          successRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.45,
            ease: "back.out(1.5)",
          },
          "-=0.1",
        );

      /*
       * -----------------------------------------
       * VIEWPORT CONTROL
       * -----------------------------------------
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
       * -----------------------------------------
       * MOUSE TILT
       * -----------------------------------------
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
    <CardShell ref={cardRef} className="relative h-[320px] overflow-hidden p-7">
      {/* Cursor glow */}

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

        <div>
          <p className="text-xs font-semibold uppercase tracking-[.25em] text-cyan-300">BOOKING</p>

          <h3 className="mt-3 text-2xl font-semibold text-white">Book in under a minute.</h3>
        </div>

        {/* Booking content */}

        <div ref={bookingContentRef} className="mt-6 flex-1 rounded-2xl border border-white/10 bg-[#151515] p-5">
          {/* Service */}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[.18em] text-white/40">Selected Service</p>

              <p className="mt-1 text-sm font-medium text-white">Home Cleaning</p>
            </div>

            <span className="text-sm font-semibold text-cyan-300">₹799</span>
          </div>

          {/* Slots */}

          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-[.18em] text-white/40">Today</p>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {["10:30", "11:00", "11:30", "12:00"].map((time, index) => (
                <div
                  key={time}
                  ref={(el) => {
                    slotsRef.current[index] = el;
                  }}
                  className={`
                      flex
                      h-8
                      items-center
                      justify-center
                      rounded-lg
                      border
                      text-[10px]
                      ${index === 1 ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/10 bg-white/[0.02] text-white/50"}
                    `}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>

          {/* Confirm button */}

          <div
            ref={buttonRef}
            className="
    mt-5
    flex
    h-9
    items-center
    justify-center
    rounded-full
    bg-white
    px-4
    text-[10px]
    font-semibold
    text-black
  "
          >
            Confirm Booking
          </div>
        </div>

        {/* Confirmation */}

        <div ref={confirmationRef} className="mt-4 flex items-center justify-center gap-2 text-xs text-white/40">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400/10">
            <LuCheck size={10} className="text-cyan-300" />
          </div>

          <span>Instant confirmation</span>
        </div>

        {/* Success */}

        <div
          ref={successRef}
          className="
            pointer-events-none
            absolute
            inset-x-7
            bottom-7
            top-[100px]
            flex
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            border-cyan-400/20
            bg-[#151515]/95
            backdrop-blur-md
          "
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400/10">
            <LuCheck size={28} className="text-cyan-300" />
          </div>

          <p className="mt-4 text-lg font-semibold text-white">Booking Confirmed</p>

          <p className="mt-1 text-xs text-white/45">Home Cleaning · 11:00 AM</p>
        </div>
      </div>
    </CardShell>
  );
}
