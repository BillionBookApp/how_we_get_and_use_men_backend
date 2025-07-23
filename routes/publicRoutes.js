// routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const AdminSettings = require('../models/AdminSettings');

router.get('/settings', async (req, res) => {
  const settings = await AdminSettings.findOne();
  if (!settings) {
    return res.status(404).json({ message: 'Settings not found' });
  }

  res.json({
    bookPriceUSD: settings.bookPriceUSD,
    referralPercentage: settings.referralPercentage,
  });
});

module.exports = router;
