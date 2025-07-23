// middlewares/adminMiddleware.js

module.exports = function (req, res, next) {
  // Ensure the authMiddleware ran and attached user
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Check for admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  next();
};
