import React, { useState, useEffect, useRef } from "react";
import PhoneScreen from "./PhoneScreen";
import FloatingServiceCard from "./FloatingServiceCard";
import ConnectionLine from "./ConnectionLine";

import { HERO_SERVICES } from "./heroServices";

export default function HeroPhone() {
  const phoneRef = useRef(null);
  const [activeService, setActiveService] = useState(null);

  useEffect(() => {
    const phone = phoneRef.current;

    const handleMove = (e) => {
      const rect = phone.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateY = (x / rect.width - 0.5) * 16;
      const rotateX = (y / rect.height - 0.5) * -16;

      phone.style.transform = `
      perspective(1400px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-10px)
    `;
    };

    const reset = () => {
      phone.style.transform = `
      perspective(1400px)
      rotateX(0deg)
      rotateY(0deg)
      translateY(0px)
    `;
    };

    phone.addEventListener("mousemove", handleMove);
    phone.addEventListener("mouseleave", reset);

    return () => {
      phone.removeEventListener("mousemove", handleMove);
      phone.removeEventListener("mouseleave", reset);
    };
  }, []);
  return (
    <div className="hidden md:flex items-center justify-center w-full min-h-[700px] overflow-visible">
      {/* Background Glow */}

      <div className="absolute w-[650px] h-[650px] rounded-full bg-cyan-500/10 blur-[220px]" />

      <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[180px]" />

      {/* Outer Shadow */}

      <div className="absolute w-[360px] h-[680px] rounded-[58px] bg-black/30 blur-3xl translate-y-10" />

      {HERO_SERVICES.map((service) => (
        <FloatingServiceCard
          key={service.id}
          id={service.id}
          icon={service.icon}
          title={service.title}
          subtitle={service.subtitle}
          className={service.position.className}
          rotate={service.position.rotate}
          delay={service.position.delay}
          activeService={activeService}
          onHover={() => setActiveService(service.id)}
          onLeave={() => setActiveService(null)}
        />
      ))}

      <ConnectionLine className="left-32 top-28" rotate="-rotate-12" />

      <ConnectionLine className="right-32 top-36" rotate="rotate-12" />

      <ConnectionLine className="left-28 bottom-36" rotate="rotate-12" />

      <ConnectionLine className="right-28 bottom-24" rotate="-rotate-12" />

      {/* Phone */}

      <div
        ref={phoneRef}
        className="
        phoneFloat
        relative
        w-[340px]
        h-[680px]
        rounded-[58px]
        border
        border-white/10
        bg-gradient-to-b
        from-[#181818]
        via-[#111]
        to-[#070707]
        shadow-[0_60px_140px_rgba(0,0,0,.65)]
        overflow-hidden
        transition-transform
        duration-300
        will-change-transform
        hover:shadow-[0_70px_180px_rgba(34,211,238,.18)]
    "
      >
        {/* Metal Border */}

        <div
          className="
absolute
left-2
top-10
bottom-10
w-[2px]
bg-gradient-to-b
from-white/40
via-white/10
to-transparent
"
        />

        {/* Screen */}

        <div className="absolute inset-[8px] rounded-[48px] overflow-hidden bg-[#090909]">
          <div
            className="
        absolute
        -left-40
        top-0
        h-full
        w-28
        rotate-[18deg]
        bg-gradient-to-r
        from-transparent
        via-white/20
        to-transparent
        blur-2xl
        animate-reflection
        pointer-events-none
        z-50
    "
          />
          <PhoneScreen activeService={activeService} />
        </div>

        {/* Dynamic Island */}

        <div
          className="
            absolute
            left-1/2
            top-4
            -translate-x-1/2
            w-32
            h-8
            rounded-full
            bg-black
            border
            border-white/5
          "
        />
      </div>
    </div>
  );
}
