const express = require("express");
const router = express.Router();
const Order = require("../models/Orders");

router.post('/order-data', async (req, res) => {
    try {
        const { email, timeFilter } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const orderData = await Order.findOne({ email });
        
        if (!orderData || !orderData.order_data) {
            return res.json({ orderData: { order_data: [] } });
        }

        // Get all orders and flatten them for processing
        let allOrders = orderData.order_data.flatMap(orderArray => {
            const dateInfo = orderArray[0]; 
            if (!dateInfo) return [];
        
            return orderArray.slice(1).map(serviceInfo => ({
                date: dateInfo.Order_date,
                status: dateInfo.status || 'pending',
                orderId: dateInfo.id,
                ...serviceInfo
            }));
        });
        
        // Apply time filter
        if (timeFilter && timeFilter !== 'all') {
            const today = new Date();
            let filterDate = new Date();
        
            switch (timeFilter) {
                case 'month':
                    filterDate.setMonth(today.getMonth() - 1);
                    break;
                case '3months':
                    filterDate.setMonth(today.getMonth() - 3);
                    break;
                case '6months':
                    filterDate.setMonth(today.getMonth() - 6);
                    break;
                case 'year':
                    filterDate.setFullYear(today.getFullYear() - 1);
                    break;
            }
        
            allOrders = allOrders.filter(order => new Date(order.date) >= filterDate);
        }
        
        allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json({ 
            orderData: {
                email: orderData.email,
                order_data: allOrders
            }
        });
        

    } catch (error) {
        console.error("Error fetching order data:", error);
        res.status(500).json({ error: "Server Error", message: error.message });
    }
});

module.exports = router;