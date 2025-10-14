import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../../dto/pagination.dto';

export class ListFlashcardsDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @IsOptional()
  @IsIn(['all', 'any'], { message: 'mode must be either "all" or "any"' })
  mode?: 'all' | 'any';

  @IsOptional()
  @IsIn(['link', 'card'], { message: 'sort must be either "link" or "card"' })
  sort?: 'link' | 'card';
}
