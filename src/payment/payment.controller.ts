import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RazorpayService } from './razorpay.service';

@Controller('payment')
@UseGuards(AuthGuard('jwt'))
export class PaymentController {
  constructor(private razorpayService: RazorpayService) {}

  @Post('create-order')
  async createOrder(
    @Request() req,
    @Body() body: {
      amount: number;
      currency?: string;
      receipt?: string;
    }
  ) {
    try {
      console.log('🔍 PaymentController.createOrder called with:', body);
      console.log('🔍 User:', req.user);
      
      const order = await this.razorpayService.createOrder(
        body.amount,
        body.currency || 'INR',
        body.receipt
      );
      
      console.log('✅ Razorpay order created:', order);
      
      return {
        success: true,
        order,
      };
    } catch (error) {
      console.error('❌ PaymentController.createOrder error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('verify')
  async verifyPayment(
    @Request() req,
    @Body() body: {
      paymentId: string;
      orderId: string;
      signature: string;
    }
  ) {
    try {
      const verification = await this.razorpayService.verifyPayment(
        body.paymentId,
        body.orderId,
        body.signature
      );
      
      return {
        success: true,
        verification,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('capture')
  async capturePayment(
    @Request() req,
    @Body() body: {
      paymentId: string;
      amount: number;
    }
  ) {
    try {
      const capture = await this.razorpayService.capturePayment(
        body.paymentId,
        body.amount
      );
      
      return {
        success: true,
        capture,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('refund')
  async refundPayment(
    @Request() req,
    @Body() body: {
      paymentId: string;
      amount?: number;
      notes?: string;
    }
  ) {
    try {
      const refund = await this.razorpayService.refundPayment(
        body.paymentId,
        body.amount,
        body.notes
      );
      
      return {
        success: true,
        refund,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
