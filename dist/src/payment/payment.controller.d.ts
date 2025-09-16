import { RazorpayService } from './razorpay.service';
export declare class PaymentController {
    private razorpayService;
    constructor(razorpayService: RazorpayService);
    createOrder(req: any, body: {
        amount: number;
        currency?: string;
        receipt?: string;
    }): Promise<{
        success: boolean;
        order: import("razorpay/dist/types/orders").Orders.RazorpayOrder | {
            id: string;
            amount: number;
            currency: string;
            receipt: string;
            status: string;
            created_at: number;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        order?: undefined;
    }>;
    verifyPayment(req: any, body: {
        paymentId: string;
        orderId: string;
        signature: string;
    }): Promise<{
        success: boolean;
        verification: {
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
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        verification?: undefined;
    }>;
    capturePayment(req: any, body: {
        paymentId: string;
        amount: number;
    }): Promise<{
        success: boolean;
        capture: import("razorpay/dist/types/payments").Payments.RazorpayPayment;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        capture?: undefined;
    }>;
    refundPayment(req: any, body: {
        paymentId: string;
        amount?: number;
        notes?: string;
    }): Promise<{
        success: boolean;
        refund: import("razorpay/dist/types/refunds").Refunds.RazorpayRefund;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        refund?: undefined;
    }>;
}
