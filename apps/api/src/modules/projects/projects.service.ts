import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { createBlankDocument, type CanvasDocument } from "@qmcover/shared";
import { PrismaService } from "../prisma/prisma.service";
import { TemplatesService } from "../templates/templates.service";
import type { CreateProjectDto } from "./dto/create-project.dto";
import type { UpdateProjectDto } from "./dto/update-project.dto";

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templatesService: TemplatesService
  ) {}

  findAll() {
    return this.prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: { template: true }
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { template: true }
    });

    if (!project) {
      throw new NotFoundException("项目不存在");
    }

    return project;
  }

  async create(dto: CreateProjectDto) {
    const template = dto.templateId ? await this.templatesService.findOne(dto.templateId) : null;
    const document = template
      ? ({
          ...(template.document as CanvasDocument),
          id: randomUUID(),
          name: dto.name,
          updatedAt: new Date().toISOString()
        } satisfies CanvasDocument)
      : createBlankDocument({
          id: randomUUID(),
          name: dto.name,
          platform: dto.platform ?? "xiaohongshu"
        });

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        templateId: template && "createdAt" in template ? dto.templateId : undefined,
        document: document as never,
        thumbnailUrl: template?.thumbnailUrl
      }
    });

    await this.prisma.projectVersion.create({
      data: {
        projectId: project.id,
        version: 1,
        document: document as never,
        note: "创建项目"
      }
    });

    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);

    const latest = await this.prisma.projectVersion.findFirst({
      where: { projectId: id },
      orderBy: { version: "desc" }
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    const document: CanvasDocument = {
      ...dto.document,
      name: dto.name ?? dto.document.name,
      version: nextVersion,
      updatedAt: new Date().toISOString()
    };

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        document: document as never,
        thumbnailUrl: dto.thumbnailUrl
      }
    });

    await this.prisma.projectVersion.create({
      data: {
        projectId: id,
        version: nextVersion,
        document: document as never,
        note: dto.note ?? "保存项目"
      }
    });

    return project;
  }

  versions(projectId: string) {
    return this.prisma.projectVersion.findMany({
      where: { projectId },
      orderBy: { version: "desc" }
    });
  }
}
