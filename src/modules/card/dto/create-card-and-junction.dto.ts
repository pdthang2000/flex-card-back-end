import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCardDto } from './create-card.dto';
import { CreateSetCardJunctionDto } from '../../../dto/create-set-card-junction.dto';

export class CreateCardAndJunctionDto {
  @IsNotEmpty()
  @ValidateNested()
  @IsObject()
  @Type(() => CreateCardDto)
  card: CreateCardDto;

  @IsNotEmpty()
  @ValidateNested()
  @IsObject()
  @Type(() => CreateSetCardJunctionDto)
  setCardJunction: CreateSetCardJunctionDto;
}
