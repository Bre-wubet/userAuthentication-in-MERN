const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default permissions
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'users.create' },
      update: {},
      create: {
        name: 'users.create',
        description: 'Create new users',
        resource: 'users',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.read' },
      update: {},
      create: {
        name: 'users.read',
        description: 'Read user information',
        resource: 'users',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.update' },
      update: {},
      create: {
        name: 'users.update',
        description: 'Update user information',
        resource: 'users',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.delete' },
      update: {},
      create: {
        name: 'users.delete',
        description: 'Delete users',
        resource: 'users',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.create' },
      update: {},
      create: {
        name: 'roles.create',
        description: 'Create new roles',
        resource: 'roles',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.read' },
      update: {},
      create: {
        name: 'roles.read',
        description: 'Read role information',
        resource: 'roles',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.update' },
      update: {},
      create: {
        name: 'roles.update',
        description: 'Update role information',
        resource: 'roles',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles.delete' },
      update: {},
      create: {
        name: 'roles.delete',
        description: 'Delete roles',
        resource: 'roles',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'settings.read' },
      update: {},
      create: {
        name: 'settings.read',
        description: 'Read application settings',
        resource: 'settings',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'settings.update' },
      update: {},
      create: {
        name: 'settings.update',
        description: 'Update application settings',
        resource: 'settings',
        action: 'update',
      },
    }),
  ]);

  console.log('✅ Permissions created');

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full access',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user with basic access',
    },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'moderator' },
    update: {},
    create: {
      name: 'moderator',
      description: 'Moderator with limited admin access',
    },
  });

  console.log('✅ Roles created');

  // Assign permissions to roles
  // Admin gets all permissions
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // User gets basic permissions
  const userPermissions = permissions.filter(p => 
    ['users.read', 'settings.read'].includes(p.name)
  );
  for (const permission of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Moderator gets user management permissions
  const moderatorPermissions = permissions.filter(p => 
    ['users.create', 'users.read', 'users.update', 'settings.read'].includes(p.name)
  );
  for (const permission of moderatorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: moderatorRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: moderatorRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Role permissions assigned');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      isVerified: true,
      isActive: true,
    },
  });

  // Assign admin role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: hashedPassword,
      isVerified: true,
      isActive: true,
    },
  });

  // Assign user role to test user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: testUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      roleId: userRole.id,
    },
  });

  console.log('✅ Default users created');
  console.log('🌱 Database seed completed!');
  console.log('\n📋 Default credentials:');
  console.log('Admin: admin@example.com / admin123');
  console.log('User: user@example.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
