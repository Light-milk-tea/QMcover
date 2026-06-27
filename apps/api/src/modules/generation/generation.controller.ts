import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateGenerationJobDto } from "./dto/create-generation-job.dto";
import { GenerationService } from "./generation.service";

@Controller("generation-jobs")
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post()
  create(@Body() dto: CreateGenerationJobDto) {
    return this.generationService.create(dto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.generationService.findOne(id);
  }

  @Post(":id/retry")
  retry(@Param("id") id: string) {
    return this.generationService.retry(id);
  }
}
