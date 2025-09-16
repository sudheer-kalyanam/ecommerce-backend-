"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.configureCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const configureCloudinary = (configService) => {
    cloudinary_1.v2.config({
        cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
        api_key: configService.get('CLOUDINARY_API_KEY'),
        api_secret: configService.get('CLOUDINARY_API_SECRET'),
        secure: true,
    });
    return cloudinary_1.v2;
};
exports.configureCloudinary = configureCloudinary;
//# sourceMappingURL=cloudinary.config.js.map