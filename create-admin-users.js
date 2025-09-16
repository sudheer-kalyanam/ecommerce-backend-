const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUsers() {
  try {
    console.log('Creating admin users with roles...');

    // Create Developer users
    const developer1Password = await bcrypt.hash('dev123456', 10);
    const developer1 = await prisma.user.create({
      data: {
        email: 'developer1@admin.com',
        password: developer1Password,
        firstName: 'John',
        lastName: 'Developer',
        phone: '+1234567890',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    const developer2Password = await bcrypt.hash('dev123456', 10);
    const developer2 = await prisma.user.create({
      data: {
        email: 'developer2@admin.com',
        password: developer2Password,
        firstName: 'Jane',
        lastName: 'Developer',
        phone: '+1234567891',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    // Create Accounts users
    const accounts1Password = await bcrypt.hash('acc123456', 10);
    const accounts1 = await prisma.user.create({
      data: {
        email: 'accounts1@admin.com',
        password: accounts1Password,
        firstName: 'Mike',
        lastName: 'Accountant',
        phone: '+1234567892',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    const accounts2Password = await bcrypt.hash('acc123456', 10);
    const accounts2 = await prisma.user.create({
      data: {
        email: 'accounts2@admin.com',
        password: accounts2Password,
        firstName: 'Sarah',
        lastName: 'Accountant',
        phone: '+1234567893',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    // Assign roles to users
    // Developer users get both DEVELOPER and ACCOUNTS roles
    await prisma.userAdminRole.createMany({
      data: [
        { userId: developer1.id, adminRole: 'DEVELOPER' },
        { userId: developer1.id, adminRole: 'ACCOUNTS' },
        { userId: developer2.id, adminRole: 'DEVELOPER' },
        { userId: developer2.id, adminRole: 'ACCOUNTS' },
        { userId: accounts1.id, adminRole: 'ACCOUNTS' },
        { userId: accounts2.id, adminRole: 'ACCOUNTS' },
      ],
    });

    console.log('✅ Admin users created successfully!');
    console.log('\n📋 User Credentials:');
    console.log('\n🔧 DEVELOPER USERS (Full Access):');
    console.log('Developer 1:');
    console.log('  Email: developer1@admin.com');
    console.log('  Password: dev123456');
    console.log('  Roles: DEVELOPER, ACCOUNTS');
    console.log('\nDeveloper 2:');
    console.log('  Email: developer2@admin.com');
    console.log('  Password: dev123456');
    console.log('  Roles: DEVELOPER, ACCOUNTS');
    
    console.log('\n💰 ACCOUNTS USERS (Orders Only):');
    console.log('Accounts 1:');
    console.log('  Email: accounts1@admin.com');
    console.log('  Password: acc123456');
    console.log('  Roles: ACCOUNTS');
    console.log('\nAccounts 2:');
    console.log('  Email: accounts2@admin.com');
    console.log('  Password: acc123456');
    console.log('  Roles: ACCOUNTS');

    console.log('\n🎯 Access Control:');
    console.log('• DEVELOPER role: Can access seller approvals and all admin features');
    console.log('• ACCOUNTS role: Can only access orders management');
    console.log('• Users with both roles: Full access to everything');

  } catch (error) {
    console.error('❌ Error creating admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUsers();
