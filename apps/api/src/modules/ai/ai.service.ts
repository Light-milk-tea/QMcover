import { Injectable } from "@nestjs/common";
import type { GenerateCoverInput } from "@qmcover/shared";
import { MockCoverPlanningProvider } from "./mock-cover-planning.provider";
import { MockImageGenerationProvider } from "./mock-image-generation.provider";
import { MockSegmentationProvider } from "./mock-segmentation.provider";

@Injectable()
export class AiService {
  constructor(
    private readonly planner: MockCoverPlanningProvider,
    private readonly imageGenerator: MockImageGenerationProvider,
    private readonly segmentation: MockSegmentationProvider
  ) {}

  async createCandidate(input: GenerateCoverInput, index: number) {
    const planned = await this.planner.plan(input, index);
    const image = await this.imageGenerator.generate({
      prompt: planned.imagePrompt,
      width: planned.document.canvas.width,
      height: planned.document.canvas.height,
      index
    });

    const document = {
      ...planned.document,
      layers: planned.document.layers.map((layer) => {
        if (layer.type !== "image" || layer.name !== "AI 主视觉背景") {
          return layer;
        }

        return {
          ...layer,
          src: image.url
        };
      })
    };

    return {
      id: document.id,
      previewUrl: image.url,
      document
    };
  }

  createMask(input: { imageUrl: string; box: [number, number, number, number] }) {
    return this.segmentation.createMask(input);
  }
}
