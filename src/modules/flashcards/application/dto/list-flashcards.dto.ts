import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../../dto/pagination.dto';

export class ListFlashcardsDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const values = Array.isArray(value) ? value : [value];
    const normalized = values
      .map((name) => (typeof name === 'string' ? name.trim() : ''))
      .filter((name) => !!name);
    return normalized.length ? normalized : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  tagNames?: string[];

  @IsOptional()
  @IsIn(['all', 'any'], { message: 'mode must be either "all" or "any"' })
  mode?: 'all' | 'any';

  @IsOptional()
  @IsIn(['link', 'card'], { message: 'sort must be either "link" or "card"' })
  sort?: 'link' | 'card';
}
