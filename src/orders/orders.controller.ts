import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('customers/orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  getCustomerOrders(@Request() req) {
    return this.ordersService.getCustomerOrders(req.user.sub);
  }

  @Get(':id')
  getOrderById(@Request() req, @Param('id') orderId: string) {
    return this.ordersService.getOrderById(req.user.sub, orderId);
  }

  @Post()
  createOrder(
    @Request() req,
    @Body() orderData: {
      items: Array<{
        productId: string;
        sellerId: string;
        quantity: number;
        price: number;
      }>;
      deliveryAddress: any;
      paymentMethod: string;
      totalAmount: number;
    }
  ) {
    return this.ordersService.createOrder(req.user.sub, orderData);
  }

  @Patch(':id/cancel')
  cancelOrder(@Request() req, @Param('id') orderId: string) {
    return this.ordersService.cancelOrder(req.user.sub, orderId);
  }

  @Post(':id/process-payment')
  processPayment(
    @Request() req,
    @Param('id') orderId: string,
    @Body() paymentData: {
      paymentId: string;
      orderId: string;
      signature: string;
    }
  ) {
    return this.ordersService.processPayment(orderId, paymentData);
  }
}

@Controller('sellers/orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.SELLER)
export class SellerOrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  getSellerOrders(@Request() req) {
    return this.ordersService.getSellerOrders(req.user.sub);
  }

  @Get(':id')
  getSellerOrderById(@Request() req, @Param('id') orderId: string) {
    return this.ordersService.getSellerOrderById(req.user.sub, orderId);
  }

  @Patch(':id/status')
  updateOrderStatus(
    @Request() req,
    @Param('id') orderId: string,
    @Body() body: { status: string }
  ) {
    return this.ordersService.updateOrderStatus(req.user.sub, orderId, body.status);
  }
}

@Controller('admin/orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminOrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  getOrderById(@Param('id') orderId: string) {
    return this.ordersService.getOrderById('admin', orderId);
  }

  @Patch(':id/status')
  updateOrderStatus(
    @Param('id') orderId: string,
    @Body() body: { status: string }
  ) {
    return this.ordersService.updateOrderStatusByAdmin(orderId, body.status);
  }

  @Get('stats/dashboard')
  getAdminDashboardStats() {
    return this.ordersService.getAdminDashboardStats();
  }

  @Get('stats/analytics')
  getAdminAnalyticsStats() {
    return this.ordersService.getAdminAnalyticsStats();
  }
}