import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RazorpayService } from './razorpay.service';
import { PaymentController } from './payment.controller';

@Module({
  imports: [ConfigModule],
  providers: [RazorpayService],
  controllers: [PaymentController],
  exports: [RazorpayService],
})
export class PaymentModule {}
