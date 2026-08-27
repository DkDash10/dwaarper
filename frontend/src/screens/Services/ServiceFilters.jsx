import React from "react";
import { LuSearch, LuX } from "react-icons/lu";

export default function ServiceFilters({
  search,
  setSearch,
  categories,
  activeCategory,
  setActiveCategory,
}) {
  return (
    <div
      className="
        relative
        z-10
        -mx-4
        border-y
        border-white/[0.06]
        bg-black/90
        px-4
        py-4
        backdrop-blur-xl
        sm:mx-0
        sm:rounded-3xl
        sm:border
        sm:px-5
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
            placeholder="Search for a service..."
            className="
              w-full
              rounded-xl
              bg-zinc-900
              px-11
              py-3
              text-sm
              text-white
              placeholder:text-zinc-500
              transition
              focus:outline-none
              focus:ring-1
              focus:ring-zinc-600
            "
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
              const isActive =
                activeCategory === category.CategoryName;

              return (
                <button
                  key={category.CategoryName}
                  type="button"
                  onClick={() =>
                    setActiveCategory(category.CategoryName)
                  }
                  className={`
                    rounded-full
                    px-4
                    py-2
                    text-xs
                    font-medium
                    transition-all
                    duration-300
                    ${
                      isActive
                        ? "bg-white text-black"
                        : "border border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                    }
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