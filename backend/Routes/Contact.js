const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');

router.post(
    '/contact',
    [
        body('name')
            .isLength({ min: 2 })
            .withMessage('Name must be at least 2 characters long')
            .trim(),
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email address')
            .normalizeEmail(),
        body('subject')
            .isLength({ min: 3 })
            .withMessage('Subject must be at least 3 characters long')
            .trim(),
        body('message')
            .isLength({ min: 10 })
            .withMessage('Message must be at least 10 characters long')
            .trim()
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        try {
            // Create new contact submission
            const contact = new Contact({
                name: req.body.name,
                email: req.body.email,
                subject: req.body.subject,
                message: req.body.message
            });

            // Save to database
            await contact.save();

            res.json({
                success: true,
                message: 'Your message has been sent successfully!'
            });
        } catch (error) {
            console.error('Error saving contact submission:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while processing your request'
            });
        }
    }
);

module.exports = router;