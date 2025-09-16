import { CloudinaryService } from '../cloudinary/cloudinary.service';
import multer from 'multer';
export declare class ImageUploadService {
    private cloudinaryService;
    private readonly maxFileSize;
    private readonly allowedMimeTypes;
    constructor(cloudinaryService: CloudinaryService);
    getMulterConfig(): multer.Options;
    static getMulterConfig(): multer.Options;
    uploadProductImages(files: Express.Multer.File[]): Promise<string[]>;
    uploadSingleImage(file: Express.Multer.File): Promise<string>;
    private validateFile;
    deleteProductImages(imageUrls: string[]): Promise<void>;
    generateOptimizedImageUrl(url: string, options?: {
        width?: number;
        height?: number;
        crop?: string;
        quality?: string;
    }): string;
}
