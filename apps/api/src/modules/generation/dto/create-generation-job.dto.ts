import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import type { PlatformPreset } from "@qmcover/shared";

export class CreateGenerationJobDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @IsString({ each: true })
  keywords!: string[];

  @IsString()
  style!: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsIn(["xiaohongshu", "bilibili", "douyin", "ecommerce", "custom"])
  platform!: PlatformPreset;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsInt()
  @Min(4)
  @Max(8)
  count = 4;
}
