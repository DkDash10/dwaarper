import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Navigationbar from "../../components/Navigationbar";
import Footer from "../../components/Footer";
import ServiceFilters from "./ServiceFilters";
import ServiceCard from "./ServiceCard";

gsap.registerPlugin(ScrollTrigger);

const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "192.168.0.107" ? `http://${window.location.hostname}:5000` : "https://dwaarper.onrender.com";

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

const slugify = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* -------------------------------------------------------
   Page
------------------------------------------------------- */

export default function Services() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pageRef = useRef(null);

  const [serviceCategory, setServiceCategory] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollState, setScrollState] = useState({});

  /* -------------------------------------------------------
     Load services
  ------------------------------------------------------- */

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/service_data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load services");
      }

      const data = await response.json();

      setServiceData(data?.[0] || []);
      setServiceCategory(data?.[1] || []);
    } catch (err) {
      console.error("Services fetch error:", err);
      setError(err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* -------------------------------------------------------
     Read search query
  ------------------------------------------------------- */

  useEffect(() => {
    const query = searchParams.get("search") || "";
    setSearch(query);
  }, [searchParams]);

  /* -------------------------------------------------------
     Filter services
  ------------------------------------------------------- */

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return serviceData.filter((service) => activeCategory === "All" || service.CategoryName === activeCategory);
    }

    const searchTerms = query.split(/\s+/).filter(Boolean);

    return serviceData.filter((service) => {
      const categoryMatch = activeCategory === "All" || service.CategoryName === activeCategory;

      if (!categoryMatch) return false;

      const optionText = Object.keys(service?.options?.[0] || {}).join(" ");

      const searchableText = [service.name, service.description, service.CategoryName, optionText].filter(Boolean).join(" ").toLowerCase();

      return searchTerms.every((term) => searchableText.includes(term));
    });
  }, [serviceData, search, activeCategory]);

  /* -------------------------------------------------------
     Group services
  ------------------------------------------------------- */

  const groupedServices = useMemo(() => {
    const categories = activeCategory === "All" ? serviceCategory.map((item) => item.CategoryName) : [activeCategory];

    return categories
      .map((category) => ({
        category,
        services: filteredServices.filter((service) => service.CategoryName === category),
      }))
      .filter((group) => group.services.length);
  }, [filteredServices, serviceCategory, activeCategory]);

  /* -------------------------------------------------------
     Rail helpers
  ------------------------------------------------------- */

  const getRowId = (category) => `service-row-${slugify(category)}`;

  const updateScrollState = useCallback((category) => {
    const row = document.getElementById(getRowId(category));

    if (!row) return;

    const canScrollLeft = row.scrollLeft > 5;

    const canScrollRight = row.scrollLeft + row.clientWidth < row.scrollWidth - 5;

    setScrollState((prev) => ({
      ...prev,
      [category]: {
        canScrollLeft,
        canScrollRight,
      },
    }));
  }, []);

  const scrollServices = (category, direction) => {
    const row = document.getElementById(getRowId(category));

    if (!row) return;

    row.scrollBy({
      left: direction === "right" ? 390 : -390,
      behavior: "smooth",
    });

    setTimeout(() => {
      updateScrollState(category);
    }, 450);
  };

  /* -------------------------------------------------------
     Rail listeners
  ------------------------------------------------------- */

  useEffect(() => {
    if (!groupedServices.length) return;

    const cleanupFunctions = [];

    groupedServices.forEach(({ category }) => {
      const row = document.getElementById(getRowId(category));

      if (!row) return;

      const handleScroll = () => {
        updateScrollState(category);
      };

      row.addEventListener("scroll", handleScroll, {
        passive: true,
      });

      updateScrollState(category);

      cleanupFunctions.push(() => {
        row.removeEventListener("scroll", handleScroll);
      });
    });

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [groupedServices, updateScrollState]);

  /* -------------------------------------------------------
     GSAP animations
     
     IMPORTANT:
     These animations are intentionally reversible.
     ScrollTrigger scrub/reverse behaviour means the
     elements animate back when scrolling upward.
  ------------------------------------------------------- */

  useEffect(() => {
    if (loading || !groupedServices.length || !pageRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      /* Hero */
      gsap.from(".services-eyebrow", {
        opacity: 0,
        y: 18,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".services-title", {
        opacity: 0,
        y: 32,
        duration: 0.9,
        delay: 0.08,
        ease: "power3.out",
      });

      gsap.from(".services-description", {
        opacity: 0,
        y: 22,
        duration: 0.8,
        delay: 0.16,
        ease: "power3.out",
      });

      /* Category sections */
      gsap.utils.toArray(".service-category").forEach((section) => {
        const heading = section.querySelector(".service-category-heading");

        const cards = section.querySelectorAll(".service-card-shell");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            end: "top 35%",
            toggleActions: "play none none none",
          },
        });

        if (heading) {
          tl.from(heading, {
            opacity: 0,
            y: 24,
            duration: 0.55,
            ease: "power3.out",
          });
        }

        tl.from(
          cards,
          {
            opacity: 0,
            y: 28,
            scale: 0.985,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
          },
          "-=0.25",
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, [loading, groupedServices]);

  /* -------------------------------------------------------
     Hash navigation
  ------------------------------------------------------- */

  useEffect(() => {
    if (loading || !groupedServices.length) return;

    const hash = window.location.hash;

    if (!hash) return;

    const targetId = hash.substring(1);

    const timer = setTimeout(() => {
      const target = document.getElementById(targetId);

      if (!target) return;

      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "center",
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [loading, groupedServices]);

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */

  return (
    <div ref={pageRef}>
      <Navigationbar />

      <main className="min-h-screen overflow-hidden bg-black text-white">
        {/* Background atmosphere */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-cyan-500/[0.035] blur-[150px]" />

          <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-blue-500/[0.025] blur-[140px]" />
        </div>

        {/* Hero */}
        <section className="relative mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 sm:pt-32 lg:px-8">
          <div className="max-w-3xl">
            <p className="services-eyebrow text-[10px] font-medium uppercase tracking-[0.24em] text-cyan-300/70">Dwaarper Services</p>

            <h1 className="services-title mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Get things done.
              <br />
              <span className="text-white/45">We’ll handle the rest.</span>
            </h1>

            <p className="services-description mt-4 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
              Explore trusted home services, choose exactly what you need, and add it to your cart in a few clicks.
            </p>
          </div>
        </section>

        {/* Search + Categories + Services */}
        <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <ServiceFilters search={search} setSearch={setSearch} categories={serviceCategory} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

          {/* Loading */}
          {loading ? (
            <div className="mt-10 flex gap-6 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="w-[300px] min-w-[300px] shrink-0 overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] sm:w-[340px] sm:min-w-[340px] lg:w-[360px] lg:min-w-[360px]"
                >
                  <div className="aspect-[16/10] animate-pulse bg-white/[0.04]" />

                  <div className="space-y-3 p-6">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.05]" />

                    <div className="h-3 w-full animate-pulse rounded bg-white/[0.04]" />

                    <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.04]" />

                    <div className="h-10 w-full animate-pulse rounded-full bg-white/[0.04]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mt-10 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
              <p className="text-sm text-white/55">Unable to load services right now.</p>

              <button
                type="button"
                onClick={loadData}
                className="mt-5 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,255,255,.12)]"
              >
                Try Again
              </button>
            </div>
          ) : groupedServices.length ? (
            <div className="mt-12 space-y-14">
              {groupedServices.map(({ category, services }) => {
                const rowId = getRowId(category);

                return (
                  <section key={category} id={`category-${slugify(category)}`} className="service-category scroll-mt-28">
                    {/* Category heading */}
                    <div className="service-category-heading mb-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Category</p>

                        <h2 className="mt-1 text-2xl font-semibold text-white">{category}</h2>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span className="hidden text-[10px] uppercase tracking-[0.16em] text-white/20 sm:inline">Swipe to explore</span>

                        <span className="text-xs text-white/25">
                          {services.length} {services.length === 1 ? "service" : "services"}
                        </span>
                      </div>
                    </div>

                    {/* Horizontal service rail */}
                    <div className="relative">
                      <div id={rowId} className="flex gap-6 overflow-x-auto scroll-smooth pb-5 pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {services.map((service) => (
                          <div
                            key={service._id || `${service.CategoryName}-${service.name}`}
                            id={`service-${slugify(service.name)}`}
                            className="service-card-shell w-[300px] min-w-[300px] shrink-0 scroll-mt-28 sm:w-[340px] sm:min-w-[340px] lg:w-[360px] lg:min-w-[360px]"
                          >
                            <ServiceCard
                              service={service}
                              onLogin={() => navigate("/login")}
                              onBook={(service, selectedOption) => {
                                navigate("/booking", {
                                  state: {
                                    service,
                                    selectedOption,
                                  },
                                });
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Previous */}
                      {scrollState[category]?.canScrollLeft && (
                        <button
                          type="button"
                          onClick={() => scrollServices(category, "left")}
                          aria-label={`Previous ${category} services`}
                          className="
                              group absolute left-3 top-1/2 z-20
                              hidden -translate-y-1/2
                              items-center gap-2
                              rounded-full
                              border border-white/15
                              bg-black/90
                              px-4 py-2.5
                              text-xs font-medium
                              text-white/80
                              shadow-2xl
                              backdrop-blur-xl
                              transition-all duration-300
                              hover:scale-[1.03]
                              hover:border-white/30
                              hover:bg-black
                              hover:text-white
                              sm:flex
                            "
                        >
                          <span className="text-base leading-none transition-transform duration-300 group-hover:-translate-x-0.5">←</span>

                          <span>Previous</span>
                        </button>
                      )}

                      {/* Next */}
                      {scrollState[category]?.canScrollRight && (
                        <button
                          type="button"
                          onClick={() => scrollServices(category, "right")}
                          aria-label={`Next ${category} services`}
                          className="
                              group absolute right-3 top-1/2 z-20
                              hidden -translate-y-1/2
                              items-center gap-2
                              rounded-full
                              border border-white/15
                              bg-black/90
                              px-4 py-2.5
                              text-xs font-medium
                              text-white/80
                              shadow-2xl
                              backdrop-blur-xl
                              transition-all duration-300
                              hover:scale-[1.03]
                              hover:border-white/30
                              hover:bg-black
                              hover:text-white
                              sm:flex
                            "
                        >
                          <span>Next</span>

                          <span className="text-base leading-none transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                        </button>
                      )}

                      {/* Mobile previous */}
                      {scrollState[category]?.canScrollLeft && (
                        <button
                          type="button"
                          onClick={() => scrollServices(category, "left")}
                          aria-label={`Previous ${category} services`}
                          className="
                              absolute left-2 top-1/2 z-20
                              flex h-10 w-10
                              -translate-y-1/2
                              items-center justify-center
                              rounded-full
                              border border-white/15
                              bg-black/90
                              text-lg text-white
                              shadow-xl
                              backdrop-blur-xl
                              transition-all duration-300
                              active:scale-95
                              sm:hidden
                            "
                        >
                          ←
                        </button>
                      )}

                      {/* Mobile next */}
                      {scrollState[category]?.canScrollRight && (
                        <button
                          type="button"
                          onClick={() => scrollServices(category, "right")}
                          aria-label={`Next ${category} services`}
                          className="
                              absolute right-2 top-1/2 z-20
                              flex h-10 w-10
                              -translate-y-1/2
                              items-center justify-center
                              rounded-full
                              border border-white/15
                              bg-black/90
                              text-lg text-white
                              shadow-xl
                              backdrop-blur-xl
                              transition-all duration-300
                              active:scale-95
                              sm:hidden
                            "
                        >
                          →
                        </button>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="mt-12 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
              <p className="text-sm text-white/55">No services found.</p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="mt-5 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/75 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
