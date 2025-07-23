const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Allow only alphanumeric usernames (3 to 20 characters)
const isValidUsername = (username) => /^[a-zA-Z0-9_]{3,20}$/.test(username);

// Utility: Generate a referral code (Tribe Queen Code)
const generateReferralCode = (username) => {
  const suffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `QUEEN-${username.toUpperCase()}${suffix}`;
};

const register = async (req, res) => {
  try {
    console.log("Incoming data:", req.body);

    const { username, password, email, referralCode: usedReferralCode } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Username, password, and email are required.' });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({ message: 'Username must be 3-20 characters, letters, numbers or underscores only.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken.' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    // 💡 Generate Tribe Queen Code
    const referralCode = generateReferralCode(username);

    // ✨ Set up initial Tribe Queen wallet
    const tribeQueenWallet = {
      balance: 0,
      earnings: [],
    };

    // 🧠 Prepare user payload
    const newUserData = {
      username,
      email,
      password: hashed,
      referralCode,
      tribeQueenWallet,
    };

    // 📌 Check for referrer
    if (usedReferralCode) {
      const referrer = await User.findOne({ referralCode: usedReferralCode });
      if (referrer) {
        newUserData.referredBy = usedReferralCode;
        referrer.referrals.push(username); // or user._id
        await referrer.save();
      }
    }

    const user = await User.create(newUserData);
    console.log("User registered:", user);

    res.status(201).json({ message: 'Registered successfully.' });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username.toLowerCase().trim(); // 💡 normalize input

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Incorrect password.' });

    // ✅ Include role in JWT payload (optional but useful)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // ✅ Return role to frontend for navigation
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
};


module.exports = {
  register,
  login
};
