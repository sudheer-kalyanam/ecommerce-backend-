import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlistItems(userId: string) {
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
        rating: 4.5, // Default rating since not in schema
        reviewCount: 0, // Default review count since not in schema
      },
      addedAt: item.createdAt.toISOString(),
    }));
  }

  async addToWishlist(userId: string, productId: string) {
    // Verify product exists and is approved
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        approvalStatus: 'APPROVED',
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found or not available');
    }

    // Check if already in wishlist
    const existingItem = await this.prisma.wishlistItem.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingItem) {
      throw new ConflictException('Product already in wishlist');
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

  async removeFromWishlist(userId: string, productId: string) {
    const wishlistItem = await this.prisma.wishlistItem.findFirst({
      where: { userId, productId },
    });

    if (!wishlistItem) {
      throw new NotFoundException('Item not found in wishlist');
    }

    return this.prisma.wishlistItem.delete({
      where: { id: wishlistItem.id },
    });
  }

  async clearWishlist(userId: string) {
    return this.prisma.wishlistItem.deleteMany({
      where: { userId },
    });
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const item = await this.prisma.wishlistItem.findFirst({
      where: { userId, productId },
    });
    return !!item;
  }
}