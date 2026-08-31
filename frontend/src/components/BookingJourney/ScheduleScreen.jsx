import { LuArrowLeft, LuCalendar, LuClock3, LuCheck } from "react-icons/lu";
import gsap from "gsap";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

const slots = ["09:00 AM", "10:30 AM", "12:00 PM", "01:30 PM", "03:00 PM", "04:30 PM", "06:00 PM", "07:30 PM"];

export default function ScheduleScreen({ active }) {
  const headerRef = useRef(null);
  const calendarRef = useRef(null);
  const slotsRef = useRef(null);
  const buttonRef = useRef(null);
  const slotsGridRef = useRef(null);
  const timelineRef = useRef(null);

  const [selectedSlot, setSelectedSlot] = useState(-1);
  const [selectedDay, setSelectedDay] = useState(-1);

  const reset = useCallback(() => {
    const elements = [headerRef.current, calendarRef.current, slotsRef.current, buttonRef.current].filter(Boolean);

    gsap.set(elements, {
      opacity: 0,
      y: 24,
    });

    gsap.set(buttonRef.current, {
      scale: 0.96,
    });

    setSelectedDay(-1);
    setSelectedSlot(-1);
  }, []);

  const selectDay = useCallback(() => {
    setSelectedDay(26);

    const day = calendarRef.current?.querySelector("[data-day='26']");

    if (!day) return;

    gsap.fromTo(
      day,
      {
        scale: 0.9,
      },
      {
        scale: 1,
        duration: 0.3,
        ease: "back.out(2)",
      },
    );
  }, []);

  const selectSlot = useCallback(() => {
    setSelectedSlot(2);

    const slot = slotsGridRef.current?.querySelector("[data-slot='2']");

    if (!slot) return;

    gsap.fromTo(
      slot,
      {
        scale: 0.9,
      },
      {
        scale: 1.03,
        duration: 0.35,
        ease: "back.out(2)",
      },
    );
  }, []);

  const playAnimation = useCallback(() => {
    timelineRef.current?.kill();

    const tl = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });

    timelineRef.current = tl;

    tl.to(headerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.4,
    })

      .to(
        calendarRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.32,
        },
        "-=0.2",
      )

      .add("calendarComplete")

      .call(selectDay)

      .to(
        slotsRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.25,
        },
        "-=0.15",
      )

      .add("slotsVisible")

      .call(selectSlot)

      .to(
        buttonRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.28,
        },
        "-=0.2",
      );
  }, [selectDay, selectSlot]);

  useLayoutEffect(() => {
    timelineRef.current?.kill();

    if (!active) {
      reset();
      return;
    }

    reset();

    const timeout = setTimeout(() => {
      playAnimation();
    }, 550);

    return () => {
      clearTimeout(timeout);
      timelineRef.current?.kill();
    };
  }, [active, playAnimation, reset]);

  return (
    <div className="flex h-full flex-col bg-[#0b0b0b]">
      {/* Header */}

      <div ref={headerRef} className="flex items-center gap-4 px-6 pt-16">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <LuArrowLeft className="text-white" />
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white">Select Schedule</h2>
        </div>
      </div>

      {/* Calendar */}

      <div ref={calendarRef} className="mt-6 px-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">June 2026</span>

            <LuCalendar className="text-cyan-300" />
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {[23, 24, 25, 26, 27].map((day) => (
              <div
                key={day}
                data-day={day}
                className={`flex h-10 items-center justify-center rounded-xl text-sm ${selectedDay === day ? "bg-cyan-400 text-black font-semibold" : "bg-white/5 text-white/50"}`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slots */}

      <div ref={slotsRef} className="mt-6 px-6">
        <div className="flex items-center gap-3">
          <LuClock3 className="text-cyan-300" />

          <span className="text-white">Available Slots</span>
        </div>

        <div ref={slotsGridRef} className="mt-4 grid grid-cols-2 gap-3">
          {slots.map((slot, index) => (
            <button
              key={slot}
              data-slot={index}
              className={`rounded-2xl border p-3 text-sm transition ${selectedSlot === index ? "border-cyan-400 bg-cyan-400 text-black font-semibold" : "border-white/10 bg-white/5 text-white"}`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{slot}</span>

                {selectedSlot === index && <LuCheck size={15} className="text-black" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Continue */}

      <div ref={buttonRef} className="mt-8 px-6">
        <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 font-semibold text-black shadow-[0_20px_50px_rgba(34,211,238,.4)]">
          Continue Booking
        </button>
      </div>
    </div>
  );
}
