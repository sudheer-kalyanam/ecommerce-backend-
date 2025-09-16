import type { Response } from 'express';
import { SellerRegistrationService } from './seller-registration.service';
import { UploadService } from '../upload/upload.service';
import { SellerRegistrationDto, ApproveSellerDto } from './dto';
export declare class SellerRegistrationController {
    private readonly sellerRegistrationService;
    private readonly uploadService;
    constructor(sellerRegistrationService: SellerRegistrationService, uploadService: UploadService);
    registerSeller(registrationDto: SellerRegistrationDto): Promise<{
        message: string;
        requiresOTP: boolean;
        email: string;
    }>;
    registerSellerWithFiles(registrationDto: SellerRegistrationDto, files: Express.Multer.File[]): Promise<{
        message: string;
        requiresOTP: boolean;
        email: string;
    }>;
    verifyOTPAndRegister(body: {
        email: string;
        otp: string;
        registrationData: SellerRegistrationDto;
    }): Promise<{
        message: string;
        registrationId: string;
        status: import("@prisma/client").$Enums.SellerRegistrationStatus;
    }>;
    getRegistrationStatus(email: string): Promise<{
        status: string;
        rejectionReason?: undefined;
        reviewedAt?: undefined;
    } | {
        status: import("@prisma/client").$Enums.SellerRegistrationStatus;
        rejectionReason: string | null;
        reviewedAt: Date | null;
    }>;
    getPendingRegistrations(req: any): Promise<{
        id: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        status: import("@prisma/client").$Enums.SellerRegistrationStatus;
        createdAt: Date;
        updatedAt: Date;
        businessName: string;
        businessType: string;
        businessAddress: string;
        businessPhone: string;
        businessEmail: string;
        taxId: string | null;
        bankAccountNumber: string | null;
        bankName: string | null;
        businessLicense: string | null;
        idProof: string | null;
        rejectionReason: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
    }[]>;
    getApprovedRegistrations(req: any): Promise<{
        id: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        status: import("@prisma/client").$Enums.SellerRegistrationStatus;
        createdAt: Date;
        updatedAt: Date;
        businessName: string;
        businessType: string;
        businessAddress: string;
        businessPhone: string;
        businessEmail: string;
        taxId: string | null;
        bankAccountNumber: string | null;
        bankName: string | null;
        businessLicense: string | null;
        idProof: string | null;
        rejectionReason: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
    }[]>;
    getRejectedRegistrations(req: any): Promise<{
        id: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        status: import("@prisma/client").$Enums.SellerRegistrationStatus;
        createdAt: Date;
        updatedAt: Date;
        businessName: string;
        businessType: string;
        businessAddress: string;
        businessPhone: string;
        businessEmail: string;
        taxId: string | null;
        bankAccountNumber: string | null;
        bankName: string | null;
        businessLicense: string | null;
        idProof: string | null;
        rejectionReason: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
    }[]>;
    getRegistrationById(id: string, req: any): Promise<{
        id: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        status: import("@prisma/client").$Enums.SellerRegistrationStatus;
        createdAt: Date;
        updatedAt: Date;
        businessName: string;
        businessType: string;
        businessAddress: string;
        businessPhone: string;
        businessEmail: string;
        taxId: string | null;
        bankAccountNumber: string | null;
        bankName: string | null;
        businessLicense: string | null;
        idProof: string | null;
        rejectionReason: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
    }>;
    approveSeller(approveDto: ApproveSellerDto, req: any): Promise<{
        message: string;
        email: string;
        rejectionReason?: undefined;
    } | {
        message: string;
        rejectionReason: string;
        email?: undefined;
    } | undefined>;
    createUserAccountForApprovedSeller(data: {
        email: string;
    }): Promise<{
        id: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    downloadFile(registrationId: string, fileType: 'businessLicense' | 'idProof', req: any, res: Response): Promise<void>;
}
