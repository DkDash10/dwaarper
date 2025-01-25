const express= require('express');
const router = express.Router();
const Order = require('../models/Orders');

router.post('/orderData', async(req, res)=>{
    let data = req.body.order_data;
    let date = req.body.order_date;

    data = [{ Order_date: date }, ...data];
    let emailId = await Order.findOne({'email':req.body.email})
    if(emailId === null){
        try{
            await Order.create({
                email: req.body.email,
                order_data: [data]
            }).then(()=>{
                res.json({
                    success:true,
                })
            })
        }catch(error){
            res.status(500).send("Server Error: " + error.message);
        }
    }
    else{
        try{
            await Order.findOneAndUpdate({
                email: req.body.email
            },{
                $push:{
                    order_data: data
                }
            }).then(()=>{
                res.json({
                    success:true,
                })
            })
        }
        catch(error){
            res.status(500).send("Server Error: " + error.message);
        }
    }
})

module.exports = router;