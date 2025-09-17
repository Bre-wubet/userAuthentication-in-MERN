const roleService = require('../services/roleService');
const { asyncHandler } = require('../utils/errors');

class RoleController {
  // @desc    Get all roles
  // @route   GET /api/roles
  // @access  Private/Admin
  getAllRoles = asyncHandler(async (req, res) => {
    const roles = await roleService.getAllRoles();
    
    res.json({
      success: true,
      data: roles
    });
  });

  // @desc    Get role by ID
  // @route   GET /api/roles/:id
  // @access  Private/Admin
  getRoleById = asyncHandler(async (req, res) => {
    const role = await roleService.getRoleById(req.params.id);
    
    res.json({
      success: true,
      data: role
    });
  });

  // @desc    Create new role
  // @route   POST /api/roles
  // @access  Private/Admin
  createRole = asyncHandler(async (req, res) => {
    const role = await roleService.createRole(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  });

  // @desc    Update role
  // @route   PUT /api/roles/:id
  // @access  Private/Admin
  updateRole = asyncHandler(async (req, res) => {
    const role = await roleService.updateRole(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  });

  // @desc    Delete role
  // @route   DELETE /api/roles/:id
  // @access  Private/Admin
  deleteRole = asyncHandler(async (req, res) => {
    await roleService.deleteRole(req.params.id);
    
    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  });

  // @desc    Assign role to user
  // @route   POST /api/roles/assign
  // @access  Private/Admin
  assignRole = asyncHandler(async (req, res) => {
    const { userId, roleId } = req.body;
    
    await roleService.assignRole(userId, roleId);
    
    res.json({
      success: true,
      message: 'Role assigned successfully'
    });
  });

  // @desc    Remove role from user
  // @route   DELETE /api/roles/remove
  // @access  Private/Admin
  removeRole = asyncHandler(async (req, res) => {
    const { userId, roleId } = req.body;
    
    await roleService.removeRole(userId, roleId);
    
    res.json({
      success: true,
      message: 'Role removed successfully'
    });
  });

  // @desc    Get all permissions
  // @route   GET /api/permissions
  // @access  Private/Admin
  getAllPermissions = asyncHandler(async (req, res) => {
    const permissions = await roleService.getAllPermissions();
    
    res.json({
      success: true,
      data: permissions
    });
  });

  // @desc    Check user permission
  // @route   GET /api/permissions/check
  // @access  Private
  checkPermission = asyncHandler(async (req, res) => {
    const { resource, action } = req.query;
    
    if (!resource || !action) {
      return res.status(400).json({
        success: false,
        message: 'Resource and action are required'
      });
    }

    const hasPermission = await roleService.checkPermission(req.user.id, resource, action);
    
    res.json({
      success: true,
      data: { hasPermission }
    });
  });

  // @desc    Get user permissions
  // @route   GET /api/permissions/user
  // @access  Private
  getUserPermissions = asyncHandler(async (req, res) => {
    const permissions = await roleService.getUserPermissions(req.user.id);
    
    res.json({
      success: true,
      data: permissions
    });
  });
}

module.exports = new RoleController();
