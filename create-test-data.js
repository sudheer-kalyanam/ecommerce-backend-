const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('Creating test data...\n');
    
    // Create test categories
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Electronics',
          slug: 'electronics',
          description: 'Electronic devices and gadgets'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Clothing',
          slug: 'clothing', 
          description: 'Fashion and apparel'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Books',
          slug: 'books',
          description: 'Books and literature'
        }
      })
    ]);
    
    console.log('✅ Created categories:', categories.length);
    
    // Create test seller registrations with files
    const testRegistrations = [
      {
        email: 'seller1@test.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        businessName: 'Tech Solutions Inc',
        businessType: 'retail',
        businessAddress: '123 Tech Street, City',
        businessPhone: '1234567890',
        businessEmail: 'business@techsolutions.com',
        taxId: 'TAX123456',
        bankAccountNumber: '1234567890',
        bankName: 'Tech Bank',
        businessLicense: '/uploads/businessLicense-1234567890-123456789.pdf',
        idProof: '/uploads/idProof-1234567890-987654321.pdf',
        status: 'PENDING'
      },
      {
        email: 'seller2@test.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '0987654321',
        businessName: 'Fashion Forward',
        businessType: 'wholesale',
        businessAddress: '456 Fashion Ave, City',
        businessPhone: '0987654321',
        businessEmail: 'business@fashionforward.com',
        taxId: 'TAX789012',
        bankAccountNumber: '0987654321',
        bankName: 'Fashion Bank',
        businessLicense: '/uploads/businessLicense-0987654321-111222333.pdf',
        idProof: '/uploads/idProof-0987654321-444555666.pdf',
        status: 'PENDING'
      },
      {
        email: 'seller3@test.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Bob',
        lastName: 'Johnson',
        phone: '5555555555',
        businessName: 'Book World',
        businessType: 'retail',
        businessAddress: '789 Book Lane, City',
        businessPhone: '5555555555',
        businessEmail: 'business@bookworld.com',
        taxId: 'TAX345678',
        bankAccountNumber: '5555555555',
        bankName: 'Book Bank',
        businessLicense: '/uploads/businessLicense-5555555555-777888999.pdf',
        idProof: '/uploads/idProof-5555555555-000111222.pdf',
        status: 'PENDING'
      }
    ];
    
    const registrations = await Promise.all(
      testRegistrations.map(reg => prisma.sellerRegistration.create({ data: reg }))
    );
    
    console.log('✅ Created seller registrations:', registrations.length);
    
    // Create test customer
    const customer = await prisma.user.create({
      data: {
        email: 'customer@test.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Alice',
        lastName: 'Customer',
        role: 'CUSTOMER',
        status: 'ACTIVE'
      }
    });
    
    console.log('✅ Created test customer:', customer.email);
    
    console.log('\n🎉 Test data created successfully!');
    console.log('\n📋 Test Seller Registrations:');
    registrations.forEach((reg, index) => {
      console.log(`${index + 1}. ${reg.email} - ${reg.businessName} (${reg.status})`);
    });
    
    console.log('\n👤 Test Customer:');
    console.log(`- ${customer.email} (${customer.role})`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Customer: customer@test.com / password123');
    
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
