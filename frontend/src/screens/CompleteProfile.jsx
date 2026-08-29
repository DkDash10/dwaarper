import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://dwaarper.onrender.com";

export default function CompleteProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone: "",
    location: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [errors, setErrors] = useState({});

  // ======================
  // HANDLE CHANGE
  // ======================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // PHONE FIELD
    if (name === "phone") {
      const cleanedValue = value.replace(/\D/g, "");

      if (cleanedValue.length <= 10) {
        setForm({
          ...form,
          phone: cleanedValue,
        });
      }
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = () => {
    let newErrors = {};

    // PHONE
    if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    // LOCATION
    if (form.location.trim().length < 2) {
      newErrors.location = "Enter a valid location";
    }

    // ADDRESS
    if (form.address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ======================
  // AUTO LOCATION DETECT
  // ======================
  const detectLocation = async () => {
    try {
      setDetecting(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latlong = {
            lat: position.coords.latitude,
            long: position.coords.longitude,
          };

          const response = await fetch(`${API_BASE_URL}/api/auth/getlocation`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ latlong }),
          });

          const text = await response.text();
          const data = text ? JSON.parse(text) : {};

          setForm((prev) => ({
            ...prev,
            location: data.location || "",
          }));

          setDetecting(false);
        },

        (error) => {
          console.error(error);
          setDetecting(false);
        },
      );
    } catch (err) {
      console.error(err);
      setDetecting(false);
    }
  };

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/complete-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify(form),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!data.success) {
        setErrors({
          general: data.message || "Failed to complete profile",
        });
        return;
      }

      navigate("/");
    } catch (err) {
      console.error(err);
      setErrors({
        general: "Something went wrong",
      });
    }

    setLoading(false);
  };

  // ======================
  // INPUT STYLE
  // ======================
  const inputClass = "w-full px-4 py-3 bg-zinc-900 text-white rounded-lg placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition";

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 flex-col justify-center px-16">
        <h1 className="text-4xl font-semibold">Almost there</h1>

        <p className="text-zinc-400 mb-8 leading-relaxed">Complete your profile to start booking premium home services.</p>

        <ul className="space-y-4 text-zinc-400">
          <li>
            <span className="text-cyan-300">•</span> Faster checkout experience
          </li>
          <li>
            <span className="text-cyan-300">•</span> Real-time booking updates
          </li>
          <li>
            <span className="text-cyan-300">•</span> Personalized recommendations
          </li>
        </ul>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md bg-[#111] p-8 rounded-lg">
          {/* HEADER */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">Complete profile</h2>

            <p className="text-zinc-500 text-sm">
              Just a few details to <span className="text-cyan-300">personalize your experience.</span>
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* PHONE */}
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wide mb-2 block">Phone Number</label>

              <input type="tel" name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} className={inputClass} required />
              {errors.phone && <p className="text-red-500 text-xs mt-2">{errors.phone}</p>}
            </div>

            {/* LOCATION */}
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wide mb-2 block">City / Location</label>

              <div className="relative">
                <input type="text" name="location" placeholder="Mumbai, Maharashtra" value={form.location} onChange={handleChange} className={`${inputClass} pr-14`} required />

                <button
                  type="button"
                  onClick={detectLocation}
                  className="
    absolute
    right-4
    top-1/2
    -translate-y-1/2
    text-cyan-300
    transition
    hover:text-cyan-200
  "
                >
                  <IoLocationOutline size={22} />
                </button>
                {errors.location && <p className="text-red-500 text-xs mt-2">{errors.location}</p>}
              </div>

              <p className="text-xs text-cyan-300 mt-2">{detecting ? "Detecting your location..." : "Use current location"}</p>
            </div>

            {/* ADDRESS */}
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wide mb-2 block">Address</label>

              <textarea
                name="address"
                rows="4"
                placeholder="Apartment, street, landmark..."
                value={form.address}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                required
              />
              {errors.address && <p className="text-red-500 text-xs mt-2">{errors.address}</p>}
            </div>

            {/* ERROR */}
            {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
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
              {loading ? "Saving..." : "Complete setup"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
