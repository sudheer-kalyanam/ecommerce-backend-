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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const razorpay_service_1 = require("./razorpay.service");
let PaymentController = class PaymentController {
    razorpayService;
    constructor(razorpayService) {
        this.razorpayService = razorpayService;
    }
    async createOrder(req, body) {
        try {
            console.log('🔍 PaymentController.createOrder called with:', body);
            console.log('🔍 User:', req.user);
            const order = await this.razorpayService.createOrder(body.amount, body.currency || 'INR', body.receipt);
            console.log('✅ Razorpay order created:', order);
            return {
                success: true,
                order,
            };
        }
        catch (error) {
            console.error('❌ PaymentController.createOrder error:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async verifyPayment(req, body) {
        try {
            const verification = await this.razorpayService.verifyPayment(body.paymentId, body.orderId, body.signature);
            return {
                success: true,
                verification,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async capturePayment(req, body) {
        try {
            const capture = await this.razorpayService.capturePayment(body.paymentId, body.amount);
            return {
                success: true,
                capture,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async refundPayment(req, body) {
        try {
            const refund = await this.razorpayService.refundPayment(body.paymentId, body.amount, body.notes);
            return {
                success: true,
                refund,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('create-order'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)('capture'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "capturePayment", null);
__decorate([
    (0, common_1.Post)('refund'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "refundPayment", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('payment'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [razorpay_service_1.RazorpayService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map