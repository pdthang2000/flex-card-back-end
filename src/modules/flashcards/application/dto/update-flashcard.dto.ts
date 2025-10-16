import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFlashcardDto {
  @IsString()
  @MaxLength(1000)
  front: string;

  @IsString()
  @MaxLength(1000)
  back: string;

  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value) ? value : value !== undefined ? [value] : undefined,
  )
  @IsArray()
  @IsString({ each: true })
  tagNames?: string[];
}
