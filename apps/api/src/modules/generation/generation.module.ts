import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { GenerationController } from "./generation.controller";
import { GenerationService } from "./generation.service";

@Module({
  imports: [AiModule],
  controllers: [GenerationController],
  providers: [GenerationService],
  exports: [GenerationService]
})
export class GenerationModule {}
