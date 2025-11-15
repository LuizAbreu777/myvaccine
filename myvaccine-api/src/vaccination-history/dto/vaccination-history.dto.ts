import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  IsBoolean,
} from "class-validator";

export class CreateVaccinationHistoryDto {
  @IsString()
  @MinLength(11)
  user_cpf: string;

  @IsBoolean()
  @IsOptional()
  is_dependent?: boolean;

  @IsNumber()
  vaccine_id: number;

  @IsNumber()
  post_id: number;

  @IsString()
  @MinLength(1)
  batch: string;

  @IsDateString()
  @IsOptional()
  application_date?: string;
}
