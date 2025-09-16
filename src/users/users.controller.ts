import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  updateProfile(@Body() updateData: any, @Request() req) {
    return this.usersService.updateProfile(req.user.sub, updateData);
  }
}
