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
  const screens = 4;

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

          const totalSteps = bookingSteps.length;

          const step = Math.min(totalSteps - 1, Math.floor(progress * totalSteps));

          setActiveStep(step);
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    gsap.fromTo(
      [headingRef.current, descRef.current],

      {
        opacity: 0,
        y: 25,
      },

      {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.5,
        ease: "power3.out",
      },
    );
  }, [activeStep]);

  return (
    <section ref={sectionRef} className="relative py-8 overflow-hidden bg-[#090909]">
      <div className="absolute left-0 top-20 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[180px]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-24 lg:grid-cols-2">
          <div key={activeStep} className="transition-all duration-500">
            <span className="uppercase tracking-[0.35em] text-cyan-300">BOOKING JOURNEY</span>

            <h2 className="mt-4 text-5xl font-semibold leading-tight text-white" ref={headingRef}>
              {bookingSteps[activeStep].title}
            </h2>

            <p className="mt-6 max-w-lg text- text-white/55" ref={descRef}>
              {bookingSteps[activeStep].subtitle}
            </p>

            <ProgressStepper activeStep={activeStep} />
          </div>

          <BookingPhone step={activeStep} />
        </div>
      </div>
    </section>
  );
}
