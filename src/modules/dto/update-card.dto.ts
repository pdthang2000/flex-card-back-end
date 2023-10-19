import { IsOptional, IsString } from 'class-validator';

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  front?: string;

  @IsOptional()
  @IsString()
  back?: string;
}
