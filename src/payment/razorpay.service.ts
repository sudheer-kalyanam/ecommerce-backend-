import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  constructor(private configService: ConfigService) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    
    console.log('🔍 RazorpayService initialization:', {
      hasKeyId: !!keyId,
      hasKeySecret: !!keySecret,
      keyIdLength: keyId?.length || 0,
      keySecretLength: keySecret?.length || 0
    });
    
    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(amount: number, currency: string = 'INR', receipt?: string) {
    try {
      const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
      
      // Check if using dummy keys for development
      if (keyId === 'rzp_test_1234567890') {
        console.log('🔧 Using mock Razorpay response for development');
        return {
          id: `order_${Date.now()}`,
          amount: amount * 100,
          currency,
          receipt: receipt || `receipt_${Date.now()}`,
          status: 'created',
          created_at: Date.now(),
        };
      }

      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          order_type: 'ecommerce',
          platform: 'marketplace',
        },
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      
      // If it's an authentication error with dummy keys, return mock response
      if (error.statusCode === 401 && this.configService.get<string>('RAZORPAY_KEY_ID') === 'rzp_test_1234567890') {
        console.log('🔧 Returning mock response for development');
        return {
          id: `order_${Date.now()}`,
          amount: amount * 100,
          currency,
          receipt: receipt || `receipt_${Date.now()}`,
          status: 'created',
          created_at: Date.now(),
        };
      }
      
      throw new Error('Failed to create payment order');
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string) {
    try {
      const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
      
      // Check if using dummy keys for development
      if (keyId === 'rzp_test_1234567890') {
        console.log('🔧 Using mock payment verification for development');
        return {
          verified: true,
          paymentId: paymentId || `pay_${Date.now()}`,
          orderId,
          signature,
          paymentDetails: {
            amount: 0, // Will be set from order
            currency: 'INR',
            status: 'captured',
            method: 'card',
            captured: true,
            description: 'Mock payment for development',
            created_at: Date.now(),
          },
        };
      }

      const razorpayKeySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
      
      // Create the signature string
      const body = orderId + '|' + paymentId;
      
      // Generate the expected signature
      const expectedSignature = crypto
        .createHmac('sha256', razorpayKeySecret || '')
        .update(body.toString())
        .digest('hex');

      // Compare signatures
      const isAuthentic = expectedSignature === signature;

      if (isAuthentic) {
        // Fetch payment details from Razorpay
        const payment = await this.razorpay.payments.fetch(paymentId);
        
        return {
          verified: true,
          paymentId,
          orderId,
          signature,
          paymentDetails: {
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            captured: payment.captured,
            description: payment.description,
            created_at: payment.created_at,
          },
        };
      } else {
        return {
          verified: false,
          paymentId,
          orderId,
          signature,
          error: 'Invalid signature',
        };
      }
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      
      // If it's an authentication error with dummy keys, return mock success
      const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
      if (keyId === 'rzp_test_1234567890') {
        console.log('🔧 Returning mock verification success for development');
        return {
          verified: true,
          paymentId: paymentId || `pay_${Date.now()}`,
          orderId,
          signature,
          paymentDetails: {
            amount: 0,
            currency: 'INR',
            status: 'captured',
            method: 'card',
            captured: true,
            description: 'Mock payment for development',
            created_at: Date.now(),
          },
        };
      }
      
      return {
        verified: false,
        paymentId,
        orderId,
        signature,
        error: error.message,
      };
    }
  }

  async capturePayment(paymentId: string, amount: number, currency: string = 'INR') {
    try {
      const captureResponse = await this.razorpay.payments.capture(paymentId, amount * 100, currency);
      return captureResponse;
    } catch (error) {
      console.error('Error capturing payment:', error);
      throw new Error('Failed to capture payment');
    }
  }

  async refundPayment(paymentId: string, amount?: number, notes?: string) {
    try {
      const refundOptions: any = {};
      
      if (amount) {
        refundOptions.amount = amount * 100; // Amount in paise
      }
      
      if (notes) {
        refundOptions.notes = {
          reason: notes
        };
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundOptions);
      return refund;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  async getPaymentDetails(paymentId: string) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
  }
}