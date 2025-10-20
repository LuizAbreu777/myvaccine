import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { PostStatus } from '../post.entity';

export class CreatePostDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  address: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  city: string;

  @IsString()
  @MinLength(2)
  @MaxLength(2)
  state: string;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;
}

export class UpdatePostDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  address?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  city?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(2)
  @IsOptional()
  state?: string;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;
}
