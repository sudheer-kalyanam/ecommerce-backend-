import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class ResendOtpDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['login', 'registration', 'password_reset'])
  purpose: string;
}
