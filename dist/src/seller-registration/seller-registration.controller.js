"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerRegistrationController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const seller_registration_service_1 = require("./seller-registration.service");
const upload_service_1 = require("../upload/upload.service");
const dto_1 = require("./dto");
const multer = __importStar(require("multer"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let SellerRegistrationController = class SellerRegistrationController {
    sellerRegistrationService;
    uploadService;
    constructor(sellerRegistrationService, uploadService) {
        this.sellerRegistrationService = sellerRegistrationService;
        this.uploadService = uploadService;
    }
    async registerSeller(registrationDto) {
        return this.sellerRegistrationService.registerSeller(registrationDto);
    }
    async registerSellerWithFiles(registrationDto, files) {
        console.log('=== FILE UPLOAD REGISTRATION ===');
        console.log('Registration data:', registrationDto);
        console.log('Files received:', files);
        console.log('Number of files:', files ? files.length : 0);
        let businessLicense = undefined;
        let idProof = undefined;
        if (files && files.length > 0) {
            for (const file of files) {
                console.log('Processing file:', file.fieldname, file.originalname, file.filename);
                this.uploadService.validateFileSize(file);
                if (file.fieldname === 'businessLicense') {
                    businessLicense = this.uploadService.getFileUrl(file.filename);
                }
                else if (file.fieldname === 'idProof') {
                    idProof = this.uploadService.getFileUrl(file.filename);
                }
            }
        }
        const registrationDataWithFiles = {
            ...registrationDto,
            businessLicense,
            idProof
        };
        return this.sellerRegistrationService.registerSellerWithFiles(registrationDto, businessLicense, idProof);
    }
    async verifyOTPAndRegister(body) {
        return this.sellerRegistrationService.verifyOTPAndRegister(body.email, body.otp, body.registrationData);
    }
    async getRegistrationStatus(email) {
        return this.sellerRegistrationService.getRegistrationStatus(email);
    }
    async getPendingRegistrations(req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.sellerRegistrationService.getPendingRegistrations();
    }
    async getApprovedRegistrations(req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.sellerRegistrationService.getApprovedRegistrations();
    }
    async getRejectedRegistrations(req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.sellerRegistrationService.getRejectedRegistrations();
    }
    async getRegistrationById(id, req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.sellerRegistrationService.getRegistrationById(id);
    }
    async approveSeller(approveDto, req) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        return this.sellerRegistrationService.approveSeller(approveDto, req.user.sub);
    }
    async createUserAccountForApprovedSeller(data) {
        return this.sellerRegistrationService.createUserAccountForApprovedSeller(data.email);
    }
    async downloadFile(registrationId, fileType, req, res) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized: Admin access required');
        }
        const registration = await this.sellerRegistrationService.getRegistrationById(registrationId);
        let filePath;
        if (fileType === 'businessLicense' && registration.businessLicense) {
            filePath = registration.businessLicense;
        }
        else if (fileType === 'idProof' && registration.idProof) {
            filePath = registration.idProof;
        }
        else {
            throw new Error('File not found');
        }
        const fullPath = path.join(process.cwd(), filePath.replace(/^\//, ''));
        if (!fs.existsSync(fullPath)) {
            throw new Error('File not found on disk');
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(fullPath)}"`);
        const fileStream = fs.createReadStream(fullPath);
        fileStream.pipe(res);
    }
};
exports.SellerRegistrationController = SellerRegistrationController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SellerRegistrationDto]),
    __metadata("design:returntype", Promise)
], SellerRegistrationController.prototype, "registerSeller", null);
__decorate([
    (0, common_1.Post)('register-with-files'),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = path.join(process.cwd(), 'uploads');
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                console.log('File destination:', uploadPath);
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
                console.log('File filename:', filename);
                cb(null, filename);
            },
        }),
        limits: {
            fileSize: 2 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            console.log('File received:', file.originalname, 'MIME type:', file.mimetype, 'Field name:', file.fieldname);
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SellerRegistrationDto, Array]),
    __metadata("design:returntype", Promise)
], SellerRegistrationController.prototype, "registerSellerWithFiles", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SellerRegistrationController.prototype, "verifyOTPAndRegister", null);
__decorate([
    (0, common_1.Get)('status/:email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SellerRegistrationController.prototype, "getRegistrationStatus", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SellerRegistrationController.prototype, "getPendingRegistrations", null);
__decorate([
    (0, common_1.Get)('approved'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SellerRegistrationController.prototype, "getApprovedRegistrations", null);
__decorate([
    (0, common_1.Get)('rejected'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SellerRegistrationController.prototype, "getRejectedRegistrations", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SellerRegistrationController.prototype, "getRegistrationById", null);
__decorate([
    (0, common_1.Post)('approve'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ApproveSellerDto, Object]),
    __metadata("design:returntype", Promise)
], SellerRegistrationController.prototype, "approveSeller", null);
__decorate([
    (0, common_1.Post)('create-account'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SellerRegistrationController.prototype, "createUserAccountForApprovedSeller", null);
__decorate([
    (0, common_1.Get)('download/:registrationId/:fileType'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('registrationId')),
    __param(1, (0, common_1.Param)('fileType')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], SellerRegistrationController.prototype, "downloadFile", null);
exports.SellerRegistrationController = SellerRegistrationController = __decorate([
    (0, common_1.Controller)('seller-registration'),
    __metadata("design:paramtypes", [seller_registration_service_1.SellerRegistrationService,
        upload_service_1.UploadService])
], SellerRegistrationController);
//# sourceMappingURL=seller-registration.controller.js.map