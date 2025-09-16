import { Injectable, BadRequestException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import multer from 'multer';

@Injectable()
export class ImageUploadService {
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];

  constructor(private cloudinaryService: CloudinaryService) {}

  getMulterConfig(): multer.Options {
    return {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: this.maxFileSize,
        files: 5, // Maximum 5 images per upload
      },
      fileFilter: (req, file, cb) => {
        if (this.allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    };
  }

  static getMulterConfig(): multer.Options {
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif'
    ];

    return {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: maxFileSize,
        files: 5, // Maximum 5 images per upload
      },
      fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    };
  }

  async uploadProductImages(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images provided');
    }

    if (files.length > 5) {
      throw new BadRequestException('Maximum 5 images allowed per product');
    }

    // Validate each file
    files.forEach(file => {
      this.validateFile(file);
    });

    try {
      const imageUrls = await this.cloudinaryService.uploadMultipleImages(files, 'ecommerce_products');
      return imageUrls;
    } catch (error) {
      throw new BadRequestException(`Failed to upload images: ${error.message}`);
    }
  }

  async uploadSingleImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No image provided');
    }

    this.validateFile(file);

    try {
      const imageUrl = await this.cloudinaryService.uploadImage(file, 'ecommerce_products');
      return imageUrl;
    } catch (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File ${file.originalname} is too large. Maximum size is 5MB`);
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File ${file.originalname} is not a valid image type`);
    }
  }

  async deleteProductImages(imageUrls: string[]): Promise<void> {
    try {
      const publicIds = imageUrls.map(url => this.cloudinaryService.getPublicIdFromUrl(url));
      await this.cloudinaryService.deleteImages(publicIds);
    } catch (error) {
      console.error('Failed to delete images from Cloudinary:', error);
      // Don't throw error here as it might be called during cleanup
    }
  }

  generateOptimizedImageUrl(url: string, options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  } = {}): string {
    return this.cloudinaryService.generateOptimizedUrl(url, {
      width: options.width || 800,
      height: options.height || 600,
      crop: options.crop || 'fill',
      quality: options.quality || 'auto'
    });
  }
}
