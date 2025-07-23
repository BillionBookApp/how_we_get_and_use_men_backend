const express = require('express');
const router = express.Router();
const adminSettingsController = require('../controllers/adminSettingsController');
const adminOnly = require('../middlewares/adminMiddleware');
const protect = require('../middlewares/authMiddleware');

// These should be protected by isAdmin middleware
router.get('/settings', protect, adminOnly, adminSettingsController.getAdminSettings);
router.put('/settings', protect, adminOnly, adminSettingsController.updateAdminSettings);

// Payouts
router.get('/payouts', protect, adminOnly, adminSettingsController.getAllPayoutRequests);
router.post('/payouts/:id/approve', protect, adminOnly, adminSettingsController.approvePayoutRequest);
router.post('/payouts/:id/reject', protect, adminOnly, adminSettingsController.rejectPayoutRequest);

module.exports = router;
