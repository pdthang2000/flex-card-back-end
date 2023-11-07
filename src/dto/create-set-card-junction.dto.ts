import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSetCardJunctionDto {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;
}
