import React from "react";
import {
  LuSearch,
  LuArrowRight,
  LuHouse,
  LuShoppingBag,
  LuUser,
} from "react-icons/lu";

import { HERO_SERVICES } from "./heroServices";

export default function PhoneScreen({ activeService }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#090909]">
      {/* Background Glow */}

      <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative flex h-full flex-col">
        {/* Header */}

        <div className="px-6 pt-16 mb-3">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35">
            Welcome Back
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            DwaarPer
          </h1>

          {/* Search */}

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 backdrop-blur-xl">
            <LuSearch className="text-white/40" />

            <span className="text-sm text-white/35">Search services...</span>
          </div>

          {/* Chips */}

          <div className="mt-4 flex gap-1 overflow-hidden">
            {["Cleaning", "AC", "Plumbing"].map((item) => (
              <div
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white backdrop-blur-xl"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Services */}

        <div className="pt-2 flex-1 space-y-5 overflow-hidden px-6">
          {HERO_SERVICES.map((service, index)=>{
            const Icon = service.icon;
            const isActive = activeService === service.id;
            return (
              <div
                key={index}
                className={`
rounded-3xl
border
backdrop-blur-xl
transition-all
duration-500
p-3
${
  isActive
    ? "border-cyan-400/40 bg-cyan-500/15 shadow-[0_0_40px_rgba(34,211,238,.25)] scale-[1.03]"
    : "border-white/10"
}

bg-gradient-to-br
${service.color}
`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <Icon size={22} className="text-white" />
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {service.phoneTitle}
                    </h3>

                    <p className="mt-1 text-sm text-white/55">
                      {service.price}
                    </p>
                  </div>

                  <button className="rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20">
                    <LuArrowRight />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Nav */}

        <div className="mx-6">
          <div className="flex items-center justify-around py-3">
            <LuHouse size={22} className="text-white" />

            <LuSearch size={22} className="text-white/45" />

            <LuShoppingBag size={22} className="text-white/45" />

            <LuUser size={22} className="text-white/45" />
          </div>
        </div>
      </div>
    </div>
  );
}
