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
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
const cloudinary_config_1 = require("../../cloudinary.config");
let CloudinaryService = class CloudinaryService {
    configService;
    constructor(configService) {
        this.configService = configService;
        (0, cloudinary_config_1.configureCloudinary)(configService);
    }
    async uploadImage(file, folder = 'ecommerce_products') {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder,
                resource_type: 'auto',
                transformation: [
                    { width: 800, height: 600, crop: 'fill', quality: 'auto' },
                    { format: 'auto' }
                ]
            }, (error, result) => {
                if (error) {
                    reject(error);
                }
                else if (result) {
                    resolve(result.secure_url);
                }
                else {
                    reject(new Error('Upload failed - no result returned'));
                }
            });
            uploadStream.end(file.buffer);
        });
    }
    async uploadMultipleImages(files, folder = 'ecommerce_products') {
        const uploadPromises = files.map(file => this.uploadImage(file, folder));
        return Promise.all(uploadPromises);
    }
    async deleteImage(publicId) {
        return new Promise((resolve, reject) => {
            cloudinary_1.v2.uploader.destroy(publicId, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async deleteImages(publicIds) {
        const deletePromises = publicIds.map(publicId => this.deleteImage(publicId));
        await Promise.all(deletePromises);
    }
    getPublicIdFromUrl(url) {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        return `${folder}/${filename.split('.')[0]}`;
    }
    generateOptimizedUrl(url, options = {}) {
        const publicId = this.getPublicIdFromUrl(url);
        return cloudinary_1.v2.url(publicId, {
            width: options.width || 800,
            height: options.height || 600,
            crop: options.crop || 'fill',
            quality: options.quality || 'auto',
            format: options.format || 'auto',
            secure: true
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map