import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  otpCode: string;

  @IsString()
  @IsNotEmpty()
  purpose: string; // 'login', 'registration', 'password_reset'
}
