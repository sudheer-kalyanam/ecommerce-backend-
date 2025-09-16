import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ImageUploadService } from '../upload/image-upload.service';
export declare class ProductsController {
    private readonly productsService;
    private readonly imageUploadService;
    constructor(productsService: ProductsService, imageUploadService: ImageUploadService);
    create(createProductDto: CreateProductDto, req: any): Promise<{
        images: any;
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
            id: string;
        };
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
        categoryId: string | null;
        approvalStatus: import("@prisma/client").$Enums.ProductApprovalStatus;
        sellerId: string;
    }>;
    createWithImages(createProductDto: CreateProductDto, files: Express.Multer.File[], req: any): Promise<{
        images: string[];
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
            id: string;
        };
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
        categoryId: string | null;
        approvalStatus: import("@prisma/client").$Enums.ProductApprovalStatus;
        sellerId: string;
    }>;
    findAll(req: any): Promise<{
        images: any;
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
            id: string;
        };
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
        categoryId: string | null;
        approvalStatus: import("@prisma/client").$Enums.ProductApprovalStatus;
        sellerId: string;
    }[]>;
    findOne(id: string, req: any): Promise<{
        images: any;
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
            id: string;
        };
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
        categoryId: string | null;
        approvalStatus: import("@prisma/client").$Enums.ProductApprovalStatus;
        sellerId: string;
    }>;
    update(id: string, updateProductDto: UpdateProductDto, req: any): Promise<{
        images: any;
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
            id: string;
        };
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
        categoryId: string | null;
        approvalStatus: import("@prisma/client").$Enums.ProductApprovalStatus;
        sellerId: string;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    getMyProducts(req: any): Promise<{
        images: any;
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
            id: string;
        };
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
        categoryId: string | null;
        approvalStatus: import("@prisma/client").$Enums.ProductApprovalStatus;
        sellerId: string;
    }[]>;
    getPendingProducts(): Promise<{
        images: any;
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
            id: string;
        };
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
        categoryId: string | null;
        approvalStatus: import("@prisma/client").$Enums.ProductApprovalStatus;
        sellerId: string;
    }[]>;
    approveProduct(body: {
        productId: string;
        action: 'APPROVED' | 'REJECTED';
        rejectionReason?: string;
    }, req: any): Promise<{
        images: any;
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
            id: string;
        };
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
        categoryId: string | null;
        approvalStatus: import("@prisma/client").$Enums.ProductApprovalStatus;
        sellerId: string;
    }>;
    getApprovedProducts(): Promise<{
        images: any;
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
            id: string;
        };
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
        categoryId: string | null;
        approvalStatus: import("@prisma/client").$Enums.ProductApprovalStatus;
        sellerId: string;
    }[]>;
    getRejectedProducts(): Promise<{
        images: any;
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
            id: string;
        };
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
        categoryId: string | null;
        approvalStatus: import("@prisma/client").$Enums.ProductApprovalStatus;
        sellerId: string;
    }[]>;
}
