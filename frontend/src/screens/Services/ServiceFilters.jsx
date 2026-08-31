import { useEffect, useState } from "react";
import { LuSearch, LuX } from "react-icons/lu";

export default function ServiceFilters({ search, setSearch, categories, activeCategory, setActiveCategory }) {
  const placeholderServices = ["home cleaning...", "plumbing services...", "electricians...", "AC repair...", "pest control...", "appliance repair..."];

  const [placeholderText, setPlaceholderText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (search) {
      setPlaceholderText("");
      setIsDeleting(false);
      return;
    }

    const currentService = placeholderServices[placeholderIndex];

    let delay;

    if (!isDeleting) {
      // Typing
      delay = placeholderText.length === currentService.length ? 1500 : 65;
    } else {
      // Backspacing
      delay = 35;
    }

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (placeholderText.length < currentService.length) {
          setPlaceholderText(currentService.slice(0, placeholderText.length + 1));
        } else {
          setIsDeleting(true);
        }
      } else {
        if (placeholderText.length > 0) {
          setPlaceholderText(currentService.slice(0, placeholderText.length - 1));
        } else {
          setIsDeleting(false);
          setPlaceholderIndex((prev) => (prev + 1) % placeholderServices.length);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [placeholderText, placeholderIndex, isDeleting, search]);

  return (
    <div
      className="
        relative
        z-10
      "
    >
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <LuSearch
            size={17}
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-white/30
            "
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search for ${placeholderText}`}
            className="w-full rounded-2xl bg-white/[0.04] px-14 border-white/10 py-[22px] text-white placeholder:text-white/35 outline-none focus:border-white/20"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="
                absolute
                right-3
                top-1/2
                flex
                h-8
                w-8
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                text-white/35
                transition
                hover:bg-white/[0.06]
                hover:text-white
              "
            >
              <LuX size={15} />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="-mx-1 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex min-w-max gap-2 px-1">
            {/* All */}
            <button
              type="button"
              onClick={() => setActiveCategory("All")}
              className={`
                rounded-full
                px-4
                py-2
                text-xs
                font-medium
                transition-all
                duration-300
                ${
                  activeCategory === "All"
                    ? "bg-white text-black"
                    : "border border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                }
              `}
            >
              All Services
            </button>

            {/* Categories */}
            {categories.map((category) => {
              const isActive = activeCategory === category.CategoryName;

              return (
                <button
                  key={category.CategoryName}
                  type="button"
                  onClick={() => setActiveCategory(category.CategoryName)}
                  className={`
                    rounded-full
                    px-4
                    py-2
                    text-xs
                    font-medium
                    transition-all
                    duration-300
                    ${isActive ? "bg-white text-black" : "border border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"}
                  `}
                >
                  {category.CategoryName}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
