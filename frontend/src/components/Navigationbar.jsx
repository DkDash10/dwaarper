import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuShoppingCart,
  LuX,
  LuMenu,
  LuPackage,
  LuLogOut,
  LuMapPin,
} from "react-icons/lu";
import { useCart } from "./ContextReducer";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://dwaarper.onrender.com";

export default function Navigationbar() {
  const cart = useCart();
  const dropdownRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const [showNavbar, setShowNavbar] = useState(true);
  const [isTop, setIsTop] = useState(true);

  const lastScrollY = useRef(0);

  useEffect(() => {
    const authChanged = () => setLoggedIn(!!localStorage.getItem("token"));

    window.addEventListener("authChanged", authChanged);
    return () => window.removeEventListener("authChanged", authChanged);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [mobileOpen]);

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    async function loadUser() {
      if (!loggedIn) {
        setUser(null);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (data.success) setUser(data.user);
      } catch (error) {
        console.error("Failed to load navbar user:", error);
      }
    }

    loadUser();
  }, [loggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      setIsTop(currentScroll < 20);

      if (currentScroll < 300) {
        setShowNavbar(true);
      } else if (currentScroll > lastScrollY.current) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      lastScrollY.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChanged"));
    setDropdownOpen(false);
    setMobileOpen(false);
    setShowLogoutModal(false);
  };

  const openMobileMenu = () => {
    setDropdownOpen(false);
    setMobileOpen(true);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Logout confirmation */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#111] p-6 sm:p-7 shadow-2xl">
            <div>
              <h3 className="text-xl font-semibold text-white">
                Sign out of DwaarPer?
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-white/45">
                You'll need to sign in again to access your account.
              </p>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/70 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,255,255,.12)]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <div
        className={`fixed left-0 right-0 z-50 px-3 sm:px-5 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
          showNavbar
            ? "translate-y-0 opacity-100 top-2"
            : "-translate-y-24 opacity-0 top-2"
        }`}
      >
        <div
          className={`mx-auto max-w-7xl flex items-center justify-between rounded-2xl px-4 sm:px-6 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
            isTop
              ? "py-2.5 sm:py-3 bg-transparent backdrop-blur-0 border-transparent shadow-none"
              : "py-2.5 sm:py-3 bg-black/45 backdrop-blur-2xl border-white/10 shadow-[0_10px_40px_rgba(0,0,0,.35)]"
          }`}
        >
          <Link
            to="/"
            className="uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[11px] sm:text-xs text-white shrink-0"
          >
            DWAARPER
          </Link>

          {/* Desktop controls */}
          <div className="hidden md:flex items-center gap-3">
            {loggedIn ? (
              <>
                <Link
                  to="/cart"
                  className="relative h-11 w-11 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <LuShoppingCart className="text-white" size={18} />

                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white text-black text-[10px] flex items-center justify-center font-bold">
                      {cart.length}
                    </span>
                  )}
                </Link>

                <div ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-3 rounded-full bg-white/5 hover:bg-white/10 px-2 py-2 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-semibold">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-14 w-72 rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden shadow-2xl">
                      <div className="px-5 pt-4 pb-3 border-b border-white/5">
                        <h3 className="text-white font-medium text-[15px]">
                          {user?.name || "User"}
                        </h3>

                        <div className="flex items-center gap-1 mt-1 text-xs text-white/50">
                          <LuMapPin size={12} />
                          {user?.location || "India"}
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="mt-3 flex items-center justify-between rounded-xl bg-white/5 px-4 py-2 transition-all duration-300 hover:bg-white/10 hover:translate-x-[2px]"
                        >
                          <p className="text-sm font-medium text-white">
                            Manage your profile
                          </p>
                        </Link>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/myorders"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
                        >
                          <LuPackage size={18} />
                          My Orders
                        </Link>
                      </div>

                      <div className="border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setShowLogoutModal(true)}
                          className="flex w-full items-center gap-3 px-5 py-4 text-sm text-red-400 transition hover:bg-red-500/10"
                        >
                          <LuLogOut size={18} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  className="text-white/70 hover:text-white transition-colors"
                  to="/login"
                >
                  Login
                </Link>
                <Link
                  className="rounded-full bg-white text-black px-4 py-2 font-medium"
                  to="/signup"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-2">
            {loggedIn && (
              <Link
                to="/cart"
                className="relative h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Cart"
              >
                <LuShoppingCart className="text-white" size={18} />

                {cart.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-white text-black text-[9px] flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}

            <button
              type="button"
              onClick={openMobileMenu}
              className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
              aria-label="Open menu"
            >
              <LuMenu size={19} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeMobileMenu}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-[min(88vw,360px)] bg-[#0B0B0C] border-l border-white/5 flex flex-col transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end px-3 py-3 border-b border-white/5">
          <button
            type="button"
            onClick={closeMobileMenu}
            className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
            aria-label="Close menu"
          >
            <LuX className="text-white" size={18} />
          </button>
        </div>

        {loggedIn && (
          <div className="px-3 py-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">
                  {user?.name || "User"}
                </div>
                <div className="truncate text-xs text-white/40">
                  {user?.location || "India"}
                </div>
              </div>
            </div>

            <Link
              to="/profile"
              onClick={closeMobileMenu}
              className="mt-4 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 transition-all hover:bg-white/10"
            >
              <p className="text-sm font-medium text-white">
                Manage your profile
              </p>
            </Link>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loggedIn ? (
            <div className="space-y-1">
              <Link
                to="/myorders"
                onClick={closeMobileMenu}
                className="flex min-h-12 items-center gap-3 rounded-xl py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                <LuPackage size={18} />
                My Orders
              </Link>

              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl py-3 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
              >
                <LuLogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="block rounded-full border border-white/10 py-3 text-center text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={closeMobileMenu}
                className="block rounded-full bg-white py-3 text-center text-sm font-medium text-black"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}