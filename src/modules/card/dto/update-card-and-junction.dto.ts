import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { UpdateCardDto } from './update-card.dto';
import { Type } from 'class-transformer';
import { UpdateSetCardJunctionDto } from '../../../dto/update-set-card-junction.dto';

export class UpdateCardAndJunctionDto {
  @IsNotEmpty()
  @ValidateNested()
  @IsObject()
  @Type(() => UpdateCardDto)
  card: UpdateCardDto;

  @IsNotEmpty()
  @ValidateNested()
  @IsObject()
  @Type(() => UpdateSetCardJunctionDto)
  setCardJunction: UpdateSetCardJunctionDto;
}
