import { Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../../dto/pagination.dto';

export class ListFlashcardsDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
