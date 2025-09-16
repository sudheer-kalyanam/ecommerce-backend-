import { CartService } from './cart.service';
export declare class CartController {
    private cartService;
    constructor(cartService: CartService);
    getCartItems(req: any): Promise<{
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
        estimatedDelivery: string;
    }[]>;
    addToCart(req: any, body: {
        productId: string;
        quantity: number;
        sellerId?: string;
    }): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        sellerId: string;
        quantity: number;
        productId: string;
    }>;
    updateCartItem(req: any, itemId: string, body: {
        quantity: number;
    }): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        sellerId: string;
        quantity: number;
        productId: string;
    }>;
    removeFromCart(req: any, itemId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        sellerId: string;
        quantity: number;
        productId: string;
    }>;
    clearCart(req: any): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
