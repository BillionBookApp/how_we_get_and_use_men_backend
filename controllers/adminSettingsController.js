const AdminSettings = require('../models/AdminSettings');
const PayoutRequest = require('../models/PayoutRequest');
const User = require('../models/User');

// ✅ Get current admin settings
exports.getAdminSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = await AdminSettings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// ✅ Update admin settings
exports.updateAdminSettings = async (req, res) => {
  try {
    const { bookPriceUSD, referralPercentage } = req.body;

    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = new AdminSettings();
    }

    if (bookPriceUSD !== undefined) settings.bookPriceUSD = bookPriceUSD;
    if (referralPercentage !== undefined) settings.referralPercentage = referralPercentage;

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

//
// 🧾 ADMIN PAYOUT MANAGEMENT
//

// ✅ Get all payout requests (optionally filter by status)
exports.getAllPayoutRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const query = status ? { status } : {};
    const requests = await PayoutRequest.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payout requests' });
  }
};

// ✅ Approve a payout request
exports.approvePayoutRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await PayoutRequest.findById(requestId).populate('user');

    if (!request) {
      return res.status(404).json({ message: 'Payout request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Payout has already been processed' });
    }

    request.status = 'approved';
    request.processedAt = new Date();
    await request.save();

    res.json({ message: 'Payout approved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve payout' });
  }
};

// ✅ Reject a payout request with reason
exports.rejectPayoutRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { reason } = req.body;

    const request = await PayoutRequest.findById(requestId).populate('user');
    if (!request) {
      return res.status(404).json({ message: 'Payout request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Payout has already been processed' });
    }

    // Refund the user
    const user = request.user;
    user.tribeQueenWallet.balance += request.amount;
    await user.save();

    // Update request status
    request.status = 'rejected';
    request.reason = reason || 'No reason provided';
    request.processedAt = new Date();
    await request.save();

    res.json({ message: 'Payout rejected and refunded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject payout' });
  }
};
