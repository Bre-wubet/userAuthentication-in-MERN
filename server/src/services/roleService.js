const prisma = require('../config/database');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');

class RoleService {
  async getAllRoles() {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: { users: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.permissions.map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
        resource: rp.permission.resource,
        action: rp.permission.action
      })),
      userCount: role._count.users
    }));
  }

  async getRoleById(roleId) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.permissions.map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
        resource: rp.permission.resource,
        action: rp.permission.action
      })),
      users: role.users.map(ur => ur.user)
    };
  }

  async createRole(roleData) {
    const { name, description, permissions } = roleData;

    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    });

    if (existingRole) {
      throw new ConflictError('Role with this name already exists');
    }

    // Validate permissions exist
    const permissionRecords = await prisma.permission.findMany({
      where: { id: { in: permissions } }
    });

    if (permissionRecords.length !== permissions.length) {
      throw new ValidationError('One or more permissions not found');
    }

    // Create role with permissions
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissions.map(permissionId => ({
            permissionId
          }))
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.permissions.map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
        resource: rp.permission.resource,
        action: rp.permission.action
      }))
    };
  }

  async updateRole(roleId, updateData) {
    const { name, description, permissions } = updateData;

    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // Check if new name conflicts with existing role
    if (name && name !== role.name) {
      const existingRole = await prisma.role.findUnique({
        where: { name }
      });

      if (existingRole) {
        throw new ConflictError('Role with this name already exists');
      }
    }

    // Validate permissions if provided
    if (permissions) {
      const permissionRecords = await prisma.permission.findMany({
        where: { id: { in: permissions } }
      });

      if (permissionRecords.length !== permissions.length) {
        throw new ValidationError('One or more permissions not found');
      }
    }

    // Update role
    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        name,
        description,
        updatedAt: new Date()
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    // Update permissions if provided
    if (permissions) {
      // Remove existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId }
      });

      // Add new permissions
      await prisma.rolePermission.createMany({
        data: permissions.map(permissionId => ({
          roleId,
          permissionId
        }))
      });
    }

    return this.getRoleById(roleId);
  }

  async deleteRole(roleId) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    if (role._count.users > 0) {
      throw new ValidationError('Cannot delete role that is assigned to users');
    }

    await prisma.role.delete({
      where: { id: roleId }
    });
  }

  async assignRole(userId, roleId) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // Check if user already has this role
    const existingUserRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    });

    if (existingUserRole) {
      throw new ConflictError('User already has this role');
    }

    await prisma.userRole.create({
      data: {
        userId,
        roleId
      }
    });
  }

  async removeRole(userId, roleId) {
    const userRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    });

    if (!userRole) {
      throw new NotFoundError('User role assignment not found');
    }

    await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    });
  }

  async getAllPermissions() {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ]
    });

    return permissions.map(permission => ({
      id: permission.id,
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt
    }));
  }

  async checkPermission(userId, resource, action) {
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
        }
      }
    });

    if (!user) {
      return false;
    }

    const hasPermission = user.roles.some(userRole =>
      userRole.role.permissions.some(rolePermission =>
        rolePermission.permission.resource === resource &&
        rolePermission.permission.action === action
      )
    );

    return hasPermission;
  }

  async getUserPermissions(userId) {
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
        }
      }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const permissions = user.roles.flatMap(userRole =>
      userRole.role.permissions.map(rolePermission => ({
        id: rolePermission.permission.id,
        name: rolePermission.permission.name,
        description: rolePermission.permission.description,
        resource: rolePermission.permission.resource,
        action: rolePermission.permission.action
      }))
    );

    // Remove duplicates
    const uniquePermissions = permissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );

    return uniquePermissions;
  }
}

module.exports = new RoleService();
