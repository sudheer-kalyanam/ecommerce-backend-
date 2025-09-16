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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageUploadService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const multer_1 = __importDefault(require("multer"));
let ImageUploadService = class ImageUploadService {
    cloudinaryService;
    maxFileSize = 5 * 1024 * 1024;
    allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif'
    ];
    constructor(cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }
    getMulterConfig() {
        return {
            storage: multer_1.default.memoryStorage(),
            limits: {
                fileSize: this.maxFileSize,
                files: 5,
            },
            fileFilter: (req, file, cb) => {
                if (this.allowedMimeTypes.includes(file.mimetype)) {
                    cb(null, true);
                }
                else {
                    cb(null, false);
                }
            },
        };
    }
    static getMulterConfig() {
        const maxFileSize = 5 * 1024 * 1024;
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif'
        ];
        return {
            storage: multer_1.default.memoryStorage(),
            limits: {
                fileSize: maxFileSize,
                files: 5,
            },
            fileFilter: (req, file, cb) => {
                if (allowedMimeTypes.includes(file.mimetype)) {
                    cb(null, true);
                }
                else {
                    cb(null, false);
                }
            },
        };
    }
    async uploadProductImages(files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No images provided');
        }
        if (files.length > 5) {
            throw new common_1.BadRequestException('Maximum 5 images allowed per product');
        }
        files.forEach(file => {
            this.validateFile(file);
        });
        try {
            const imageUrls = await this.cloudinaryService.uploadMultipleImages(files, 'ecommerce_products');
            return imageUrls;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to upload images: ${error.message}`);
        }
    }
    async uploadSingleImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('No image provided');
        }
        this.validateFile(file);
        try {
            const imageUrl = await this.cloudinaryService.uploadImage(file, 'ecommerce_products');
            return imageUrl;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to upload image: ${error.message}`);
        }
    }
    validateFile(file) {
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException(`File ${file.originalname} is too large. Maximum size is 5MB`);
        }
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File ${file.originalname} is not a valid image type`);
        }
    }
    async deleteProductImages(imageUrls) {
        try {
            const publicIds = imageUrls.map(url => this.cloudinaryService.getPublicIdFromUrl(url));
            await this.cloudinaryService.deleteImages(publicIds);
        }
        catch (error) {
            console.error('Failed to delete images from Cloudinary:', error);
        }
    }
    generateOptimizedImageUrl(url, options = {}) {
        return this.cloudinaryService.generateOptimizedUrl(url, {
            width: options.width || 800,
            height: options.height || 600,
            crop: options.crop || 'fill',
            quality: options.quality || 'auto'
        });
    }
};
exports.ImageUploadService = ImageUploadService;
exports.ImageUploadService = ImageUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService])
], ImageUploadService);
//# sourceMappingURL=image-upload.service.js.map