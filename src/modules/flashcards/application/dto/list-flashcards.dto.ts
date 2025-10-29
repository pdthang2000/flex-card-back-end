import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../../dto/pagination.dto';

export class ListFlashcardsDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const values = Array.isArray(value) ? value : [value];
    const normalized = values
      .flatMap((item) =>
        typeof item === 'string'
          ? item
              .split(',')
              .map((name) => name.trim())
              .filter((name) => !!name)
          : [],
      )
      .filter((name) => !!name);
    console.log({ normalized });
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

  @IsOptional()
  @IsString()
  frontContains?: string;

  @IsOptional()
  @IsString()
  backContains?: string;
}
