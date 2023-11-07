import { IsNumber, IsOptional } from 'class-validator';

export class UpdateSetCardJunctionDto {
  @IsOptional()
  @IsNumber()
  orderId?: number;
}
