import React from "react";
import { useCart, useDispatchCart } from "../components/ContextReducer";
import Navigationbar from "../components/Navigationbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import { TbShoppingCartQuestion } from "react-icons/tb";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles
import { loadStripe } from "@stripe/stripe-js";

export default function Cart() {
  let data = useCart();
  // console.log(data);
  let dispatch = useDispatchCart();

  let totalPrice = data.reduce((total, service) => {
    let price = parseFloat(service.price);
    return total + (isNaN(price) ? 0 : price);
  }, 0);

  let discount = 0.2 * totalPrice;

  let finalPrice = totalPrice - discount;

  // Toast notification function
  const showToast = (serviceName) => {
    toast(`${serviceName} has been added to the cart!`);
  };

  const makePayment = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData) {
        console.error("No user data found in localStorage");
        return;
      }
  
      const userEmail = userData.email;
      const order_data = data; // Pass the cart data as order_data
  
      const body = {
        products: data,
        customerDetails: userData,
        email: userEmail,
        order_data, // Add order_data to the body
        order_date: new Date().toDateString(),
        finalPrice: finalPrice,
      };
      
      const response = await fetch(`${window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://dwaarper.onrender.com'}/api/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to create checkout session! Status: ${response.status}`);
      }
  
      const session = await response.json();
      const stripe = await loadStripe("pk_test_51MgU4YSCZDwYFEVOL78hnRImX4fndMO5GO8JTI0IVJxGivngE2azshTFLlPXewd3sckyAioyIpW5ovWVROVa4jqA00TL5cC618");
  
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });
  
      if (result.error) {
        console.error(result.error.message);
      }
    } catch (error) {
      console.error("Error during the payment process:", error);
    }
  };
  
  

  return (
    <>
      <Navigationbar />
      <ToastContainer draggable transition={Slide} autoClose={1500} />
      {data.length === 0 ? (
        <>
          <div className="emptyCart">
            <div className="emptyCart_card">
              <TbShoppingCartQuestion className="emptyCart_card-logo" />
              <p>Your cart is currently empty.</p>
              <Link to="/">Browse services</Link>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="discount">
            <p>Got it! We've got you covered. A <strong>20%</strong> discount has already been applied to your
            cart.</p>
          </div>
          <div className="cart">
            <div className="cart_items">
              <p className="cart_header">Cart</p>
              <Link to="/" className="backToHome">
                <IoChevronBackOutline /> Back to home
              </Link>
              {data.map((service, index) => (
                <div className="cart_items-item" key={index}>
                  <img
                    className="cart_items-img"
                    src={service.img}
                    alt={service.name}
                  />
                  <div className="cart_items-details">
                    <div>
                      <p className="cart_items-name">{service.name}</p>
                      <p className="cart_items-service">{service.service}</p>
                    </div>
                    <button
                      className="cart_items-remove"
                      onClick={() => {
                        dispatch({ type: "REMOVE", index: index });
                        showToast(service.name);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="cart_items-amount">
                    <p>₹{service.price}/-</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart_summary">
              <p className="cart_header">Summary</p>
              <div className="cart_summaryItems">
                <div className="cart_summaryItem">
                  <span>Total Price</span>
                  <span className="cart_summary-price">
                    ₹{totalPrice.toFixed(2)}/-
                  </span>
                  {/* <span>{totalPrice}</span> */}
                </div>
                <div className="cart_summaryItem">
                  <span>Discount</span>
                  <span className="cart_summary-price">20%</span>
                </div>
                <hr />
                <div className="cart_summaryItem">
                  <span>Final Price</span>
                  <span className="cart_summary-price">
                    ₹{finalPrice.toFixed(2)}/-
                  </span>
                  {/* <span>{totalPrice}</span> */}
                </div>
              </div>
              <button className="cart_checkout" onClick={makePayment}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}

      {/* <Footer /> */}
    </>
  );
}
