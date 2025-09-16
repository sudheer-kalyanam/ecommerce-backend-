const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestCategories() {
  try {
    console.log('Creating test categories...\n');
    
    const categories = [
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        imageUrl: null,
        parentId: null
      },
      {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
        imageUrl: null,
        parentId: null
      },
      {
        name: 'Books',
        slug: 'books',
        description: 'Books and literature',
        imageUrl: null,
        parentId: null
      },
      {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home improvement and garden supplies',
        imageUrl: null,
        parentId: null
      },
      {
        name: 'Sports',
        slug: 'sports',
        description: 'Sports and fitness equipment',
        imageUrl: null,
        parentId: null
      }
    ];
    
    const createdCategories = await Promise.all(
      categories.map(category => 
        prisma.category.upsert({
          where: { slug: category.slug },
          update: category,
          create: category
        })
      )
    );
    
    console.log('✅ Created categories:', createdCategories.length);
    createdCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.slug})`);
    });
    
  } catch (error) {
    console.error('Error creating categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestCategories();
