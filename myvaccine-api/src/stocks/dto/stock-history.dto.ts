import { IsEnum, IsInt, IsString, IsOptional, IsDateString, Min } from 'class-validator';
import { StockMovementType } from '../stock-history.entity';

export class CreateStockHistoryDto {
  @IsInt()
  @Min(1)
  post_id: number;

  @IsInt()
  @Min(1)
  vaccine_id: number;

  @IsOptional()
  @IsString()
  user_id?: string;

  @IsEnum(StockMovementType)
  movement_type: StockMovementType;

  @IsInt()
  quantity_change: number;

  @IsInt()
  @Min(0)
  quantity_before: number;

  @IsInt()
  @Min(0)
  quantity_after: number;

  @IsOptional()
  @IsString()
  batch?: string;

  @IsOptional()
  @IsDateString()
  expiration_date?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class StockHistoryResponseDto {
  id: number;
  post_id: number;
  vaccine_id: number;
  user_id?: string;
  movement_type: StockMovementType;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  batch?: string;
  expiration_date?: string;
  reason?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  post?: {
    id: number;
    name: string;
    city: string;
    state: string;
  };
  vaccine?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}
