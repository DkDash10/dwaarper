import React, { useMemo, useState } from "react";
import {
  LuChevronDown,
  LuShoppingCart,
} from "react-icons/lu";
import { toast } from "react-toastify";
import {
  useCart,
  useDispatchCart,
} from "../../components/ContextReducer";

export default function ServiceCard({ service, onLogin }) {
  const dispatch = useDispatchCart();
  const cartData = useCart();

  const options = service?.options?.[0] || {};
  const optionNames = Object.keys(options);

  const [selectedOption, setSelectedOption] = useState(
    optionNames[0] || ""
  );

  const selectedPrice = useMemo(() => {
    const rawPrice = options[selectedOption];

    if (rawPrice === undefined || rawPrice === null) {
      return 0;
    }

    return (
      Number(String(rawPrice).replace(/,/g, "")) || 0
    );
  }, [options, selectedOption]);

  const isServiceInCart = cartData.some(
    (item) =>
      item.id === service._id &&
      item.service === selectedOption
  );

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
        {optionNames.length > 0 && (
          <div className="relative mt-6">
            <select
              value={selectedOption}
              onChange={(event) =>
                setSelectedOption(event.target.value)
              }
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
              {optionNames.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
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

            <p className="mt-1 text-lg font-semibold text-white">
              ₹{selectedPrice.toLocaleString("en-IN")}
            </p>
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

            {isServiceInCart
              ? "Added"
              : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}