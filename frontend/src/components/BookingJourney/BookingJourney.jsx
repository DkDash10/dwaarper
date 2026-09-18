import { useRef, useState, useLayoutEffect } from "react";
import BookingPhone from "./BookingPhone";
import { bookingSteps } from "./bookingData";
import ProgressStepper from "./ProgressStepper";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function BookingJourney() {
  const [activeStep, setActiveStep] = useState(0);

  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);

  const mobileHeadingRef = useRef(null);
  const mobileDescRef = useRef(null);

  const stepperRef = useRef(null);

  const screens = bookingSteps.length;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,

        start: "top top",

        end: `+=${screens * 450}`,

        pin: true,

        scrub: 1,

        anticipatePin: 1,

        onUpdate: (self) => {
          const progress = self.progress;

          const step = Math.min(screens - 1, Math.floor(progress * screens));

          setActiveStep(step);
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [screens]);

  /*
   * Animate only the CURRENT title + description.
   * We don't animate the whole stepper on mobile.
   */
  useLayoutEffect(() => {
    const heading = window.innerWidth >= 1024 ? headingRef.current : mobileHeadingRef.current;

    const description = window.innerWidth >= 1024 ? descRef.current : mobileDescRef.current;

    if (!heading) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      tl.fromTo(
        heading,
        {
          opacity: 0,
          y: 24,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
        },
      );

      if (description) {
        tl.fromTo(
          description,
          {
            opacity: 0,
            y: 16,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
          },
          "-=0.22",
        );
      }

      if (stepperRef.current && window.innerWidth >= 1024) {
        tl.fromTo(
          stepperRef.current,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
          },
          "-=0.15",
        );
      }
    });

    return () => ctx.revert();
  }, [activeStep]);

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden bg-[#090909] pt-12 pb-6 md:pt-8 md:pb-20">
      {/* Background glow */}

      <div className="pointer-events-none absolute left-0 top-20 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[180px]" />

      <div className="relative mx-auto h-full max-w-7xl px-5 sm:px-6">
        {/* ================================================= */}
        {/* DESKTOP */}
        {/* ================================================= */}

        <div className="hidden h-full items-center gap-24 lg:grid lg:grid-cols-2">
          <div key={activeStep}>
            <span className="uppercase tracking-[0.35em] text-cyan-300">BOOKING JOURNEY</span>

            <h2 className="mt-4 text-5xl font-semibold leading-tight text-white" ref={headingRef}>
              {bookingSteps[activeStep].title}
            </h2>

            <p className="mt-6 max-w-lg text-white/55 block sm:hidden" ref={descRef}>
              {bookingSteps[activeStep].subtitle}
            </p>

            <ProgressStepper activeStep={activeStep} />
          </div>

          <BookingPhone step={activeStep} />
        </div>

        {/* ================================================= */}
        {/* MOBILE */}
        {/* ================================================= */}

        <div className="flex h-full flex-col lg:hidden">
          {/* CURRENT STEP INFORMATION */}

          <div key={activeStep} className="relative z-20 shrink-0">
            <span className="text-[14px] font-medium uppercase tracking-[0.32em] text-cyan-300">BOOKING JOURNEY</span>

            <h2 ref={headingRef} className="mt-6 text-[34px] font-semibold leading-[1] tracking-[-0.045em] text-white sm:text-4xl">
              {bookingSteps[activeStep].title}
            </h2>

            <p ref={mobileDescRef} className="mt-6 max-w-[330px] text-sm md:text-lg leading-7 text-white/55">
              {bookingSteps[activeStep].subtitle}
            </p>

            {/* COMPACT PROGRESS */}

            <div className="mt-5 flex items-center gap-3">
              <span className="text-[14px] font-medium tracking-[0.15em] text-white/40">{String(activeStep + 1).padStart(2, "0")}</span>

              <div className="flex items-center gap-1.5">
                {bookingSteps.map((step, index) => (
                  <span
                    key={step.id}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === activeStep ? "w-7 bg-cyan-400" : index < activeStep ? "w-1.5 bg-cyan-400/50" : "w-1.5 bg-white/15"
                    }`}
                  />
                ))}
              </div>

              <span className="text-[14px] text-white/25">{String(screens).padStart(2, "0")}</span>
            </div>

            <p className="mt-2 text-[12px] uppercase tracking-[0.18em] text-white/25">{bookingSteps[activeStep].label}</p>
          </div>

          {/* BOOKING CONTENT */}

          <div className="relative mt-6 w-full flex-1 overflow-visible">
            <BookingPhone step={activeStep} />
          </div>
        </div>
      </div>
    </section>
  );
}
