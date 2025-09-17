const prisma = require('../config/database');
const { NotFoundError, ConflictError } = require('../utils/errors');

class UserService {
  async getProfile(userId) {
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

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.roles.map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description
      })),
      permissions: user.roles.flatMap(ur => 
        ur.role.permissions.map(rp => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          resource: rp.permission.resource,
          action: rp.permission.action
        }))
      ),
      profile: user.profile
    };
  }

  async updateProfile(userId, updateData) {
    const { firstName, lastName, username, bio, website, location, phone, birthDate } = updateData;

    // Check if username is taken by another user
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          id: { not: userId }
        }
      });

      if (existingUser) {
        throw new ConflictError('Username is already taken');
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        username,
        updatedAt: new Date()
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

    // Update or create profile
    if (bio !== undefined || website !== undefined || location !== undefined || 
        phone !== undefined || birthDate !== undefined) {
      await prisma.profile.upsert({
        where: { userId },
        update: {
          bio,
          website,
          location,
          phone,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          updatedAt: new Date()
        },
        create: {
          userId,
          bio,
          website,
          location,
          phone,
          birthDate: birthDate ? new Date(birthDate) : undefined
        }
      });
    }

    return this.getProfile(userId);
  }

  async deleteAccount(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    });
  }

  async getAllUsers(params = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          roles: {
            include: {
              role: true
            }
          },
          profile: true
        }
      }),
      prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roles: user.roles.map(ur => ur.role.name),
        profile: user.profile
      })),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async getUserById(userId) {
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

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.roles.map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description
      })),
      permissions: user.roles.flatMap(ur => 
        ur.role.permissions.map(rp => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          resource: rp.permission.resource,
          action: rp.permission.action
        }))
      ),
      profile: user.profile
    };
  }

  async updateUser(userId, updateData) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if email or username is taken by another user
    if (updateData.email || updateData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            updateData.email ? { email: updateData.email } : null,
            updateData.username ? { username: updateData.username } : null
          ].filter(Boolean),
          id: { not: userId }
        }
      });

      if (existingUser) {
        throw new ConflictError('Email or username is already taken');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        updatedAt: new Date()
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

    return this.getUserById(userId);
  }

  async deleteUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await prisma.user.delete({
      where: { id: userId }
    });
  }

  async getUserSessions(userId) {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    return sessions.map(session => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt
    }));
  }

  async revokeSession(sessionId, userId) {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
        isActive: true
      }
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false }
    });
  }
}

module.exports = new UserService();
