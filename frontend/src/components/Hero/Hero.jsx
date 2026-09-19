import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { LuSearch, LuShieldCheck, LuArrowUpRight } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import HeroPhone from "./HeroPhone";
import { HERO_SERVICES } from "./heroServices";

const placeholderTexts = ["home cleaning...", "plumbing services...", "electricians...", "AC repair...", "pest control...", "appliance repair..."];

export default function Hero({ search, setSearch, onViewResults }) {
  const [displayText, setDisplayText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursor, setCursor] = useState(true);

  const mobileIntroRef = useRef(null);

  const mobileServicesRef = useRef(null);
  const mobileFeaturedRef = useRef(null);
  const mobileChipsRef = useRef(null);

  const navigate = useNavigate();

  // ============================================================
  // SEARCH PLACEHOLDER
  // ============================================================

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

  // ============================================================
  // SEARCH CURSOR
  // ============================================================

  useEffect(() => {
    const interval = setInterval(() => {
      setCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // MOBILE INTRO
  // DWAARPER → REAL NAVBAR LOGO
  // ============================================================

  useEffect(() => {
    const intro = mobileIntroRef.current;
    const introBrand = intro?.querySelector(".mobile-intro-brand");
    const target = document.querySelector(".nav-brand-target");

    if (!intro || !introBrand || !target) return;

    const ctx = gsap.context(() => {
      /*
       * Make the intro visible FIRST so that
       * getBoundingClientRect() returns its real dimensions.
       */
      gsap.set(intro, {
        display: "flex",
        opacity: 1,
      });

      gsap.set(introBrand, {
        x: 0,
        y: 0,
        opacity: 0,
      });

      /*
       * Hide the real navbar logo while the intro travels.
       */
      gsap.set(target, {
        opacity: 0,
      });

      /*
       * Wait until the browser has actually painted
       * the intro and navbar.
       */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const introRect = introBrand.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();

          /*
           * Actual center of intro DWAARPER.
           */
          const introCenterX = introRect.left + introRect.width / 2;

          const introCenterY = introRect.top + introRect.height / 2;

          /*
           * Actual center of navbar DWAARPER.
           */
          const targetCenterX = targetRect.left + targetRect.width / 2;

          const targetCenterY = targetRect.top + targetRect.height / 2;

          /*
           * Distance from intro center → navbar center.
           */
          const moveX = targetCenterX - introCenterX;
          const moveY = targetCenterY - introCenterY;

          const tl = gsap.timeline();

          /*
           * DWAARPER appears in the exact center.
           */
          tl.to(introBrand, {
            opacity: 1,
            duration: 0.55,
            ease: "power2.out",
          })

            /*
             * Small pause.
             */
            .to(
              {},
              {
                duration: 0.35,
              },
            )

            /*
             * Move from center → navbar logo.
             */
            .to(introBrand, {
              x: moveX,
              y: moveY,
              duration: 1.15,
              ease: "power3.inOut",
            })

            /*
             * Reveal actual navbar logo.
             */
            .to(
              target,
              {
                opacity: 1,
                duration: 0.18,
                ease: "power2.out",
              },
              "-=0.15",
            )

            /*
             * Remove intro.
             */
            .to(
              intro,
              {
                opacity: 0,
                duration: 0.25,
                ease: "power2.out",
                onComplete: () => {
                  intro.style.display = "none";
                },
              },
              "-=0.05",
            );
        });
      });
    });

    return () => ctx.revert();
  }, []);

  // ============================================================
  // MOBILE HERO VISUAL ANIMATION
  // ============================================================

  useEffect(() => {
    if (window.innerWidth >= 768) return;

    const services = mobileServicesRef.current;
    const featured = mobileFeaturedRef.current;
    const chips = mobileChipsRef.current;

    if (!services || !featured || !chips) return;

    const ctx = gsap.context(() => {
      gsap.set(services, {
        opacity: 0,
        y: 24,
      });

      gsap.set(featured, {
        opacity: 0,
        y: 20,
        scale: 0.98,
      });

      gsap.set(chips.children, {
        opacity: 0,
        y: 12,
      });

      const tl = gsap.timeline({
        delay: 1.9,
      });

      tl.to(services, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power3.out",
      })
        .to(
          featured,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.25",
        )
        .to(
          chips.children,
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.08,
            ease: "power3.out",
          },
          "-=0.25",
        );
    });

    return () => ctx.revert();
  }, []);

  // ============================================================
  // BOOK NOW
  // ============================================================

  const handleBookNow = () => {
    navigate("/services");
  };

  // ============================================================
  // HERO
  // ============================================================

  return (
    <section className="relative min-h-[auto] lg:min-h-[90vh] pb-6 md:pb-10 bg-[#090909] overflow-hidden">
      {/* ====================================================== */}
      {/* NAVBAR SPACING                                         */}
      {/* ====================================================== */}

      <div className="h-24 md:h-28"></div>

      {/* ====================================================== */}
      {/* BACKGROUND GLOW                                        */}
      {/* ====================================================== */}

      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 blur-[180px] rounded-full pointer-events-none" />

      {/* ====================================================== */}
      {/* MOBILE INTRO                                           */}
      {/* ====================================================== */}

      <div ref={mobileIntroRef} className="fixed inset-0 z-[9999] hidden items-center justify-center bg-[#090909]">
        <div className="mobile-intro-brand text-[11px] font-normal uppercase tracking-[0.2em] text-white sm:text-xs sm:tracking-[0.25em]">DWAARPER</div>{" "}
      </div>

      {/* ====================================================== */}
      {/* MAIN HERO                                              */}
      {/* ====================================================== */}

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center min-h-[auto] lg:min-h-[calc(100vh-8rem)] pb-8 lg:pb-12">
          {/* ================================================== */}
          {/* LEFT                                                */}
          {/* ================================================== */}

          <div>
            {/* TRUST BADGE */}

            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-300">
              <LuShieldCheck />
              Trusted Professionals
            </span>

            {/* ================================================= */}
            {/* HERO TITLE                                         */}
            {/* ================================================= */}

            <h1 className="mt-6 md:mt-8 text-white text-5xl sm:text-6xl lg:text-7xl xl:text-[82px] font-semibold leading-[0.95] tracking-[-0.05em]">
              Home services,
              <br />
              without the
              <br className="md:hidden" />
              <span className="text-white/40"> hassle.</span>
            </h1>

            {/* ================================================= */}
            {/* DESCRIPTION                                        */}
            {/* ================================================= */}

            <p className="mt-6 md:mt-8 md:max-w-xl md:text-lg leading-7 text-white/55">
              Whether it's deep cleaning, appliance repair, plumbing or electrical work, find trusted professionals near you in minutes.
            </p>

            {/* ================================================= */}
            {/* SEARCH                                              */}
            {/* ================================================= */}

            <div className="mt-8 md:mt-12">
              <div className="relative">
                <LuSearch size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" />

                <input
                  type="search"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-14 py-4 sm:py-[22px] text-white placeholder:text-white/35 outline-none focus:border-white/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {!search && (
                  <div className="absolute left-14 right-4 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden">
                    <span className="block truncate text-white/35">
                      Search for {displayText}
                      {cursor && "|"}
                    </span>
                  </div>
                )}
              </div>

              {/* ================================================= */}
              {/* SEARCH RESULT                                      */}
              {/* ================================================= */}

              {search.trim() && (
                <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white/90 break-words">
                        Looking for
                        <span className="ml-2 font-medium break-all">"{search}"</span>
                      </p>

                      <p className="mt-1 text-xs text-white/45">Scroll to explore matching services.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onViewResults(search)}
                      className="shrink-0 self-start sm:self-auto rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:scale-105"
                    >
                      View Results
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ================================================= */}
            {/* CTA                                                 */}
            {/* ================================================= */}

            <div className="mt-8 md:mt-10">
              <button
                className="rounded-full bg-white px-8 py-4 text-sm font-medium text-black transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(255,255,255,.15)]"
                onClick={handleBookNow}
              >
                Book a Professional
              </button>
            </div>

            {/* ================================================= */}
            {/* MOBILE SERVICE DISCOVERY                         */}
            {/* ================================================= */}

            <div ref={mobileServicesRef} className="mt-12 lg:hidden">
              {/* SECTION LABEL */}

              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/35">Popular services</p>

                <Link to="/services" className="text-[10px] text-white/30 transition-colors hover:text-white/60">
                  Explore all
                </Link>
              </div>

              {/* ================================================= */}
              {/* FEATURED CARD                                     */}
              {/* ================================================= */}

              {HERO_SERVICES.slice(0, 1).map((service) => {
                const Icon = service.icon;

                return (
                  <Link key={service.id} to={`/services#category-${service.categorySlug}`} className="block">
                    <div
                      ref={mobileFeaturedRef}
                      className={`relative overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br ${service.color} p-5 transition-all duration-300 hover:border-white/20 hover:-translate-y-1`}
                    >
                      {/* Glow */}

                      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

                      <div className="relative">
                        <div className="flex items-start justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08]">
                            <Icon size={22} className="text-white" />
                          </div>

                          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.08]">
                            <LuArrowUpRight size={19} className="text-white/80" />
                          </div>
                        </div>

                        <div className="mt-8">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-white/35">Featured service</p>

                          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{service.phoneTitle}</h2>

                          <p className="mt-1 text-sm text-white/45">{service.subtitle}</p>

                          <div className="mt-5 flex items-center justify-between">
                            <p className="text-sm font-medium text-white/80">{service.price}</p>

                            <span className="flex items-center gap-2 text-xs text-emerald-300/80">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                              Available today
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* ================================================= */}
              {/* SERVICE CHIPS                                     */}
              {/* ================================================= */}

              <div ref={mobileChipsRef} className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {HERO_SERVICES.slice(1).map((service) => {
                  const Icon = service.icon;

                  return (
                    <Link
                      key={service.id}
                      to={`/services#category-${service.categorySlug}`}
                      className="shrink-0 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-medium text-white/65 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                    >
                      <Icon size={14} />
                      {service.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* DESKTOP PHONE                                      */}
          {/* ================================================== */}

          <div className="relative hidden lg:flex items-center justify-center">
            <HeroPhone />
          </div>
        </div>
      </div>
    </section>
  );
}
