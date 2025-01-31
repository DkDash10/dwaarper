import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { TbShoppingCartX } from "react-icons/tb";

const Cancel = () => {
  const [searchParams] = useSearchParams();
  const [cancelStatus, setCancelStatus] = useState({ loading: true, error: null });
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      cancelOrder(sessionId);
    }
  }, [sessionId]);

  const cancelOrder = async (sessionId) => {
    try {
      setCancelStatus({ loading: true, error: null });
      
      const userDataString = localStorage.getItem("userData");
      if (!userDataString) {
        throw new Error("User data not found");
      }

      const userData = JSON.parse(userDataString);
      const email = userData?.email;
      
      if (!email) {
        throw new Error("User email not found");
      }

      const response = await fetch("http://localhost:5000/api/cancel-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }

      setCancelStatus({ loading: false, error: null });
      
      // Clear cart data from localStorage
      localStorage.removeItem("cart");
      
    } catch (error) {
      console.error("Error canceling order:", error);
      setCancelStatus({ loading: false, error: error.message });
    }
  };

  return (
    <div className="cancel">
      <div className="cancel_card">
        <TbShoppingCartX className="cancel_card-logo" />
        <div>
          {cancelStatus.loading ? (
            <p className="cancel_card-text">Processing cancellation...</p>
          ) : cancelStatus.error ? (
            <p className="cancel_card-text">Error: {cancelStatus.error}</p>
          ) : (
            <>
              <p className="cancel_card-text">Payment Canceled</p>
              <p>Your order has been canceled successfully.</p>
            </>
          )}
        </div>
        <Link to="/cart" className="button">Back to Cart</Link>
      </div>
    </div>
  );
};

export default Cancel;
