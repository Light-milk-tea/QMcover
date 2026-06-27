import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { MockCoverPlanningProvider } from "./mock-cover-planning.provider";
import { MockImageGenerationProvider } from "./mock-image-generation.provider";
import { MockSegmentationProvider } from "./mock-segmentation.provider";

@Module({
  providers: [AiService, MockCoverPlanningProvider, MockImageGenerationProvider, MockSegmentationProvider],
  exports: [AiService]
})
export class AiModule {}
