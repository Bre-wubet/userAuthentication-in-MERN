const { AuthorizationError } = require('../utils/errors');
const roleService = require('../services/roleService');

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required'));
    }

    if (!roles.includes(req.user.roles[0])) {
      return next(new AuthorizationError(`Role ${req.user.roles[0]} is not authorized`));
    }

    next();
  };
};

// Permission-based authorization middleware
const authorizePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AuthorizationError('Authentication required'));
      }

      const hasPermission = await roleService.checkPermission(req.user.id, resource, action);
      
      if (!hasPermission) {
        return next(new AuthorizationError(`Permission denied for ${action} on ${resource}`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Multiple permissions authorization (user needs ALL permissions)
const authorizePermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AuthorizationError('Authentication required'));
      }

      const userPermissions = await roleService.getUserPermissions(req.user.id);
      const userPermissionNames = userPermissions.map(p => p.name);

      const hasAllPermissions = permissions.every(permission => 
        userPermissionNames.includes(permission)
      );

      if (!hasAllPermissions) {
        return next(new AuthorizationError('Insufficient permissions'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Any permission authorization (user needs ANY of the permissions)
const authorizeAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AuthorizationError('Authentication required'));
      }

      const userPermissions = await roleService.getUserPermissions(req.user.id);
      const userPermissionNames = userPermissions.map(p => p.name);

      const hasAnyPermission = permissions.some(permission => 
        userPermissionNames.includes(permission)
      );

      if (!hasAnyPermission) {
        return next(new AuthorizationError('Insufficient permissions'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Self or admin authorization (user can access their own data or admin can access any)
const authorizeSelfOrAdmin = (userIdParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required'));
    }

    const targetUserId = req.params[userIdParam];
    const isAdmin = req.user.roles.includes('admin');
    const isSelf = req.user.id === targetUserId;

    if (!isSelf && !isAdmin) {
      return next(new AuthorizationError('Access denied'));
    }

    next();
  };
};

// Resource ownership authorization
const authorizeResourceOwner = (resourceModel, userIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AuthorizationError('Authentication required'));
      }

      const isAdmin = req.user.roles.includes('admin');
      if (isAdmin) {
        return next();
      }

      const resourceId = req.params.id;
      const resource = await prisma[resourceModel].findUnique({
        where: { id: resourceId }
      });

      if (!resource) {
        return next(new AuthorizationError('Resource not found'));
      }

      if (resource[userIdField] !== req.user.id) {
        return next(new AuthorizationError('Access denied'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authorize,
  authorizePermission,
  authorizePermissions,
  authorizeAnyPermission,
  authorizeSelfOrAdmin,
  authorizeResourceOwner
};
