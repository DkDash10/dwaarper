import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BiShow, BiHide } from "react-icons/bi";
import { FcGoogle } from "react-icons/fc";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://dwaarper.onrender.com";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  // ======================
  // HANDLE CHANGE
  // ======================
  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  // ======================
  // LOGIN SUBMIT
  // ======================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!data.success) {
        setErrors({
          general: data.message || "Invalid credentials",
        });
        return;
      }

      localStorage.setItem("token", data.authToken);
      window.dispatchEvent(new Event("authChanged"));

      if (!data.isProfileComplete) {
        navigate("/complete-profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);

      setErrors({
        general: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // GOOGLE LOGIN
  // ======================
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  // ======================
  // INPUT STYLE
  // ======================
  const inputClass = "w-full px-4 py-3 bg-zinc-900 text-white rounded-lg placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition";

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 flex-col justify-center px-16">
        <h1 className="text-4xl font-semibold">Welcome Back</h1>

        <p className="text-zinc-400 mb-8 leading-relaxed">Continue booking trusted home services with ease.</p>

        <ul className="space-y-4 text-zinc-400">
          <li>
            <span className="text-cyan-300">•</span> Verified professionals
          </li>
          <li>
            <span className="text-cyan-300">•</span> Secure Stripe payments
          </li>
          <li>
            <span className="text-cyan-300">•</span> Fast doorstep service
          </li>
        </ul>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent)] pointer-events-none"></div>
      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md bg-[#111] p-8 rounded-lg">
          {/* HEADER */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Sign in</h2>

            <p className="text-zinc-500 text-sm">
              New here?{" "}
              <Link to="/signup" className="text-cyan-300 hover:text-cyan-200">
                Create account
              </Link>
            </p>
          </div>

          {/* GOOGLE BUTTON */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="
  w-full
  rounded-full
  border
  border-white/10
  bg-transparent
  px-6
  py-3
  text-sm
  font-medium
  text-white/75
  flex
  items-center
  justify-center
  gap-3
  transition-all
  duration-300
  hover:border-white/20
  hover:bg-white/[0.04]
  hover:text-white
"
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>

          {/* DIVIDER */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-zinc-800"></div>

            <span className="px-4 text-zinc-500 text-sm">or</span>

            <div className="flex-1 h-px bg-zinc-800"></div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wide mb-2 block">Email</label>

              <input type="email" name="email" placeholder="you@example.com" value={credentials.email} onChange={handleChange} className={inputClass} required />
              {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wide mb-2 block">Password</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={handleChange}
                  className={`${inputClass} pr-12`}
                  required
                />

                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                  {showPassword ? <BiHide className="text-cyan-300" size={22} /> : <BiShow className="text-cyan-300" size={22} />}
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password}</p>}
              </div>
            </div>

            {/* ERROR */}
            {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

            {/* BUTTON */}
            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="
    w-full
    rounded-full
    bg-white
    px-6
    py-3
    text-sm
    font-medium
    text-black
    flex
    items-center
    justify-center
    gap-2
    transition-all
    duration-300
    hover:-translate-y-0.5
    hover:shadow-[0_12px_30px_rgba(255,255,255,.12)]
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
