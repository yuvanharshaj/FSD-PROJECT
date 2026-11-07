const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateChangePassword
} = require('../middleware/validators');

const router = express.Router();

// Stricter rate limiter specifically for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // Limit to 30 login/register attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

// Route: Register new user
router.post('/register', authLimiter, validateRegister, register);

// Route: User login
router.post('/login', authLimiter, validateLogin, login);

// Route: Get current user profile
router.get('/me', authenticate, getMe);

// Route: Update user profile
router.put('/profile', authenticate, validateProfileUpdate, updateProfile);

// Route: Change password
router.put('/password', authenticate, validateChangePassword, changePassword);

module.exports = router;
