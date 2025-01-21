import React from "react";
import { Link} from "react-router-dom";

export default function Navigationbar() {
  const handleLogout =()=>{
    localStorage.removeItem("authToken");
  }

  return (
    <nav className="navigationbar">
      <div className="nav_container">
        <Link className="nav_logo" to="/">DwaarPer</Link>
        <div className="nav_links" gap={3}>
          {localStorage.getItem("authToken") ? (
            <>
             <Link className="nav_links" to="/myorders">
              My Orders
              </Link>

              <Link className="nav_links" to="/login" onClick={handleLogout}>
              Logout
              </Link>
            </>
          ) : (
            <>
              <Link className="nav_links" to="/login">
                Login
              </Link>
              <Link className="nav_links" to="/signup">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
