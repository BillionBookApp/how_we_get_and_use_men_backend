const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const protect = require('../middlewares/authMiddleware');

router.get('/profile', protect, userController.getProfile);

// 🧠 Wallet + Tribe Queen features
router.post('/wallet/request-payout', protect, userController.requestPayout);
router.post('/wallet/bank-details', protect, userController.updateBankDetails);
router.get('/wallet/banks/:country', userController.getBanksByCountry);
router.post('/wallet/resolve-account', userController.resolveAccountName);

module.exports = router;
