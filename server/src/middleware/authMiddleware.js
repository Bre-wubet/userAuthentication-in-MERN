const { verifyToken } = require('../utils/jwt');
const { AuthenticationError } = require('../utils/errors');
const prisma = require('../config/database');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AuthenticationError('Access token is required');
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        profile: true
      }
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isActive: user.isActive,
      roles: user.roles.map(ur => ur.role.name),
      permissions: user.roles.flatMap(ur => 
        ur.role.permissions.map(rp => rp.permission.name)
      ),
      profile: user.profile
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true
                      }
                    }
                  }
                }
              }
            },
            profile: true
          }
        });

        if (user && user.isActive) {
          req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            isVerified: user.isVerified,
            isActive: user.isActive,
            roles: user.roles.map(ur => ur.role.name),
            permissions: user.roles.flatMap(ur => 
              ur.role.permissions.map(rp => rp.permission.name)
            ),
            profile: user.profile
          };
        }
      } catch (error) {
        // Ignore token errors for optional auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  optionalAuth
};
