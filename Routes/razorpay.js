const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { initPayment, validatePayment } = require('../Controllers/Razorpay/RazorpayFunctions');

const router = express.Router();

// Route to create an order
router.post('/create-order', initPayment);

// Route to verify payment
router.post('/verify-payment',validatePayment);

module.exports = router;