import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateCardDto } from '../../card/dto/create-card.dto';
import { Type } from 'class-transformer';

export class CreateSetDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @ValidateNested()
  @IsArray()
  @Type(() => CreateCardDto)
  cards: CreateCardDto[];
}
