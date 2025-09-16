import { PrismaService } from '../prisma/prisma.service';
import { RazorpayService } from '../payment/razorpay.service';
export declare class OrdersService {
    private prisma;
    private razorpayService;
    constructor(prisma: PrismaService, razorpayService: RazorpayService);
    private calculateEstimatedDelivery;
    createOrder(userId: string, orderData: {
        items: Array<{
            productId: string;
            sellerId: string;
            quantity: number;
            price: number;
        }>;
        deliveryAddress: any;
        paymentMethod: string;
        totalAmount: number;
    }): Promise<{
        items: ({
            product: {
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    imageUrl: string | null;
                    parentId: string | null;
                    slug: string;
                } | null;
                seller: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    phone: string | null;
                    id: string;
                };
            } & {
                rejectionReason: string | null;
                id: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                reviewedBy: string | null;
                reviewedAt: Date | null;
                description: string | null;
                price: number;
                stock: number;
                images: string | null;
                categoryId: string | null;
                approvalStatus: import("@prisma/client").$Enums.ProductApprovalStatus;
                sellerId: string;
            };
        } & {
            id: string;
            price: number;
            sellerId: string;
            quantity: number;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
        totalAmount: number;
        paymentMethod: string;
        deliveryAddress: import("@prisma/client/runtime/library").JsonValue;
        estimatedDelivery: Date | null;
        paymentId: string | null;
        paymentStatus: string | null;
    }>;
    processPayment(orderId: string, paymentData: {
        paymentId: string;
        orderId: string;
        signature: string;
    }): Promise<{
        items: ({
            product: {
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    imageUrl: string | null;
                    parentId: string | null;
                    slug: string;
                } | null;
                seller: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    phone: string | null;
                    id: string;
                };
            } & {
                rejectionReason: string | null;
                id: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                reviewedBy: string | null;
                reviewedAt: Date | null;
                description: string | null;
                price: number;
                stock: number;
                images: string | null;
                categoryId: string | null;
                approvalStatus: import("@prisma/client").$Enums.ProductApprovalStatus;
                sellerId: string;
            };
        } & {
            id: string;
            price: number;
            sellerId: string;
            quantity: number;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
        totalAmount: number;
        paymentMethod: string;
        deliveryAddress: import("@prisma/client/runtime/library").JsonValue;
        estimatedDelivery: Date | null;
        paymentId: string | null;
        paymentStatus: string | null;
    }>;
    getSellerOrders(sellerId: string): Promise<{
        id: string;
        orderNumber: string;
        customer: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            id: string;
        };
        status: import("@prisma/client").$Enums.OrderStatus;
        totalAmount: number;
        paymentMethod: string;
        deliveryAddress: import("@prisma/client/runtime/library").JsonValue;
        estimatedDelivery: Date | null;
        paymentStatus: string;
        createdAt: string;
        updatedAt: string;
        items: {
            id: string;
            productId: string;
            product: {
                id: string;
                name: string;
                images: any;
                price: number;
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    imageUrl: string | null;
                    parentId: string | null;
                    slug: string;
                } | null;
            };
            seller: {
                id: string;
                businessName: string;
                businessAddress: string;
                businessPhone: string | null;
                businessEmail: string;
            };
            quantity: number;
            price: number;
        }[];
    }[]>;
    getSellerOrderById(sellerId: string, orderId: string): Promise<{
        id: string;
        orderNumber: string;
        customer: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            id: string;
        };
        status: import("@prisma/client").$Enums.OrderStatus;
        totalAmount: number;
        paymentMethod: string;
        deliveryAddress: import("@prisma/client/runtime/library").JsonValue;
        estimatedDelivery: Date | null;
        paymentStatus: string;
        createdAt: string;
        updatedAt: string;
        items: {
            id: string;
            productId: string;
            product: {
                id: string;
                name: string;
                images: any;
                price: number;
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    imageUrl: string | null;
                    parentId: string | null;
                    slug: string;
                } | null;
            };
            seller: {
                id: string;
                businessName: string;
                businessAddress: string;
                businessPhone: string | null;
                businessEmail: string;
            };
            quantity: number;
            price: number;
        }[];
    }>;
    updateOrderStatus(sellerId: string, orderId: string, status: string): Promise<{
        id: string;
        orderNumber: string;
        customer: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            id: string;
        };
        status: import("@prisma/client").$Enums.OrderStatus;
        totalAmount: number;
        paymentMethod: string;
        deliveryAddress: import("@prisma/client/runtime/library").JsonValue;
        estimatedDelivery: Date | null;
        paymentStatus: string;
        createdAt: string;
        updatedAt: string;
        items: {
            id: string;
            productId: string;
            product: {
                id: string;
                name: string;
                images: any;
                price: number;
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    imageUrl: string | null;
                    parentId: string | null;
                    slug: string;
                } | null;
            };
            seller: {
                id: string;
                businessName: string;
                businessAddress: string;
                businessPhone: string | null;
                businessEmail: string;
            };
            quantity: number;
            price: number;
        }[];
    }>;
    getCustomerOrders(userId: string): Promise<{
        id: string;
        totalAmount: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        paymentMethod: string;
        deliveryAddress: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        items: {
            id: string;
            product: {
                id: string;
                name: string;
                images: any;
                price: number;
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    imageUrl: string | null;
                    parentId: string | null;
                    slug: string;
                } | null;
            };
            seller: {
                id: string;
                businessName: string;
                businessAddress: string;
                businessPhone: string | null;
                businessEmail: string;
            };
            quantity: number;
            price: number;
        }[];
    }[]>;
    getOrderById(userId: string, orderId: string): Promise<{
        id: string;
        totalAmount: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        paymentMethod: string;
        deliveryAddress: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        items: {
            id: string;
            product: {
                id: string;
                name: string;
                images: any;
                price: number;
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    imageUrl: string | null;
                    parentId: string | null;
                    slug: string;
                } | null;
            };
            seller: {
                id: string;
                businessName: string;
                businessAddress: string;
                businessPhone: string | null;
                businessEmail: string;
            };
            quantity: number;
            price: number;
        }[];
    }>;
    cancelOrder(userId: string, orderId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        paymentDetails: import("@prisma/client/runtime/library").JsonValue | null;
        totalAmount: number;
        paymentMethod: string;
        deliveryAddress: import("@prisma/client/runtime/library").JsonValue;
        estimatedDelivery: Date | null;
        paymentId: string | null;
        paymentStatus: string | null;
    }>;
    getAllOrders(): Promise<{
        id: string;
        orderNumber: string;
        customer: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            id: string;
        };
        status: import("@prisma/client").$Enums.OrderStatus;
        totalAmount: number;
        paymentMethod: string;
        deliveryAddress: import("@prisma/client/runtime/library").JsonValue;
        estimatedDelivery: Date | null;
        paymentStatus: string;
        createdAt: string;
        updatedAt: string;
        items: {
            id: string;
            productId: string;
            product: {
                id: string;
                name: string;
                images: any;
                price: number;
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    imageUrl: string | null;
                    parentId: string | null;
                    slug: string;
                } | null;
            };
            seller: {
                id: string;
                businessName: string;
                businessAddress: string;
                businessPhone: string | null;
                businessEmail: string;
            };
            quantity: number;
            price: number;
        }[];
    }[]>;
    updateOrderStatusByAdmin(orderId: string, status: string): Promise<{
        id: string;
        orderNumber: string;
        customer: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            id: string;
        };
        status: import("@prisma/client").$Enums.OrderStatus;
        totalAmount: number;
        paymentMethod: string;
        deliveryAddress: import("@prisma/client/runtime/library").JsonValue;
        estimatedDelivery: Date | null;
        paymentStatus: string;
        createdAt: string;
        updatedAt: string;
        items: {
            id: string;
            productId: string;
            product: {
                id: string;
                name: string;
                images: any;
                price: number;
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    imageUrl: string | null;
                    parentId: string | null;
                    slug: string;
                } | null;
            };
            seller: {
                id: string;
                businessName: string;
                businessAddress: string;
                businessPhone: string | null;
                businessEmail: string;
            };
            quantity: number;
            price: number;
        }[];
    }>;
    getAdminDashboardStats(): Promise<{
        totalSellers: number;
        pendingSellers: number;
        approvedSellers: number;
        totalProducts: number;
        pendingProducts: number;
        totalCustomers: number;
        totalOrders: number;
        pendingOrders: number;
        totalRevenue: number;
        recentOrders: {
            id: string;
            customer: string;
            amount: number;
            status: import("@prisma/client").$Enums.OrderStatus;
            date: string;
        }[];
    }>;
    getAdminAnalyticsStats(): Promise<{
        totalRevenue: number;
        totalOrders: number;
        totalCustomers: number;
        totalProducts: number;
        revenueGrowth: number;
        ordersGrowth: number;
        topProducts: {
            name: string;
            sales: number;
            revenue: number;
        }[];
        monthlyRevenue: {
            month: string;
            revenue: number;
        }[];
    }>;
}
