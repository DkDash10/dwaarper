import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Navigationbar from "../components/Navigationbar";
import Footer from "../components/Footer";
import gsap from "gsap";

const termsSections = [
  {
    id: "acceptance-of-terms",
    number: "01",
    title: "Acceptance of Terms",
    content: [
      {
        heading: "Agreeing to these terms",
        text: "By creating an account, accessing our website, or using any Dwaarper service, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, please do not use Dwaarper.",
      },
      {
        heading: "Who these terms apply to",
        text: "These terms apply to everyone who visits our website, browses services, creates an account, or books a service through Dwaarper, whether or not you complete a booking.",
      },
      {
        heading: "Updates to these terms",
        text: "We may revise these terms periodically. Continued use of Dwaarper after changes take effect means you accept the revised terms.",
      },
    ],
  },
  {
    id: "eligibility-and-accounts",
    number: "02",
    title: "Eligibility & Accounts",
    content: [
      {
        heading: "Who can use Dwaarper",
        text: "You must be at least 18 years old and capable of entering a binding contract to create an account or book a service through Dwaarper.",
      },
      {
        heading: "Accurate information",
        text: "You agree to provide accurate, current, and complete information when registering, and to keep that information up to date.",
      },
      {
        heading: "Account security",
        text: "You are responsible for all activity under your account and for keeping your login credentials confidential. Notify us immediately if you suspect unauthorized access.",
      },
    ],
  },
  {
    id: "services-provided",
    number: "03",
    title: "Services We Provide",
    content: [
      {
        heading: "Marketplace for home services",
        text: "Dwaarper provides a platform that connects users with service providers offering home services such as décor, cleaning, repairs, appliance services, pest control, and related work.",
      },
      {
        heading: "Service providers",
        text: "Service providers are responsible for performing the services they accept through Dwaarper in accordance with the booking details and applicable requirements. Dwaarper facilitates the connection and booking process between users and service providers.",
      },
      {
        heading: "Availability",
        text: "Service availability varies by location and provider capacity. We do not guarantee that a specific service will be available at a specific time or place.",
      },
    ],
  },
  {
    id: "bookings-and-cancellations",
    number: "04",
    title: "Bookings, Scheduling & Cancellations",
    content: [
      {
        heading: "Making a booking",
        text: "When you book a service, you agree to provide accurate and complete information about the service, location, preferred timing, and relevant requirements so that the service provider can properly understand and perform the requested work.",
      },
      {
        heading: "Rescheduling",
        text: "You may request to reschedule a booking subject to service provider availability and any applicable notice period or conditions communicated at the time of booking.",
      },
      {
        heading: "Cancellations",
        text: "You may cancel a booking subject to the cancellation terms communicated at the time of booking. Depending on when a cancellation is made, cancellation fees or other charges may apply.",
      },
    ],
  },
  {
    id: "pricing-and-payments",
    number: "05",
    title: "Pricing & Payments",
    content: [
      {
        heading: "Service pricing",
        text: "Prices displayed on Dwaarper may vary depending on the service, location, availability, applicable offers, and the scope of work. The applicable price will be shown before you complete payment.",
      },
      {
        heading: "Payment processing",
        text: "Payments are processed through our third-party payment provider, Stripe. When you proceed with payment, you authorize the applicable payment transaction for the service you are booking.",
      },
      {
        heading: "Refunds",
        text: "Where a refund is applicable, eligibility and the refund amount will depend on the circumstances of the booking and the applicable cancellation or refund terms communicated to you. Approved refunds will generally be returned through the original payment method.",
      },
    ],
  },
  {
    id: "user-responsibilities",
    number: "06",
    title: "Your Responsibilities",
    content: [
      {
        heading: "Accurate information",
        text: "You are responsible for providing accurate information about the service, location, access requirements, and other details necessary for the service provider to complete the booking.",
      },
      {
        heading: "Safe access",
        text: "You are responsible for providing safe and reasonable access to the location where a service will be performed and for informing the service provider of any relevant conditions or restrictions that may affect the work.",
      },
      {
        heading: "Lawful and respectful use",
        text: "You agree to use Dwaarper only for lawful purposes and to treat service providers and other users respectfully. Abusive, threatening, discriminatory, or unsafe behavior may result in suspension or termination of your account.",
      },
    ],
  },
  {
    id: "provider-conduct",
    number: "07",
    title: "Service Provider Conduct",
    content: [
      {
        heading: "Professional conduct",
        text: "Service providers are expected to perform accepted services professionally, safely, and in accordance with the details communicated at the time of booking.",
      },
      {
        heading: "Service standards",
        text: "Service providers are responsible for carrying out the services they accept and for communicating relevant changes, delays, or limitations to the user where reasonably possible.",
      },
      {
        heading: "Reporting issues",
        text: "If you experience an issue with a service provider, the service performed, or the booking experience, please contact Dwaarper through our Contact Us page so that we can review the matter.",
      },
    ],
  },
  {
    id: "prohibited-uses",
    number: "08",
    title: "Prohibited Uses",
    content: [
      {
        heading: "What you may not do",
        text: "You may not use Dwaarper to submit false information, circumvent our payment system, harass other users, or attempt to access accounts that are not yours.",
      },
      {
        heading: "Platform integrity",
        text: "Scraping, reverse engineering, or interfering with the normal operation of our website or app is not permitted.",
      },
    ],
  },
  {
    id: "intellectual-property",
    number: "09",
    title: "Intellectual Property",
    content: [
      {
        heading: "Our content",
        text: "The Dwaarper name, logo, website, and app content are owned by Dwaarper or its licensors and are protected by applicable intellectual property laws.",
      },
      {
        heading: "Limited license",
        text: "We grant you a limited, non-exclusive, non-transferable license to use Dwaarper for personal, non-commercial booking of services.",
      },
    ],
  },
  {
    id: "disclaimers-liability",
    number: "10",
    title: "Disclaimers & Limitation of Liability",
    content: [
      {
        heading: "Service provided as is",
        text: "Dwaarper is provided on an 'as is' and 'as available' basis. We do not guarantee that the platform will be uninterrupted, error-free, or completely secure.",
      },
      {
        heading: "Limitation of liability",
        text: "To the extent permitted by law, Dwaarper is not liable for indirect, incidental, or consequential damages arising from your use of the platform or the services booked through it.",
      },
      {
        heading: "Service provider work",
        text: "Dwaarper facilitates the booking relationship between users and service providers. To the extent permitted by applicable law, Dwaarper is not responsible for the acts, omissions, or outcomes of services performed by service providers, except where liability cannot lawfully be excluded.",
      },
    ],
  },
  {
    id: "indemnification",
    number: "11",
    title: "Indemnification",
    content: [
      {
        heading: "Holding Dwaarper harmless",
        text: "You agree to indemnify and hold Dwaarper harmless from claims, losses, or damages arising from your misuse of the platform or violation of these terms.",
      },
    ],
  },
  {
    id: "termination",
    number: "12",
    title: "Termination & Suspension",
    content: [
      {
        heading: "Ending your account",
        text: "You may close your account at any time by contacting us. We may suspend or terminate accounts that violate these terms or misuse the platform.",
      },
      {
        heading: "Effect of termination",
        text: "Termination does not cancel obligations that arose before the termination, such as outstanding payments for completed services.",
      },
    ],
  },
  {
    id: "disputes-governing-law",
    number: "13",
    title: "Disputes & Governing Law",
    content: [
      {
        heading: "Governing law",
        text: "These Terms are governed by the applicable laws of India, except where applicable law requires otherwise.",
      },
      {
        heading: "Dispute resolution",
        text: "We encourage you to contact Dwaarper first so that we can try to resolve any dispute or concern informally. If a dispute cannot be resolved informally, it will be handled in accordance with applicable law.",
      },
    ],
  },
  {
    id: "changes-to-terms",
    number: "14",
    title: "Changes to These Terms",
    content: [
      {
        heading: "Updates",
        text: "We may update these Terms & Conditions from time to time to reflect changes to our services, technology, business practices, or applicable legal requirements.",
      },
      {
        heading: "Notice of changes",
        text: "Material changes will be reflected by updating the 'Last updated' date on this page. Your continued use of Dwaarper after the updated Terms take effect constitutes acceptance of the revised Terms, to the extent permitted by applicable law.",
      },
    ],
  },
  {
    id: "contact-us",
    number: "15",
    title: "Contact Us",
    content: [
      {
        heading: "Questions about these terms",
        text: "If you have questions, concerns, or complaints about these Terms, a booking, or a service provided through Dwaarper, please contact us through our Contact Us page. We will review your request and respond as appropriate.",
      },
    ],
  },
];

export default function TermsAndConditions() {
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const progressBarRef = useRef(null);

  const [activeSection, setActiveSection] = useState(termsSections[0].id);

  /*
   * =========================================================
   * GSAP ANIMATIONS — hero + one reveal per section on scroll
   * =========================================================
   */

  useLayoutEffect(() => {
    const page = pageRef.current;

    if (!page) return;

    const ctx = gsap.context(() => {
      const createAnimation = (trigger, elements) => {
        if (!trigger) return;

        const timeline = gsap.timeline({
          paused: true,
        });

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
            threshold: 0.2,
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
      const heroDate = heroRef.current?.querySelector("[data-hero-date]");
      const heroChips = heroRef.current ? Array.from(heroRef.current.querySelectorAll("[data-hero-chip]")) : [];

      const cleanupHero = createAnimation(heroRef.current, [
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
          from: { opacity: 0, y: 16 },
          to: { opacity: 1, y: 0, duration: 0.45 },
          position: "-=0.25",
        },
        {
          element: heroChips,
          from: { opacity: 0, y: 12 },
          to: { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
          position: "-=0.2",
        },
        {
          element: heroDate,
          from: { opacity: 0, y: 12 },
          to: { opacity: 1, y: 0, duration: 0.35 },
          position: "-=0.15",
        },
      ]);

      const sectionElements = contentRef.current ? Array.from(contentRef.current.querySelectorAll("[data-terms-section]")) : [];

      const sectionCleanups = sectionElements.map((section) => {
        const number = section.querySelector("[data-section-number]");
        const title = section.querySelector("[data-section-title]");
        const content = section.querySelector("[data-section-content]");

        return createAnimation(section, [
          {
            element: number,
            from: { opacity: 0, y: 12 },
            to: { opacity: 1, y: 0, duration: 0.35 },
          },
          {
            element: title,
            from: { opacity: 0, y: 18 },
            to: { opacity: 1, y: 0, duration: 0.45 },
            position: "-=0.2",
          },
          {
            element: content,
            from: { opacity: 0, y: 18 },
            to: { opacity: 1, y: 0, duration: 0.45 },
            position: "-=0.2",
          },
        ]);
      });

      return () => {
        cleanupHero?.();
        sectionCleanups.forEach((cleanup) => cleanup?.());
      };
    }, page);

    return () => ctx.revert();
  }, []);

  /*
   * =========================================================
   * ACTIVE SECTION + READING PROGRESS
   * =========================================================
   *
   * Tracks which clause is crossing the 35% reading line for
   * the sidebar / mobile nav, and imperatively updates a top
   * progress bar's width as the visitor reads through — kept
   * out of React state so it doesn't trigger a re-render on
   * every scroll frame.
   * =========================================================
   */

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const content = contentRef.current;

      if (content) {
        const sections = Array.from(content.querySelectorAll("[data-terms-section]"));

        if (sections.length) {
          const readingLine = window.innerHeight * 0.35;
          let currentSection = sections[0];

          for (const section of sections) {
            const rect = section.getBoundingClientRect();

            if (rect.top <= readingLine) {
              currentSection = section;
            }
          }

          if (currentSection?.id) {
            setActiveSection(currentSection.id);
          }
        }
      }

      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const progress = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress}%`;
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(update);
    };

    update();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  /*
   * =========================================================
   * SCROLL TO CLAUSE
   * =========================================================
   */

  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (!element) return;

    setActiveSection(id);

    const offset = 100;
    const top = element.getBoundingClientRect().top + window.scrollY - offset;

    window.history.replaceState(null, "", `#${id}`);

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-[#080808] text-white">
      <Navigationbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section ref={heroRef} className="relative mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pt-32 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-cyan-500/[0.035] blur-[150px]" />

        <div className="relative max-w-3xl">
          <p data-hero-eyebrow className="text-[10px] font-medium uppercase tracking-[0.24em] text-cyan-300/70">
            Terms &amp; Conditions
          </p>

          <h1 data-hero-title className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            The agreement behind
            <br />
            <span className="text-white/45">every booking.</span>
          </h1>

          <p data-hero-description className="mt-4 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
            These Terms &amp; Conditions govern your use of Dwaarper&apos;s website, app, and services. Please read them before creating an account or booking a service.
          </p>

          <p data-hero-date className="mt-5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
            Last updated · September 20, 2026
          </p>
        </div>
      </section>

      {/* =====================================================
          MOBILE / TABLET CLAUSE NAV
      ===================================================== */}

      <div className="sticky top-0 z-30 border-y border-white/[0.06] bg-[#090909]/90 backdrop-blur-xl lg:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative">
            <div id="terms-mobile-nav" className="overflow-x-auto py-3 scrollbar-hide">
              <div className="flex min-w-max gap-2 pr-12">
                {termsSections.map((section) => {
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className={`shrink-0 rounded-full border px-3 py-2 text-[10px] font-medium uppercase tracking-[0.12em] transition-all duration-300 ${
                        isActive ? "border-cyan-300/30 bg-cyan-300/[0.08] text-white" : "border-white/[0.08] bg-[#111] text-white/45 hover:border-cyan-300/20 hover:text-white"
                      }`}
                    >
                      <span className={`mr-1.5 ${isActive ? "text-cyan-300" : "text-cyan-300/50"}`}>{section.number}</span>

                      {section.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pointer-events-none absolute right-0 top-0 flex h-full w-12 items-center justify-end bg-gradient-to-l from-[#090909] via-[#090909]/90 to-transparent">
              <div className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-cyan-300/60" />
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span className="h-1 w-1 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          TERMS CONTENT
      ===================================================== */}

      <section ref={contentRef} className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
        {/* NOTE: no items-start here — the grid track stays at
            `stretch` (the default) so the aside's cell matches
            the full height of the taller content column, and
            the sticky nav inside it has room to stay pinned for
            the whole section instead of detaching early. */}
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* =================================================
              DESKTOP CLAUSE NAV
          ================================================= */}

          <aside className="hidden lg:block">
            <div className="sticky top-28 w-[220px]">
              <div className="max-h-[calc(100vh-9rem)] overflow-y-auto scrollbar-hide">
                <nav className="relative space-y-1 pb-4">
                  {termsSections.map((section) => {
                    const isActive = activeSection === section.id;

                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => scrollToSection(section.id)}
                        aria-current={isActive ? "location" : undefined}
                        className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-300 ${
                          isActive
                            ? "bg-white/[0.035] before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:rounded-full before:bg-cyan-300"
                            : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <span
                          className={`shrink-0 text-[9px] font-medium tracking-[0.12em] transition-colors duration-300 ${
                            isActive ? "text-cyan-300" : "text-white/20 group-hover:text-cyan-300/70"
                          }`}
                        >
                          {section.number}
                        </span>

                        <span className={`min-w-0 text-xs leading-5 transition-colors duration-300 ${isActive ? "text-white" : "text-white/40 group-hover:text-white/80"}`}>
                          {section.title}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* =================================================
              TERMS CLAUSES
          ================================================= */}

          <div className="min-w-0 space-y-4">
            {termsSections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                data-terms-section
                className="scroll-mt-28 rounded-[28px] border border-white/[0.08] bg-[#111] p-6 sm:rounded-[32px] sm:p-8 lg:p-10"
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <span data-section-number className="pt-1 text-[10px] font-medium tracking-[0.18em] text-cyan-300/60">
                    {section.number}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h2 data-section-title className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      {section.title}
                    </h2>

                    <div data-section-content className="mt-7 space-y-7">
                      {section.content.map((item) => (
                        <div key={item.heading}>
                          <h3 className="text-sm font-medium text-white sm:text-base">{item.heading}</h3>

                          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/45">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {/* =================================================
                FINAL NOTE
            ================================================= */}

            <div className="rounded-[28px] border border-cyan-300/10 bg-cyan-400/[0.025] p-6 sm:rounded-[32px] sm:p-8">
              <p className="text-sm leading-7 text-white/45">
                These Terms &amp; Conditions form a binding agreement between you and Dwaarper once you access or use our services. If any provision is found invalid or
                unenforceable, the remaining provisions will continue in full effect.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
