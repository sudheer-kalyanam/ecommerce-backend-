import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, VerifyOtpDto, ResendOtpDto } from './dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    resendOtp(resendOtpDto: ResendOtpDto): Promise<{
        message: string;
    }>;
    enable2FA(req: any): Promise<{
        secret: string;
        qrCodeUrl: string | undefined;
    }>;
    disable2FA(req: any): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<any>;
}
