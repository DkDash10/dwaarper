import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Navigationbar from "../components/Navigationbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import gsap from "gsap";

const offerings = [
  {
    number: "01",
    title: "Wide Range of Services",
    description: "From home cleaning and plumbing to electrical repairs, we offer diverse services tailored to customer needs.",
  },
  {
    number: "02",
    title: "Verified Professionals",
    description: "All service providers undergo a thorough verification process to ensure quality and trustworthiness.",
  },
  {
    number: "03",
    title: "Seamless Booking",
    description: "Our user-friendly platform allows hassle-free service booking with real-time updates.",
  },
  {
    number: "04",
    title: "Secure Payments",
    description: "Transactions are encrypted and processed securely via Stripe.",
  },
];

const approachSlides = [
  {
    eyebrow: "01 / CONVENIENCE",
    title: "Convenience without",
    highlight: "compromising trust.",
  },
  {
    eyebrow: "02 / SIMPLICITY",
    title: "Everything you need,",
    highlight: "in one simple place.",
  },
  {
    eyebrow: "03 / CONNECTION",
    title: "The right service,",
    highlight: "at the right time.",
  },
  {
    eyebrow: "04 / RELIABILITY",
    title: "Professionals you can",
    highlight: "count on.",
  },
];

export default function WhoAreWe() {
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const offerRef = useRef(null);
  const cardsRef = useRef(null);
  const ctaRef = useRef(null);

  const approachRef = useRef(null);
  const approachContentRef = useRef(null);
  const approachIntervalRef = useRef(null);

  const [activeApproach, setActiveApproach] = useState(0);

  useLayoutEffect(() => {
    const page = pageRef.current;

    if (!page) return;

    const ctx = gsap.context(() => {
      const createSectionAnimation = (trigger, elements, options = {}) => {
        if (!trigger) return;

        const timeline = gsap.timeline({ paused: true });

        elements.forEach(({ element, from, to, position }) => {
          if (!element) return;

          timeline.fromTo(
            element,
            from,
            {
              ...to,
              ease: "power3.out",
            },
            position,
          );
        });

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              timeline.restart();
            } else {
              timeline.reverse();
            }
          },
          {
            threshold: options.threshold || 0.3,
          },
        );

        observer.observe(trigger);

        return () => {
          observer.disconnect();
          timeline.kill();
        };
      };

      const heroEyebrow = heroRef.current?.querySelector("[data-hero-eyebrow]");
      const heroTitle = heroRef.current?.querySelector("[data-hero-title]");
      const heroDescription = heroRef.current?.querySelector("[data-hero-description]");

      const offerEyebrow = offerRef.current?.querySelector("[data-offer-eyebrow]");
      const offerTitle = offerRef.current?.querySelector("[data-offer-title]");
      const offerDescription = offerRef.current?.querySelector("[data-offer-description]");

      const cardElements = cardsRef.current ? Array.from(cardsRef.current.children) : [];

      const ctaTitle = ctaRef.current?.querySelector("[data-cta-title]");
      const ctaDescription = ctaRef.current?.querySelector("[data-cta-description]");
      const ctaButton = ctaRef.current?.querySelector("[data-cta-button]");

      const cleanupHero = createSectionAnimation(
        heroRef.current,
        [
          {
            element: heroEyebrow,
            from: { opacity: 0, y: 14 },
            to: { opacity: 1, y: 0, duration: 0.4 },
          },
          {
            element: heroTitle,
            from: { opacity: 0, y: 24 },
            to: { opacity: 1, y: 0, duration: 0.55 },
            position: "-=0.2",
          },
          {
            element: heroDescription,
            from: { opacity: 0, y: 18 },
            to: { opacity: 1, y: 0, duration: 0.45 },
            position: "-=0.25",
          },
        ],
        { threshold: 0.35 },
      );

      const cleanupOffer = createSectionAnimation(
        offerRef.current,
        [
          {
            element: offerEyebrow,
            from: { opacity: 0, y: 14 },
            to: { opacity: 1, y: 0, duration: 0.4 },
          },
          {
            element: offerTitle,
            from: { opacity: 0, y: 24 },
            to: { opacity: 1, y: 0, duration: 0.5 },
            position: "-=0.2",
          },
          {
            element: offerDescription,
            from: { opacity: 0, y: 16 },
            to: { opacity: 1, y: 0, duration: 0.4 },
            position: "-=0.22",
          },
        ],
        { threshold: 0.4 },
      );

      let cleanupCards;

      if (cardsRef.current) {
        const cardTimeline = gsap.timeline({ paused: true });

        cardElements.forEach((card, index) => {
          cardTimeline.fromTo(
            card,
            {
              opacity: 0,
              y: 30,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power3.out",
            },
            index === 0 ? 0 : "-=0.32",
          );
        });

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              cardTimeline.restart();
            } else {
              cardTimeline.reverse();
            }
          },
          {
            threshold: 0.2,
          },
        );

        observer.observe(cardsRef.current);

        cleanupCards = () => {
          observer.disconnect();
          cardTimeline.kill();
        };
      }

      const cleanupCta = createSectionAnimation(
        ctaRef.current,
        [
          {
            element: ctaTitle,
            from: { opacity: 0, y: 20 },
            to: { opacity: 1, y: 0, duration: 0.45 },
          },
          {
            element: ctaDescription,
            from: { opacity: 0, y: 14 },
            to: { opacity: 1, y: 0, duration: 0.4 },
            position: "-=0.2",
          },
          {
            element: ctaButton,
            from: { opacity: 0, y: 12, scale: 0.97 },
            to: {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.4,
            },
            position: "-=0.15",
          },
        ],
        { threshold: 0.35 },
      );

      return () => {
        cleanupHero?.();
        cleanupOffer?.();
        cleanupCards?.();
        cleanupCta?.();
      };
    }, page);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const startSlider = () => {
      clearInterval(approachIntervalRef.current);

      approachIntervalRef.current = setInterval(() => {
        setActiveApproach((current) => (current + 1) % approachSlides.length);
      }, 3000);
    };

    startSlider();

    return () => {
      clearInterval(approachIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const content = approachContentRef.current;

    if (!content) return;

    gsap.fromTo(
      content,
      {
        opacity: 0,
        y: 14,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power3.out",
      },
    );
  }, [activeApproach]);

  return (
    <>
      <Navigationbar />

      <main ref={pageRef} className="overflow-hidden bg-[#090909] text-white">
        {/* HERO */}
        <section ref={heroRef} className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
          <div className="pointer-events-none absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.025] blur-3xl" />

          <div className="relative max-w-3xl">
            <p data-hero-eyebrow className="text-[10px] font-medium uppercase tracking-[0.24em] text-cyan-300/70">
              About Dwaarper
            </p>

            <h1 data-hero-title className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Making everyday services
              <br />
              <span className="text-white/45">simpler and more reliable.</span>
            </h1>

            <p data-hero-description className="mt-5 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
              Dwaarper is a service-based platform designed to connect users with professional service providers. We bring convenience, trust, and efficiency together to make
              service booking a simpler experience.
            </p>
          </div>
        </section>

        {/* STORY / INTRO */}
        <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[32px] border border-white/10 bg-[#111] p-7 sm:p-9 lg:p-10">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-cyan-300/70">Who We Are</p>

              <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Bridging the gap between
                <br />
                <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">people and professionals.</span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-white/45 sm:text-base">
                We aim to bridge the gap between customers and service providers through technology and innovation. Our platform is built around a simple idea: finding and booking
                the right service should feel straightforward, transparent, and secure.
              </p>
            </div>

            <div ref={approachRef} className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#111] p-7 sm:p-9 lg:p-10">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/[0.04] blur-3xl" />

              <div className="relative flex h-full flex-col justify-between">
                <div ref={approachContentRef}>
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-cyan-300/70">{approachSlides[activeApproach].eyebrow}</p>

                  <p className="mt-5 max-w-md text-2xl font-semibold leading-tight sm:text-3xl">
                    {approachSlides[activeApproach].title}
                    <br />
                    <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">{approachSlides[activeApproach].highlight}</span>
                  </p>
                </div>

                <div className="mt-12 flex items-center gap-3">
                  {approachSlides.map((slide, index) => (
                    <button
                      key={slide.eyebrow}
                      type="button"
                      aria-label={`Show approach slide ${index + 1}`}
                      onClick={() => {
                        setActiveApproach(index);

                        clearInterval(approachIntervalRef.current);

                        approachIntervalRef.current = setInterval(() => {
                          setActiveApproach((current) => (current + 1) % approachSlides.length);
                        }, 3000);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-500 ${index === activeApproach ? "w-10 bg-cyan-400" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OFFERINGS */}
        <section ref={offerRef} className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p data-offer-eyebrow className="text-[10px] font-medium uppercase tracking-[0.24em] text-cyan-300/70">
              What We Offer
            </p>

            <h2 data-offer-title className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Everything you need.
              <br />
              <span className="text-white/45">All in one place.</span>
            </h2>

            <p data-offer-description className="mt-4 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
              From everyday home maintenance to essential repairs, Dwaarper brings the services you need into one simple booking experience.
            </p>
          </div>

          <div ref={cardsRef} className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {offerings.map((offer) => (
              <article
                key={offer.number}
                className="group min-h-[270px] rounded-[32px] border border-white/10 bg-[#111] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:shadow-[0_20px_60px_rgba(34,211,238,.06)] sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-cyan-300/60">{offer.number}</span>

                  <span className="h-1.5 w-1.5 rounded-full bg-white/20 transition-colors duration-300 group-hover:bg-cyan-300" />
                </div>

                <h3 className="mt-12 text-xl font-semibold leading-snug text-white">{offer.title}</h3>

                <p className="mt-4 text-sm leading-6 text-white/40">{offer.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* SERVICES CTA */}
        <section ref={ctaRef} className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111] px-6 py-10 text-center sm:rounded-[32px] sm:px-10 sm:py-14">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.05] blur-[100px]" />

            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-300">READY WHEN YOU ARE</p>

              <h2 data-cta-title className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                Need something fixed,
                <br className="hidden sm:block" /> cleaned, or taken care of?
              </h2>

              <p data-cta-description className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/40 sm:text-base">
                Explore DwaarPer&apos;s home services and find the right professional for the job.
              </p>

              <Link
                data-cta-button
                to="/services"
                className="group mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,255,255,.12)]"
              >
                Explore Services
                <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
