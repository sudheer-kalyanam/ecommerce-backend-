import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { configureCloudinary } from '../../cloudinary.config';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    configureCloudinary(configService);
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'ecommerce_products'): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 600, crop: 'fill', quality: 'auto' },
            { format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Upload failed - no result returned'));
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadMultipleImages(files: Express.Multer.File[], folder: string = 'ecommerce_products'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async deleteImages(publicIds: string[]): Promise<void> {
    const deletePromises = publicIds.map(publicId => this.deleteImage(publicId));
    await Promise.all(deletePromises);
  }

  getPublicIdFromUrl(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    return `${folder}/${filename.split('.')[0]}`;
  }

  generateOptimizedUrl(url: string, options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}): string {
    const publicId = this.getPublicIdFromUrl(url);
    return cloudinary.url(publicId, {
      width: options.width || 800,
      height: options.height || 600,
      crop: options.crop || 'fill',
      quality: options.quality || 'auto',
      format: options.format || 'auto',
      secure: true
    });
  }
}
