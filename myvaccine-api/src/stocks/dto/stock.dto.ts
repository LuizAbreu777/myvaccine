import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";

export class CreateStockDto {
  @IsNumber()
  post_id: number;

  @IsNumber()
  vaccine_id: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @MinLength(1)
  batch: string;

  @IsDateString()
  expiration_date: string;
}

export class UpdateStockDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsString()
  @MinLength(1)
  @IsOptional()
  batch?: string;

  @IsDateString()
  @IsOptional()
  expiration_date?: string;
}
