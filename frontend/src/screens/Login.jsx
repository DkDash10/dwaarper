import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { GrHide } from "react-icons/gr";
import { BiShow } from "react-icons/bi";
import { IoChevronBackOutline } from "react-icons/io5";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  let navigate = useNavigate();

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        return !/\S+@\S+\.\S+/.test(value) ? "Enter a valid email" : "";
      case "password":
        return value.length < 5 ? "Password must be at least 5 characters long" : "";
      default:
        return "";
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    Object.keys(credentials).forEach(field => {
      newErrors[field] = validateField(field, credentials[field]);
    });

    if (Object.values(newErrors).some(error => error !== "")) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch(`${window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://dwaarper.onrender.com'}/api/loginuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        if (data.errors === "Email not found") {
          setErrors(prev => ({
            ...prev,
            email: "Email not found"
          }));
        } else if (data.errors === "Incorrect password") {
          setErrors(prev => ({
            ...prev,
            password: "Incorrect password"
          }));
        } else if (data.errors) {
          const backendErrors = {};
          if (Array.isArray(data.errors)) {
            data.errors.forEach(error => {
              backendErrors[error.param] = error.msg;
            });
          }
          setErrors(backendErrors);
        }
      } else {
        const { password, ...userData } = credentials;
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("authToken", data.authToken);
        navigate("/");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrors(prev => ({
        ...prev,
        general: "An error occurred during login. Please try again."
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  return (
    <div className="signup">
      <div className="signup_card">
        <p className="signup_card-header">Login</p>
        <Link to="/" className="backToHome">
          <IoChevronBackOutline /> Back to home
        </Link>
        <form onSubmit={handleSubmit} className="signup_form">
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
          
          {errors.general && (
            <div className="error-message general">{errors.general}</div>
          )}
          
          <button type="submit">Login</button>
          
          <p className="signup_form-footer">
            Not a user?
            <span>
              <Link to="/signup">&nbsp;Signup</Link>
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}