import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateVaccinationHistoryDto {
  @IsString()
  @MinLength(11)
  user_cpf: string;

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
