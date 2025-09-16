import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';

import { PrismaService } from '../prisma/prisma.service';
// import { UsersService } from '../users/users.service'; // Removed for simplified schema
import { EmailService } from '../email/email.service';
import { SellerRegistrationService } from '../seller-registration/seller-registration.service';
import { LoginDto, RegisterDto, VerifyOtpDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    // private usersService: UsersService, // Removed for simplified schema
    private emailService: EmailService,
    private configService: ConfigService,
    private sellerRegistrationService: SellerRegistrationService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    // First, check if this is a seller registration that needs approval
    const registrationStatus = await this.sellerRegistrationService.getRegistrationStatus(loginDto.email);
    
    if (registrationStatus.status === 'PENDING') {
      throw new UnauthorizedException('Your seller registration is pending admin approval. Please wait for approval email.');
    }
    
    if (registrationStatus.status === 'REJECTED') {
      throw new UnauthorizedException(`Your seller registration was rejected. Reason: ${registrationStatus.rejectionReason}`);
    }

    // If registration is approved but user doesn't exist yet, create the account
    if (registrationStatus.status === 'APPROVED') {
      try {
        await this.sellerRegistrationService.createUserAccountForApprovedSeller(loginDto.email);
        // Continue with the login flow for the newly created user
      } catch (error) {
        // User might already exist, continue with normal login
        console.log('User account creation note:', error.message);
      }
    }

    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      // For sellers, if status is PENDING, they need OTP verification
      if (user.role === 'SELLER' && user.status === 'PENDING') {
        // Generate and send OTP for seller activation
        const otp = this.generateOTP();
        await this.saveOTP(user.id, otp, 'login');
        
        // Send OTP asynchronously to prevent timeout
        this.emailService.sendOTP(user.email, otp).catch(error => {
          console.error('Failed to send seller activation OTP email:', error.message);
          // OTP is already logged in email service, so login can continue
        });
        
        return {
          message: 'OTP sent to your email for account activation',
          requiresOTP: true,
          userId: user.id,
        };
      }
      throw new UnauthorizedException('Account is not active');
    }

    // Check if 2FA is required (for Seller & Customer roles, not Admin)
    const requires2FA = user.role === 'SELLER' || user.role === 'CUSTOMER';
    
    if (requires2FA || user.is2FAEnabled) {
      // Generate and send OTP
      const otp = this.generateOTP();
      await this.saveOTP(user.id, otp, 'login');
      
      // Send OTP asynchronously to prevent timeout
      this.emailService.sendOTP(user.email, otp).catch(error => {
        console.error('Failed to send OTP email:', error.message);
        // OTP is already logged in email service, so login can continue
      });
      
      return {
        message: 'OTP sent to your email',
        requiresOTP: true,
        userId: user.id,
      };
    }

    // Generate JWT token
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
        profile: null, // Profile data removed for simplified schema
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
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
        status: 'PENDING', // User must verify email before being active
      },
    });

    // Generate and send OTP for email verification
    const otp = this.generateOTP();
    await this.saveOTP(user.id, otp, 'registration');
    
    // Send OTP asynchronously to prevent timeout
    this.emailService.sendOTP(registerDto.email, otp).catch(error => {
      console.error('Failed to send registration OTP email:', error.message);
      // OTP is already logged in email service, so registration can continue
    });

    return {
      message: 'Registration successful. Please verify your email with the OTP sent.',
      userId: user.id,
      requiresOTP: true,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
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
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // If it's a registration OTP, activate the user
    if (verifyOtpDto.purpose === 'registration') {
      await this.prisma.user.update({
        where: { id: verifyOtpDto.userId },
        data: { status: 'ACTIVE' },
      });
    }
    
    // For login OTP, also ensure user is active (in case they were deactivated)
    if (verifyOtpDto.purpose === 'login') {
      await this.prisma.user.update({
        where: { id: verifyOtpDto.userId },
        data: { status: 'ACTIVE' },
      });
    }

    // Get user data for login response
    const user = await this.prisma.user.findUnique({
      where: { id: verifyOtpDto.userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate JWT token
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
        profile: null, // Profile data removed for simplified schema
      },
    };
  }

  async enable2FA(userId: string) {
    const secret = speakeasy.generateSecret({
      name: 'Ecommerce App',
      issuer: 'Ecommerce',
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
      },
    });

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url,
    };
  }

  async disable2FA(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
      },
    });

    return { message: '2FA disabled successfully' };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async resendOtp(userId: string, purpose: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate and send new OTP
    const otp = this.generateOTP();
    await this.saveOTP(userId, otp, purpose);
    
    // Send OTP asynchronously to prevent timeout
    this.emailService.sendOTP(user.email, otp).catch(error => {
      console.error('Failed to send resend OTP email:', error.message);
      // OTP is already logged in email service, so resend can continue
    });

    return {
      message: 'New OTP sent to your email',
    };
  }

  private async saveOTP(userId: string, otp: string, purpose: string) {
    // Delete any existing OTPs for this user and purpose
    await this.prisma.otpCode.deleteMany({
      where: {
        userId,
        purpose,
      },
    });

    // Save new OTP
    await this.prisma.otpCode.create({
      data: {
        userId,
        code: otp,
        purpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });
  }
}
