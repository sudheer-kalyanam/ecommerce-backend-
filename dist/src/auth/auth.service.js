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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
const speakeasy = __importStar(require("speakeasy"));
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const seller_registration_service_1 = require("../seller-registration/seller-registration.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    emailService;
    configService;
    sellerRegistrationService;
    constructor(prisma, jwtService, emailService, configService, sellerRegistrationService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.configService = configService;
        this.sellerRegistrationService = sellerRegistrationService;
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(loginDto) {
        const registrationStatus = await this.sellerRegistrationService.getRegistrationStatus(loginDto.email);
        if (registrationStatus.status === 'PENDING') {
            throw new common_1.UnauthorizedException('Your seller registration is pending admin approval. Please wait for approval email.');
        }
        if (registrationStatus.status === 'REJECTED') {
            throw new common_1.UnauthorizedException(`Your seller registration was rejected. Reason: ${registrationStatus.rejectionReason}`);
        }
        if (registrationStatus.status === 'APPROVED') {
            try {
                await this.sellerRegistrationService.createUserAccountForApprovedSeller(loginDto.email);
            }
            catch (error) {
                console.log('User account creation note:', error.message);
            }
        }
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== 'ACTIVE') {
            if (user.role === 'SELLER' && user.status === 'PENDING') {
                const otp = this.generateOTP();
                await this.saveOTP(user.id, otp, 'login');
                await this.emailService.sendOTP(user.email, otp);
                return {
                    message: 'OTP sent to your email for account activation',
                    requiresOTP: true,
                    userId: user.id,
                };
            }
            throw new common_1.UnauthorizedException('Account is not active');
        }
        const requires2FA = user.role === 'SELLER' || user.role === 'CUSTOMER';
        if (requires2FA || user.is2FAEnabled) {
            const otp = this.generateOTP();
            await this.saveOTP(user.id, otp, 'login');
            await this.emailService.sendOTP(user.email, otp);
            return {
                message: 'OTP sent to your email',
                requiresOTP: true,
                userId: user.id,
            };
        }
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profile: null,
            },
        };
    }
    async register(registerDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                phone: registerDto.phone,
                role: registerDto.role || 'CUSTOMER',
                status: 'PENDING',
            },
        });
        const otp = this.generateOTP();
        await this.saveOTP(user.id, otp, 'registration');
        await this.emailService.sendOTP(registerDto.email, otp);
        return {
            message: 'Registration successful. Please verify your email with the OTP sent.',
            userId: user.id,
            requiresOTP: true,
        };
    }
    async verifyOtp(verifyOtpDto) {
        const otpRecord = await this.prisma.otpCode.findFirst({
            where: {
                userId: verifyOtpDto.userId,
                code: verifyOtpDto.otpCode,
                purpose: verifyOtpDto.purpose,
                isUsed: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        if (!otpRecord) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        await this.prisma.otpCode.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
        });
        if (verifyOtpDto.purpose === 'registration') {
            await this.prisma.user.update({
                where: { id: verifyOtpDto.userId },
                data: { status: 'ACTIVE' },
            });
        }
        if (verifyOtpDto.purpose === 'login') {
            await this.prisma.user.update({
                where: { id: verifyOtpDto.userId },
                data: { status: 'ACTIVE' },
            });
        }
        const user = await this.prisma.user.findUnique({
            where: { id: verifyOtpDto.userId },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profile: null,
            },
        };
    }
    async enable2FA(userId) {
        const secret = speakeasy.generateSecret({
            name: 'Ecommerce App',
            issuer: 'Ecommerce',
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: {},
        });
        return {
            secret: secret.base32,
            qrCodeUrl: secret.otpauth_url,
        };
    }
    async disable2FA(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {},
        });
        return { message: '2FA disabled successfully' };
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async resendOtp(userId, purpose) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const otp = this.generateOTP();
        await this.saveOTP(userId, otp, purpose);
        await this.emailService.sendOTP(user.email, otp);
        return {
            message: 'New OTP sent to your email',
        };
    }
    async saveOTP(userId, otp, purpose) {
        await this.prisma.otpCode.deleteMany({
            where: {
                userId,
                purpose,
            },
        });
        await this.prisma.otpCode.create({
            data: {
                userId,
                code: otp,
                purpose,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        email_service_1.EmailService,
        config_1.ConfigService,
        seller_registration_service_1.SellerRegistrationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map