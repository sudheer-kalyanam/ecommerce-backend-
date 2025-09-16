"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
let RazorpayService = class RazorpayService {
    configService;
    razorpay;
    constructor(configService) {
        this.configService = configService;
        const keyId = this.configService.get('RAZORPAY_KEY_ID');
        const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
        console.log('🔍 RazorpayService initialization:', {
            hasKeyId: !!keyId,
            hasKeySecret: !!keySecret,
            keyIdLength: keyId?.length || 0,
            keySecretLength: keySecret?.length || 0
        });
        this.razorpay = new razorpay_1.default({
            key_id: keyId,
            key_secret: keySecret,
        });
    }
    async createOrder(amount, currency = 'INR', receipt) {
        try {
            const keyId = this.configService.get('RAZORPAY_KEY_ID');
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
                amount: amount * 100,
                currency,
                receipt: receipt || `receipt_${Date.now()}`,
                notes: {
                    order_type: 'ecommerce',
                    platform: 'marketplace',
                },
            };
            const order = await this.razorpay.orders.create(options);
            return order;
        }
        catch (error) {
            console.error('Error creating Razorpay order:', error);
            if (error.statusCode === 401 && this.configService.get('RAZORPAY_KEY_ID') === 'rzp_test_1234567890') {
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
    async verifyPayment(paymentId, orderId, signature) {
        try {
            const keyId = this.configService.get('RAZORPAY_KEY_ID');
            if (keyId === 'rzp_test_1234567890') {
                console.log('🔧 Using mock payment verification for development');
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
            const razorpayKeySecret = this.configService.get('RAZORPAY_KEY_SECRET');
            const body = orderId + '|' + paymentId;
            const expectedSignature = crypto_1.default
                .createHmac('sha256', razorpayKeySecret || '')
                .update(body.toString())
                .digest('hex');
            const isAuthentic = expectedSignature === signature;
            if (isAuthentic) {
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
            }
            else {
                return {
                    verified: false,
                    paymentId,
                    orderId,
                    signature,
                    error: 'Invalid signature',
                };
            }
        }
        catch (error) {
            console.error('Error verifying Razorpay payment:', error);
            const keyId = this.configService.get('RAZORPAY_KEY_ID');
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
    async capturePayment(paymentId, amount, currency = 'INR') {
        try {
            const captureResponse = await this.razorpay.payments.capture(paymentId, amount * 100, currency);
            return captureResponse;
        }
        catch (error) {
            console.error('Error capturing payment:', error);
            throw new Error('Failed to capture payment');
        }
    }
    async refundPayment(paymentId, amount, notes) {
        try {
            const refundOptions = {};
            if (amount) {
                refundOptions.amount = amount * 100;
            }
            if (notes) {
                refundOptions.notes = {
                    reason: notes
                };
            }
            const refund = await this.razorpay.payments.refund(paymentId, refundOptions);
            return refund;
        }
        catch (error) {
            console.error('Error processing refund:', error);
            throw new Error('Failed to process refund');
        }
    }
    async getPaymentDetails(paymentId) {
        try {
            const payment = await this.razorpay.payments.fetch(paymentId);
            return payment;
        }
        catch (error) {
            console.error('Error fetching payment details:', error);
            throw new Error('Failed to fetch payment details');
        }
    }
};
exports.RazorpayService = RazorpayService;
exports.RazorpayService = RazorpayService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RazorpayService);
//# sourceMappingURL=razorpay.service.js.map