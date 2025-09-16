import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Mock data for categories
  private mockCategories = [
    { id: '1', name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets' },
    { id: '2', name: 'Fashion', slug: 'fashion', description: 'Clothing and accessories' },
    { id: '3', name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and garden supplies' },
    { id: '4', name: 'Sports', slug: 'sports', description: 'Sports equipment and gear' },
    { id: '5', name: 'Books', slug: 'books', description: 'Books and educational materials' },
    { id: '6', name: 'Health', slug: 'health', description: 'Health and wellness products' },
    { id: '7', name: 'Beauty', slug: 'beauty', description: 'Beauty and personal care' },
    { id: '8', name: 'Toys', slug: 'toys', description: 'Toys and games for all ages' },
  ];

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = this.generateSlug(createCategoryDto.name);
    const newCategory = {
      id: Date.now().toString(),
      ...createCategoryDto,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockCategories.push({
      ...newCategory,
      description: newCategory.description || ''
    });
    return newCategory;
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findHierarchy() {
    // Return mock categories as root categories
    return this.mockCategories;
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id }
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug }
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto
    });
    return category;
  }

  async remove(id: string) {
    await this.prisma.category.delete({
      where: { id }
    });
    return { message: 'Category deleted successfully' };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
}