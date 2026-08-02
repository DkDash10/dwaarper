import { LuSearch, LuSparkles, LuHouse, LuZap, LuWrench, LuAirVent, LuShoppingBag, LuUser } from "react-icons/lu";
import gsap from "gsap";
import { useCallback, useLayoutEffect, useRef, useState, useEffect } from "react";

const services = [
  {
    title: "Home Cleaning",
    icon: LuSparkles,
    color: "from-cyan-500/20 to-cyan-500/5",
  },
  {
    title: "Plumbing",
    icon: LuWrench,
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    title: "Electrician",
    icon: LuZap,
    color: "from-yellow-500/20 to-yellow-500/5",
  },
  {
    title: "AC Repair",
    icon: LuAirVent,
    color: "from-indigo-500/20 to-indigo-500/5",
  },
];

export default function SearchScreen({ active }) {
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const searchRef = useRef(null);
  const popularRef = useRef(null);
  const cardsRef = useRef(null);
  const navRef = useRef(null);
  const timelineRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const [typedText, setTypedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [activeCard, setActiveCard] = useState(-1);

  const reset = useCallback(() => {
    const elements = [titleRef.current, searchRef.current, popularRef.current, navRef.current].filter(Boolean);

    const cards = cardsRef.current ? gsap.utils.toArray(cardsRef.current.children) : [];

    setTypedText("");
    setActiveCard(-1);
    clearInterval(typingIntervalRef.current);

    gsap.set(elements, {
      opacity: 0,
      y: 20,
    });

    gsap.set(searchRef.current, {
      scale: 0.97,
    });

    gsap.set(cards, {
      opacity: 0,
      y: 28,
    });
  }, []);

  const highlightCard = useCallback(() => {
    setActiveCard(1);

    const card = cardsRef.current?.children[1];

    if (!card) return;

    const searchIcon = searchRef.current?.querySelector("[data-search-icon]");

    const icon = card.querySelector("[data-icon]");

    gsap
      .timeline()
      .to(searchIcon, {
        scale: 1.16,
        rotate: 10,
        color: "#22d3ee",
        duration: 0.22,
        ease: "power2.out",
      })
      .to(searchIcon, {
        scale: 1,
        rotate: 0,
        color: "#9ca3af",
        duration: 0.3,
      })
      .to(card, {
        scale: 1.01,
        duration: 0.25,
        ease: "power2.out",
      })
      .to(
        icon,
        {
          scale: 1.12,
          backgroundColor: "#22d3ee22",
          boxShadow: "0 0 22px rgba(34,211,238,.35)",
          duration: 0.25,
          ease: "power2.out",
        },
        "<",
      )
      .to(icon, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      })

      .to(
        card,
        {
          scale: 1.01,
          duration: 0.2,
        },
        "<",
      )
      .to(icon, {
        backgroundColor: "rgba(34,211,238,.12)",
        boxShadow: "0 0 16px rgba(34,211,238,.22)",
        duration: 0.18,
      });
  }, []);

  const startTyping = useCallback(() => {
    const text = "Plumbing";
    let index = 0;

    setTypedText("");

    typingIntervalRef.current = setInterval(() => {
      index++;

      setTypedText(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(typingIntervalRef.current);

        highlightCard();
      }
    }, 70);

    return typingIntervalRef.current;
  }, [highlightCard]);

  const playAnimation = useCallback(() => {
    timelineRef.current?.kill();

    const cards = cardsRef.current ? gsap.utils.toArray(cardsRef.current.children) : [];

    const tl = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });

    timelineRef.current = tl;

    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.45,
      overwrite: "auto",
    })
      .to(
        searchRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          overwrite: "auto",
        },
        "-=0.2",
      )
      .to(
        popularRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          overwrite: "auto",
        },
        "-=0.15",
      )
      .to(
        cards,
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.35,
          overwrite: "auto",
        },
        "-=0.1",
      )
      .to(
        navRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          overwrite: "auto",
        },
        "-=.2",
      )
      .add("searchReady")
      .call(() => {
        startTyping();
      });
  }, [startTyping]);

  useLayoutEffect(() => {
    timelineRef.current?.kill();

    if (!active) {
      reset();
      return;
    }

    reset();

    requestAnimationFrame(() => {
      playAnimation();
    });

    return () => {
      clearInterval(typingIntervalRef.current);
      timelineRef.current?.kill();
    };
  }, [active, playAnimation, reset]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={rootRef} className="relative flex h-full flex-col bg-[#0b0b0b]">
      {/* Header */}

      <div ref={titleRef} className="px-6 pt-16">
        <h2 className="mt-2 text-3xl font-semibold text-white">Find Your Service</h2>
      </div>

      {/* Search */}

      <div ref={searchRef} className="px-6 mt-6">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 backdrop-blur-xl">
          <LuSearch data-search-icon className="text-white/40" />

          <span className="text-sm text-white/35">
            {typedText || "Search services..."}
            <span className="inline-block w-2">{cursorVisible ? "|" : ""}</span>
          </span>
        </div>
      </div>

      {/* Popular */}

      <div ref={popularRef} className="mt-6 px-6">
        <span className="text-sm tracking-[0.2em] uppercase text-cyan-300">Popular</span>
      </div>

      {/* Cards */}

      <div ref={cardsRef} className="mt-4 flex-1 space-y-4 overflow-hidden px-6">
        {services.map((service, index) => {
          const Icon = service.icon;

          return (
            <div
              key={service.title}
              className={`group rounded-2xl border p-3 transition-all duration-500
                      ${
                        activeCard === index ? "border-cyan-400/40 bg-white/[0.05] scale-[1.01]" : "border-white/10 bg-white/[0.03] hover:border-cyan-400/30 hover:bg-white/[0.05]"
                      }`}
            >
              <div className="flex items-center gap-3">
                <div data-icon className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${service.color}`}>
                  <Icon size={26} className="text-white" />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white">{service.title}</h3>

                  <p className="mt-1 text-sm text-white/45">Available today</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Nav */}

      <div ref={navRef} className="mx-6">
        <div className="flex items-center justify-around py-3">
          <LuHouse size={22} className="text-white" />

          <LuSearch size={22} className="text-white/45" />

          <LuShoppingBag size={22} className="text-white/45" />

          <LuUser size={22} className="text-white/45" />
        </div>
      </div>
    </div>
  );
}
