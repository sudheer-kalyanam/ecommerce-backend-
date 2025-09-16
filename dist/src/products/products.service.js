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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const image_upload_service_1 = require("../upload/image-upload.service");
let ProductsService = class ProductsService {
    prisma;
    imageUploadService;
    constructor(prisma, imageUploadService) {
        this.prisma = prisma;
        this.imageUploadService = imageUploadService;
    }
    async create(createProductDto, sellerId) {
        const seller = await this.prisma.user.findUnique({
            where: { id: sellerId }
        });
        if (!seller) {
            throw new common_1.NotFoundException('Seller not found');
        }
        if (createProductDto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: createProductDto.categoryId }
            });
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
            }
        }
        const product = await this.prisma.product.create({
            data: {
                ...createProductDto,
                sellerId,
                images: createProductDto.images ? JSON.stringify(createProductDto.images) : null,
            },
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        return {
            ...product,
            images: product.images ? JSON.parse(product.images) : [],
        };
    }
    async findAll(sellerId) {
        const where = sellerId ? { sellerId } : {};
        const products = await this.prisma.product.findMany({
            where,
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return products.map(product => ({
            ...product,
            images: product.images ? JSON.parse(product.images) : [],
        }));
    }
    async findOne(id, sellerId) {
        const where = { id };
        if (sellerId) {
            where.sellerId = sellerId;
        }
        const product = await this.prisma.product.findUnique({
            where,
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return {
            ...product,
            images: product.images ? JSON.parse(product.images) : [],
        };
    }
    async update(id, updateProductDto, sellerId) {
        const existingProduct = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!existingProduct) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (existingProduct.sellerId !== sellerId) {
            throw new common_1.ForbiddenException('You can only update your own products');
        }
        const product = await this.prisma.product.update({
            where: { id },
            data: {
                ...updateProductDto,
                images: updateProductDto.images ? JSON.stringify(updateProductDto.images) : undefined,
            },
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        return {
            ...product,
            images: product.images ? JSON.parse(product.images) : [],
        };
    }
    async remove(id, sellerId) {
        const existingProduct = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!existingProduct) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (existingProduct.sellerId !== sellerId) {
            throw new common_1.ForbiddenException('You can only delete your own products');
        }
        await this.prisma.product.delete({
            where: { id },
        });
        return { message: 'Product deleted successfully' };
    }
    async getSellerProducts(sellerId) {
        return this.findAll(sellerId);
    }
    async getPendingProducts() {
        const products = await this.prisma.product.findMany({
            where: {
                approvalStatus: 'PENDING'
            },
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return products.map(product => ({
            ...product,
            images: product.images ? JSON.parse(product.images) : [],
        }));
    }
    async approveProduct(productId, adminId, action, rejectionReason) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId }
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.approvalStatus !== 'PENDING') {
            throw new common_1.BadRequestException('Product has already been processed');
        }
        const updateData = {
            approvalStatus: action,
            reviewedBy: adminId,
            reviewedAt: new Date()
        };
        if (action === 'REJECTED' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }
        const updatedProduct = await this.prisma.product.update({
            where: { id: productId },
            data: updateData,
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            }
        });
        return {
            ...updatedProduct,
            images: updatedProduct.images ? JSON.parse(updatedProduct.images) : [],
        };
    }
    async getApprovedProducts() {
        const products = await this.prisma.product.findMany({
            where: {
                approvalStatus: 'APPROVED',
                status: 'ACTIVE'
            },
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return products.map(product => ({
            ...product,
            images: product.images ? JSON.parse(product.images) : [],
        }));
    }
    async getRejectedProducts() {
        const products = await this.prisma.product.findMany({
            where: {
                approvalStatus: 'REJECTED'
            },
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return products.map(product => ({
            ...product,
            images: product.images ? JSON.parse(product.images) : [],
        }));
    }
    async createWithImages(createProductDto, sellerId, files) {
        const seller = await this.prisma.user.findUnique({
            where: { id: sellerId }
        });
        if (!seller) {
            throw new common_1.NotFoundException('Seller not found');
        }
        if (createProductDto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: createProductDto.categoryId }
            });
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
            }
        }
        let imageUrls = [];
        if (files && files.length > 0) {
            try {
                imageUrls = await this.imageUploadService.uploadProductImages(files);
            }
            catch (error) {
                throw new common_1.BadRequestException(`Failed to upload images: ${error.message}`);
            }
        }
        const product = await this.prisma.product.create({
            data: {
                ...createProductDto,
                sellerId,
                images: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
            },
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        return {
            ...product,
            images: imageUrls,
        };
    }
    async updateWithImages(id, updateProductDto, sellerId, files) {
        const existingProduct = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!existingProduct) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (existingProduct.sellerId !== sellerId) {
            throw new common_1.ForbiddenException('You can only update your own products');
        }
        let imageUrls = [];
        if (files && files.length > 0) {
            try {
                if (existingProduct.images) {
                    const oldImageUrls = JSON.parse(existingProduct.images);
                    await this.imageUploadService.deleteProductImages(oldImageUrls);
                }
                imageUrls = await this.imageUploadService.uploadProductImages(files);
            }
            catch (error) {
                throw new common_1.BadRequestException(`Failed to update images: ${error.message}`);
            }
        }
        else if (updateProductDto.images) {
            imageUrls = updateProductDto.images;
        }
        else {
            if (existingProduct.images) {
                imageUrls = JSON.parse(existingProduct.images);
            }
        }
        const product = await this.prisma.product.update({
            where: { id },
            data: {
                ...updateProductDto,
                images: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
            },
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        return {
            ...product,
            images: imageUrls,
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        image_upload_service_1.ImageUploadService])
], ProductsService);
//# sourceMappingURL=products.service.js.map