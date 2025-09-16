import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('customers/cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCartItems(@Request() req) {
    return this.cartService.getCartItems(req.user.sub);
  }

  @Post()
  addToCart(
    @Request() req,
    @Body() body: { productId: string; quantity: number; sellerId?: string }
  ) {
    return this.cartService.addToCart(req.user.sub, body.productId, body.quantity, body.sellerId);
  }

  @Patch(':id')
  updateCartItem(
    @Request() req,
    @Param('id') itemId: string,
    @Body() body: { quantity: number }
  ) {
    return this.cartService.updateCartItem(req.user.sub, itemId, body.quantity);
  }

  @Delete(':id')
  removeFromCart(@Request() req, @Param('id') itemId: string) {
    return this.cartService.removeFromCart(req.user.sub, itemId);
  }

  @Delete()
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.sub);
  }
}