import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { templateSeeds } from "./template-seeds";

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const templates = await this.prisma.template.findMany({
      orderBy: { createdAt: "desc" }
    });

    return templates.length > 0 ? templates : templateSeeds;
  }

  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({ where: { id } });
    const seed = templateSeeds.find((item) => item.id === id);

    if (!template && !seed) {
      throw new NotFoundException("模板不存在");
    }

    return template ?? seed;
  }
}
