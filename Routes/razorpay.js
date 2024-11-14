const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { initPayment, validatePayment, verifyPaymentStatus } = require('../Controllers/Razorpay/RazorpayFunctions');

const router = express.Router();

// Route to create an order
router.post('/create-order', initPayment);

// Route to verify payment
router.post('/verify-payment',validatePayment);

router.post("/verify-status", verifyPaymentStatus);

module.exports = router;