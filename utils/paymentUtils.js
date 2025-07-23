const axios = require('axios');
const User = require('../models/User');

const FLUTTERWAVE_SECRET = process.env.FLW_SECRET_KEY;

// @desc    Verify payment with Flutterwave
// @param   transactionId
// @return  boolean success
const verifyFlutterwavePayment = async (transactionId) => {
  try {
    const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      headers: {
        Authorization: `Bearer ${FLUTTERWAVE_SECRET}`,
      },
    });

    const data = response.data;
    return data.status === 'success' && data.data.status === 'successful';
  } catch (err) {
    console.error('Payment verification failed:', err.message);
    return false;
  }
};

// @desc    Unlock book for user after payment
// @param   userId
// @return  updated user
const unlockBookForUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Unlock book for the buyer
  user.hasAccess = true;
  await user.save();

  // 🚨 Step 1: Check if user was referred
  if (user.referredBy) {
    // 🔍 Step 2: Get referrer user by referralCode
    const referrer = await User.findOne({ referralCode: user.referredBy });

    if (referrer) {
      // 🔢 Step 3: Fetch referral percentage from admin settings
      const settings = await AdminSettings.findOne();
      const percentage = settings?.referralPercentage || 0.3; // fallback 30%

      // 💵 Step 4: Use book price from settings to calculate amount
      const bookPrice = settings?.bookPriceUSD || 3.5;
      const earningAmount = parseFloat((percentage * bookPrice).toFixed(2));

      // 💰 Step 5: Update referrer’s wallet
      referrer.tribeQueenWallet.balance += earningAmount;
      referrer.tribeQueenWallet.earnings.push({
        from: user.username || user.email || 'unknown',
        amount: earningAmount,
        note: 'Referral earning from book unlock',
      });

      await referrer.save();
    }
  }

  return user;
};


module.exports = {
  verifyFlutterwavePayment,
  unlockBookForUser,
};
