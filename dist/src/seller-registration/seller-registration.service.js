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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerRegistrationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const upload_service_1 = require("../upload/upload.service");
const bcrypt = __importStar(require("bcrypt"));
let SellerRegistrationService = class SellerRegistrationService {
    prisma;
    emailService;
    uploadService;
    constructor(prisma, emailService, uploadService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.uploadService = uploadService;
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async saveOTP(email, otp, purpose) {
        const tempUser = await this.prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: 'temp',
                firstName: 'temp',
                lastName: 'temp',
                role: 'CUSTOMER',
                status: 'PENDING'
            }
        });
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.prisma.otpCode.create({
            data: {
                userId: tempUser.id,
                code: otp,
                purpose,
                expiresAt
            }
        });
    }
    async registerSeller(registrationDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registrationDto.email }
        });
        if (existingUser && existingUser.password !== 'temp') {
            throw new common_1.ConflictException('Email already registered');
        }
        const existingRegistration = await this.prisma.sellerRegistration.findUnique({
            where: { email: registrationDto.email }
        });
        if (existingRegistration) {
            throw new common_1.ConflictException('Registration already pending for this email');
        }
        const otp = this.generateOTP();
        await this.saveOTP(registrationDto.email, otp, 'registration');
        await this.emailService.sendOTP(registrationDto.email, otp);
        return {
            message: 'OTP sent to your email for verification. Please verify your email to complete registration.',
            requiresOTP: true,
            email: registrationDto.email
        };
    }
    async registerSellerWithFiles(registrationDto, businessLicense, idProof) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registrationDto.email }
        });
        if (existingUser && existingUser.password !== 'temp') {
            throw new common_1.ConflictException('Email already registered');
        }
        const existingRegistration = await this.prisma.sellerRegistration.findUnique({
            where: { email: registrationDto.email }
        });
        if (existingRegistration) {
            throw new common_1.ConflictException('Registration already pending for this email');
        }
        const tempRegistration = await this.prisma.sellerRegistration.upsert({
            where: { email: registrationDto.email },
            update: {
                businessLicense,
                idProof,
                status: 'TEMP'
            },
            create: {
                email: registrationDto.email,
                password: 'temp',
                firstName: 'temp',
                lastName: 'temp',
                phone: '',
                businessName: 'temp',
                businessType: 'temp',
                businessAddress: 'temp',
                businessPhone: 'temp',
                businessEmail: registrationDto.email,
                businessLicense,
                idProof,
                status: 'TEMP'
            }
        });
        const otp = this.generateOTP();
        await this.saveOTP(registrationDto.email, otp, 'registration');
        await this.emailService.sendOTP(registrationDto.email, otp);
        return {
            message: 'OTP sent to your email for verification. Please verify your email to complete registration.',
            requiresOTP: true,
            email: registrationDto.email
        };
    }
    async verifyOTPAndRegister(email, otp, registrationDto) {
        const tempUser = await this.prisma.user.findUnique({
            where: { email }
        });
        if (!tempUser) {
            throw new common_1.BadRequestException('No OTP found for this email');
        }
        const otpRecord = await this.prisma.otpCode.findFirst({
            where: {
                userId: tempUser.id,
                purpose: 'registration',
                isUsed: false
            },
            orderBy: { createdAt: 'desc' }
        });
        if (!otpRecord || otpRecord.code !== otp) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        if (otpRecord.expiresAt < new Date()) {
            throw new common_1.BadRequestException('OTP has expired');
        }
        let businessLicense = undefined;
        let idProof = undefined;
        const tempRegistration = await this.prisma.sellerRegistration.findUnique({
            where: { email }
        });
        if (tempRegistration && tempRegistration.status === 'TEMP') {
            businessLicense = tempRegistration.businessLicense || undefined;
            idProof = tempRegistration.idProof || undefined;
        }
        const hashedPassword = await bcrypt.hash(registrationDto.password, 10);
        const registration = await this.prisma.sellerRegistration.upsert({
            where: { email },
            update: {
                ...registrationDto,
                password: hashedPassword,
                businessLicense,
                idProof,
                status: 'PENDING'
            },
            create: {
                ...registrationDto,
                password: hashedPassword,
                businessLicense,
                idProof,
                status: 'PENDING'
            }
        });
        await this.prisma.otpCode.update({
            where: { id: otpRecord.id },
            data: { isUsed: true }
        });
        await this.prisma.user.delete({
            where: { id: tempUser.id }
        });
        return {
            message: 'Email verified successfully! Seller registration submitted. Please wait for admin approval.',
            registrationId: registration.id,
            status: registration.status
        };
    }
    async getPendingRegistrations() {
        return this.prisma.sellerRegistration.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getApprovedRegistrations() {
        return this.prisma.sellerRegistration.findMany({
            where: { status: 'APPROVED' },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getRejectedRegistrations() {
        return this.prisma.sellerRegistration.findMany({
            where: { status: 'REJECTED' },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getRegistrationById(id) {
        const registration = await this.prisma.sellerRegistration.findUnique({
            where: { id }
        });
        if (!registration) {
            throw new common_1.NotFoundException('Registration not found');
        }
        return registration;
    }
    async approveSeller(approveDto, adminId) {
        const registration = await this.prisma.sellerRegistration.findUnique({
            where: { id: approveDto.registrationId }
        });
        if (!registration) {
            throw new common_1.NotFoundException('Registration not found');
        }
        if (registration.status !== 'PENDING') {
            throw new common_1.BadRequestException('Registration has already been processed');
        }
        if (approveDto.action === 'APPROVE') {
            await this.prisma.sellerRegistration.update({
                where: { id: approveDto.registrationId },
                data: {
                    status: 'APPROVED',
                    reviewedBy: adminId,
                    reviewedAt: new Date()
                }
            });
            return {
                message: 'Seller approved successfully. Email notification sent.',
                email: registration.email
            };
        }
        else if (approveDto.action === 'REJECT') {
            if (!approveDto.rejectionReason) {
                throw new common_1.BadRequestException('Rejection reason is required');
            }
            await this.prisma.sellerRegistration.update({
                where: { id: approveDto.registrationId },
                data: {
                    status: 'REJECTED',
                    rejectionReason: approveDto.rejectionReason,
                    reviewedBy: adminId,
                    reviewedAt: new Date()
                }
            });
            return {
                message: 'Seller registration rejected. Email notification sent.',
                rejectionReason: approveDto.rejectionReason
            };
        }
    }
    async getRegistrationStatus(email) {
        const registration = await this.prisma.sellerRegistration.findUnique({
            where: { email }
        });
        if (!registration) {
            return { status: 'NOT_FOUND' };
        }
        return {
            status: registration.status,
            rejectionReason: registration.rejectionReason,
            reviewedAt: registration.reviewedAt
        };
    }
    async createUserAccountForApprovedSeller(email) {
        const registration = await this.prisma.sellerRegistration.findUnique({
            where: { email }
        });
        if (!registration) {
            throw new common_1.NotFoundException('Registration not found');
        }
        if (registration.status !== 'APPROVED') {
            throw new common_1.BadRequestException('Registration is not approved');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return existingUser;
        }
        const user = await this.prisma.user.create({
            data: {
                email: registration.email,
                password: registration.password,
                firstName: registration.firstName,
                lastName: registration.lastName,
                phone: registration.phone,
                role: 'SELLER',
                status: 'PENDING'
            }
        });
        return user;
    }
};
exports.SellerRegistrationService = SellerRegistrationService;
exports.SellerRegistrationService = SellerRegistrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        upload_service_1.UploadService])
], SellerRegistrationService);
//# sourceMappingURL=seller-registration.service.js.map