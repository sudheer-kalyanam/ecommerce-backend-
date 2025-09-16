import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCartItems(userId: string) {
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
        businessAddress: item.product.seller.email, // Using email as placeholder
        businessPhone: item.product.seller.phone,
        businessEmail: item.product.seller.email,
      },
      quantity: item.quantity,
      price: item.product.price,
      estimatedDelivery: this.calculateEstimatedDelivery(item.product.seller.email),
    }));
  }

  async addToCart(userId: string, productId: string, quantity: number, sellerId?: string) {
    // Verify product exists and is approved
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
      throw new NotFoundException('Product not found or not available');
    }

    // If sellerId is provided, verify it matches the product's seller
    if (sellerId && product.sellerId !== sellerId) {
      throw new BadRequestException('Invalid seller for this product');
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
        sellerId: product.sellerId,
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new BadRequestException('Not enough stock available');
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
    } else {
      // Add new item
      if (quantity > product.stock) {
        throw new BadRequestException('Not enough stock available');
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

  async updateCartItem(userId: string, itemId: string, quantity: number) {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
      include: { product: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    if (quantity > cartItem.product.stock) {
      throw new BadRequestException('Not enough stock available');
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

  async removeFromCart(userId: string, itemId: string) {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }

  private calculateEstimatedDelivery(sellerAddress: string): string {
    // Simple logic - in real app, this would be more sophisticated
    const city = sellerAddress.split(',')[0]?.trim();
    if (city === 'Mumbai' || city === 'Delhi' || city === 'Bangalore') {
      return '1-2 days';
    }
    return '3-4 days';
  }
}