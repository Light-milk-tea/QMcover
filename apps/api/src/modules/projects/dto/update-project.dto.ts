import { IsObject, IsOptional, IsString } from "class-validator";
import type { CanvasDocument } from "@qmcover/shared";

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsObject()
  document!: CanvasDocument;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
