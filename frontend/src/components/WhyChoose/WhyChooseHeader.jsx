import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export default function WhyChooseHeader() {
  const headerRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headingRef = useRef(null);
  const descriptionRef = useRef(null);

  useLayoutEffect(() => {
    const header = headerRef.current;

    if (!header) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        paused: true,
      });

      timeline
        .fromTo(
          eyebrowRef.current,
          {
            opacity: 0,
            y: 14,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power3.out",
          },
        )
        .fromTo(
          headingRef.current,
          {
            opacity: 0,
            y: 24,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
          },
          "-=0.2",
        )
        .fromTo(
          descriptionRef.current,
          {
            opacity: 0,
            y: 16,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power3.out",
          },
          "-=0.25",
        );

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            timeline.restart();
          } else {
            timeline.reverse();
          }
        },
        {
          threshold: 0.45,
        },
      );

      observer.observe(header);

      return () => {
        observer.disconnect();
        timeline.kill();
      };
    }, header);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={headerRef} className="mx-auto max-w-3xl px-5 text-center sm:px-6 lg:px-0">
      {/* Eyebrow */}
      <span ref={eyebrowRef} className="text-[14px] font-medium uppercase tracking-[0.32em] text-cyan-300">
        WHY DWAARPER
      </span>

      {/* Heading */}
      <h2 ref={headingRef} className="mt-6 text-[34px] font-semibold leading-[1] tracking-[-0.045em] text-white lg:text-5xl lg:leading-tight lg:tracking-normal">
        Everything You Need,
        <br />
        <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">Nothing You Don't.</span>
      </h2>

      {/* Description */}
      <p ref={descriptionRef} className="mx-auto mt-6 max-w-[330px] text-sm leading-7 text-white/55 lg:max-w-2xl lg:text-lg lg:leading-8">
        Verified professionals, transparent pricing, secure payments, and a seamless booking experience from start to finish.
      </p>
    </div>
  );
}
