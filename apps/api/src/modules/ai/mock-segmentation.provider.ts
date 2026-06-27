import { Injectable } from "@nestjs/common";
import type { SegmentationProvider } from "./ai.types";

@Injectable()
export class MockSegmentationProvider implements SegmentationProvider {
  async createMask(input: { imageUrl: string; box: [number, number, number, number] }) {
    const [x, y, width, height] = input.box;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${x + width}" height="${y + height}"><rect width="100%" height="100%" fill="black"/><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="24" fill="white"/></svg>`;

    return {
      maskUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    };
  }
}
