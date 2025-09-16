import { WishlistService } from './wishlist.service';
export declare class WishlistController {
    private wishlistService;
    constructor(wishlistService: WishlistService);
    getWishlistItems(req: any): Promise<{
        id: string;
        product: {
            id: string;
            name: string;
            description: string | null;
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
            seller: {
                id: string;
                businessName: string;
                businessAddress: string;
                businessPhone: string | null;
                businessEmail: string;
            };
            stock: number;
            rating: number;
            reviewCount: number;
        };
        addedAt: string;
    }[]>;
    addToWishlist(req: any, body: {
        productId: string;
    }): Promise<{
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
        userId: string;
        productId: string;
    }>;
    removeFromWishlist(req: any, productId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        productId: string;
    }>;
    clearWishlist(req: any): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
