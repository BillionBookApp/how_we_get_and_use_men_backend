const axios = require('axios');
const { verifyFlutterwavePayment, unlockBookForUser } = require('../utils/paymentUtils');

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;


// ✅ Verify Payment & Unlock Book
exports.verifyPaymentAndUnlockBook = async (req, res) => {
  const { transactionId } = req.body;
  const userId = req.user.id;

  if (!transactionId) {
    return res.status(400).json({ message: 'Transaction ID is required.' });
  }

  try {
    const verified = await verifyFlutterwavePayment(transactionId);

    if (!verified) {
      return res.status(400).json({ message: 'Payment verification failed.' });
    }

    const updatedUser = await unlockBookForUser(userId);

    return res.status(200).json({
      message: 'Payment verified. Book unlocked.',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        hasAccess: updatedUser.hasAccess,
      },
    });
  } catch (err) {
    console.error('Payment verification error:', err.message);
    res.status(500).json({ message: 'Server error verifying payment.' });
  }
};

// ✅ Initiate Flutterwave Payment
exports.initiateFlutterwavePayment = async (req, res) => {
  const user = req.user;
  const { amount, currency } = req.body;

  // Validate user and essential fields
  if (!user || !user._id || !user.username) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  if (!amount || !currency) {
    return res.status(400).json({ message: 'Amount and currency are required.' });
  }

  const tx_ref = `TX-${user._id}-${Date.now()}`;
  console.log('🌍 Initiating payment with:', { amount, currency, username: user.username });

  try {
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref,
        amount,
        currency,
        redirect_url: 'https://howweusemen.com/payment-success',
        payment_options: 'card',
        currency_hint: currency,
        customer: {
          name: user.username,
          email: user.email || `${user.username}@example.com`, // fallback dummy email
        },
        customizations: {
          title: 'How We Get and Use Men',
          description: 'Unlock full book access',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paymentLink = response?.data?.data?.link;

    if (!paymentLink) {
      console.error('⚠️ Flutterwave response missing payment link:', response?.data);
      return res.status(500).json({ message: 'Failed to generate payment link.' });
    }

    return res.status(200).json({
      payment_link: paymentLink,
      tx_ref,
    });
  } catch (err) {
    console.error('💥 Flutterwave initiation error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Error initiating payment.' });
  }
};
