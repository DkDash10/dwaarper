import React from "react";
import SearchScreen from "./SearchScreen";
import ScheduleScreen from "./ScheduleScreen";
import ProfessionalScreen from "./ProfessionalScreen";
import SuccessScreen from "./SuccessScreen";
import ScreenWrapper from "./ScreenWrapper";
import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";

export default function BookingPhone({ step = 0 }) {
  const searchRef = useRef();
  const scheduleRef = useRef();
  const professionalRef = useRef();
  const successRef = useRef();
  const phoneRef = useRef();
  const glowRef = useRef();

  const refs = useMemo(() => [searchRef, scheduleRef, professionalRef, successRef], []);

  useLayoutEffect(() => {
    refs.forEach((ref, index) => {
      gsap.to(ref.current, {
        opacity: index === step ? 1 : 0,

        scale: index === step ? 1 : 0.96,

        y: index === step ? 0 : 30,

        duration: 0.55,

        ease: "power3.out",
      });
    });
  }, [refs, step]);

  useLayoutEffect(() => {
    gsap.fromTo(
      phoneRef.current,

      {
        scale: 0.985,
      },
      {
        scale: 1,
        duration: 0.45,
        ease: "power3.out",
      },
    );
  }, [step]);

  useLayoutEffect(() => {
    gsap.fromTo(
      glowRef.current,

      {
        scale: 1,
        opacity: 0.18,
      },

      {
        scale: 1.08,
        opacity: 0.32,
        duration: 0.35,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      },
    );
  }, [step]);

  return (
    <>
      <style>{`

      @keyframes phoneFloat{

        0%{
            transform:translateY(0px);
        }

        50%{
            transform:translateY(-8px);
        }

        100%{
            transform:translateY(0px);
        }

      }

      @keyframes shine{

        0%{
            transform:translateX(-180px) rotate(18deg);
        }

        100%{
            transform:translateX(420px) rotate(18deg);
        }

      }

      `}</style>

      <div className="relative mx-auto w-[340px] h-[690px] animate-[phoneFloat_7s_ease-in-out_infinite]">
        {/* Glow */}

        <div ref={glowRef} className="absolute inset-0 rounded-[60px] bg-cyan-500/8 blur-[120px] scale-110" />

        {/* Phone */}

        <div
          className="phoneFloat relative w-[340px] h-[680px] rounded-[58px] border border-white/15 bg-gradient-to-b from-[#181818] via-[#101010] to-[#070707] shadow-[0_60px_140px_rgba(0,0,0,.65)] overflow-hidden transition-transform duration-300 will-change-transform hover:shadow-[0_70px_180px_rgba(34,211,238,.18)]"
          ref={phoneRef}
        >
          {/* Metal */}

          <div className="absolute inset-[3px] rounded-[55px]" />

          {/* Screen */}

          <div className="absolute inset-[8px] rounded-[48px] overflow-hidden bg-[#080808]">
            {/* Reflection */}

            <div className="absolute -left-40 top-0 h-full w-24 rotate-[18deg] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-2xl animate-[shine_6s_linear_infinite] pointer-events-none z-10" />

            <div className="absolute inset-0 rounded-[42px] overflow-hidden">
              <ScreenWrapper active={step === 0} screenRef={searchRef}>
                <SearchScreen active={step === 0} />
              </ScreenWrapper>

              <ScreenWrapper active={step === 1} screenRef={scheduleRef}>
                <ScheduleScreen active={step === 1} />
              </ScreenWrapper>

              <ScreenWrapper active={step === 2} screenRef={professionalRef}>
                <ProfessionalScreen active={step === 2} />
              </ScreenWrapper>

              <ScreenWrapper active={step === 3} screenRef={successRef}>
                <SuccessScreen active={step === 3} />
              </ScreenWrapper>
            </div>
          </div>

          {/* Dynamic Island */}

          <div className="absolute z-[100] left-1/2 top-4 -translate-x-1/2 h-9 w-32 rounded-full bg-[#050505] border border-white/10 shadow-[0_6px_18px_rgba(0,0,0,.7)] backdrop-blur-xl" />
        </div>
      </div>
    </>
  );
}
