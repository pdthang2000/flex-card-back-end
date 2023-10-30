import { IsOptional, IsString } from 'class-validator';

export class CreateCardDto {
  @IsOptional()
  @IsString()
  front?: string;

  @IsOptional()
  @IsString()
  back?: string;
}
