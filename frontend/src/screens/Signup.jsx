import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { GrHide } from "react-icons/gr";
import { BiShow } from "react-icons/bi";
import { IoChevronBackOutline } from "react-icons/io5";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
  });
  let [address, setAddress] = useState("");
  let navigate = useNavigate()
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/createuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
        location: credentials.location,
      }),
    });
    const data = await response.json();
    console.log(data);
    if (!data.success) {
      alert("Enter valid details");
    }else{
      const { password, ...userData } = credentials;
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("authToken", data.authToken)
      navigate("/")
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
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
      console.log(lat, long); // Ensure coordinates are logged correctly
  
      // Now call your API with the correct latlong
      const response = await fetch("http://localhost:5000/api/getlocation", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ latlong: { lat, long } })
      });
  
      const {location}  = await response.json();
      console.log(location);
      setAddress(location);
      setCredentials({ ...credentials, location: location });
    } catch (error) {
      console.error('Error retrieving location:', error);
    }
  };
  

  return (
    <div className="signup">
      <div className="signup_card">
         <p className="signup_card-header">Create Account</p>
        <Link to="/" className="backToHome"><IoChevronBackOutline /> Back to home</Link>
        <form action="" onSubmit={handleSubmit} className="signup_form">
          <div className="signup_form-field">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={credentials.name}
              onChange={handleChange}
            />
          </div>
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
          <div className="signup_form-field">
            <label htmlFor="location">Location</label>
            <fieldset>
              <input
                type="text"
                id="location"
                name="location"
                value={address} // Display address fetched or typed by user
                onChange={(e) => {
                  setAddress(e.target.value); // Update visible address
                  setCredentials((prev) => ({ ...prev, location: e.target.value })); // Update credentials
                }}
              />
            </fieldset>
            <div className="m-3">
              <button type="button" onClick={handleClick} name="location" className=" btn btn-success">Click for current Location </button>
            </div>
          </div>
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
