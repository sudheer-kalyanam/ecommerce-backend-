import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('customers/wishlist')
@UseGuards(AuthGuard('jwt'))
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  getWishlistItems(@Request() req) {
    return this.wishlistService.getWishlistItems(req.user.sub);
  }

  @Post()
  addToWishlist(
    @Request() req,
    @Body() body: { productId: string }
  ) {
    return this.wishlistService.addToWishlist(req.user.sub, body.productId);
  }

  @Delete(':productId')
  removeFromWishlist(@Request() req, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(req.user.sub, productId);
  }

  @Delete()
  clearWishlist(@Request() req) {
    return this.wishlistService.clearWishlist(req.user.sub);
  }
}