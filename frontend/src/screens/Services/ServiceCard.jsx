import React, { useMemo, useState } from "react";
import { LuChevronDown, LuShoppingCart } from "react-icons/lu";
import { toast } from "react-toastify";
import { useCart, useDispatchCart } from "../../components/ContextReducer";

export default function ServiceCard({ service, onLogin }) {
  const dispatch = useDispatchCart();
  const cartData = useCart();

  const options = service?.options?.[0] || {};
  const optionNames = Object.keys(options);

  const [selectedOption, setSelectedOption] = useState(optionNames[0] || "");
  const [isOptionOpen, setIsOptionOpen] = useState(false);

  const selectedPrice = useMemo(() => {
    const rawPrice = options[selectedOption];

    if (rawPrice === undefined || rawPrice === null) {
      return 0;
    }

    return Number(String(rawPrice).replace(/,/g, "")) || 0;
  }, [options, selectedOption]);

  const isServiceInCart = cartData.some((item) => item.id === service._id && item.service === selectedOption);

  const handleAddToCart = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      onLogin?.();
      return;
    }

    if (isServiceInCart) {
      return;
    }

    dispatch({
      type: "ADD",
      img: service.img,
      id: service._id,
      name: service.name,
      price: selectedPrice,
      service: selectedOption,
    });

    toast.success(`${service.name} added to cart`, {
      autoClose: 1500,
      hideProgressBar: true,
    });
  };

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-3xl
        border
        border-white/[0.07]
        bg-white/[0.025]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-white/[0.13]
        hover:bg-white/[0.04]
      "
    >
      {/* Image */}
      <div
        className="
          relative
          aspect-[16/10]
          overflow-hidden
          bg-white/[0.03]
        "
      >
        <img
          src={service.img}
          alt={service.name}
          loading="lazy"
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            group-hover:scale-[1.04]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-black/60
            via-transparent
            to-transparent
          "
        />
      </div>

      {/* Content */}
      <div className="flex flex-col p-6">
        {/* Category */}
        <p
          className="
            text-[10px]
            font-medium
            uppercase
            tracking-[0.18em]
            text-white/30
          "
        >
          {service.CategoryName}
        </p>

        {/* Name */}
        <h3
          className="
            mt-2
            line-clamp-1
            text-lg
            font-semibold
            tracking-tight
            text-white
          "
        >
          {service.name}
        </h3>

        {/* Description */}
        <p
          className="
            mt-2
            line-clamp-2
            min-h-[40px]
            text-xs
            leading-5
            text-white/40
          "
        >
          {service.description}
        </p>

        {/* Options */}
        {/* {optionNames.length > 0 && (
          <div className="relative mt-6">
            <select
              value={selectedOption}
              onChange={(event) => setSelectedOption(event.target.value)}
              className="
                w-full
                appearance-none
                rounded-xl
                bg-zinc-900
                px-4
                py-3
                pr-10
                text-xs
                text-white
                transition
                focus:outline-none
                focus:ring-1
                focus:ring-zinc-600
              "
            >
              {optionNames.map((option) => {
                const price = Number(String(options[option]).replace(/,/g, "")) || 0;

                return (
                  <option key={option} value={option} className="bg-zinc-900 text-white">
                    {option} — ₹{price.toLocaleString("en-IN")}
                  </option>
                );
              })}
            </select>

            <LuChevronDown
              size={15}
              className="
                pointer-events-none
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-white/35
              "
            />
          </div>
        )}
         */}

        {optionNames.length > 0 && (
          <div className="relative mt-6">
            <p
              className="
        mb-2
        text-[10px]
        font-medium
        uppercase
        tracking-[0.16em]
        text-white/30
      "
            >
              Choose an option
            </p>

            {/* Selected option */}
            <button
              type="button"
              onClick={() => setIsOptionOpen((prev) => !prev)}
              className="
        flex
        w-full
        items-center
        justify-between
        gap-3
        rounded-xl
        bg-zinc-900
        px-4
        py-3
        text-left
        text-sm
        text-white
        transition
        hover:bg-zinc-800
        focus:outline-none
        focus:ring-1
        focus:ring-zinc-600
      "
            >
              <span className="truncate">{selectedOption}</span>

              <LuChevronDown
                size={15}
                className={`
          shrink-0
          text-white/35
          transition-transform
          duration-200
          ${isOptionOpen ? "rotate-180" : ""}
        `}
              />
            </button>

            {/* Dropdown */}
            {isOptionOpen && (
              <div
                className="
          absolute
          left-0
          right-0
         bottom-full
          z-50
          mt-2
          p-1
          overflow-hidden
          rounded-2xl
          border-white/[0.08]
          bg-zinc-950
          shadow-2xl
        "
              >
                <div
  className="
    service-options-scroll
    max-h-52
    overflow-y-auto
    p-1
    [scrollbar-width:thin]
    [scrollbar-color:rgba(255,255,255,0.2)_transparent]
  "
>
                  {optionNames.map((option) => {
                    const price = Number(String(options[option]).replace(/,/g, "")) || 0;

                    const isSelected = option === selectedOption;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setSelectedOption(option);
                          setIsOptionOpen(false);
                        }}
                        className={`
                  flex
                  w-full
                  items-center
                  justify-between
                  gap-4
                  rounded-xl
                  px-3
                  py-3
                  my-1
                  text-left
                  transition-colors
                  duration-150
                  ${isSelected ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"}
                `}
                      >
                        <span
                          className={`
                    min-w-0
                    truncate
                    text-sm
                    ${isSelected ? "font-medium text-white" : "text-white/65"}
                  `}
                        >
                          {option}
                        </span>

                        <span
                          className="
                    shrink-0
                    text-xs
                    text-white/40
                  "
                        >
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom section */}
        <div
          className="
            mt-6
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.16em]
                text-white/25
              "
            >
              Starting at
            </p>

            <p className="mt-1 text-lg font-semibold text-white">₹{selectedPrice.toLocaleString("en-IN")}</p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isServiceInCart}
            className="
              inline-flex
              shrink-0
              items-center
              gap-2
              rounded-full
              bg-white
              px-5
              py-3
              text-xs
              font-medium
              text-black
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_12px_30px_rgba(255,255,255,.12)]
              disabled:cursor-not-allowed
              disabled:bg-white/[0.12]
              disabled:text-white/35
              disabled:shadow-none
            "
          >
            <LuShoppingCart size={14} />

            {isServiceInCart ? "Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
