const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔐 Incoming Authorization Header:", authHeader); // Log the full header

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("❌ No or malformed Authorization header");
    return res.status(401).json({ message: 'Authorization token missing or invalid.' });
  }

  const token = authHeader.split(' ')[1];
  console.log("🔑 Extracted Token:", token); // Log the token only

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded JWT:", decoded); // Log decoded token content

    // Try fetching user
    const user = await User.findById(decoded.id).select('-password');
    console.log("📌 Mongoose fetched user:", user); // Key debug: show what Mongoose returned

    if (!user) {
      console.log("❌ User not found for decoded ID:", decoded.id);
      return res.status(404).json({ message: 'User not found.' });
    }

    console.log("👤 Authenticated user:", user?.email || user?.username || 'No email or username');
    req.user = user;
    next();
  } catch (err) {
    console.log("❌ JWT verification error:", err.message);
    res.status(401).json({ message: 'Token verification failed.', error: err.message });
  }
};

module.exports = protect;
