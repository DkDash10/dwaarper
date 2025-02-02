import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import NavigationBar from '../components/Navigationbar';
import Footer from '../components/Footer';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [timeFilter]); // Add timeFilter as dependency to refetch when it changes

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      if (!userData?.email) {
        throw new Error('User email not found');
      }

      const response = await fetch('http://localhost:5000/api/order-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userData.email,
          timeFilter: timeFilter 
        }),
      });

      const data = await response.json();
      
      if (data.orderData && data.orderData.order_data) {
        // Data is already processed in the backend, just set it directly
        setOrders(data.orderData.order_data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove the filterOrdersByDate function since filtering is now handled in the backend
  const filteredOrders = orders; // Just use orders directly
  filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));


  if (loading) return <div className="myOrder_loading">Loading orders...</div>;
  if (error) return <div className="myOrder_error">Error: {error}</div>;

  return (
    <>
      <NavigationBar />
      <div className="myOrders">
        <div className="myOrder_card">
          <div className="myOrder_card-header">
            <h2 className="myOrder_card-title">Order History</h2>
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
              className="myOrder_card-timeFilter"
            >
              <option value="all">All Orders</option>
              <option value="month">This Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="myOrder_card-content">
            <div className="myOrder_list">
              {filteredOrders.length === 0 ? (
                <div className="myOrder_noOrders">
                  No orders found
                </div>
              ) : (
                filteredOrders.map((order, index) => (
                  <div key={index} className="myOrder_item">
                    <img
                      src={order.img}
                      alt={order.name}
                      className="myOrder_image"
                    />
                    <div className="myOrder_details">
                      <div>
                        <p className="myOrder_name">{order.name}</p>
                        <p className="myOrder_service">{order.service}</p>
                      </div>
                      <div className="myOrder_date">
                        <Calendar className="calendar-icon" />
                        {order?.date ? new Date(order.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'No Date'}
                      </div>
                    </div>
                    <div className="myOrder_priceStatus">
                      <p className="myOrder_price">₹{order.price}</p>
                      <span className={`myOrder_status ${order.status === 'completed' ? 'status-completed' : 'status-pending'}`}>
                        {order.status === 'completed' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {/* <Footer/> */}
    </>
  );
};

export default OrderHistory;