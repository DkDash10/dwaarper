import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuShoppingCart,
  LuX,
  LuPackage,
  LuLogOut,
  LuMapPin
} from "react-icons/lu";
import { useCart } from "./ContextReducer";

export default function Navigationbar() {
  const cart = useCart();
  const dropdownRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(null);

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
        const res = await fetch("/api/auth/me", {
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
        });
        const data = await res.json();
        if (data.success) setUser(data.user);
      } catch {}
    }
    loadUser();
  }, [loggedIn]);

  const logout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChanged"));
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      <div className="fixed top-4 left-0 right-0 z-50 px-5">
        <div className="mx-auto max-w-6xl rounded-2xl bg-black/40 backdrop-blur-2xl px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="uppercase tracking-[0.25em] text-xs text-white"
          >
            DWAARPER
          </Link>


          <div className="flex items-center gap-3">
            {loggedIn ? (
              <>
                <Link
                  to="/cart"
                  className="relative h-11 w-11 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
                >
                  <LuShoppingCart className="text-white" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white text-black text-[10px] flex items-center justify-center font-bold">
                      {cart.length}
                    </span>
                  )}
                </Link>

                <div ref={dropdownRef} className="relative md:block">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-3 rounded-full bg-white/5 hover:bg-white/10 px-2 py-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-semibold">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-14 w-72 rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden">
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
                          <div>
                            <p className="text-sm font-medium text-white">
                              Manage your profile
                            </p>
                          </div>
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
                          onClick={logout}
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
              <div className="hidden md:flex items-center gap-3">
                <Link className="text-white/70 hover:text-white" to="/login">
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
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition ${mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-80 bg-[#0B0B0C] border-l border-white/5 flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
          <span className="uppercase tracking-[0.25em] text-xs text-white/70">
            DWAARPER
          </span>
          <button onClick={() => setMobileOpen(false)}>
            <LuX className="text-white" />
          </button>
        </div>

        {loggedIn && (
          <>
            <div className="px-6 py-6 border-b border-white/5 flex flex-col gap-4">
            <div className="flex flex-row gap-4 items-center justify-center">
              <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <div className="text-white">{user?.name}</div>
                <div className="text-xs text-white/50">{user?.location}</div>
              </div>
            </div>
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="block rounded-2xl bg-white/5 px-4 py-3 transition-all hover:bg-white/10"
            >
              <p className="text-sm font-medium text-white">
                Manage your profile
              </p>
            </Link>
            </div>
          </>
        )}

        <div className="space-y-2">
          <div className="border-t border-white/5 px-4 space-y-2">
            {loggedIn ? (
              <>
                <Link
                  to="/myorders"
                  className="block rounded-xl px-4 py-3 text-white/70 hover:bg-white/5"
                >
                  My Orders
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left rounded-xl px-4 py-3 text-red-400 hover:bg-red-500/10"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 py-3 px-4">
                <Link
                  to="/login"
                  className="block rounded-xl px-4 py-3 text-center border text-white/70 hover:bg-white/5"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block rounded-xl bg-white text-center py-3 font-medium text-black"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
