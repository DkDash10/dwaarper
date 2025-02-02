import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Slide } from "react-toastify";
import { useDispatchCart } from "../components/ContextReducer";
import { TbShoppingCartCheck } from "react-icons/tb";

const Success = () => {
  const navigate = useNavigate();
  let dispatch = useDispatchCart();

  useEffect(() => {
    const confirmPayment = async () => {
      const sessionId = new URLSearchParams(window.location.search).get('session_id');
      console.log(sessionId);
      const userData = JSON.parse(localStorage.getItem("userData")); // Get stored user data
    
      if (!sessionId || !userData) {
        console.error("Missing sessionId or userData");
        toast.error("Payment verification failed. Missing sessionId or userData.");
        return;
      }
      const orderData = JSON.parse(localStorage.getItem("cartData"));
      console.log("Order Data:", orderData);
      const requestBody = {
        sessionId,
        email: userData.email, // Include email from user data
        order_data: orderData, // Include cart/order data
      };
    
      console.log("Request Body to /verify-payment:", requestBody); // Debug the request body
    
      try {
        const response = await fetch(`${window.location.hostname === 'localhost' 
          ? 'http://localhost:5000' 
          : 'https://dwaarper.onrender.com'}/api/verify-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
    
        if (response.ok) {
          const result = await response.json();
          console.log("Payment Verified:", result);
          dispatch({ type: "DROP" }); // Clear the cart
          toast.success('Payment verified and order placed successfully!');
          navigate('/');
        } else {
          const error = await response.json();
          console.error("Verification Error:", error);
          toast.error(error.error || 'Payment verification failed.');
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error('Error verifying payment.');
      }
    };
    
    confirmPayment();
  }, [dispatch, navigate]);

  return (
    <>
      <ToastContainer draggable transition={Slide} autoClose={1500} />
      <div className="success">
        <div className="success_card">
          <TbShoppingCartCheck className="success_card-logo" />
          <div>
            <p className="success_card-text">Payment Successful!</p>
            <p>Your service order has been successfully placed.</p>
          </div>
          {/* <Link to="/">Browse services</Link> */}
        </div>
      </div>
    </>
  );
};

export default Success;
