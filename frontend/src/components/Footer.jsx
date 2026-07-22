import React from "react";
import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="bg-[#090909] border-t border-white/5 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h2 className="text-white text-xl font-semibold mb-4">DWAARPER</h2>
            <p className="text-white/50 text-sm leading-7">
              Premium home services, delivered with trust, transparency and
              convenience.
            </p>
          </div>
          <div>
            <h3 className="text-white font-medium mb-4">Services</h3>
            <ul className="space-y-3 text-white/50 text-sm">
              <li>Cleaning</li>
              <li>Appliance Repair</li>
              <li>Plumbing</li>
              <li>Electrician</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-medium mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  className="text-white/50 hover:text-white"
                  to="/who-are-we"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  className="text-white/50 hover:text-white"
                  to="/why-choose-us"
                >
                  Why Choose Us
                </Link>
              </li>
              <li>
                <Link
                  className="text-white/50 hover:text-white"
                  to="/connect-with-us"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-medium mb-4">Legal</h3>
            <ul className="space-y-3 text-white/50 text-sm">
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
              <li>Help Center</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-12 pt-6 flex justify-center text-white/40 text-sm">
          <p>© 2026 DwaarPer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
