import { PrismaService } from '../prisma/prisma.service';
export declare class WishlistService {
    private prisma;
    constructor(prisma: PrismaService);
    getWishlistItems(userId: string): Promise<{
        id: string;
        product: {
            id: string;
            name: string;
            description: string | null;
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
    addToWishlist(userId: string, productId: string): Promise<{
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
        userId: string;
        productId: string;
    }>;
    removeFromWishlist(userId: string, productId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        productId: string;
    }>;
    clearWishlist(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    isInWishlist(userId: string, productId: string): Promise<boolean>;
}
