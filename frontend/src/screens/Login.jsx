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

    let navigate = useNavigate();

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const response = await fetch("http://localhost:5000/api/loginuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });
      const data = await response.json();
      console.log(data);
      if (!data.success) {
        alert("Enter valid details");
      }
      const { password, ...userData } = credentials;

      if (data.success) {
        localStorage.setItem("userData", JSON.stringify(userData))
        localStorage.setItem("authToken", data.authToken)
        navigate("/");
      }
    };
  
    const handleChange = (e) => {
      setCredentials({
        ...credentials,
        [e.target.name]: e.target.value,
      });
    };
  return (
    <div className="signup">
          <div className="signup_card">
            <p className="signup_card-header">Login</p>
            <Link to="/" className="backToHome"><IoChevronBackOutline /> Back to home</Link>
            <form action="" onSubmit={handleSubmit} className="signup_form">
              <div className="signup_form-field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                />
              </div>
              <div className="signup_form-field">
                <label htmlFor="password">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                />
                <button type="button" onClick={togglePasswordVisibility}>
                  {showPassword ? (
                    <GrHide className="signup_form-icons" />
                  ) : (
                    <BiShow className="signup_form-icons" />
                  )}
                </button>
              </div>
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
  )
}
