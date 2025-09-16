import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ImageUploadService } from '../upload/image-upload.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private imageUploadService: ImageUploadService
  ) {}

  async create(createProductDto: CreateProductDto, sellerId: string) {
    // Validate seller exists
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId }
    });
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    // Validate category exists if categoryId is provided
    if (createProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: createProductDto.categoryId }
      });
      if (!category) {
        throw new NotFoundException('Category not found');
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

  async findAll(sellerId?: string) {
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

  async findOne(id: string, sellerId?: string) {
    const where: any = { id };
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
      throw new NotFoundException('Product not found');
    }

    return {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, sellerId: string) {
    // Check if product exists and belongs to seller
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (existingProduct.sellerId !== sellerId) {
      throw new ForbiddenException('You can only update your own products');
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

  async remove(id: string, sellerId: string) {
    // Check if product exists and belongs to seller
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (existingProduct.sellerId !== sellerId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  }

  async getSellerProducts(sellerId: string) {
    return this.findAll(sellerId);
  }

  // Product approval methods
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

  async approveProduct(productId: string, adminId: string, action: 'APPROVED' | 'REJECTED', rejectionReason?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.approvalStatus !== 'PENDING') {
      throw new BadRequestException('Product has already been processed');
    }

    const updateData: any = {
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

  async createWithImages(createProductDto: CreateProductDto, sellerId: string, files: Express.Multer.File[]) {
    // Validate seller exists
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId }
    });
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    // Validate category exists if categoryId is provided
    if (createProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: createProductDto.categoryId }
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    let imageUrls: string[] = [];

    // Upload images to Cloudinary if provided
    if (files && files.length > 0) {
      try {
        imageUrls = await this.imageUploadService.uploadProductImages(files);
      } catch (error) {
        throw new BadRequestException(`Failed to upload images: ${error.message}`);
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

  async updateWithImages(id: string, updateProductDto: UpdateProductDto, sellerId: string, files?: Express.Multer.File[]) {
    // Check if product exists and belongs to seller
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (existingProduct.sellerId !== sellerId) {
      throw new ForbiddenException('You can only update your own products');
    }

    let imageUrls: string[] = [];

    // Handle image updates
    if (files && files.length > 0) {
      try {
        // Delete old images from Cloudinary
        if (existingProduct.images) {
          const oldImageUrls = JSON.parse(existingProduct.images);
          await this.imageUploadService.deleteProductImages(oldImageUrls);
        }

        // Upload new images
        imageUrls = await this.imageUploadService.uploadProductImages(files);
      } catch (error) {
        throw new BadRequestException(`Failed to update images: ${error.message}`);
      }
    } else if (updateProductDto.images) {
      // If images are provided as URLs (from frontend)
      imageUrls = updateProductDto.images;
    } else {
      // Keep existing images
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
}