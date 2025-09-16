import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ApproveSellerDto {
  @IsString()
  @IsNotEmpty()
  registrationId: string;

  @IsString()
  @IsNotEmpty()
  action: 'APPROVE' | 'REJECT';

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
