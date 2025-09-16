import { ConfigService } from '@nestjs/config';
export declare class RazorpayService {
    private configService;
    private razorpay;
    constructor(configService: ConfigService);
    createOrder(amount: number, currency?: string, receipt?: string): Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder | {
        id: string;
        amount: number;
        currency: string;
        receipt: string;
        status: string;
        created_at: number;
    }>;
    verifyPayment(paymentId: string, orderId: string, signature: string): Promise<{
        verified: boolean;
        paymentId: string;
        orderId: string;
        signature: string;
        paymentDetails: {
            amount: number;
            currency: string;
            status: string;
            method: string;
            captured: boolean;
            description: string;
            created_at: number;
        };
        error?: undefined;
    } | {
        verified: boolean;
        paymentId: string;
        orderId: string;
        signature: string;
        paymentDetails: {
            amount: string | number;
            currency: string;
            status: "created" | "captured" | "authorized" | "refunded" | "failed";
            method: string;
            captured: boolean;
            description: string | undefined;
            created_at: number;
        };
        error?: undefined;
    } | {
        verified: boolean;
        paymentId: string;
        orderId: string;
        signature: string;
        error: any;
        paymentDetails?: undefined;
    }>;
    capturePayment(paymentId: string, amount: number, currency?: string): Promise<import("razorpay/dist/types/payments").Payments.RazorpayPayment>;
    refundPayment(paymentId: string, amount?: number, notes?: string): Promise<import("razorpay/dist/types/refunds").Refunds.RazorpayRefund>;
    getPaymentDetails(paymentId: string): Promise<import("razorpay/dist/types/payments").Payments.RazorpayPayment>;
}
