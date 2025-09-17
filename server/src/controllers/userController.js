const userService = require('../services/userService');
const { asyncHandler } = require('../utils/errors');

class UserController {
  // @desc    Get user profile
  // @route   GET /api/users/profile
  // @access  Private
  getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user.id);
    
    res.json({
      success: true,
      data: user
    });
  });

  // @desc    Update user profile
  // @route   PUT /api/users/profile
  // @access  Private
  updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.body);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  });

  // @desc    Delete user account
  // @route   DELETE /api/users/profile
  // @access  Private
  deleteAccount = asyncHandler(async (req, res) => {
    await userService.deleteAccount(req.user.id);
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  });

  // @desc    Get all users (Admin only)
  // @route   GET /api/users
  // @access  Private/Admin
  getAllUsers = asyncHandler(async (req, res) => {
    const result = await userService.getAllUsers(req.query);
    
    res.json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  });

  // @desc    Get user by ID (Admin only)
  // @route   GET /api/users/:id
  // @access  Private/Admin
  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    
    res.json({
      success: true,
      data: user
    });
  });

  // @desc    Update user by ID (Admin only)
  // @route   PUT /api/users/:id
  // @access  Private/Admin
  updateUser = asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  });

  // @desc    Delete user by ID (Admin only)
  // @route   DELETE /api/users/:id
  // @access  Private/Admin
  deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  });

  // @desc    Get user sessions
  // @route   GET /api/users/sessions
  // @access  Private
  getUserSessions = asyncHandler(async (req, res) => {
    const sessions = await userService.getUserSessions(req.user.id);
    
    res.json({
      success: true,
      data: sessions
    });
  });

  // @desc    Revoke user session
  // @route   DELETE /api/users/sessions/:sessionId
  // @access  Private
  revokeSession = asyncHandler(async (req, res) => {
    await userService.revokeSession(req.params.sessionId, req.user.id);
    
    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
  });
}

module.exports = new UserController();
