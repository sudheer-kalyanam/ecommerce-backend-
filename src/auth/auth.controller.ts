import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, VerifyOtpDto, ResendOtpDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto.userId, resendOtpDto.purpose);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/enable')
  async enable2FA(@Request() req) {
    return this.authService.enable2FA(req.user.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/disable')
  async disable2FA(@Request() req) {
    return this.authService.disable2FA(req.user.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }
}

