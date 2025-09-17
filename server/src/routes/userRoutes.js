const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize, authorizePermission, authorizeSelfOrAdmin } = require('../middleware/authorizationMiddleware');
const { validate, validateQuery } = require('../utils/validation');

// Profile routes (user's own profile)
router.get('/profile', 
  authenticate,
  userController.getProfile
);

router.put('/profile', 
  authenticate,
  validate(require('../utils/validation').updateProfileSchema),
  userController.updateProfile
);

router.delete('/profile', 
  authenticate,
  userController.deleteAccount
);

// Session management
router.get('/sessions', 
  authenticate,
  userController.getUserSessions
);

router.delete('/sessions/:sessionId', 
  authenticate,
  userController.revokeSession
);

// Admin routes for user management
router.get('/', 
  authenticate,
  authorizePermission('users', 'read'),
  validateQuery(require('../utils/validation').paginationSchema),
  userController.getAllUsers
);

router.get('/:id', 
  authenticate,
  authorizeSelfOrAdmin(),
  userController.getUserById
);

router.put('/:id', 
  authenticate,
  authorizeSelfOrAdmin(),
  userController.updateUser
);

router.delete('/:id', 
  authenticate,
  authorizePermission('users', 'delete'),
  userController.deleteUser
);

module.exports = router;
