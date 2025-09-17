const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizePermission } = require('../middleware/authorizationMiddleware');
const { validate } = require('../utils/validation');

// All role routes require authentication and admin permissions
router.use(authenticate);

// Role management routes
router.get('/', 
  authorizePermission('roles', 'read'),
  roleController.getAllRoles
);

router.get('/:id', 
  authorizePermission('roles', 'read'),
  roleController.getRoleById
);

router.post('/', 
  authorizePermission('roles', 'create'),
  validate(require('../utils/validation').createRoleSchema),
  roleController.createRole
);

router.put('/:id', 
  authorizePermission('roles', 'update'),
  validate(require('../utils/validation').updateRoleSchema),
  roleController.updateRole
);

router.delete('/:id', 
  authorizePermission('roles', 'delete'),
  roleController.deleteRole
);

// Role assignment routes
router.post('/assign', 
  authorizePermission('roles', 'update'),
  validate(require('../utils/validation').assignRoleSchema),
  roleController.assignRole
);

router.delete('/remove', 
  authorizePermission('roles', 'update'),
  validate(require('../utils/validation').assignRoleSchema),
  roleController.removeRole
);

// Permission routes
router.get('/permissions/all', 
  authorizePermission('roles', 'read'),
  roleController.getAllPermissions
);

router.get('/permissions/check', 
  roleController.checkPermission
);

router.get('/permissions/user', 
  roleController.getUserPermissions
);

module.exports = router;
