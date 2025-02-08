import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LuUser,LuShoppingCart } from "react-icons/lu";
import Badge from 'react-bootstrap/Badge';
import {useCart} from "./ContextReducer";


export default function Navigationbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  let data = useCart();
  return (
    <nav className="navigationbar">
      <div className="nav_container">
        <Link className="nav_logo" to="/">DwaarPer</Link>
        <div className="nav_links nav_links-mid">
          <Link className="nav_links" to="/why-choose-us" >
            Why Choose Us
          </Link>
          <Link className="nav_links" to="/who-are-we" >
            Who are we
          </Link>
          <Link className="nav_links" to="/connect-with-us" >
            Connect with us
          </Link>
        </div>
        <div className="nav_links">
          {localStorage.getItem("authToken") ? (
            <div className="nav_dropdown">
              <Link className="nav_links" to="/cart" title="Cart" >
                <LuShoppingCart className="nav_cart-logo" />
                {
                  data.length > 0 && (
                    <Badge className="nav_cart-count">{data.length}</Badge>
                  )
                }
              </Link>
              <button className="nav_dropdown-button" onClick={toggleDropdown} title="Menu">
                <LuUser className="nav_dropdown-logo" />
              </button>
              {isDropdownOpen && (
                <div className="nav_dropdown-menu">
                  <Link className="nav_links" to="/myorders" >
                    My Orders
                  </Link>
                  <div className="nav_links-midResp">
                    <Link className="nav_links" to="/why-choose-us" >
                      Why Choose Us
                    </Link>
                    <Link className="nav_links" to="/who-are-we" >
                      Who are we
                    </Link>
                    <Link className="nav_links" to="/connect-with-us" >
                      Connect with us
                    </Link>
                  </div>
                  <Link className="nav_links" to="/login" onClick={handleLogout}>
                    Logout
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link className="nav_links nav_links-auth" to="/login">
                Login
              </Link>
              <Link className="nav_links nav_links-auth" to="/signup">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
