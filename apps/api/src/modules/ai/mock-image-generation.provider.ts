import { Injectable } from "@nestjs/common";
import type { ImageGenerationProvider } from "./ai.types";

@Injectable()
export class MockImageGenerationProvider implements ImageGenerationProvider {
  async generate(input: { prompt: string; width: number; height: number; index: number }) {
    const hue = (input.index * 68 + 250) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${input.width}" height="${input.height}" viewBox="0 0 ${input.width} ${input.height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue}, 78%, 46%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 80) % 360}, 82%, 58%)"/>
    </linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="80"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="${input.width * 0.72}" cy="${input.height * 0.38}" r="${input.width * 0.22}" fill="rgba(255,255,255,0.26)" filter="url(#blur)"/>
  <circle cx="${input.width * 0.22}" cy="${input.height * 0.76}" r="${input.width * 0.28}" fill="rgba(0,0,0,0.18)" filter="url(#blur)"/>
  <path d="M ${input.width * 0.58} ${input.height * 0.18} C ${input.width * 0.82} ${input.height * 0.18}, ${input.width * 0.95} ${input.height * 0.42}, ${input.width * 0.76} ${input.height * 0.62}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="18"/>
</svg>`;

    return {
      url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
      mimeType: "image/svg+xml"
    };
  }
}
