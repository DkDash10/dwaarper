import { useLayoutEffect, useRef, useState } from "react";
import Navigationbar from "../components/Navigationbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { LuArrowUpRight, LuCheck, LuCircleCheck, LuClock3, LuMail, LuMessageCircle, LuSend, LuShieldCheck, LuSparkles } from "react-icons/lu";
import gsap from "gsap";

export default function ConnectWithUs() {
  const pageRef = useRef(null);

  const eyebrowRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const quickItemsRef = useRef([]);

  const infoRef = useRef(null);
  const formRef = useRef(null);
  const formGlowRef = useRef(null);
  const successRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * -----------------------------------------
   * PAGE ANIMATION
   * -----------------------------------------
   */

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline();

      timeline
        .from(eyebrowRef.current, {
          opacity: 0,
          y: 16,
          duration: 0.45,
          ease: "power3.out",
        })
        .from(
          titleRef.current,
          {
            opacity: 0,
            y: 35,
            duration: 0.65,
            ease: "power3.out",
          },
          "-=0.2",
        )
        .from(
          descriptionRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: "power3.out",
          },
          "-=0.25",
        )
        .from(
          quickItemsRef.current.filter(Boolean),
          {
            opacity: 0,
            y: 14,
            duration: 0.35,
            stagger: 0.08,
            ease: "power2.out",
          },
          "-=0.2",
        )
        .from(
          infoRef.current,
          {
            opacity: 0,
            y: 30,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.2",
        )
        .from(
          formRef.current,
          {
            opacity: 0,
            y: 35,
            scale: 0.985,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.4",
        );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  /*
   * -----------------------------------------
   * VALIDATION
   * -----------------------------------------
   */

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim().length < 2 ? "Name must be at least 2 characters long" : "";

      case "email":
        return !/\S+@\S+\.\S+/.test(value) ? "Please enter a valid email address" : "";

      case "subject":
        return value.trim().length < 3 ? "Subject must be at least 3 characters long" : "";

      case "message":
        return value.trim().length < 10 ? "Message must be at least 10 characters long" : "";

      default:
        return "";
    }
  };

  /*
   * -----------------------------------------
   * INPUT CHANGE
   * -----------------------------------------
   */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSubmitError("");
  };

  /*
   * -----------------------------------------
   * QUICK SUBJECT
   * -----------------------------------------
   */

  const handleQuickSubject = (subject) => {
    setFormData((prev) => ({
      ...prev,
      subject,
    }));

    setErrors((prev) => ({
      ...prev,
      subject: "",
    }));

    document.getElementById("subject")?.focus();
  };

  /*
   * -----------------------------------------
   * SUBMIT
   * -----------------------------------------
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      newErrors[field] = validateField(field, formData[field]);
    });

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error !== "")) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const API_URL =
        window.location.hostname === "localhost" || window.location.hostname === "192.168.0.107" ? `http://${window.location.hostname}:5000` : "https://dwaarper.onrender.com";

      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);

        requestAnimationFrame(() => {
          if (!successRef.current) return;

          gsap.fromTo(
            successRef.current,
            {
              opacity: 0,
              y: 20,
              scale: 0.98,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              ease: "power3.out",
            },
          );
        });
      } else {
        setSubmitError(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError("Unable to send your message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * -----------------------------------------
   * RESET
   * -----------------------------------------
   */

  const resetForm = () => {
    setIsSubmitted(false);

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    setErrors({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    setSubmitError("");
  };

  /*
   * -----------------------------------------
   * FORM GLOW
   * -----------------------------------------
   */

  const handleFormMouseMove = (event) => {
    if (!formRef.current || !formGlowRef.current) return;

    const rect = formRef.current.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    gsap.to(formGlowRef.current, {
      x: x - rect.width / 2,
      y: y - rect.height / 2,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  return (
    <div ref={pageRef} className="min-h-screen overflow-hidden bg-[#080808] text-white">
      <Navigationbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 sm:pt-32 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-cyan-500/[0.035] blur-[150px]" />

        <div>
          <div className="max-w-3xl">
            <div ref={eyebrowRef} className="text-[10px] font-medium uppercase tracking-[0.24em] text-cyan-300/70">
              Connect With Us
            </div>

            <h1 ref={titleRef} className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Let&apos;s make things easier.
              <br />
              <span className="text-white/45">We&apos;ll take it from here.</span>
            </h1>

            <p ref={descriptionRef} className="mt-4 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
              Have a question about a service, booking, payment, or anything else? Tell us what you need and the DwaarPer team will get back to you.
            </p>
          </div>

          {/* Quick information */}

          <div className="mt-8 max-w-4xl gap-12 flex">
            {[
              {
                icon: LuMessageCircle,
                title: "Quick response",
                text: "We'll get back to you",
              },
              {
                icon: LuShieldCheck,
                title: "Secure submission",
                text: "Your details stay private",
              },
              {
                icon: LuClock3,
                title: "Support",
                text: "We'll review your message",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  ref={(el) => {
                    quickItemsRef.current[index] = el;
                  }}
                  className="flex items-center gap-3 py-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/10">
                    <Icon size={17} className="text-cyan-300" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-white">{item.title}</p>

                    <p className="mt-0.5 text-[10px] text-white/35">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT AREA
      ===================================================== */}

      <section className="relative mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          {/* =================================================
              LEFT INFORMATION
          ================================================= */}

          <div ref={infoRef} className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111] p-6 sm:rounded-[32px] sm:p-8 lg:p-10">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.25]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10">
                <LuSparkles size={21} className="text-cyan-300" />
              </div>

              <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">WE&apos;RE HERE TO HELP</p>

              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
                Tell us what&apos;s
                <br />
                on your mind.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/45">
                Whether you need help with an existing booking or simply want to know more about DwaarPer, send us a message and we&apos;ll take it from there.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  {
                    title: "Clear communication",
                    text: "Tell us exactly what you need.",
                  },
                  {
                    title: "Service-related help",
                    text: "Booking, service, payment, or general questions.",
                  },
                  {
                    title: "One simple conversation",
                    text: "No unnecessary steps or complicated forms.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.05]">
                      <LuCheck size={14} className="text-cyan-300" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>

                      <p className="mt-1 text-xs leading-5 text-white/35">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex items-center gap-3 border-t border-white/[0.08] pt-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05]">
                  <LuMail size={15} className="text-white/60" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-white/30">Contact</p>

                  <p className="mt-1 text-xs text-white/65">Send us your message below</p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <div
            ref={formRef}
            onMouseMove={handleFormMouseMove}
            className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111] p-6 sm:rounded-[32px] sm:p-8 lg:p-10"
          >
            <div
              ref={formGlowRef}
              className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.05] blur-[90px]"
            />

            <div className="relative">
              {!isSubmitted ? (
                <>
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">CONTACT FORM</p>

                      <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">How can we help?</h2>

                      <p className="mt-2 text-xs leading-6 text-white/40 sm:text-sm">Fill in the details and we&apos;ll take it from there.</p>
                    </div>

                    <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-zinc-900 sm:flex">
                      <LuSend size={17} className="text-cyan-300" />
                    </div>
                  </div>

                  {/* Quick topics */}

                  <div className="mt-7">
                    <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-white/30">Quick topic</p>

                    <div className="flex flex-wrap gap-2">
                      {["Booking help", "Service question", "Payment", "General inquiry"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleQuickSubject(item)}
                          className={`rounded-full border px-3 py-1.5 text-[10px] transition-all duration-300 ${
                            formData.subject === item
                              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                              : "border-white/[0.08] bg-zinc-900 text-white/45 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                    {/* Name / Email */}

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-white/45">
                          Your Name
                        </label>

                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Wick"
                          className={`w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:ring-1 ${
                            errors.name ? "ring-1 ring-red-400/60" : "focus:ring-zinc-600"
                          }`}
                        />

                        {errors.name && <p className="mt-2 text-xs text-red-400">{errors.name}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-white/45">
                          Email Address
                        </label>

                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className={`w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:ring-1 ${
                            errors.email ? "ring-1 ring-red-400/60" : "focus:ring-zinc-600"
                          }`}
                        />

                        {errors.email && <p className="mt-2 text-xs text-red-400">{errors.email}</p>}
                      </div>
                    </div>

                    {/* Subject */}

                    <div>
                      <label htmlFor="subject" className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-white/45">
                        Subject
                      </label>

                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="What would you like to talk about?"
                        className={`w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:ring-1 ${
                          errors.subject ? "ring-1 ring-red-400/60" : "focus:ring-zinc-600"
                        }`}
                      />

                      {errors.subject && <p className="mt-2 text-xs text-red-400">{errors.subject}</p>}
                    </div>

                    {/* Message */}

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label htmlFor="message" className="block text-[10px] font-medium uppercase tracking-[0.16em] text-white/45">
                          Message
                        </label>

                        <span className="text-[9px] text-white/20">{formData.message.length}/1000</span>
                      </div>

                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={(e) => {
                          if (e.target.value.length <= 1000) {
                            handleChange(e);
                          }
                        }}
                        placeholder="Tell us a little more..."
                        rows={5}
                        className={`w-full resize-none rounded-lg bg-zinc-900 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-500 focus:ring-1 ${
                          errors.message ? "ring-1 ring-red-400/60" : "focus:ring-zinc-600"
                        }`}
                      />

                      {errors.message && <p className="mt-2 text-xs text-red-400">{errors.message}</p>}
                    </div>

                    {/* Error */}

                    {submitError && <div className="rounded-lg border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-xs leading-5 text-red-300">{submitError}</div>}

                    {/* CTA */}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,255,255,.12)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <LuArrowUpRight size={17} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-[9px] leading-5 text-white/25">Your information is sent securely to DwaarPer.</p>
                  </form>
                </>
              ) : (
                /* SUCCESS STATE */

                <div ref={successRef} className="flex min-h-[500px] flex-col items-center justify-center text-center sm:min-h-[560px]">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-2xl" />

                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400/10">
                      <LuCircleCheck size={38} className="text-cyan-300" />
                    </div>
                  </div>

                  <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">MESSAGE RECEIVED</p>

                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">Thank you.</h2>

                  <p className="mt-4 max-w-md text-sm leading-7 text-white/45">
                    We&apos;ve received your message and our team will review your inquiry. We&apos;ll get back to you as soon as possible.
                  </p>

                  <div className="mt-8 flex items-center gap-2 rounded-full border border-white/[0.08] bg-zinc-900 px-4 py-2">
                    <LuCheck size={13} className="text-cyan-300" />

                    <span className="text-[10px] text-white/45">Your message was submitted successfully</span>
                  </div>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-8 rounded-full border border-white/[0.1] px-5 py-2.5 text-xs font-medium text-white/60 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                  >
                    Send another message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SERVICES CTA
      ===================================================== */}

      <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111] px-6 py-10 text-center sm:rounded-[32px] sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.05] blur-[100px]" />
          <div className="relative">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-300">READY WHEN YOU ARE</p>

            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              Need something fixed,
              <br className="hidden sm:block" />
              cleaned, or taken care of?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/40 sm:text-base">Explore DwaarPer&apos;s home services and find the right professional for the job.</p>

            <Link
              to="/services"
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,255,255,.12)]"
            >
              Explore Services
              <LuArrowUpRight size={17} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
