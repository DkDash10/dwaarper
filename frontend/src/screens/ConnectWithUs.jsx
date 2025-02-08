import { useState } from "react";
import Navigationbar from "../components/Navigationbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { MdDone } from "react-icons/md";

export default function ConnectWithUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.length < 2
          ? "Name must be at least 2 characters long"
          : "";
      case "email":
        return !/\S+@\S+\.\S+/.test(value)
          ? "Please enter a valid email address"
          : "";
      case "subject":
        return value.length < 3
          ? "Subject must be at least 3 characters long"
          : "";
      case "message":
        return value.length < 10
          ? "Message must be at least 10 characters long"
          : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      newErrors[field] = validateField(field, formData[field]);
    });

    if (Object.values(newErrors).some((error) => error !== "")) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch(`${window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://dwaarper.onrender.com'}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        setSubmitError("");
      } else {
        setSubmitError(
          data.message || "Something went wrong. Please try again."
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError("An error occurred. Please try again later.");
    }
  };

  return (
    <>
      <Navigationbar />
      <div className="connectWithUs">
        <section className="whyChooseUs_banner">
          <p className="whyChooseUs_banner-title">Connect With Us</p>
          <p className="whyChooseUs_banner-desc">We believe in delivering top-notch home services with reliability and excellence. Whether you need cleaning, pest control, repairs, or home improvement solutions, our expert team is always ready to assist you. If you have any issue or have question please send us the response on the below form.</p>
        </section>
        <section className="connectWithUs_main">
          <div className="contactUs_form-container">
            {isSubmitted ? (
              <div className="success_message">
                <MdDone className="success_message-icons" />
                <p className="success_message-title">
                  Thank you for your message!
                </p>
                <p className="success_message-desc">
                  We have received your inquiry and will get back to you soon.
                  <br />
                  Our team typically responds within 24-48 business hours.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      subject: "",
                      message: "",
                    });
                  }}
                  className="contactUs_form-btn"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contactUs_form">
                <div className="contactUs_form-field">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? "error" : ""}
                  />
                  {errors.name && (
                    <span className="error-message">{errors.name}</span>
                  )}
                </div>

                <div className="contactUs_form-field">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "error" : ""}
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                <div className="contactUs_form-field">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={errors.subject ? "error" : ""}
                  />
                  {errors.subject && (
                    <span className="error-message">{errors.subject}</span>
                  )}
                </div>

                <div className="contactUs_form-field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={errors.message ? "error" : ""}
                    rows="5"
                  />
                  {errors.message && (
                    <span className="error-message">{errors.message}</span>
                  )}
                </div>

                {submitError && (
                  <div className="error-message">{submitError}</div>
                )}

                <button type="submit" className="contactUs_form-btn">Submit</button>
              </form>
            )}
          </div>
        </section>

        <section className="whyChooseUs_bs">
          <p className="whyChooseUs_bs-title">Browse Our Services</p>
          <p className="whyChooseUs_bs-desc">
            Explore our range of services and find the perfect solution for your
            needs.
          </p>
          <button className="whyChooseUs_bs-btn">
            <Link to="/">Explore Now</Link>
          </button>
        </section>
      </div>
      <Footer />
    </>
  );
}
