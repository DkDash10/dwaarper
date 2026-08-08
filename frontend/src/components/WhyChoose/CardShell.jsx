import { forwardRef } from "react";

const CardShell = forwardRef(({ children, className = "" }, ref) => {
  return (
    <div
      ref={ref}
      className={`
          group
          relative
          h-full
          overflow-hidden
          rounded-[32px]
          border
          border-white/15
          bg-[#101010]
          shadow-[0_10px_30px_rgba(0,0,0,.25)]
          transition-all
          duration-500
          hover:-translate-y-2
          hover:border-cyan-400/30
          hover:shadow-[0_20px_60px_rgba(34,211,238,.12)]
          ${className}
        `}
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[140px]" />

      <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-blue-500/15 blur-[120px]" />

      {/* Grid Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: `
              linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)
            `,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Subtle Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Border Highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/5 group-hover:ring-cyan-400/20 transition-all duration-500" />

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
});

CardShell.displayName = "CardShell";

export default CardShell;
