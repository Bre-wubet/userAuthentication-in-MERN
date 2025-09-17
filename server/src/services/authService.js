const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateToken, generateRefreshToken, generateRandomToken } = require('../utils/jwt');
const { AuthenticationError, ConflictError, NotFoundError, ValidationError } = require('../utils/errors');

class AuthService {
  async register(userData) {
    const { email, username, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictError('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
      },
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

    // Assign default user role
    const userRole = await prisma.role.findUnique({
      where: { name: 'user' }
    });

    if (userRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: userRole.id
        }
      });
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles.map(ur => ur.role.name),
      permissions: user.roles.flatMap(ur => 
        ur.role.permissions.map(rp => rp.permission.name)
      )
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(user.id);

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        userAgent: 'unknown',
        ipAddress: 'unknown'
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isVerified: user.isVerified,
        roles: user.roles.map(ur => ur.role.name),
        permissions: user.roles.flatMap(ur => 
          ur.role.permissions.map(rp => rp.permission.name)
        )
      },
      token,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    };
  }

  async login(credentials) {
    const { email, password, rememberMe } = credentials;

    // Find user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { email },
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
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles.map(ur => ur.role.name),
      permissions: user.roles.flatMap(ur => 
        ur.role.permissions.map(rp => rp.permission.name)
      )
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(user.id);

    // Create session
    const expiresAt = rememberMe 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
        userAgent: 'unknown',
        ipAddress: 'unknown'
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isVerified: user.isVerified,
        roles: user.roles.map(ur => ur.role.name),
        permissions: user.roles.flatMap(ur => 
          user.roles.flatMap(ur => 
            ur.role.permissions.map(rp => rp.permission.name)
          )
        )
      },
      token,
      refreshToken,
      expiresIn: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
    };
  }

  async logout(userId, sessionId) {
    if (sessionId) {
      // Logout specific session
      await prisma.session.update({
        where: { id: sessionId },
        data: { isActive: false }
      });
    } else {
      // Logout all sessions
      await prisma.session.updateMany({
        where: { userId },
        data: { isActive: false }
      });
    }
  }

  async refreshToken(refreshToken) {
    const { verifyRefreshToken } = require('../utils/jwt');
    const { userId } = verifyRefreshToken(refreshToken);

    // Find active session
    const session = await prisma.session.findFirst({
      where: {
        token: refreshToken,
        userId,
        isActive: true,
        expiresAt: { gt: new Date() }
      }
    });

    if (!session) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Get user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles.map(ur => ur.role.name),
      permissions: user.roles.flatMap(ur => 
        ur.role.permissions.map(rp => rp.permission.name)
      )
    };

    const newToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(user.id);

    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isVerified: user.isVerified,
        roles: user.roles.map(ur => ur.role.name),
        permissions: user.roles.flatMap(ur => 
          ur.role.permissions.map(rp => rp.permission.name)
        )
      },
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: 7 * 24 * 60 * 60 * 1000
    };
  }

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token
    await prisma.token.create({
      data: {
        userId: user.id,
        token: resetToken,
        type: 'PASSWORD_RESET',
        expiresAt
      }
    });

    // TODO: Send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }

  async resetPassword(token, newPassword) {
    const tokenRecord = await prisma.token.findFirst({
      where: {
        token,
        type: 'PASSWORD_RESET',
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!tokenRecord) {
      throw new ValidationError('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);

    // Update user password
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { password: hashedPassword }
    });

    // Mark token as used
    await prisma.token.update({
      where: { id: tokenRecord.id },
      data: { isUsed: true }
    });

    // Invalidate all sessions
    await prisma.session.updateMany({
      where: { userId: tokenRecord.userId },
      data: { isActive: false }
    });
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Invalidate all sessions except current one
    // This would require passing the current session ID
    // For now, we'll invalidate all sessions
    await prisma.session.updateMany({
      where: { userId },
      data: { isActive: false }
    });
  }
}

module.exports = new AuthService();
