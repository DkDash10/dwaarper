import React from "react";

export default function ScreenWrapper({
  active,
  children,
  screenRef,
}) {
  return (
    <div
      ref={screenRef}
      className={`
        absolute
        inset-0
        will-change-transform
        ${
          active
            ? "pointer-events-auto z-20"
            : "pointer-events-none z-10"
        }
      `}
    >
      {children}
    </div>
  );
}