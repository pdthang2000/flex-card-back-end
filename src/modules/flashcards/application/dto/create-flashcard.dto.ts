import { IsString, MaxLength } from 'class-validator';

export class CreateFlashcardDto {
  @IsString()
  @MaxLength(1000)
  front: string;

  @IsString()
  @MaxLength(1000)
  back: string;
  // Optional: tags?: string[]
}
