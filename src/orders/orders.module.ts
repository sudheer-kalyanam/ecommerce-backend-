import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController, SellerOrdersController, AdminOrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PrismaModule, PaymentModule],
  controllers: [OrdersController, SellerOrdersController, AdminOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}