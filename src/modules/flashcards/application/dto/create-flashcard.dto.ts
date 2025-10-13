import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFlashcardDto {
  @IsString()
  @MaxLength(1000)
  front: string;

  @IsString()
  @MaxLength(1000)
  back: string;
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : undefined))
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
