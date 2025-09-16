const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      
      // Generate token for existing admin
      const token = jwt.sign(
        { sub: existingAdmin.id, role: existingAdmin.role },
        'your-super-secret-jwt-key-change-this-in-production',
        { expiresIn: '24h' }
      );
      
      console.log('Admin token:', token);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    console.log('Admin created:', admin.email);

    // Generate token
    const token = jwt.sign(
      { sub: admin.id, role: admin.role },
      'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '24h' }
    );

    console.log('Admin token:', token);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
