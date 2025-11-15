import {
  IsString,
  IsDateString,
  MinLength,
  MaxLength,
  IsOptional,
} from "class-validator";

export class CreateDependentDto {
  @IsString()
  @MinLength(11)
  @MaxLength(14)
  cpf: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsDateString()
  dob: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  relationship: string;
}

export class UpdateDependentDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  dob?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  relationship?: string;
}

