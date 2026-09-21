import { Link } from "react-router-dom";
import { LuArrowUpRight, LuMail, LuMapPin, LuPhone } from "react-icons/lu";

const serviceLinks = [
  { label: "Decor", to: "/services#category-decor" },
  { label: "Appliance Repair", to: "/services#category-appliance-repair" },
  { label: "General Repair", to: "/services#category-general-repair" },
  { label: "Pest Control", to: "/services#category-pest-control" },
  { label: "Cleaning", to: "/services#category-cleaning" },
];

const companyLinks = [
  { label: "About Us", to: "/who-are-we" },
  { label: "Contact", to: "/connect-with-us" },
];

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms-and-conditions" },
];

const linkClass = "group inline-flex items-center gap-1.5 text-sm text-white/40 transition-all duration-300 hover:translate-x-1 hover:text-white";

export default function Footer() {
  const handleFooterNavigation = () => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] bg-[#070707] text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-cyan-400/[0.045] blur-3xl" />

      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-white/[0.025] blur-3xl" />

      {/* Subtle top light */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-2 pb-7 pt-14 sm:px-8 sm:pt-16 lg:px-10">
        {/* Main footer */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-16">
          {/* Brand */}
          <div className="md:max-w-sm text-center md:text-left">
            <Link to="/" className="uppercase tracking-[0.2em] sm:tracking-[0.35em] text-lg text-white shrink-0" onClick={handleFooterNavigation}>
              DWAARPER
            </Link>

            <p className="mt-5 md:max-w-xs text-sm leading-7 text-white/35">Premium home services, delivered with trust, transparency and convenience.</p>
          </div>

          {/* Services */}
          <div className="text-center md:text-left">
            <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-cyan-300/70">Services</p>

            <ul className="space-y-3.5">
              {serviceLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className={linkClass}
                    onClick={(e) => {
                      const [path, hash] = item.to.split("#");

                      if (window.location.pathname === path && hash) {
                        e.preventDefault();

                        const target = document.getElementById(hash);

                        if (target) {
                          window.history.replaceState(null, "", item.to);

                          target.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }
                      }
                    }}
                  >
                    <span>{item.label}</span>

                    <LuArrowUpRight className="h-3 w-3 translate-y-0.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0 group-hover:opacity-60" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="text-center md:text-left">
            <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-cyan-300/70">Company</p>

            <ul className="space-y-3.5">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className={linkClass} onClick={handleFooterNavigation}>
                    <span>{item.label}</span>

                    <LuArrowUpRight className="h-3 w-3 translate-y-0.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0 group-hover:opacity-60" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="text-center md:text-left">
            <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-cyan-300/70">Legal</p>

            <ul className="space-y-3.5">
              {legalLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className={linkClass} onClick={handleFooterNavigation}>
                    <span>{item.label}</span>

                    <LuArrowUpRight className="h-3 w-3 translate-y-0.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0 group-hover:opacity-60" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact strip */}
        <div className="mt-14 grid gap-4 border-y border-white/[0.06] py-6 text-xs text-white/30 sm:grid-cols-3 sm:gap-3">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <LuMapPin className="h-3.5 w-3.5 shrink-0 text-cyan-300/60" />
            <span>Serving homes with care</span>
          </div>

          <div className="flex items-center gap-2 justify-center">
            <LuMail className="h-3.5 w-3.5 shrink-0 text-cyan-300/60" />
            <span>Support available when you need</span>
          </div>

          <div className="flex items-center gap-2 justify-center sm:justify-end">
            <LuPhone className="h-3.5 w-3.5 shrink-0 text-cyan-300/60" />
            <span>Professional service, every time</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex gap-4 pt-6 text-[11px] text-white/20 items-center justify-between">
          <p>© 2026 Dwaarper. All rights reserved.</p>

          <Link to="/services" className="group inline-flex w-fit items-center gap-1.5 transition-colors duration-300 hover:text-white/55" onClick={handleFooterNavigation}>
            Explore services
            <LuArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
