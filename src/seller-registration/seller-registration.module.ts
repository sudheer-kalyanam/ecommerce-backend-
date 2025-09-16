import { Module } from '@nestjs/common';
import { SellerRegistrationService } from './seller-registration.service';
import { SellerRegistrationController } from './seller-registration.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, EmailModule, UploadModule],
  controllers: [SellerRegistrationController],
  providers: [SellerRegistrationService],
  exports: [SellerRegistrationService],
})
export class SellerRegistrationModule {}
