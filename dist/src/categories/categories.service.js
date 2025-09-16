"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mockCategories = [
        { id: '1', name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets' },
        { id: '2', name: 'Fashion', slug: 'fashion', description: 'Clothing and accessories' },
        { id: '3', name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and garden supplies' },
        { id: '4', name: 'Sports', slug: 'sports', description: 'Sports equipment and gear' },
        { id: '5', name: 'Books', slug: 'books', description: 'Books and educational materials' },
        { id: '6', name: 'Health', slug: 'health', description: 'Health and wellness products' },
        { id: '7', name: 'Beauty', slug: 'beauty', description: 'Beauty and personal care' },
        { id: '8', name: 'Toys', slug: 'toys', description: 'Toys and games for all ages' },
    ];
    async create(createCategoryDto) {
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
        return this.mockCategories;
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({
            where: { id }
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async findBySlug(slug) {
        const category = await this.prisma.category.findUnique({
            where: { slug }
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async update(id, updateCategoryDto) {
        const category = await this.prisma.category.update({
            where: { id },
            data: updateCategoryDto
        });
        return category;
    }
    async remove(id) {
        await this.prisma.category.delete({
            where: { id }
        });
        return { message: 'Category deleted successfully' };
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map