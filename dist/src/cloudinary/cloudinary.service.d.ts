import { ConfigService } from '@nestjs/config';
export declare class CloudinaryService {
    private configService;
    constructor(configService: ConfigService);
    uploadImage(file: Express.Multer.File, folder?: string): Promise<string>;
    uploadMultipleImages(files: Express.Multer.File[], folder?: string): Promise<string[]>;
    deleteImage(publicId: string): Promise<void>;
    deleteImages(publicIds: string[]): Promise<void>;
    getPublicIdFromUrl(url: string): string;
    generateOptimizedUrl(url: string, options?: {
        width?: number;
        height?: number;
        crop?: string;
        quality?: string;
        format?: string;
    }): string;
}
