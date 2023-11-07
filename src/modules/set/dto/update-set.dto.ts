import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateCardDto } from '../../card/dto/update-card.dto';

export class UpdateSetDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @ValidateNested()
  @IsArray()
  @Type(() => UpdateCardDto)
  cards: UpdateCardDto[];
}
