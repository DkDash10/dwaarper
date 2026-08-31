import { LuArrowLeft, LuMapPin, LuShieldCheck, LuPhone, LuMessageCircle } from "react-icons/lu";
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

export default function ProfessionalScreen({ active }) {
  const headerRef = useRef(null);
  const avatarRef = useRef(null);
  const statsRef = useRef(null);
  const locationRef = useRef(null);
  const buttonsRef = useRef(null);
  const onlineDotRef = useRef(null);
  const timelineRef = useRef(null);
  const verifiedRef = useRef(null);

  const reset = () => {
    const elements = [headerRef.current, avatarRef.current, statsRef.current, locationRef.current, buttonsRef.current].filter(Boolean);

    gsap.set(elements, {
      opacity: 0,
      y: 24,
    });

    gsap.set(avatarRef.current, {
      scale: 0.9,
    });

    gsap.set(onlineDotRef.current, {
      scale: 0,
    });

    gsap.set(verifiedRef.current, {
      opacity: 0,
      y: 10,
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

    tl.to(headerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.4,
    })

      .to(
        avatarRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
        },
        "-=0.2",
      )

      .to(
        onlineDotRef.current,
        {
          scale: 1,
          duration: 0.35,
          ease: "back.out(3)",
        },
        "-=.15",
      )

      .to(
        verifiedRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
        },
        "-=.1",
      )

      .to(
        statsRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
        },
        "-=.15",
      )

      .fromTo(
        statsRef.current.children,
        {
          y: 15,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.28,
        },
        "<+=.05",
      )

      .to(
        locationRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
        },
        "-=0.15",
      )

      .to(
        buttonsRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
        },
        "-=0.15",
      );
  };

  useLayoutEffect(() => {
    timelineRef.current?.kill();

    if (!active) {
      reset();
      return;
    }

    reset();

    const timeout = setTimeout(() => {
      playAnimation();
    }, 180);

    return () => {
      clearTimeout(timeout);
      timelineRef.current?.kill();
    };
  }, [active]);

  return (
    <div className="flex h-full flex-col bg-[#0b0b0b]">
      {/* Header */}

      <div ref={headerRef} className="flex items-center gap-4 px-6 pt-16">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <LuArrowLeft className="text-white" />
        </div>

        <div>
          <span className="text-sm text-cyan-300">Professional Assigned</span>

          <h2 className="text-2xl font-semibold text-white">Your Expert is Ready</h2>
        </div>
      </div>

      {/* Avatar */}

      <div ref={avatarRef} className="mt-6 flex flex-col items-center">
        <div className="relative">
          <img src="https://i.pravatar.cc/300?img=12" alt="" className="h-28 w-28 rounded-full border-4 border-cyan-400 object-cover" />

          <div ref={onlineDotRef} className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-[#0b0b0b] bg-green-500" />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-white">Rahul Sharma</h3>

        <div ref={verifiedRef} className="mt-1 text-sm flex items-center gap-2 text-cyan-300">
          <LuShieldCheck />
          Verified Professional
        </div>
      </div>

      {/* Stats */}

      <div ref={statsRef} className="mt-6 grid grid-cols-3 gap-2 px-6 items-center">
        <div className="flex flex-col-reverse rounded-2xl border border-white/10 bg-white/5 p-2 text-center">
          <p className="font-semibold text-white">4.9</p>

          <span className="text-xs text-white/45">Rating</span>
        </div>

        <div className="flex flex-col-reverse rounded-2xl border border-white/10 bg-white/5 p-2 text-center">
          <p className="font-semibold text-white">520+</p>

          <span className="text-xs text-white/45">Jobs</span>
        </div>

        <div className="flex flex-col-reverse rounded-2xl border border-white/10 bg-white/5 p-2 text-center">
          <p className="font-semibold text-white">12 min</p>

          <span className="text-xs text-white/45">ETA</span>
        </div>
      </div>

      {/* Location */}

      <div ref={locationRef} className="mt-6 px-6">
        <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-3">
          <div className="rounded-2xl bg-cyan-500/10 p-3">
            <LuMapPin className="text-cyan-300" size={16} />
          </div>

          <div>
            <p className="text-sm text-white/45">Current Location</p>

            <h4 className="text-white">2.8 km away from you</h4>
          </div>
        </div>
      </div>

      {/* Buttons */}

      <div ref={buttonsRef} className="mt-6 flex gap-3 px-6">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-white">
          <LuPhone />
          Call
        </button>

        <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 font-semibold text-black">
          <LuMessageCircle />
          Chat
        </button>
      </div>
    </div>
  );
}
