import {
  LuSparkles,
  LuDroplets,
  LuZap,
  LuSnowflake,
} from "react-icons/lu";

export const HERO_SERVICES = [
  {
    id: "cleaning",
    title: "Cleaning",
    phoneTitle: "Home Cleaning",
    subtitle: "Same-day service",
    price: "Starts ₹499",
    color: "from-cyan-500/30 to-blue-500/10",
    icon: LuSparkles,

    position: {
      className: "-left-10 top-10",
      rotate: "-rotate-6",
      delay: "0s",
    },
  },

  {
    id: "plumbing",
    title: "Plumbing",
    phoneTitle: "Plumbing",
    subtitle: "Verified experts",
    price: "Starts ₹299",
    color: "from-emerald-500/30 to-teal-500/10",
    icon: LuDroplets,

    position: {
      className: "-right-24 top-24",
      rotate: "rotate-6",
      delay: ".8s",
    },
  },

  {
    id: "electrician",
    title: "Electrician",
    phoneTitle: "Electrician",
    subtitle: "30 min response",
    price: "Starts ₹249",
    color: "from-yellow-500/30 to-orange-500/10",
    icon: LuZap,

    position: {
      className: "-left-12 bottom-24",
      rotate: "-rotate-3",
      delay: "1.6s",
    },
  },

  {
    id: "ac",
    title: "AC Repair",
    phoneTitle: "AC Repair",
    subtitle: "Quick diagnosis",
    price: "Starts ₹599",
    color: "from-sky-500/30 to-indigo-500/10",
    icon: LuSnowflake,

    position: {
      className: "-right-20 bottom-10",
      rotate: "rotate-6",
      delay: "2.3s",
    },
  },
];