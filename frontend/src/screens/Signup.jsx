import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiShow, BiHide } from "react-icons/bi";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  // ======================
  // EMAIL SIGNUP
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDATE FIRST
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.authToken);
        window.dispatchEvent(new Event("authChanged"));
        if (!data.isProfileComplete) {
          navigate("/complete-profile");
        } else {
          navigate("/");
        }
      } else {
        setErrors({
          general: data.message || "Signup failed",
        });
      }
    } catch (err) {
      console.error(err);

      setErrors({
        general: "Something went wrong",
      });
    }

    setLoading(false);
  };

  const validateForm = () => {
    let newErrors = {};

    // NAME
    if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // EMAIL
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email";
    }

    // PASSWORD
    if (form.password.length < 5) {
      newErrors.password = "Password must be at least 5 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ======================
  // GOOGLE LOGIN (REDIRECT)
  // ======================
  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const inputClass =
    "w-full px-4 py-3 bg-zinc-900 text-white rounded-lg placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition";

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-black via-zinc-950 to-black text-white ">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 flex-col justify-center px-16">
        <h1 className="text-4xl font-semibold">DwaarPer</h1>

        <p className="text-zinc-400 mb-8">
          Home services, delivered by verified professionals at your doorstep.
        </p>

        <ul className="space-y-3 text-zinc-400">
          <li>
            <span className="text-yellow-500">•</span> Verified professionals
            only
          </li>
          <li>
            <span className="text-yellow-500">•</span> Secure payments via
            Stripe
          </li>
          <li>
            <span className="text-yellow-500">•</span> 20% off your first order
          </li>
        </ul>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent)] pointer-events-none"></div>
      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md bg-[#111] p-8 rounded-lg">
          <h2 className="text-2xl font-semibold">Create Account</h2>
          <p className="text-sm text-zinc-400 mb-6">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-yellow-500 hover:text-yellow-300 cursor-pointer"
            >
              Login
            </span>
          </p>
          {/* GOOGLE BUTTON */}
          <button
            onClick={handleGoogleSignup}
            className="w-full py-3 rounded-lg border border-zinc-800 text-white flex items-center justify-center gap-2 hover:bg-zinc-900 transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
              alt="google"
            />
            Continue with Google
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-zinc-700"></div>
            <span className="px-3 text-sm text-zinc-500">or</span>
            <div className="flex-1 h-px bg-zinc-700"></div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NAME */}
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1 block">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Wick"
                onChange={handleChange}
                className={inputClass}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-2">{errors.name}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1 block">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={handleChange}
                className={inputClass}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-2">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wide mb-1 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  className={`${inputClass} pr-12`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? (
                    <BiHide className="text-yellow-500" size={22} />
                  ) : (
                    <BiShow className="text-yellow-500" size={22} />
                  )}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-2">{errors.password}</p>
                )}
              </div>
            </div>
            {errors.general && (
              <p className="text-red-500 text-sm">{errors.general}</p>
            )}
            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-white text-black font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
