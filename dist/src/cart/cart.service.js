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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CartService = class CartService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCartItems(userId) {
        const cartItems = await this.prisma.cartItem.findMany({
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
        return cartItems.map(item => ({
            id: item.id,
            product: {
                id: item.product.id,
                name: item.product.name,
                images: item.product.images ? JSON.parse(item.product.images) : [],
                price: item.product.price,
                category: item.product.category,
            },
            seller: {
                id: item.product.seller.id,
                businessName: `${item.product.seller.firstName} ${item.product.seller.lastName}`,
                businessAddress: item.product.seller.email,
                businessPhone: item.product.seller.phone,
                businessEmail: item.product.seller.email,
            },
            quantity: item.quantity,
            price: item.product.price,
            estimatedDelivery: this.calculateEstimatedDelivery(item.product.seller.email),
        }));
    }
    async addToCart(userId, productId, quantity, sellerId) {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                approvalStatus: 'APPROVED',
                stock: { gt: 0 },
            },
            include: {
                seller: true,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found or not available');
        }
        if (sellerId && product.sellerId !== sellerId) {
            throw new common_1.BadRequestException('Invalid seller for this product');
        }
        const existingItem = await this.prisma.cartItem.findFirst({
            where: {
                userId,
                productId,
                sellerId: product.sellerId,
            },
        });
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stock) {
                throw new common_1.BadRequestException('Not enough stock available');
            }
            return this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
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
        else {
            if (quantity > product.stock) {
                throw new common_1.BadRequestException('Not enough stock available');
            }
            return this.prisma.cartItem.create({
                data: {
                    userId,
                    productId,
                    sellerId: product.sellerId,
                    quantity,
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
    }
    async updateCartItem(userId, itemId, quantity) {
        const cartItem = await this.prisma.cartItem.findFirst({
            where: { id: itemId, userId },
            include: { product: true },
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        if (quantity <= 0) {
            throw new common_1.BadRequestException('Quantity must be greater than 0');
        }
        if (quantity > cartItem.product.stock) {
            throw new common_1.BadRequestException('Not enough stock available');
        }
        return this.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
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
    async removeFromCart(userId, itemId) {
        const cartItem = await this.prisma.cartItem.findFirst({
            where: { id: itemId, userId },
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        return this.prisma.cartItem.delete({
            where: { id: itemId },
        });
    }
    async clearCart(userId) {
        return this.prisma.cartItem.deleteMany({
            where: { userId },
        });
    }
    calculateEstimatedDelivery(sellerAddress) {
        const city = sellerAddress.split(',')[0]?.trim();
        if (city === 'Mumbai' || city === 'Delhi' || city === 'Bangalore') {
            return '1-2 days';
        }
        return '3-4 days';
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map