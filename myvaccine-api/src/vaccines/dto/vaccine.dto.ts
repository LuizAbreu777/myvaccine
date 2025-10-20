import { IsString, IsNumber, IsOptional, MinLength, MaxLength, Min } from 'class-validator';

export class CreateVaccineDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(0)
  min_age: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  max_age?: number;

  @IsString()
  @IsOptional()
  contraindications?: string;
}

export class UpdateVaccineDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  min_age?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  max_age?: number;

  @IsString()
  @IsOptional()
  contraindications?: string;
}
