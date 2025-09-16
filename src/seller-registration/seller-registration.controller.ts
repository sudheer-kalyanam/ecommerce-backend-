import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  Res
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { SellerRegistrationService } from './seller-registration.service';
import { UploadService } from '../upload/upload.service';
import { SellerRegistrationDto, ApproveSellerDto } from './dto';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Controller('seller-registration')
export class SellerRegistrationController {
  constructor(
    private readonly sellerRegistrationService: SellerRegistrationService,
    private readonly uploadService: UploadService
  ) {}

  @Post('register')
  async registerSeller(@Body() registrationDto: SellerRegistrationDto) {
    return this.sellerRegistrationService.registerSeller(registrationDto);
  }

  @Post('register-with-files')
  @UseInterceptors(AnyFilesInterceptor({
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
      fileSize: 2 * 1024 * 1024, // 2MB
    },
    fileFilter: (req, file, cb) => {
      // For testing, allow any file type
      console.log('File received:', file.originalname, 'MIME type:', file.mimetype, 'Field name:', file.fieldname);
      cb(null, true);
    },
  }))
  async registerSellerWithFiles(
    @Body() registrationDto: SellerRegistrationDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    console.log('=== FILE UPLOAD REGISTRATION ===');
    console.log('Registration data:', registrationDto);
    console.log('Files received:', files);
    console.log('Number of files:', files ? files.length : 0);
    
    // Handle file uploads
    let businessLicense: string | undefined = undefined;
    let idProof: string | undefined = undefined;

    if (files && files.length > 0) {
      for (const file of files) {
        console.log('Processing file:', file.fieldname, file.originalname, file.filename);
        this.uploadService.validateFileSize(file);
        
        if (file.fieldname === 'businessLicense') {
          businessLicense = this.uploadService.getFileUrl(file.filename);
        } else if (file.fieldname === 'idProof') {
          idProof = this.uploadService.getFileUrl(file.filename);
        }
      }
    }

    // Add file paths to registration data
    const registrationDataWithFiles = {
      ...registrationDto,
      businessLicense,
      idProof
    };

    return this.sellerRegistrationService.registerSellerWithFiles(
      registrationDto, 
      businessLicense, 
      idProof
    );
  }

  @Post('verify-otp')
  async verifyOTPAndRegister(@Body() body: { email: string; otp: string; registrationData: SellerRegistrationDto }) {
    return this.sellerRegistrationService.verifyOTPAndRegister(
      body.email, 
      body.otp, 
      body.registrationData
    );
  }

  @Get('status/:email')
  async getRegistrationStatus(@Param('email') email: string) {
    return this.sellerRegistrationService.getRegistrationStatus(email);
  }

  @Get('pending')
  @UseGuards(AuthGuard('jwt'))
  async getPendingRegistrations(@Request() req) {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }
    
    return this.sellerRegistrationService.getPendingRegistrations();
  }

  @Get('approved')
  @UseGuards(AuthGuard('jwt'))
  async getApprovedRegistrations(@Request() req) {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }
    
    return this.sellerRegistrationService.getApprovedRegistrations();
  }

  @Get('rejected')
  @UseGuards(AuthGuard('jwt'))
  async getRejectedRegistrations(@Request() req) {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }
    
    return this.sellerRegistrationService.getRejectedRegistrations();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getRegistrationById(@Param('id') id: string, @Request() req) {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }
    
    return this.sellerRegistrationService.getRegistrationById(id);
  }

  @Post('approve')
  @UseGuards(AuthGuard('jwt'))
  async approveSeller(@Body() approveDto: ApproveSellerDto, @Request() req) {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }
    
    return this.sellerRegistrationService.approveSeller(approveDto, req.user.sub);
  }

  @Post('create-account')
  async createUserAccountForApprovedSeller(@Body() data: { email: string }) {
    return this.sellerRegistrationService.createUserAccountForApprovedSeller(data.email);
  }

  @Get('download/:registrationId/:fileType')
  @UseGuards(AuthGuard('jwt'))
  async downloadFile(
    @Param('registrationId') registrationId: string,
    @Param('fileType') fileType: 'businessLicense' | 'idProof',
    @Request() req,
    @Res() res: Response
  ) {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    const registration = await this.sellerRegistrationService.getRegistrationById(registrationId);
    
    let filePath: string;
    if (fileType === 'businessLicense' && registration.businessLicense) {
      filePath = registration.businessLicense;
    } else if (fileType === 'idProof' && registration.idProof) {
      filePath = registration.idProof;
    } else {
      throw new Error('File not found');
    }

    // Remove the leading slash and convert to full path
    const fullPath = path.join(process.cwd(), filePath.replace(/^\//, ''));
    
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found on disk');
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(fullPath)}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
  }
}
