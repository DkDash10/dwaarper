import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { GrHide } from "react-icons/gr";
import { BiShow } from "react-icons/bi";
import { IoChevronBackOutline } from "react-icons/io5";
import { RiUserLocationLine } from "react-icons/ri";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
  });
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.length < 2 ? "Name must be at least 2 characters long" : "";
      case "email":
        return !/\S+@\S+\.\S+/.test(value) ? "Enter a valid email" : "";
      case "password":
        return value.length < 5 ? "Password must be at least 5 characters long" : "";
      case "location":
        return value.length < 3 ? "Location must be at least 3 characters long" : "";
      default:
        return "";
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const newErrors = {};
    Object.keys(credentials).forEach(field => {
      newErrors[field] = validateField(field, credentials[field]);
    });

    // Check if there are any validation errors
    if (Object.values(newErrors).some(error => error !== "")) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch(`${window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://dwaarper.onrender.com'}/api/createuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        if (data.errors) {
          // Handle backend validation errors
          const backendErrors = {};
          data.errors.forEach(error => {
            backendErrors[error.param] = error.msg;
          });
          setErrors(backendErrors);
        } else if (data.message) {
          // Handle specific error messages (e.g., email already exists)
          setErrors(prev => ({
            ...prev,
            email: data.message
          }));
        }
      } else {
        const { password, ...userData } = credentials;
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("authToken", data.authToken);
        navigate("/");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setErrors(prev => ({
        ...prev,
        general: "An error occurred during signup. Please try again."
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    
    let navLocation = () => {
      return new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej);
      });
    };
  
    try {
      let latlong = await navLocation().then((res) => {
        let latitude = res.coords.latitude;
        let longitude = res.coords.longitude;
        return [latitude, longitude];
      });
  
      let [lat, long] = latlong;
      
      const response = await fetch(`${window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://dwaarper.onrender.com'}/api/getlocation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ latlong: { lat, long } })
      });
  
      const { location } = await response.json();
      setAddress(location);
      setCredentials(prev => ({ ...prev, location }));
      setErrors(prev => ({ ...prev, location: "" }));
    } catch (error) {
      console.error('Error retrieving location:', error);
      setErrors(prev => ({
        ...prev,
        location: "Failed to fetch location. Please enter manually."
      }));
    }
  };

  return (
    <div className="signup">
      <div className="signup_card">
        <p className="signup_card-header">Create Account</p>
        <Link to="/" className="backToHome">
          <IoChevronBackOutline /> Back to home
        </Link>
        <form onSubmit={handleSubmit} className="signup_form">
          <div className="signup_form-field">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={credentials.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="signup_form-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="signup_form-field">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
              />
              <button type="button" onClick={togglePasswordVisibility}>
                {showPassword ? (
                  <GrHide title="Hide" className="signup_form-icons" />
                ) : (
                  <BiShow title="Show" className="signup_form-icons" />
                )}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          <div className="signup_form-field">
            <label htmlFor="location">Location</label>
            <div className="location-input">
              <input
                type="text"
                id="location"
                name="location"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setCredentials(prev => ({ ...prev, location: e.target.value }));
                }}
                className={errors.location ? "error" : ""}
              />
              <button type="button" onClick={handleClick} title="Fetch Location">
                <RiUserLocationLine className="signup_form-icons" />
              </button>
            </div>
            {errors.location && <span className="error-message">{errors.location}</span>}
          </div>
          
          {errors.general && <div className="error-message general">{errors.general}</div>}
          
          <button type="submit">Sign Up</button>
          <p className="signup_form-footer">
            Already have an account?
            <span>
              <Link to="/login">&nbsp;Login</Link>
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}