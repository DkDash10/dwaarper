import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // GET TOKEN FROM URL
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");

    const profileComplete = params.get("profileComplete");

    if (token) {
      localStorage.setItem("token", token);
      window.dispatchEvent(new Event("authChanged"));
      if (profileComplete === "true") {
        navigate("/");
      } else {
        navigate("/complete-profile");
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p className="text-zinc-400 text-lg">Signing you in...</p>
    </div>
  );
}
