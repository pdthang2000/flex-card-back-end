import { IsString, MaxLength } from 'class-validator';

export class CreateFlashcardDto {
  @IsString()
  @MaxLength(100)
  front: string;

  @IsString()
  @MaxLength(100)
  back: string;
  // Optional: tags?: string[]
}
