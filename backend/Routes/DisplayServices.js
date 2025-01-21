const express = require("express");
const router = express.Router();

router.post('/service_data', (req, res)=>{
    try{
        res.send([global.service_data, global.service_category])
    }catch(error){
        console.error(error.message)
        res.send("Server Error")
    }
})

module.exports = router;