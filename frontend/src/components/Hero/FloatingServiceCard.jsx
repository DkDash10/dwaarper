import React from "react";
import { LuArrowUpRight } from "react-icons/lu";

export default function FloatingServiceCard({
  icon: Icon,
  title,
  subtitle,
  className,
  delay = 0,
  rotate = "",
  id,
  activeService,
  onHover,
  onLeave,
}) {
  const isActive = activeService === id;

  return (
    <>
      <style>{`
        @keyframes floatCard{
          0%{transform:translateY(0px);}
          50%{transform:translateY(-14px);}
          100%{transform:translateY(0px);}
        }
      `}</style>

      <div
        className={`
          absolute
          ${className}
          
        `}
        style={{
          animation: `floatCard 6s ease-in-out infinite`,
          animationDelay: delay,
        }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        <div
          className={`
            group cursor-pointer hover:scale-105
            w-60
            rounded-[30px]
            border
            border-white/10
            ${
              isActive
                ? "bg-cyan-500/10 border-cyan-400/40 shadow-[0_0_50px_rgba(34,211,238,.25)]"
                : "bg-white/[0.06] border-white/10"
            }
            backdrop-blur-3xl
            p-6
            transition-all
            duration-500
            shadow-[0_30px_80px_rgba(0,0,0,.35)]
            hover:-translate-y-5
            hover:shadow-[0_40px_120px_rgba(34,211,238,.20)]
            hover:rotate-0
            hover:bg-white/[0.09]
            hover:border-white/20
            ${rotate}
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Icon size={28} className="text-white" />
            </div>

            <LuArrowUpRight
              className="
                text-white/40
                transition
                group-hover:text-white
                group-hover:translate-x-1
                group-hover:-translate-y-1
              "
              size={20}
            />
          </div>

          <h3 className="mt-7 text-xl font-semibold text-white">{title}</h3>

          <p className="mt-2 text-white/55">{subtitle}</p>

          <div className="mt-8 h-px bg-white/10" />

          <div className="mt-4 flex justify-between">
            <span className="text-xs text-white/35">Available Today</span>

            <span className="text-xs text-green-400">● Online</span>
          </div>
        </div>
      </div>
    </>
  );
}
