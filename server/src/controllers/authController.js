const authService = require('../services/authService');
const { asyncHandler } = require('../utils/errors');

class AuthController {
  // @desc    Register a new user
  // @route   POST /api/auth/register
  // @access  Public
  register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  });

  // @desc    Login user
  // @route   POST /api/auth/login
  // @access  Public
  login = asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  });

  // @desc    Logout user
  // @route   POST /api/auth/logout
  // @access  Private
  logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    await authService.logout(req.user.id, refreshToken);
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });

  // @desc    Refresh access token
  // @route   POST /api/auth/refresh
  // @access  Public
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const result = await authService.refreshToken(refreshToken);
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: result
    });
  });

  // @desc    Forgot password
  // @route   POST /api/auth/forgot-password
  // @access  Public
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    await authService.forgotPassword(email);
    
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  });

  // @desc    Reset password
  // @route   POST /api/auth/reset-password
  // @access  Public
  resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    
    await authService.resetPassword(token, password);
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  });

  // @desc    Change password
  // @route   POST /api/auth/change-password
  // @access  Private
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    await authService.changePassword(req.user.id, { currentPassword, newPassword });
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  });

  // @desc    Get current user
  // @route   GET /api/auth/me
  // @access  Private
  getMe = asyncHandler(async (req, res) => {
    const userService = require('../services/userService');
    const user = await userService.getProfile(req.user.id);
    
    res.json({
      success: true,
      data: user
    });
  });
}

module.exports = new AuthController();
