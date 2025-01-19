const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

router.post('/createuser', [
    body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('location').isLength({ min: 3 }).withMessage('Location must be at least 3 characters long'),
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
    ],
    async (req, res) => {  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {
       await User.create({
            name: req.body.name,
            location: req.body.location,
            email: req.body.email,
            password: req.body.password
        });
        res.json({success:true});
    } catch (error) {
        console.error('Error while creating user:', error);
        res.json({success:false});
    }
})

module.exports = router;