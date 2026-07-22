import React, { useEffect, useState } from "react";
import { LuSearch, LuShieldCheck } from "react-icons/lu";
import HeroPhone from "./HeroPhone";

const placeholderTexts = [
  "home cleaning...",
  "plumbing services...",
  "electricians...",
  "AC repair...",
  "pest control...",
  "appliance repair...",
];

export default function Hero({ search, setSearch, onViewResults }) {

  const [displayText, setDisplayText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    const current = placeholderTexts[placeholderIndex];

    let timeout;

    if (!isDeleting) {
      if (displayText.length < current.length) {
        timeout = setTimeout(() => {
          setDisplayText(current.substring(0, displayText.length + 1));
        }, 70);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 1800);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(current.substring(0, displayText.length - 1));
        }, 35);
      } else {
        setIsDeleting(false);

        setPlaceholderIndex((prev) => (prev + 1) % placeholderTexts.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, placeholderIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleBookNow = () => {
    document.getElementById("services")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({
      behavior: "smooth",
    });
  };
  return (
    <section className="relative min-h-[90vh] bg-[#090909] overflow-hidden">
      {/* Navbar spacing */}
      <div className="h-28 md:h-32"></div>
      {/* Background Blur */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 blur-[180px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center min-h-[calc(100vh-8rem)] pb-20">
          {/* LEFT */}

          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">
              <LuShieldCheck />
              Trusted Professionals
            </span>

            <h1 className="mt-8 text-white text-5xl sm:text-6xl lg:text-7xl xl:text-[82px] font-semibold leading-[0.95] tracking-[-0.05em]">
              Home services,
              <br />
              without the
              <span className="text-white/40"> hassle.</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-white/55">
              Whether it's deep cleaning, appliance repair, plumbing or
              electrical work, find trusted professionals near you in minutes.
            </p>

            {/* CTA */}

            <div className="flex flex-wrap gap-4 mt-10">
              <button
                className="rounded-full bg-white px-8 py-4 font-medium text-black transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(255,255,255,.15)]"
                onClick={handleBookNow}
              >
                Book a Professional
              </button>

              <button
                className="group font-medium text-white/70 hover:text-white transition flex items-center gap-2"
                onClick={handleHowItWorks}
              >
                See How It Works
              </button>
            </div>

            {/* Search */}

            <div className="mt-12">
              <div>
                <div className="relative">
                  <LuSearch
                    size={20}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40"
                  />

                  <input
                    type="search"
                    className="w-full rounded-2xl bg-white/[0.04] border border-white/5  px-14  py-[22px] text-white placeholder:text-white/35 outline-none focus:border-white/20"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 pointer-events-none">
                    {!search && (
                      <span className="text-white/35">
                        Search for {displayText}
                        {cursor && "|"}
                      </span>
                    )}
                  </div>
                </div>
                {search.trim() && (
                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4">
                    <div>
                      <p className="text-sm text-white/90">
                        Looking for
                        <span className="ml-2 font-medium">"{search}"</span>
                      </p>

                      <p className="mt-1 text-xs text-white/45">
                        Scroll to explore matching services.
                      </p>
                    </div>

                    <button
                      onClick={onViewResults}
                      className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:scale-105"
                    >
                      View Results
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}

            <div className="mt-16 flex divide-x divide-white/10">
              <div className="pr-10">
                <h2 className="text-4xl font-semibold text-white">4.9★</h2>

                <p className="text-white/45 mt-2">Average Rating</p>
              </div>

              <div className="px-10">
                <h2 className="text-4xl font-semibold text-white">12K+</h2>

                <p className="text-white/45 mt-2">Happy Customers</p>
              </div>

              <div className="pl-10">
                <h2 className="text-4xl font-semibold text-white">250+</h2>

                <p className="text-white/45 mt-2">Professionals</p>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="relative flex items-center justify-center">
            <HeroPhone/>
          </div>
        </div>
      </div>
    </section>
  );
}
