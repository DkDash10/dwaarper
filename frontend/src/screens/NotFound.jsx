import React from "react";
import { Link } from "react-router-dom";
import { TbError404 } from "react-icons/tb";
import { LuArrowLeft } from "react-icons/lu";

import Navigationbar from "../components/Navigationbar";
import Footer from "../components/Footer";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Navigationbar />

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-24 sm:px-6 sm:py-32">
        {/* Background glow */}
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-[320px]
            w-[320px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-white/[0.025]
            blur-[100px]
            sm:h-[450px]
            sm:w-[450px]
          "
        />

        <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">

          {/* 404 icon */}
          <div
            className="
              flex
              h-24
              w-24
              items-center
              justify-center
              rounded-3xl
              border
              border-white/[0.08]
              bg-white/[0.035]
              shadow-[0_20px_60px_rgba(0,0,0,0.35)]
              sm:h-28
              sm:w-28
            "
          >
            <TbError404
              className="h-14 w-14 text-white/70 sm:h-16 sm:w-16"
            />
          </div>

          {/* Eyebrow */}
          <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.25em] text-white/30">
            Page not found
          </p>

          {/* Heading */}
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Looks like you're lost.
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-md text-sm leading-6 text-white/40 sm:text-base">
            The page you're looking for doesn't exist or may have been moved.
            Let's get you back to DwaarPer.
          </p>

          {/* CTA */}
          <Link
            to="/"
            className="
              group
              mt-8
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-white
              px-6
              py-3.5
              text-sm
              font-medium
              text-black
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-white/90
              hover:shadow-[0_15px_40px_rgba(255,255,255,0.10)]
            "
          >
            <LuArrowLeft
              size={15}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />

            Back to Home
          </Link>

          {/* Small 404 */}
          <p className="mt-10 text-[10px] tracking-[0.2em] text-white/15">
            ERROR 404
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;