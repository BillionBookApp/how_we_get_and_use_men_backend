const express = require('express');
const router = express.Router();
const {
  verifyPaymentAndUnlockBook,
  initiateFlutterwavePayment,
} = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

// 👇 Initiate payment
router.post('/initiate', authMiddleware, initiateFlutterwavePayment);

// 👇 Verify and unlock book
router.post('/verify', authMiddleware, verifyPaymentAndUnlockBook);

module.exports = router;
