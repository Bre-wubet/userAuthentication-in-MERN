const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { authLimiter, passwordResetLimiter, registrationLimiter } = require('../middleware/rateLimitMiddleware');
const { validate } = require('../utils/validation');

// Public routes
router.post('/register', 
  registrationLimiter,
  validate(require('../utils/validation').registerSchema),
  authController.register
);

router.post('/login', 
  authLimiter,
  validate(require('../utils/validation').loginSchema),
  authController.login
);

router.post('/refresh', 
  authController.refreshToken
);

router.post('/forgot-password', 
  passwordResetLimiter,
  validate(require('../utils/validation').forgotPasswordSchema),
  authController.forgotPassword
);

router.post('/reset-password', 
  passwordResetLimiter,
  validate(require('../utils/validation').resetPasswordSchema),
  authController.resetPassword
);

// Protected routes
router.post('/logout', 
  authenticate,
  authController.logout
);

router.post('/change-password', 
  authenticate,
  validate(require('../utils/validation').changePasswordSchema),
  authController.changePassword
);

router.get('/me', 
  authenticate,
  authController.getMe
);

module.exports = router;
