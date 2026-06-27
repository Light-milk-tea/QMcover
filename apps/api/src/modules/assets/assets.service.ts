import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.asset.findMany({
      orderBy: { createdAt: "desc" }
    });
  }

  createGeneratedAsset(input: {
    url: string;
    mimeType: string;
    width?: number;
    height?: number;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.asset.create({
      data: {
        kind: "generated",
        url: input.url,
        mimeType: input.mimeType,
        width: input.width,
        height: input.height,
        metadata: input.metadata as never
      }
    });
  }
}
