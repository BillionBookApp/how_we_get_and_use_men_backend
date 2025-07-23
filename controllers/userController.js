const axios = require('axios');
const User = require('../models/User');
const PayoutRequest = require('../models/PayoutRequest');


// @desc    Get complete user profile including wallet and referral info
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,

      // 🧠 Tribe Queen Code Info
      referralCode: user.referralCode,
      totalReferrals: user.referrals?.length || 0,
      referrals: user.referrals || [],

      // 💰 Wallet Info
      tribeQueenWallet: {
        balance: user.tribeQueenWallet?.balance || 0,
        earnings: user.tribeQueenWallet?.earnings || [],
      },

      // 🔓 Book Access Info
      hasAccess: user.hasAccess || false,

      // 📅 Date Joined (optional)
      createdAt: user.createdAt,

      // 🏦 Bank Info
      bankDetails: user.bankDetails || null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 👑 Request payout
const requestPayout = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!user.bankDetails?.accountNumber)
      return res.status(400).json({ message: 'Please add bank details first.' });

    const balance = user.tribeQueenWallet?.balance || 0;
    if (amount > balance)
      return res.status(400).json({ message: 'Insufficient balance.' });

    // Deduct and save
    user.tribeQueenWallet.balance -= amount;
    await user.save();

    // ✅ Create payout request for admin
    const request = new PayoutRequest({
      user: user._id,
      amount,
      bankDetailsSnapshot: user.bankDetails,
    });

    await request.save();

    res.json({ message: 'Payout requested successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Payout request failed.', error: err.message });
  }
};

// 👑 Add or update bank details
const updateBankDetails = async (req, res) => {
  try {
    const { accountName, accountNumber, bankName, bankCode } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.bankDetails = { accountName, accountNumber, bankName, bankCode };
    await user.save();

    res.json({ message: 'Bank details updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update bank details.', error: err.message });
  }
};

// 🌍 Get banks by country (Flutterwave)
const getBanksByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const flutterwaveKey = process.env.FLW_SECRET_KEY;

    const response = await axios.get(`https://api.flutterwave.com/v3/banks/${country}`, {
      headers: {
        Authorization: `Bearer ${flutterwaveKey}`,
      },
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch banks.', error: err.message });
  }
};

// 🧠 Resolve account name
const resolveAccountName = async (req, res) => {
  try {
    const { account_number, account_bank } = req.body;
    const flutterwaveKey = process.env.FLW_SECRET_KEY;

    const response = await axios.post(
      'https://api.flutterwave.com/v3/accounts/resolve',
      { account_number, account_bank },
      {
        headers: {
          Authorization: `Bearer ${flutterwaveKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to resolve account name.',
      error: err.response?.data?.message || err.message,
    });
  }
};

module.exports = {
  getProfile,
  requestPayout,
  updateBankDetails,
  getBanksByCountry,
  resolveAccountName,
};
