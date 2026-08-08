import { LuShieldCheck, LuClock3, LuCreditCard, LuBadgeCheck, LuCalendarDays, LuStar } from "react-icons/lu";

export const features = [
  {
    id: 1,
    title: "Verified Professionals",
    description: "Every expert is background verified, highly rated, and trained to deliver reliable service.",
    icon: LuShieldCheck,
    span: "lg:col-span-2 lg:row-span-2",
    hero: true,
  },
  {
    id: 2,
    title: "30 Min Arrival",
    description: "Nearby professionals are dispatched instantly for faster service.",
    icon: LuClock3,
  },
  {
    id: 3,
    title: "Secure Payments",
    description: "Safe payments powered by Stripe with complete transparency.",
    icon: LuCreditCard,
  },
  {
    id: 4,
    title: "Satisfaction Guarantee",
    description: "We're committed to making every service experience exceptional.",
    icon: LuBadgeCheck,
  },
  {
    id: 5,
    title: "Easy Scheduling",
    description: "Book any service in under one minute with a seamless experience.",
    icon: LuCalendarDays,
  },
  {
    id: 6,
    title: "Rated 4.9/5",
    description: "Thousands of happy homeowners trust DwaarPer every day.",
    icon: LuStar,
  },
];
