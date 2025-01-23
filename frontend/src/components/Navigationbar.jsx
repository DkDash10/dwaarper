import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LuUser,LuShoppingCart } from "react-icons/lu";
import Badge from 'react-bootstrap/Badge';


export default function Navigationbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="navigationbar">
      <div className="nav_container">
        <Link className="nav_logo" to="/">DwaarPer</Link>
        <div className="nav_links" gap={3}>
          {localStorage.getItem("authToken") ? (
            <div className="nav_dropdown">
              <Link className="nav_links" to="/cart" >
                <LuShoppingCart className="nav_cart-logo" />
                <Badge className="nav_cart-count">1</Badge>
              </Link>
              <button className="nav_dropdown-button" onClick={toggleDropdown}>
                <LuUser className="nav_dropdown-logo" />
              </button>
              {isDropdownOpen && (
                <div className="nav_dropdown-menu">
                   <Link className="nav_links" to="/profile" >
                    Profile
                  </Link>
                  <Link className="nav_links" to="/myorders" >
                    My Orders
                  </Link>
                  <Link className="nav_links" to="/login" onClick={handleLogout}>
                    Logout
                  </Link>
                </div>
              )}
            </div>
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
