import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ImageUploadService } from '../upload/image-upload.service';
import { FormDataTransformInterceptor } from './interceptors/form-data-transform.interceptor';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly imageUploadService: ImageUploadService
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    // Check if user is a seller
    if (req.user.role !== 'SELLER') {
      throw new Error('Only sellers can create products');
    }
    
    return this.productsService.create(createProductDto, req.user.sub);
  }

  @Post('with-images')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FilesInterceptor('images', 5, ImageUploadService.getMulterConfig()),
    FormDataTransformInterceptor
  )
  async createWithImages(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req
  ) {
    // Check if user is a seller
    if (req.user.role !== 'SELLER') {
      throw new Error('Only sellers can create products');
    }
    
    // Debug logging
    console.log('Received data:', {
      name: createProductDto.name,
      description: createProductDto.description,
      price: createProductDto.price,
      priceType: typeof createProductDto.price,
      stock: createProductDto.stock,
      stockType: typeof createProductDto.stock,
      categoryId: createProductDto.categoryId,
      status: createProductDto.status,
      filesCount: files?.length || 0
    });
    
    return this.productsService.createWithImages(createProductDto, req.user.sub, files);
  }

  @Get()
  findAll(@Request() req) {
    // If user is a seller, only show their products
    if (req.user && req.user.role === 'SELLER') {
      return this.productsService.getSellerProducts(req.user.sub);
    }
    
    // Otherwise, show all products
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // If user is a seller, only allow them to see their own products
    if (req.user && req.user.role === 'SELLER') {
      return this.productsService.findOne(id, req.user.sub);
    }
    
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req) {
    // Check if user is a seller
    if (req.user.role !== 'SELLER') {
      throw new Error('Only sellers can update products');
    }
    
    return this.productsService.update(id, updateProductDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @Request() req) {
    // Check if user is a seller
    if (req.user.role !== 'SELLER') {
      throw new Error('Only sellers can delete products');
    }
    
    return this.productsService.remove(id, req.user.sub);
  }

  @Get('seller/my-products')
  @UseGuards(AuthGuard('jwt'))
  getMyProducts(@Request() req) {
    // Check if user is a seller
    if (req.user.role !== 'SELLER') {
      throw new Error('Only sellers can view their products');
    }
    
    return this.productsService.getSellerProducts(req.user.sub);
  }

  // Admin-only endpoints for product approval
  @Get('admin/pending')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  getPendingProducts() {
    return this.productsService.getPendingProducts();
  }

  @Post('admin/approve')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  approveProduct(@Body() body: { productId: string; action: 'APPROVED' | 'REJECTED'; rejectionReason?: string }, @Request() req) {
    return this.productsService.approveProduct(body.productId, req.user.sub, body.action, body.rejectionReason);
  }

  @Get('customer/approved')
  getApprovedProducts() {
    return this.productsService.getApprovedProducts();
  }

  @Get('admin/rejected')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  getRejectedProducts() {
    return this.productsService.getRejectedProducts();
  }
}