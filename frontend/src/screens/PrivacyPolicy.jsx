import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Navigationbar from "../components/Navigationbar";
import Footer from "../components/Footer";
import gsap from "gsap";

const policySections = [
  {
    id: "information-we-collect",
    number: "01",
    title: "Information We Collect",
    content: [
      {
        heading: "Information you provide",
        text: "When you create an account, contact us, make a booking, or otherwise use Dwaarper, we may collect information you choose to provide, such as your name, email address, phone number, address, location details, and information included in messages or service requests.",
      },
      {
        heading: "Account information",
        text: "If you create a Dwaarper account, we use the information associated with your account to provide authentication, maintain your profile, and support your use of our services.",
      },
      {
        heading: "Booking and service information",
        text: "When you use Dwaarper to explore or book services, we may process information necessary to complete and manage the booking, including selected services, booking details, service location, order information, and related communications.",
      },
      {
        heading: "Technical information",
        text: "We may automatically receive certain technical information when you use our website, such as browser information, device information, IP address, and basic usage information needed to operate, secure, and improve the platform.",
      },
    ],
  },
  {
    id: "how-we-use-information",
    number: "02",
    title: "How We Use Your Information",
    content: [
      {
        heading: "Providing our services",
        text: "We use information to create and manage accounts, process bookings, provide requested services, communicate with you, and support your experience on Dwaarper.",
      },
      {
        heading: "Improving Dwaarper",
        text: "We may use information to understand how our platform is used, improve features, troubleshoot problems, and develop a better service experience.",
      },
      {
        heading: "Security and fraud prevention",
        text: "Information may be used to protect accounts, detect suspicious activity, prevent misuse, and maintain the security and reliability of our platform.",
      },
      {
        heading: "Communication",
        text: "We may use your contact information to respond to enquiries, provide service-related updates, and communicate information necessary for your use of Dwaarper.",
      },
    ],
  },
  {
    id: "sharing-information",
    number: "03",
    title: "How We Share Information",
    content: [
      {
        heading: "Service providers",
        text: "Where necessary to provide a requested service, relevant information may be shared with professionals or service providers involved in fulfilling your booking.",
      },
      {
        heading: "Technology providers",
        text: "We may use trusted third-party technology providers to support functions such as authentication, payments, hosting, communications, security, and application infrastructure.",
      },
      {
        heading: "Legal requirements",
        text: "We may disclose information where reasonably necessary to comply with applicable law, legal processes, regulatory requirements, or lawful requests from authorities.",
      },
      {
        heading: "Business protection",
        text: "Information may also be processed when reasonably necessary to protect the rights, safety, property, users, or operation of Dwaarper.",
      },
    ],
  },
  {
    id: "payments",
    number: "04",
    title: "Payments",
    content: [
      {
        heading: "Secure payment processing",
        text: "Payments made through Dwaarper may be processed by third-party payment providers such as Stripe. Payment information is handled according to the applicable payment provider's policies and security practices.",
      },
      {
        heading: "Payment information",
        text: "Dwaarper does not intend to store complete payment-card information on its own systems when payment processing is handled by the payment provider.",
      },
      {
        heading: "Payment records",
        text: "We may retain transaction-related information such as payment status, order details, transaction references, and amounts necessary to manage orders, refunds, support, accounting, and legal obligations.",
      },
    ],
  },
  {
    id: "authentication",
    number: "05",
    title: "Authentication",
    content: [
      {
        heading: "Account authentication",
        text: "Dwaarper may provide account authentication through its own authentication system and supported third-party authentication services.",
      },
      {
        heading: "Google authentication",
        text: "If you choose to sign in using Google, certain account information provided through Google's authentication service may be used to create or authenticate your Dwaarper account.",
      },
      {
        heading: "Keeping your account secure",
        text: "You are responsible for maintaining the confidentiality of your account credentials and for notifying us if you believe your account has been accessed without authorization.",
      },
    ],
  },
  {
    id: "location-information",
    number: "06",
    title: "Location & Address Information",
    content: [
      {
        heading: "Why location may be needed",
        text: "Some Dwaarper services require an address or location so that a requested service can be provided at the correct place.",
      },
      {
        heading: "Information you provide",
        text: "You may provide your address or location manually when using Dwaarper. Depending on the feature available, location-related information may also be obtained through supported location services.",
      },
      {
        heading: "Use of location information",
        text: "Location and address information may be used for service availability, booking, order fulfilment, communication, and other purposes directly connected to providing the requested service.",
      },
    ],
  },
  {
    id: "data-security",
    number: "07",
    title: "Data Security",
    content: [
      {
        heading: "Protecting your information",
        text: "We take reasonable measures designed to protect personal information against unauthorized access, misuse, alteration, disclosure, or destruction.",
      },
      {
        heading: "Authentication and access",
        text: "Account authentication and authorization mechanisms are used to help protect access to user accounts and platform functionality.",
      },
      {
        heading: "Important limitation",
        text: "No internet-based service can guarantee absolute security. You should use appropriate care when protecting your account credentials and personal information.",
      },
    ],
  },
  {
    id: "data-retention",
    number: "08",
    title: "Data Retention",
    content: [
      {
        heading: "How long we keep information",
        text: "We retain personal information only for as long as reasonably necessary for the purposes for which it was collected, including providing services, maintaining accounts, resolving disputes, maintaining records, and complying with applicable legal obligations.",
      },
      {
        heading: "Deletion",
        text: "Where information is no longer required and there is no legal or legitimate reason to retain it, we may delete, anonymize, or otherwise dispose of it in accordance with our applicable processes.",
      },
    ],
  },
  {
    id: "your-rights",
    number: "09",
    title: "Your Choices & Rights",
    content: [
      {
        heading: "Access and information",
        text: "Depending on applicable law, you may have rights relating to personal information processed by Dwaarper, including rights to access information about processing and request correction of inaccurate information.",
      },
      {
        heading: "Correction",
        text: "If information associated with your account is inaccurate or incomplete, you may contact us or use available account features to request an update.",
      },
      {
        heading: "Withdrawal and deletion",
        text: "Where processing is based on consent and applicable law provides for withdrawal, you may request withdrawal of consent. You may also request deletion of personal information where applicable, subject to legal and operational requirements.",
      },
      {
        heading: "Grievances",
        text: "If you have a privacy-related concern or complaint, you can contact Dwaarper through the contact channel provided on our website.",
      },
    ],
  },
  {
    id: "cookies",
    number: "10",
    title: "Cookies & Similar Technologies",
    content: [
      {
        heading: "How they may be used",
        text: "Dwaarper may use cookies or similar technologies that are necessary for website functionality, authentication, security, preferences, or understanding how the platform is used.",
      },
      {
        heading: "Your browser settings",
        text: "Most browsers allow you to control or disable certain cookies through browser settings. Some functionality may not work correctly if essential technologies are disabled.",
      },
    ],
  },
  {
    id: "childrens-privacy",
    number: "11",
    title: "Children's Privacy",
    content: [
      {
        heading: "Age and use",
        text: "Dwaarper is intended for users who can legally use the services available through the platform. We do not knowingly seek to collect personal information from children in circumstances where such collection is prohibited by applicable law.",
      },
      {
        heading: "If you believe information was collected",
        text: "If you believe that a child has provided personal information to Dwaarper inappropriately, please contact us so that the matter can be reviewed.",
      },
    ],
  },
  {
    id: "policy-changes",
    number: "12",
    title: "Changes to This Policy",
    content: [
      {
        heading: "Updates",
        text: "We may update this Privacy Policy from time to time to reflect changes to Dwaarper, our services, technology, or applicable legal requirements.",
      },
      {
        heading: "Effective date",
        text: "When we make changes, we will update the 'Last updated' date shown at the top of this page. We encourage you to review this policy periodically.",
      },
    ],
  },
  {
    id: "contact-us",
    number: "13",
    title: "Contact Us",
    content: [
      {
        heading: "Questions about privacy",
        text: "If you have a question, concern, or request relating to your personal information or this Privacy Policy, please contact Dwaarper through our Contact Us page.",
      },
    ],
  },
];

export default function PrivacyPolicy() {
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const contentRef = useRef(null);

  const [activeSection, setActiveSection] = useState(policySections[0].id);

  /*
   * =========================================================
   * GSAP ANIMATIONS
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

      const cleanupHero = createAnimation(heroRef.current, [
        {
          element: heroEyebrow,
          from: {
            opacity: 0,
            y: 14,
          },
          to: {
            opacity: 1,
            y: 0,
            duration: 0.4,
          },
        },
        {
          element: heroTitle,
          from: {
            opacity: 0,
            y: 24,
          },
          to: {
            opacity: 1,
            y: 0,
            duration: 0.55,
          },
          position: "-=0.2",
        },
        {
          element: heroDescription,
          from: {
            opacity: 0,
            y: 16,
          },
          to: {
            opacity: 1,
            y: 0,
            duration: 0.45,
          },
          position: "-=0.25",
        },
        {
          element: heroDate,
          from: {
            opacity: 0,
            y: 12,
          },
          to: {
            opacity: 1,
            y: 0,
            duration: 0.35,
          },
          position: "-=0.18",
        },
      ]);

      const sectionElements = contentRef.current ? Array.from(contentRef.current.querySelectorAll("[data-policy-section]")) : [];

      const sectionCleanups = sectionElements.map((section) => {
        const number = section.querySelector("[data-section-number]");

        const title = section.querySelector("[data-section-title]");

        const content = section.querySelector("[data-section-content]");

        return createAnimation(section, [
          {
            element: number,
            from: {
              opacity: 0,
              y: 12,
            },
            to: {
              opacity: 1,
              y: 0,
              duration: 0.35,
            },
          },
          {
            element: title,
            from: {
              opacity: 0,
              y: 18,
            },
            to: {
              opacity: 1,
              y: 0,
              duration: 0.45,
            },
            position: "-=0.2",
          },
          {
            element: content,
            from: {
              opacity: 0,
              y: 18,
            },
            to: {
              opacity: 1,
              y: 0,
              duration: 0.45,
            },
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
   * ACTIVE POLICY SECTION
   * =========================================================
   *
   * The active item is determined by the section currently
   * crossing the reading line around 35% of the viewport.
   *
   * This controls both:
   * - Desktop sidebar
   * - Mobile horizontal navigation
   * =========================================================
   */

  useEffect(() => {
    let ticking = false;

    const updateActiveSection = () => {
      const content = contentRef.current;

      if (!content) {
        ticking = false;
        return;
      }

      const sections = Array.from(content.querySelectorAll("[data-policy-section]"));

      if (!sections.length) {
        ticking = false;
        return;
      }

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

      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(updateActiveSection);
    };

    const handleResize = () => {
      updateActiveSection();
    };

    updateActiveSection();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);

      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /*
   * =========================================================
   * SCROLL TO POLICY SECTION
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
            Privacy Policy
          </p>

          <h1 data-hero-title className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your privacy matters.
            <br />
            <span className="text-white/45">We&apos;ll handle your data responsibly.</span>
          </h1>

          <p data-hero-description className="mt-4 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
            This Privacy Policy explains how Dwaarper collects, uses, protects, and handles information when you use our website, services, and related features.
          </p>

          <p data-hero-date className="mt-5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
            Last updated · September 20, 2026
          </p>
        </div>
      </section>

      {/* =====================================================
          MOBILE / TABLET SECTION NAV
      ===================================================== */}

      <div className="sticky top-0 z-30 border-y border-white/[0.06] bg-[#090909]/90 backdrop-blur-xl lg:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative">
            <div id="privacy-mobile-nav" className="overflow-x-auto py-3 scrollbar-hide">
              <div className="flex min-w-max gap-2 pr-12">
                {policySections.map((section) => {
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

            {/* Right scroll indicator */}

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
          POLICY CONTENT
      ===================================================== */}

      <section ref={contentRef} className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* =================================================
              DESKTOP ACCESSIBILITY NAV
          ================================================= */}

          <aside className="hidden lg:block">
            <div className="sticky top-28 w-[220px]">
              <div className="max-h-[calc(100vh-9rem)] overflow-y-auto scrollbar-hide">
                <nav className="space-y-1 pb-4">
                  {policySections.map((section) => {
                    const isActive = activeSection === section.id;

                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => scrollToSection(section.id)}
                        aria-current={isActive ? "location" : undefined}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-300 ${
                          isActive ? "bg-white/[0.035]" : "hover:bg-white/[0.03]"
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
              POLICY SECTIONS
          ================================================= */}

          <div className="min-w-0 space-y-4">
            {policySections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                data-policy-section
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
                This Privacy Policy is intended to explain Dwaarper&apos;s current approach to handling personal information. It is not a substitute for legal advice and may be
                updated as Dwaarper&apos;s services, technology, and applicable requirements evolve.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
