import React from "react";

export default function ConnectionLine({
  className = "",
  rotate = "",
  width = "260px",
}) {
  return (
    <div className={`absolute pointer-events-none z-10 ${className}`}>
      <div
        className={`
                    relative
                    ${rotate}
                `}
        style={{
          width,
          height: "1px",
        }}
      >
        {/* Glow */}

        <div
          className="
                        absolute
                        inset-0
                        rounded-full
                        bg-gradient-to-r
                        from-transparent
                        via-cyan-400/30
                        to-transparent
                        blur-[2px]
                    "
        />

        {/* Main Line */}

        <div
          className="
                        absolute
                        inset-0
                        rounded-full
                        bg-gradient-to-r
                        from-transparent
                        via-white/35
                        to-transparent
                    "
        />

        {/* Moving Dot */}

        <div
          className="
                        signal
                        absolute
                        top-1/2
                        -translate-y-1/2
                        h-2
                        w-2
                        rounded-full
                        bg-cyan-300
                        shadow-[0_0_12px_rgba(34,211,238,.8)]
                    "
        />
      </div>

      <style>{`
                .signal{
                    animation:travel 4s linear infinite;
                }

                @keyframes travel{

                    0%{
                        left:0%;
                        opacity:0;
                    }

                    15%{
                        opacity:1;
                    }

                    85%{
                        opacity:1;
                    }

                    100%{
                        left:100%;
                        opacity:0;
                    }

                }
            `}</style>
    </div>
  );
}
