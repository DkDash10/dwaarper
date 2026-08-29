import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuMapPin, LuPhone, LuMail, LuLock, LuLogOut, LuTrash2 } from "react-icons/lu";
import Navigationbar from "../../components/Navigationbar";
import Footer from "../../components/Footer";

import ProfileHeader from "./ProfileHeader";
import ProfileSection from "./ProfileSection";

const API_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://dwaarper.onrender.com";

export default function Profile() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    location: "",
  });

  /*
   * -----------------------------------------
   * FETCH PROFILE
   * -----------------------------------------
   */

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            "auth-token": token,
          },
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok || !data.success) {
          localStorage.removeItem("token");
          window.dispatchEvent(new Event("authChanged"));

          navigate("/login", { replace: true });
          return;
        }

        setUser(data.user);

        setFormData({
          name: data.user.name || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          location: data.user.location || "",
        });
      } catch (error) {
        console.error("Profile fetch error:", error);

        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("authChanged", handleAuthChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login", { replace: true });
  };

  /*
   * -----------------------------------------
   * FORM HANDLING
   * -----------------------------------------
   */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * -----------------------------------------
   * UPDATE PROFILE
   * -----------------------------------------
   */

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },

        body: JSON.stringify(formData),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update profile");
      }

      setUser(data.user);

      setFormData({
        name: data.user.name || "",
        phone: data.user.phone || "",
        address: data.user.address || "",
        location: data.user.location || "",
      });

      setEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);

      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  /*
   * -----------------------------------------
   * DELETE ACCOUNT
   * -----------------------------------------
   */

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      return;
    }

    setDeleting(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({
          confirmation: "DELETE",
        }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete account");
      }

      localStorage.removeItem("token");
      window.dispatchEvent(new Event("authChanged"));

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Delete account error:", error);
      alert(error.message);
    } finally {
      setDeleting(false);
    }
  };

  /*
   * -----------------------------------------
   * LOADING
   * -----------------------------------------
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-5xl px-6 py-32">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-white/5" />

          <div className="mt-8 h-32 animate-pulse rounded-3xl bg-white/5" />
        </div>
      </main>
    );
  }

  /*
   * -----------------------------------------
   * PROFILE
   * -----------------------------------------
   */

  return (
    <>
    
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
      px-6
      backdrop-blur-md
    "
        >
          <div
            className="
        w-full
        max-w-md
        rounded-3xl
        border
        border-white/[0.08]
        bg-[#111]
        p-7
        shadow-2xl
      "
          >
            <div>
              <h3 className="text-xl font-semibold text-white">Sign out of DwaarPer?</h3>

              <p className="mt-2 text-sm leading-relaxed text-white/45">You'll need to sign in again to access your account.</p>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="
            w-full
            rounded-full
            border
            border-white/10
            bg-white/[0.03]
            px-6
            sm:w-auto
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
                onClick={handleLogout}
                className="
            w-full
            rounded-full
            bg-white
            px-6
            sm:w-auto
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


      {showDeleteModal && (
        <div
          className="
      fixed
      inset-0
      z-[100]
      flex
      items-center
      justify-center
      bg-black/70
      px-6
      backdrop-blur-md
    "
        >
          <div
            className="
        w-full
        max-w-md
        rounded-3xl
        border
        border-white/[0.08]
        bg-[#111]
        p-7
        shadow-2xl
      "
          >
            {/* Header */}

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-white">Delete your account?</h3>

              <p className="mt-2 text-sm leading-relaxed text-white/45">This will permanently delete your DwaarPer account. This action cannot be undone.</p>
            </div>

            {/* Confirmation */}

            <div className="mt-6">
              <label className="text-[10px] font-medium uppercase tracking-[.18em] text-white/35">Type DELETE to confirm</label>

              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                className="
            mt-2
            w-full
            px-4
            py-3
            bg-zinc-900
            text-white
            rounded-lg
            placeholder:text-zinc-500
            focus:outline-none
            focus:ring-1
            focus:ring-red-500/40
            transition
          "
              />
            </div>

            {/* Actions */}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation("");
                }}
                disabled={deleting}
                className="
            w-full
            rounded-full
            border
            border-white/10
            bg-white/[0.03]
            px-6
            sm:w-auto
            py-3
            text-sm
            font-medium
            text-white/70
            transition-all
            duration-300
            hover:border-white/20
            hover:bg-white/[0.06]
            hover:text-white
            disabled:opacity-50
          "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== "DELETE" || deleting}
                className="
            w-full
            rounded-full
            bg-red-500
            px-6
            sm:w-auto
            py-3
            text-sm
            font-medium
            text-white
            transition-all
            duration-300
            hover:bg-red-400
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
      <Navigationbar />
      <main className="min-h-screen bg-black text-white">
        {/* Background */}

        <div className="pointer-events-none fixed inset-0">
          <div
            className="
            absolute
            left-1/2
            top-0
            h-[500px]
            w-[500px]
            -translate-x-1/2
            rounded-full
            bg-cyan-500/[0.04]
            blur-[140px]
            "
          />
        </div>

        <div className="
            relative
            mx-auto
            max-w-5xl
            px-4
            sm:px-6
            pb-16
            sm:pb-24
            pt-24
            sm:pt-32
          ">
          {/* Header */}

          <ProfileHeader user={user} onEdit={() => setEditing(true)} />

          {/* Profile content */}

          <div className="mt-14">
            {/* Personal Information */}

            <ProfileSection title="Personal Information" description="Your basic account information.">
              {editing ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} />

                  <InputField label="Email" value={user?.email || ""} disabled />

                  <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" />
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  <InfoItem icon={<LuMail size={16} />} label="Email" value={user?.email} />

                  <InfoItem icon={<LuPhone size={16} />} label="Phone" value={user?.phone || "Not added"} />
                </div>
              )}
            </ProfileSection>

            {/* Address */}

            <ProfileSection title="Address & Location" description="Where your services are usually requested.">
              {editing ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <InputField label="Location" name="location" value={formData.location} onChange={handleChange} />

                  <InputField label="Address" name="address" value={formData.address} onChange={handleChange} />
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  <InfoItem icon={<LuMapPin size={16} />} label="Location" value={user?.location || "Location not added"} />

                  <InfoItem icon={<LuMapPin size={16} />} label="Address" value={user?.address || "Address not added"} />
                </div>
              )}
            </ProfileSection>

            {/* Edit actions */}

            {editing && (
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
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
                  onClick={handleSave}
                  disabled={saving}
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
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}

            {/* Security */}

            <ProfileSection title="Security" description="Manage your account security.">
              <div
                className="
                flex
                flex-col
                gap-4
                rounded-2xl
                border
                border-white/[0.08]
                bg-white/[0.02]
                p-4
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:p-5
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/[0.04]
                    "
                  >
                    <LuLock size={17} className="text-white/50" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">Password</p>

                    <p className="mt-1 text-xs text-white/35">{user?.authProvider === "google" ? "Managed by Google" : "••••••••••••"}</p>
                  </div>
                </div>

                {user?.authProvider !== "google" && (
                  <button type="button" className="text-xs text-cyan-300 transition hover:text-cyan-200">
                    Change Password
                  </button>
                )}
              </div>
            </ProfileSection>

            {/* Actions */}

            {/* Account */}

            <ProfileSection title="Account" description="Manage your DwaarPer account.">
              <div className="space-y-3">
                {/* Logout */}

                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="
        flex
        w-full
        items-center
        justify-between
        rounded-2xl
        border
        border-white/[0.08]
        bg-white/[0.02]
        p-4
        sm:p-5
        text-left
        transition-all
        duration-300
        hover:border-white/[0.14]
        hover:bg-white/[0.04]
      "
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-white/[0.04]
          "
                    >
                      <LuLogOut size={17} className="text-white/50" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white">Logout</p>

                      <p className="mt-1 text-xs text-white/35">Sign out of your DwaarPer account.</p>
                    </div>
                  </div>

                  <span className="text-xs text-white/30">Sign out</span>
                </button>

                {/* Delete Account */}

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="
    flex
    w-full
    items-center
    justify-between
    rounded-2xl
    border
    border-red-500/10
    bg-red-500/[0.02]
    p-4
    text-left
    transition-all
    duration-300
    hover:border-red-500/20
    hover:bg-red-500/[0.04]
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        bg-red-500/[0.06]
      "
                    >
                      <LuTrash2 size={17} className="text-red-300/70" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-red-300">Delete Account</p>

                      <p className="mt-1 text-xs text-red-300/40">Permanently delete your DwaarPer account.</p>
                    </div>
                  </div>

                  <span className="text-xs text-red-300/40">{deleting ? "Deleting..." : "Delete"}</span>
                </button>
              </div>
            </ProfileSection>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/*
 * -----------------------------------------
 * INPUT
 * -----------------------------------------
 */

function InputField({ label, name, value, onChange, disabled = false, placeholder }) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium uppercase tracking-[.18em] text-white/35">{label}</span>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="
          mt-2
          w-full
          px-4
          py-3
          bg-zinc-900
          text-white
          rounded-lg
          placeholder:text-zinc-500
          focus:outline-none
          focus:ring-1
          focus:ring-zinc-600
          transition
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      />
    </label>
  );
}

/*
 * -----------------------------------------
 * INFO ITEM
 * -----------------------------------------
 */

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-white/[0.04]
        text-white/45
      "
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[.18em] text-white/30">{label}</p>

        <p className="mt-1 truncate text-sm text-white/75">{value}</p>
      </div>
    </div>
  );
}