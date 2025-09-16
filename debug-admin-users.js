const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAdminUsers() {
  try {
    console.log('🔍 Debugging admin users...\n');

    // Find all admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        is2FAEnabled: true,
        createdAt: true
      }
    });

    console.log(`📊 Found ${adminUsers.length} admin users:`);
    console.log('=' .repeat(80));
    
    adminUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. User Details:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   2FA Enabled: ${user.is2FAEnabled}`);
      console.log(`   Created: ${user.createdAt}`);
    });

    // Check if any admin users have 2FA enabled
    const adminWith2FA = adminUsers.filter(user => user.is2FAEnabled);
    if (adminWith2FA.length > 0) {
      console.log(`\n⚠️  ${adminWith2FA.length} admin user(s) have 2FA enabled:`);
      adminWith2FA.forEach(user => {
        console.log(`   - ${user.email} (${user.firstName} ${user.lastName})`);
      });
    } else {
      console.log('\n✅ No admin users have 2FA enabled');
    }

    // Check if any admin users are not ACTIVE
    const inactiveAdmins = adminUsers.filter(user => user.status !== 'ACTIVE');
    if (inactiveAdmins.length > 0) {
      console.log(`\n⚠️  ${inactiveAdmins.length} admin user(s) are not ACTIVE:`);
      inactiveAdmins.forEach(user => {
        console.log(`   - ${user.email} (Status: ${user.status})`);
      });
    } else {
      console.log('\n✅ All admin users are ACTIVE');
    }

    console.log('\n' + '=' .repeat(80));
    console.log('🎯 Expected Login Behavior:');
    console.log('• Admin users should NOT require OTP (unless 2FA is enabled)');
    console.log('• Admin users should be redirected to /admin after login');
    console.log('• If admin users are going to /customer, check the frontend routing logic');

  } catch (error) {
    console.error('❌ Error debugging admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAdminUsers();
