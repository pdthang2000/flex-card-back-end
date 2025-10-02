import { IsString, MaxLength } from 'class-validator';

export class RenameTagDto {
  @IsString()
  @MaxLength(50)
  name: string;
}
