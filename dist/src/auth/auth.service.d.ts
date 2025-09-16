import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { SellerRegistrationService } from '../seller-registration/seller-registration.service';
import { LoginDto, RegisterDto, VerifyOtpDto } from './dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private emailService;
    private configService;
    private sellerRegistrationService;
    constructor(prisma: PrismaService, jwtService: JwtService, emailService: EmailService, configService: ConfigService, sellerRegistrationService: SellerRegistrationService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        requiresOTP: boolean;
        userId: any;
        access_token?: undefined;
        user?: undefined;
    } | {
        access_token: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
            profile: null;
        };
        message?: undefined;
        requiresOTP?: undefined;
        userId?: undefined;
    }>;
    register(registerDto: RegisterDto): Promise<{
        message: string;
        userId: string;
        requiresOTP: boolean;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
            profile: null;
        };
    }>;
    enable2FA(userId: string): Promise<{
        secret: string;
        qrCodeUrl: string | undefined;
    }>;
    disable2FA(userId: string): Promise<{
        message: string;
    }>;
    private generateOTP;
    resendOtp(userId: string, purpose: string): Promise<{
        message: string;
    }>;
    private saveOTP;
}
