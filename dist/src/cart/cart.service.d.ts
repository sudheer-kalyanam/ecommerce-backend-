import { PrismaService } from '../prisma/prisma.service';
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    getCartItems(userId: string): Promise<{
        id: string;
        product: {
            id: string;
            name: string;
            images: any;
            price: number;
            category: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
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
        estimatedDelivery: string;
    }[]>;
    addToCart(userId: string, productId: string, quantity: number, sellerId?: string): Promise<{
        product: {
            category: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
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
            name: string;
            rejectionReason: string | null;
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
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
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        sellerId: string;
        quantity: number;
        productId: string;
    }>;
    updateCartItem(userId: string, itemId: string, quantity: number): Promise<{
        product: {
            category: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
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
            name: string;
            rejectionReason: string | null;
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
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
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        sellerId: string;
        quantity: number;
        productId: string;
    }>;
    removeFromCart(userId: string, itemId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        sellerId: string;
        quantity: number;
        productId: string;
    }>;
    clearCart(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    private calculateEstimatedDelivery;
}
