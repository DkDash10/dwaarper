import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigationbar from "../../components/Navigationbar";
import Footer from "../../components/Footer";
import ServiceFilters from "./ServiceFilters";
import ServiceCard from "./ServiceCard";

const API_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://dwaarper.onrender.com";

export default function Services() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [serviceCategory, setServiceCategory] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollState, setScrollState] = useState({});

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/service_data`, {
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

  useEffect(() => {
    const query = searchParams.get("search") || "";
    setSearch(query);
  }, [searchParams]);

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

  const groupedServices = useMemo(() => {
    const categories = activeCategory === "All" ? serviceCategory.map((item) => item.CategoryName) : [activeCategory];

    return categories
      .map((category) => ({
        category,
        services: filteredServices.filter((service) => service.CategoryName === category),
      }))
      .filter((group) => group.services.length);
  }, [filteredServices, serviceCategory, activeCategory]);

  const updateScrollState = (category) => {
    const rowId = `service-row-${category
      .replace(/\s+/g, "-")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")}`;

    const row = document.getElementById(rowId);

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
  };

  const scrollServices = (category, direction) => {
    const rowId = `service-row-${category
      .replace(/\s+/g, "-")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")}`;

    const row = document.getElementById(rowId);

    if (!row) return;

    row.scrollBy({
      left: direction === "right" ? 390 : -390,
      behavior: "smooth",
    });

    setTimeout(() => {
      updateScrollState(category);
    }, 450);
  };

  useEffect(() => {
    if (!groupedServices.length) return;

    const cleanupFunctions = [];

    groupedServices.forEach(({ category }) => {
      const rowId = `service-row-${category
        .replace(/\s+/g, "-")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")}`;

      const row = document.getElementById(rowId);

      if (!row) return;

      const handleScroll = () => {
        updateScrollState(category);
      };

      row.addEventListener("scroll", handleScroll, {
        passive: true,
      });

      // Calculate initial state
      updateScrollState(category);

      cleanupFunctions.push(() => {
        row.removeEventListener("scroll", handleScroll);
      });
    });

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [groupedServices]);

  return (
    <>
      <Navigationbar />

      <main className="min-h-screen bg-black text-white">
        {/* Background glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-cyan-500/[0.035] blur-[150px]" />

          <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-blue-500/[0.025] blur-[140px]" />
        </div>

        {/* Hero */}
        <section className="relative mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 sm:pt-32 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-cyan-300/70">DwaarPer Services</p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Get things done.
              <br />
              <span className="text-white/45">We’ll handle the rest.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
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
                  className="
                    w-[300px]
                    min-w-[300px]
                    shrink-0
                    overflow-hidden
                    rounded-3xl
                    border
                    border-white/[0.06]
                    bg-white/[0.02]
                    sm:w-[340px]
                    sm:min-w-[340px]
                    lg:w-[360px]
                    lg:min-w-[360px]
                  "
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
            /* Error */
            <div className="mt-10 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
              <p className="text-sm text-white/55">Unable to load services right now.</p>

              <button
                type="button"
                onClick={loadData}
                className="
                  mt-5
                  rounded-full
                  bg-white
                  px-6
                  py-3
                  text-sm
                  font-medium
                  text-black
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                "
              >
                Try Again
              </button>
            </div>
          ) : groupedServices.length ? (
            /* Services */
            <div className="mt-12 space-y-14">
              {groupedServices.map(({ category, services }) => {
                const rowId = `service-row-${category.replace(/\s+/g, "-").toLowerCase()}`;

                return (
                  <section key={category}>
                    {/* Category heading */}
                    <div className="mb-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Category</p>

                        <h2 className="mt-1 text-2xl font-semibold text-white">{category}</h2>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        {(scrollState[category]?.canScrollLeft || scrollState[category]?.canScrollRight) && (
                          <span className="hidden text-[10px] uppercase tracking-[0.16em] text-white/20 sm:inline">Swipe to explore</span>
                        )}

                        <span className="text-xs text-white/25">
                          {services.length} {services.length === 1 ? "service" : "services"}
                        </span>
                      </div>
                    </div>

                    {/* Horizontal service rail */}
                    <div className="relative">
                      <div
                        id={rowId}
                        className="
                          flex
                          gap-6
                          overflow-x-auto
                          scroll-smooth
                          pb-4
                          pr-2
                          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
                        "
                      >
                        {services.map((service) => (
                          <div
                            key={service._id || `${service.CategoryName}-${service.name}`}
                            className="
                              w-[300px]
                              min-w-[300px]
                              shrink-0
                              sm:w-[340px]
                              sm:min-w-[340px]
                              lg:w-[360px]
                              lg:min-w-[360px]
                            "
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

                      {/* Scroll button */}
                      {scrollState[category]?.canScrollLeft && (
                        <button
                          type="button"
                          onClick={() => scrollServices(category, "left")}
                          aria-label={`Previous ${category} services`}
                          className="
      absolute
      left-2
      top-1/2
      z-10
      flex
      h-10
      w-10
      -translate-y-1/2
      items-center
      justify-center
      rounded-full
      border
      border-white/10
      bg-black/80
      text-white/70
      backdrop-blur-md
      transition-colors
      duration-200
      hover:border-white/20
      hover:bg-black
      hover:text-white
    "
                        >
                          ←
                        </button>
                      )}

                      {scrollState[category]?.canScrollRight && (
                        <button
                          type="button"
                          onClick={() => scrollServices(category, "right")}
                          aria-label={`Next ${category} services`}
                          className="
      absolute
      right-2
      top-1/2
      z-10
      flex
      h-10
      w-10
      -translate-y-1/2
      items-center
      justify-center
      rounded-full
      border
      border-white/10
      bg-black/80
      text-white/70
      backdrop-blur-md
      transition-colors
      duration-200
      hover:border-white/20
      hover:bg-black
      hover:text-white
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
            /* Empty state */
            <div className="mt-12 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
              <p className="text-sm text-white/55">No services found.</p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="
                  mt-5
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-6
                  py-3
                  text-sm
                  font-medium
                  text-white/75
                  transition-all
                  duration-300
                  hover:border-white/20
                  hover:bg-white/[0.06]
                  hover:text-white
                "
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
