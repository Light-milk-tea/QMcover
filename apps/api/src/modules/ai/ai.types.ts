import type { CanvasDocument, GenerateCoverInput } from "@qmcover/shared";

export interface PlannedCover {
  document: CanvasDocument;
  imagePrompt: string;
}

export interface CoverPlanningProvider {
  plan(input: GenerateCoverInput, index: number): Promise<PlannedCover>;
}

export interface ImageGenerationProvider {
  generate(input: { prompt: string; width: number; height: number; index: number }): Promise<{
    url: string;
    mimeType: string;
  }>;
}

export interface SegmentationProvider {
  createMask(input: { imageUrl: string; box: [number, number, number, number] }): Promise<{
    maskUrl: string;
  }>;
}
