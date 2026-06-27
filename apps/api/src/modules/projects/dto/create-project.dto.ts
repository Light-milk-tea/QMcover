import { IsOptional, IsString } from "class-validator";
import type { PlatformPreset } from "@qmcover/shared";

export class CreateProjectDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  platform?: PlatformPreset;
}
