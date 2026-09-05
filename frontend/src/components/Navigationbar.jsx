import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuShoppingCart, LuX, LuMenu, LuPackage, LuLogOut, LuMapPin } from "react-icons/lu";
import { useCart } from "./ContextReducer";

const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://dwaarper.onrender.com";

export default function Navigationbar() {
  const cart = useCart();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  const [user, setUser] = useState(null);

  const [showNavbar, setShowNavbar] = useState(true);
  const [isTop, setIsTop] = useState(true);

  const lastScrollY = useRef(0);

  /*
  |--------------------------------------------------------------------------
  | AUTH STATE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("token");

      setLoggedIn(!!token);

      if (!token) {
        setUser(null);
        setDropdownOpen(false);
        setShowLogoutModal(false);
      }
    };

    window.addEventListener("authChanged", handleAuthChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | BODY SCROLL LOCK
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const shouldLock = mobileOpen || showLogoutModal;

    document.body.style.overflow = shouldLock ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, showLogoutModal]);

  /*
  |--------------------------------------------------------------------------
  | CLOSE PROFILE DROPDOWN WHEN CLICKING OUTSIDE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD USER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token || !loggedIn) {
        setUser(null);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",

          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        });

        /*
        |--------------------------------------------------------------------------
        | INVALID / EXPIRED TOKEN
        |--------------------------------------------------------------------------
        */

        if (response.status === 401) {
          localStorage.removeItem("token");

          if (!cancelled) {
            setLoggedIn(false);
            setUser(null);
          }

          window.dispatchEvent(new Event("authChanged"));

          return;
        }

        const text = await response.text();

        const data = text ? JSON.parse(text) : {};

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load user");
        }

        if (!cancelled) {
          setUser(data.user);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load navbar user:", error);
        }
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  /*
  |--------------------------------------------------------------------------
  | NAVBAR SCROLL BEHAVIOUR
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      setIsTop(currentScroll < 20);

      /*
      |--------------------------------------------------------------------------
      | Always visible near the top
      |--------------------------------------------------------------------------
      */

      if (currentScroll < 300) {
        setShowNavbar(true);
      } else if (currentScroll > lastScrollY.current) {

      /*
      |--------------------------------------------------------------------------
      | Hide when scrolling down
      |--------------------------------------------------------------------------
      */
        setShowNavbar(false);
      } else {

      /*
      |--------------------------------------------------------------------------
      | Show when scrolling back up
      |--------------------------------------------------------------------------
      */
        setShowNavbar(true);
      }

      lastScrollY.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const logout = () => {
    localStorage.removeItem("token");

    setLoggedIn(false);
    setUser(null);

    setDropdownOpen(false);
    setMobileOpen(false);
    setShowLogoutModal(false);

    /*
     * ContextReducer listens to this event and
     * clears the React cart state.
     */
    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
  };

  /*
  |--------------------------------------------------------------------------
  | MOBILE MENU
  |--------------------------------------------------------------------------
  */

  const openMobileMenu = () => {
    setDropdownOpen(false);
    setMobileOpen(true);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  /*
  |--------------------------------------------------------------------------
  | CART COUNT
  |--------------------------------------------------------------------------
  */

  const cartCount = Array.isArray(cart) ? cart.length : 0;

  return (
    <>
      {/* ================================================================== */}
      {/* LOGOUT CONFIRMATION MODAL */}
      {/* ================================================================== */}

      {showLogoutModal && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/70
            px-5
            backdrop-blur-md
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div
            className="
              w-full
              max-w-md
              rounded-3xl
              border
              border-white/[0.08]
              bg-[#111]
              p-6
              sm:p-7
              shadow-2xl
            "
          >
            <div>
              <h3 id="logout-title" className="text-xl font-semibold text-white">
                Sign out of DwaarPer?
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-white/45">You'll need to sign in again to access your account.</p>
            </div>

            <div
              className="
                mt-7
                flex
                flex-col-reverse
                gap-3
                sm:flex-row
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-6
                  py-3
                  text-sm
                  font-medium
                  text-white/70
                  transition-all
                  duration-300
                  hover:border-white/20
                  hover:bg-white/[0.06]
                  hover:text-white
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={logout}
                className="
                  rounded-full
                  bg-white
                  px-6
                  py-3
                  text-sm
                  font-medium
                  text-black
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:shadow-[0_12px_30px_rgba(255,255,255,.12)]
                "
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* NAVBAR */}
      {/* ================================================================== */}

      <div
        className={`
          fixed
          left-0
          right-0
          z-50
          px-3
          sm:px-5
          transition-all
          duration-500
          ease-[cubic-bezier(.22,1,.36,1)]

          ${showNavbar ? "translate-y-0 opacity-100 top-2" : "-translate-y-24 opacity-0 top-2"}
        `}
      >
        <div
          className={`
            mx-auto
            max-w-7xl
            flex
            items-center
            justify-between
            rounded-2xl
            px-4
            sm:px-6
            transition-all
            duration-500
            ease-[cubic-bezier(.22,1,.36,1)]

            ${
              isTop
                ? `
                  py-2.5
                  sm:py-3
                  bg-transparent
                  backdrop-blur-0
                  border-transparent
                  shadow-none
                `
                : `
                  py-2.5
                  sm:py-3
                  bg-black/45
                  backdrop-blur-2xl
                  border
                  border-white/10
                  shadow-[0_10px_40px_rgba(0,0,0,.35)]
                `
            }
          `}
        >
          {/* ============================================================ */}
          {/* LOGO */}
          {/* ============================================================ */}

          <Link
            to="/"
            className="
              uppercase
              tracking-[0.2em]
              sm:tracking-[0.25em]
              text-[11px]
              sm:text-xs
              text-white
              shrink-0
            "
          >
            DWAARPER
          </Link>

          {/* ============================================================ */}
          {/* DESKTOP */}
          {/* ============================================================ */}

          <div className="hidden md:flex items-center gap-3">
            {loggedIn ? (
              <>
                {/* CART */}

                <Link
                  to="/cart"
                  className="
                    relative
                    h-11
                    w-11
                    rounded-full
                    bg-white/5
                    hover:bg-white/10
                    flex
                    items-center
                    justify-center
                    transition-colors
                  "
                  aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
                >
                  <LuShoppingCart className="text-white" size={18} />

                  {cartCount > 0 && (
                    <span
                      className="
                        absolute
                        -top-1
                        -right-1
                        h-5
                        w-5
                        rounded-full
                        bg-white
                        text-black
                        text-[10px]
                        flex
                        items-center
                        justify-center
                        font-bold
                      "
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* PROFILE */}

                <div ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((previous) => !previous)}
                    aria-label="Open profile menu"
                    aria-expanded={dropdownOpen}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-full
                      bg-white/5
                      hover:bg-white/10
                      px-2
                      py-2
                      transition-colors
                    "
                  >
                    <div
                      className="
                        h-8
                        w-8
                        rounded-full
                        bg-white/10
                        flex
                        items-center
                        justify-center
                        text-white
                        text-sm
                        font-semibold
                      "
                    >
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  </button>

                  {/* PROFILE DROPDOWN */}

                  {dropdownOpen && (
                    <div
                      className="
                        absolute
                        right-0
                        top-14
                        w-72
                        rounded-2xl
                        bg-zinc-950
                        border
                        border-white/5
                        overflow-hidden
                        shadow-2xl
                      "
                    >
                      {/* USER */}

                      <div
                        className="
                          px-5
                          pt-4
                          pb-3
                          border-b
                          border-white/5
                        "
                      >
                        <h3 className="text-white font-medium text-[15px]">{user?.name || "User"}</h3>

                        <div
                          className="
                            flex
                            items-center
                            gap-1
                            mt-1
                            text-xs
                            text-white/50
                          "
                        >
                          <LuMapPin size={12} />

                          {user?.location || "India"}
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="
                            mt-3
                            flex
                            items-center
                            justify-between
                            rounded-xl
                            bg-white/5
                            px-4
                            py-2
                            transition-all
                            duration-300
                            hover:bg-white/10
                            hover:translate-x-[2px]
                          "
                        >
                          <p className="text-sm font-medium text-white">Manage your profile</p>
                        </Link>
                      </div>

                      {/* ORDERS */}

                      <div className="py-2">
                        <Link
                          to="/myorders"
                          onClick={() => setDropdownOpen(false)}
                          className="
                            flex
                            items-center
                            gap-3
                            px-5
                            py-3
                            text-sm
                            text-white/75
                            transition
                            hover:bg-white/5
                            hover:text-white
                          "
                        >
                          <LuPackage size={18} />
                          My Orders
                        </Link>
                      </div>

                      {/* LOGOUT */}

                      <div className="border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            setShowLogoutModal(true);
                          }}
                          className="
                            flex
                            w-full
                            items-center
                            gap-3
                            px-5
                            py-4
                            text-sm
                            text-red-400
                            transition
                            hover:bg-red-500/10
                          "
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
              /* ======================================================== */
              /* LOGGED OUT */
              /* ======================================================== */

              <div className="flex items-center gap-3">
                <Link
                  className="
                    text-white/70
                    hover:text-white
                    transition-colors
                  "
                  to="/login"
                >
                  Login
                </Link>

                <Link
                  className="
                    rounded-full
                    bg-white
                    text-black
                    px-4
                    py-2
                    font-medium
                  "
                  to="/signup"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* MOBILE CONTROLS */}
          {/* ============================================================ */}

          <div className="flex md:hidden items-center gap-2">
            {loggedIn && (
              <Link
                to="/cart"
                onClick={closeMobileMenu}
                className="
                  relative
                  h-10
                  w-10
                  rounded-full
                  bg-white/5
                  hover:bg-white/10
                  flex
                  items-center
                  justify-center
                  transition-colors
                "
                aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
              >
                <LuShoppingCart className="text-white" size={18} />

                {cartCount > 0 && (
                  <span
                    className="
                      absolute
                      -top-0.5
                      -right-0.5
                      h-[18px]
                      w-[18px]
                      rounded-full
                      bg-white
                      text-black
                      text-[9px]
                      flex
                      items-center
                      justify-center
                      font-bold
                    "
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <button
              type="button"
              onClick={openMobileMenu}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="
                h-10
                w-10
                rounded-full
                bg-white/5
                hover:bg-white/10
                flex
                items-center
                justify-center
                text-white
                transition-colors
              "
            >
              <LuMenu size={19} />
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MOBILE BACKDROP */}
      {/* ================================================================== */}

      <div
        className={`
          fixed
          inset-0
          z-40
          bg-black/70
          backdrop-blur-sm
          transition-opacity
          duration-300
          md:hidden

          ${mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* ================================================================== */}
      {/* MOBILE DRAWER */}
      {/* ================================================================== */}

      <aside
        className={`
          fixed
          top-0
          right-0
          z-50
          h-screen
          w-[min(88vw,360px)]
          bg-[#0B0B0C]
          border-l
          border-white/5
          flex
          flex-col
          transition-transform
          duration-500
          ease-[cubic-bezier(.22,1,.36,1)]
          md:hidden

          ${mobileOpen ? "translate-x-0" : "translate-x-full"}
        `}
        aria-hidden={!mobileOpen}
      >
        {/* CLOSE */}

        <div
          className="
            flex
            justify-end
            px-3
            py-3
            border-b
            border-white/5
          "
        >
          <button
            type="button"
            onClick={closeMobileMenu}
            className="
              h-9
              w-9
              rounded-full
              bg-white/5
              hover:bg-white/10
              flex
              items-center
              justify-center
            "
            aria-label="Close menu"
          >
            <LuX className="text-white" size={18} />
          </button>
        </div>

        {/* USER */}

        {loggedIn && (
          <div
            className="
              px-3
              py-3
              border-b
              border-white/5
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  h-11
                  w-11
                  shrink-0
                  rounded-full
                  bg-white/10
                  flex
                  items-center
                  justify-center
                  text-white
                  text-sm
                  font-semibold
                "
              >
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>

              <div className="min-w-0">
                <div
                  className="
                    truncate
                    text-sm
                    font-medium
                    text-white
                  "
                >
                  {user?.name || "User"}
                </div>

                <div
                  className="
                    truncate
                    text-xs
                    text-white/40
                  "
                >
                  {user?.location || "India"}
                </div>
              </div>
            </div>

            <Link
              to="/profile"
              onClick={closeMobileMenu}
              className="
                mt-4
                flex
                items-center
                justify-between
                rounded-xl
                bg-white/5
                px-4
                py-3
                transition-all
                hover:bg-white/10
              "
            >
              <p className="text-sm font-medium text-white">Manage your profile</p>
            </Link>
          </div>
        )}

        {/* MENU CONTENT */}

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loggedIn ? (
            <div className="space-y-1">
              {/* CART */}

              <Link
                to="/cart"
                onClick={closeMobileMenu}
                className="
                  flex
                  min-h-12
                  items-center
                  justify-between
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  text-white/70
                  transition-colors
                  hover:bg-white/5
                  hover:text-white
                "
              >
                <span className="flex items-center gap-3">
                  <LuShoppingCart size={18} />
                  Cart
                </span>

                {cartCount > 0 && (
                  <span
                    className="
                      rounded-full
                      bg-white
                      px-2
                      py-0.5
                      text-[10px]
                      font-bold
                      text-black
                    "
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* ORDERS */}

              <Link
                to="/myorders"
                onClick={closeMobileMenu}
                className="
                  flex
                  min-h-12
                  items-center
                  gap-3
                  rounded-xl
                  py-3
                  text-sm
                  text-white/70
                  transition-colors
                  hover:bg-white/5
                  hover:text-white
                "
              >
                <LuPackage size={18} />
                My Orders
              </Link>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setShowLogoutModal(true);
                }}
                className="
                  flex
                  min-h-12
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  py-3
                  text-left
                  text-sm
                  text-red-400
                  transition-colors
                  hover:bg-red-500/10
                "
              >
                <LuLogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            /* ========================================================== */
            /* LOGGED OUT MOBILE */
            /* ========================================================== */

            <div className="space-y-2">
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="
                  block
                  rounded-full
                  border
                  border-white/10
                  py-3
                  text-center
                  text-sm
                  text-white/70
                  transition-colors
                  hover:bg-white/5
                  hover:text-white
                "
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={closeMobileMenu}
                className="
                  block
                  rounded-full
                  bg-white
                  py-3
                  text-center
                  text-sm
                  font-medium
                  text-black
                "
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
