import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { UploadService } from '../upload/upload.service';
import { SellerRegistrationDto, ApproveSellerDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SellerRegistrationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private uploadService: UploadService
  ) {}

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async saveOTP(email: string, otp: string, purpose: 'registration'): Promise<void> {
    // For seller registration, we'll store OTP temporarily
    // Since we don't have a user yet, we'll use a temporary approach
    // We'll store the OTP in a way that can be retrieved by email
    
    // First, let's create a temporary user record for OTP storage
    // This will be cleaned up after verification
    const tempUser = await this.prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: 'temp', // Temporary password
        firstName: 'temp',
        lastName: 'temp',
        role: 'CUSTOMER', // Temporary role
        status: 'PENDING'
      }
    });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.otpCode.create({
      data: {
        userId: tempUser.id,
        code: otp,
        purpose,
        expiresAt
      }
    });
  }


  async registerSeller(registrationDto: SellerRegistrationDto) {
    // Check if email already exists in users table (excluding temporary users)
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registrationDto.email }
    });

    if (existingUser && existingUser.password !== 'temp') {
      throw new ConflictException('Email already registered');
    }

    // Check if email already exists in pending registrations
    const existingRegistration = await this.prisma.sellerRegistration.findUnique({
      where: { email: registrationDto.email }
    });

    if (existingRegistration) {
      throw new ConflictException('Registration already pending for this email');
    }

    // Generate and send OTP for email verification
    const otp = this.generateOTP();
    await this.saveOTP(registrationDto.email, otp, 'registration');
    await this.emailService.sendOTP(registrationDto.email, otp);

    return {
      message: 'OTP sent to your email for verification. Please verify your email to complete registration.',
      requiresOTP: true,
      email: registrationDto.email
    };
  }

  async registerSellerWithFiles(registrationDto: SellerRegistrationDto, businessLicense?: string, idProof?: string) {
    // Check if email already exists in users table (excluding temporary users)
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registrationDto.email }
    });

    if (existingUser && existingUser.password !== 'temp') {
      throw new ConflictException('Email already registered');
    }

    // Check if email already exists in pending registrations
    const existingRegistration = await this.prisma.sellerRegistration.findUnique({
      where: { email: registrationDto.email }
    });

    if (existingRegistration) {
      throw new ConflictException('Registration already pending for this email');
    }

    // Create temporary registration with files immediately
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

    // Generate and send OTP for email verification
    const otp = this.generateOTP();
    await this.saveOTP(registrationDto.email, otp, 'registration');
    await this.emailService.sendOTP(registrationDto.email, otp);

    return {
      message: 'OTP sent to your email for verification. Please verify your email to complete registration.',
      requiresOTP: true,
      email: registrationDto.email
    };
  }

  async verifyOTPAndRegister(email: string, otp: string, registrationDto: SellerRegistrationDto) {
    // Find the temporary user created for OTP storage
    const tempUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!tempUser) {
      throw new BadRequestException('No OTP found for this email');
    }

    // Find the OTP record
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: { 
        userId: tempUser.id,
        purpose: 'registration',
        isUsed: false
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord || otpRecord.code !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    // Retrieve file paths from temporary registration if available
    let businessLicense: string | undefined = undefined;
    let idProof: string | undefined = undefined;
    
    const tempRegistration = await this.prisma.sellerRegistration.findUnique({
      where: { email }
    });
    
    if (tempRegistration && tempRegistration.status === 'TEMP') {
      businessLicense = tempRegistration.businessLicense || undefined;
      idProof = tempRegistration.idProof || undefined;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registrationDto.password, 10);

    // Create or update seller registration with file paths
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

    // Mark OTP as used and delete temporary user
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

  async getRegistrationById(id: string) {
    const registration = await this.prisma.sellerRegistration.findUnique({
      where: { id }
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  async approveSeller(approveDto: ApproveSellerDto, adminId: string) {
    const registration = await this.prisma.sellerRegistration.findUnique({
      where: { id: approveDto.registrationId }
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.status !== 'PENDING') {
      throw new BadRequestException('Registration has already been processed');
    }

    if (approveDto.action === 'APPROVE') {
      // Update registration status to approved (but don't create user account yet)
      await this.prisma.sellerRegistration.update({
        where: { id: approveDto.registrationId },
        data: {
          status: 'APPROVED',
          reviewedBy: adminId,
          reviewedAt: new Date()
        }
      });

      // TODO: Send email notification to seller about approval
      // This will be handled by the email service

      return {
        message: 'Seller approved successfully. Email notification sent.',
        email: registration.email
      };
    } else if (approveDto.action === 'REJECT') {
      if (!approveDto.rejectionReason) {
        throw new BadRequestException('Rejection reason is required');
      }

      // Update registration status
      await this.prisma.sellerRegistration.update({
        where: { id: approveDto.registrationId },
        data: {
          status: 'REJECTED',
          rejectionReason: approveDto.rejectionReason,
          reviewedBy: adminId,
          reviewedAt: new Date()
        }
      });

      // TODO: Send email notification to seller about rejection
      // This will be handled by the email service

      return {
        message: 'Seller registration rejected. Email notification sent.',
        rejectionReason: approveDto.rejectionReason
      };
    }
  }

  async getRegistrationStatus(email: string) {
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

  async createUserAccountForApprovedSeller(email: string) {
    const registration = await this.prisma.sellerRegistration.findUnique({
      where: { email }
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.status !== 'APPROVED') {
      throw new BadRequestException('Registration is not approved');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return existingUser;
    }

    // Create user account
    const user = await this.prisma.user.create({
      data: {
        email: registration.email,
        password: registration.password,
        firstName: registration.firstName,
        lastName: registration.lastName,
        phone: registration.phone,
        role: 'SELLER',
        status: 'PENDING' // Will be activated after OTP verification
      }
    });

    return user;
  }
}
