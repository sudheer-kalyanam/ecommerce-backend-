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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const image_upload_service_1 = require("../upload/image-upload.service");
const form_data_transform_interceptor_1 = require("./interceptors/form-data-transform.interceptor");
let ProductsController = class ProductsController {
    productsService;
    imageUploadService;
    constructor(productsService, imageUploadService) {
        this.productsService = productsService;
        this.imageUploadService = imageUploadService;
    }
    create(createProductDto, req) {
        if (req.user.role !== 'SELLER') {
            throw new Error('Only sellers can create products');
        }
        return this.productsService.create(createProductDto, req.user.sub);
    }
    async createWithImages(createProductDto, files, req) {
        if (req.user.role !== 'SELLER') {
            throw new Error('Only sellers can create products');
        }
        console.log('Received data:', {
            name: createProductDto.name,
            description: createProductDto.description,
            price: createProductDto.price,
            priceType: typeof createProductDto.price,
            stock: createProductDto.stock,
            stockType: typeof createProductDto.stock,
            categoryId: createProductDto.categoryId,
            status: createProductDto.status,
            filesCount: files?.length || 0
        });
        return this.productsService.createWithImages(createProductDto, req.user.sub, files);
    }
    findAll(req) {
        if (req.user && req.user.role === 'SELLER') {
            return this.productsService.getSellerProducts(req.user.sub);
        }
        return this.productsService.findAll();
    }
    findOne(id, req) {
        if (req.user && req.user.role === 'SELLER') {
            return this.productsService.findOne(id, req.user.sub);
        }
        return this.productsService.findOne(id);
    }
    update(id, updateProductDto, req) {
        if (req.user.role !== 'SELLER') {
            throw new Error('Only sellers can update products');
        }
        return this.productsService.update(id, updateProductDto, req.user.sub);
    }
    remove(id, req) {
        if (req.user.role !== 'SELLER') {
            throw new Error('Only sellers can delete products');
        }
        return this.productsService.remove(id, req.user.sub);
    }
    getMyProducts(req) {
        if (req.user.role !== 'SELLER') {
            throw new Error('Only sellers can view their products');
        }
        return this.productsService.getSellerProducts(req.user.sub);
    }
    getPendingProducts() {
        return this.productsService.getPendingProducts();
    }
    approveProduct(body, req) {
        return this.productsService.approveProduct(body.productId, req.user.sub, body.action, body.rejectionReason);
    }
    getApprovedProducts() {
        return this.productsService.getApprovedProducts();
    }
    getRejectedProducts() {
        return this.productsService.getRejectedProducts();
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('with-images'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 5, image_upload_service_1.ImageUploadService.getMulterConfig()), form_data_transform_interceptor_1.FormDataTransformInterceptor),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Array, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "createWithImages", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('seller/my-products'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getMyProducts", null);
__decorate([
    (0, common_1.Get)('admin/pending'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getPendingProducts", null);
__decorate([
    (0, common_1.Post)('admin/approve'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "approveProduct", null);
__decorate([
    (0, common_1.Get)('customer/approved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getApprovedProducts", null);
__decorate([
    (0, common_1.Get)('admin/rejected'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getRejectedProducts", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        image_upload_service_1.ImageUploadService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map