// app.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
// Middlewares
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/book', require('./routes/bookRoutes'));
app.use('/api/video', require('./routes/videoRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/location', require('./routes/locationRoutes'));
// Add this after other routes
app.use('/api/community', require('./routes/communityRoutes')); // ✅ Community route
app.use('/api/admin', require('./routes/adminRoutes')); // ✅ Admin route



module.exports = app;
