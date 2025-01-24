import React from "react";
import { useCart, useDispatchCart } from "../components/ContextReducer";
import Navigationbar from "../components/Navigationbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import { TbShoppingCartQuestion } from "react-icons/tb";

export default function Cart() {
  let data = useCart();
  console.log(data[0]?.img);
  let dispatch = useDispatchCart();

  let totalPrice = data.reduce((total, service) => {
    let price = parseFloat(service.price);
    return total + (isNaN(price) ? 0 : price); 
  }, 0);

  let discount = 0.20 * totalPrice;

  let finalPrice = totalPrice - discount;

  return (
    <>
      <Navigationbar />
      {data.length === 0 ? (
        <>
          <div className="emptyCart">
            <div className="emptyCart_card">
              <TbShoppingCartQuestion className="emptyCart_card-logo" />
              <p>Your cart is currently empty.</p>
              <Link to="/">Browse Services</Link>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="discount">
            <p>Got it! We've got you covered.&nbsp;</p>
            <p>
              A <strong>20%</strong> discount has already been applied to your
              cart.
            </p>
          </div>
          <div className="cart">
            <div className="cart_items">
              <Link to="/" className="backToHome">
                <IoChevronBackOutline /> Back to home
              </Link>
              <p className="cart_header">Cart</p>
              {data.map((service, index) => (
                <div className="cart_items-item" key={index}>
                  <img
                    className="cart_items-img"
                    src={service.img}
                    alt={service.name}
                  />
                  <div className="cart_items-details">
                    <p className="cart_items-name">{service.name}</p>
                    <p className="cart_items-service">{service.service}</p>
                    <button
                      className="cart_items-remove"
                      onClick={() => {
                        dispatch({ type: "REMOVE", index: index });
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
                  <span className="cart_summary-price">₹{totalPrice.toFixed(2)}/-</span>
                  {/* <span>{totalPrice}</span> */}
                </div>
                <div className="cart_summaryItem">
                  <span>Discount</span>
                  <span className="cart_summary-price">20%</span>
                </div>
                <hr />
                <div className="cart_summaryItem">
                  <span>Final Price</span>
                  <span className="cart_summary-price">₹{finalPrice.toFixed(2)}/-</span>
                  {/* <span>{totalPrice}</span> */}
                </div>
              </div>
              <button className="cart_checkout">Proceed to Checkout</button>
            </div>
          </div>
        </>
      )}

      <Footer />
    </>
  );
}
