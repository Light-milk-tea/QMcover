import { Injectable, NotFoundException } from "@nestjs/common";
import type { GenerateCoverInput } from "@qmcover/shared";
import { AiService } from "../ai/ai.service";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateGenerationJobDto } from "./dto/create-generation-job.dto";

@Injectable()
export class GenerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService
  ) {}

  async create(dto: CreateGenerationJobDto) {
    const input: GenerateCoverInput = {
      title: dto.title,
      subtitle: dto.subtitle,
      keywords: dto.keywords,
      style: dto.style,
      brand: dto.brand,
      platform: dto.platform,
      templateId: dto.templateId,
      count: dto.count
    };

    const auditError = this.auditInput(input);
    if (auditError) {
      return this.prisma.generationJob.create({
        data: {
          projectId: dto.projectId,
          input: input as never,
          status: "failed",
          error: auditError
        }
      });
    }

    const job = await this.prisma.generationJob.create({
      data: {
        projectId: dto.projectId,
        input: input as never,
        status: "planning"
      }
    });

    try {
      await this.prisma.generationJob.update({
        where: { id: job.id },
        data: { status: "generating" }
      });

      const candidates = await Promise.all(
        Array.from({ length: input.count }, (_, index) => this.aiService.createCandidate(input, index))
      );

      return this.prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: "succeeded",
          candidates: candidates as never
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "生成失败";
      return this.prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: "failed",
          error: message
        }
      });
    }
  }

  async findOne(id: string) {
    const job = await this.prisma.generationJob.findUnique({ where: { id } });

    if (!job) {
      throw new NotFoundException("生成任务不存在");
    }

    return job;
  }

  async retry(id: string) {
    const job = await this.findOne(id);
    const input = job.input as unknown as CreateGenerationJobDto;
    return this.create({
      ...input,
      projectId: job.projectId ?? undefined
    });
  }

  private auditInput(input: GenerateCoverInput) {
    const text = [input.title, input.subtitle, input.style, input.brand, ...input.keywords].filter(Boolean).join(" ");
    const blockedWords = ["暴力血腥", "违法", "仇恨"];
    const matched = blockedWords.find((word) => text.includes(word));

    return matched ? `内容包含不适合生成的词语：${matched}` : undefined;
  }
}
