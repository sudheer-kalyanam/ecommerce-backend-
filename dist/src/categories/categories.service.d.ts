import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    private mockCategories;
    create(createCategoryDto: CreateCategoryDto): Promise<{
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description?: string;
        imageUrl?: string;
        parentId?: string;
        id: string;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        imageUrl: string | null;
        parentId: string | null;
        slug: string;
    }[]>;
    findHierarchy(): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        imageUrl: string | null;
        parentId: string | null;
        slug: string;
    }>;
    findBySlug(slug: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        imageUrl: string | null;
        parentId: string | null;
        slug: string;
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        imageUrl: string | null;
        parentId: string | null;
        slug: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    private generateSlug;
}
