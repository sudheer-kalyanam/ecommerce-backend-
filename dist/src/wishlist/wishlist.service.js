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
exports.WishlistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WishlistService = class WishlistService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWishlistItems(userId) {
        const wishlistItems = await this.prisma.wishlistItem.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        category: true,
                        seller: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return wishlistItems.map(item => ({
            id: item.id,
            product: {
                id: item.product.id,
                name: item.product.name,
                description: item.product.description,
                images: item.product.images ? JSON.parse(item.product.images) : [],
                price: item.product.price,
                category: item.product.category,
                seller: {
                    id: item.product.seller.id,
                    businessName: `${item.product.seller.firstName} ${item.product.seller.lastName}`,
                    businessAddress: item.product.seller.email,
                    businessPhone: item.product.seller.phone,
                    businessEmail: item.product.seller.email,
                },
                stock: item.product.stock,
                rating: 4.5,
                reviewCount: 0,
            },
            addedAt: item.createdAt.toISOString(),
        }));
    }
    async addToWishlist(userId, productId) {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                approvalStatus: 'APPROVED',
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found or not available');
        }
        const existingItem = await this.prisma.wishlistItem.findFirst({
            where: {
                userId,
                productId,
            },
        });
        if (existingItem) {
            throw new common_1.ConflictException('Product already in wishlist');
        }
        return this.prisma.wishlistItem.create({
            data: {
                userId,
                productId,
            },
            include: {
                product: {
                    include: {
                        category: true,
                        seller: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async removeFromWishlist(userId, productId) {
        const wishlistItem = await this.prisma.wishlistItem.findFirst({
            where: { userId, productId },
        });
        if (!wishlistItem) {
            throw new common_1.NotFoundException('Item not found in wishlist');
        }
        return this.prisma.wishlistItem.delete({
            where: { id: wishlistItem.id },
        });
    }
    async clearWishlist(userId) {
        return this.prisma.wishlistItem.deleteMany({
            where: { userId },
        });
    }
    async isInWishlist(userId, productId) {
        const item = await this.prisma.wishlistItem.findFirst({
            where: { userId, productId },
        });
        return !!item;
    }
};
exports.WishlistService = WishlistService;
exports.WishlistService = WishlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WishlistService);
//# sourceMappingURL=wishlist.service.js.map