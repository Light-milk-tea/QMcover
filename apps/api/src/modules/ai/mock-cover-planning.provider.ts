import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { createBlankDocument, createLayerTransform, PLATFORM_SIZES, type GenerateCoverInput } from "@qmcover/shared";
import type { CoverPlanningProvider, PlannedCover } from "./ai.types";

const palettes = [
  { bg: "#6D28D9", accent: "#FDE68A", stroke: "#312E81" },
  { bg: "#0F172A", accent: "#38BDF8", stroke: "#020617" },
  { bg: "#BE185D", accent: "#F9A8D4", stroke: "#831843" },
  { bg: "#047857", accent: "#A7F3D0", stroke: "#064E3B" }
];

@Injectable()
export class MockCoverPlanningProvider implements CoverPlanningProvider {
  async plan(input: GenerateCoverInput, index: number): Promise<PlannedCover> {
    const palette = palettes[index % palettes.length];
    const canvas = PLATFORM_SIZES[input.platform];
    const document = createBlankDocument({
      id: randomUUID(),
      name: `${input.title} 方案 ${index + 1}`,
      platform: input.platform,
      layers: [
        {
          id: `bg-${index}`,
          type: "image",
          name: "AI 主视觉背景",
          src: "",
          transform: createLayerTransform({
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
            zIndex: 0
          }),
          style: { opacity: 1 }
        },
        {
          id: `title-${index}`,
          type: "text",
          name: "主标题",
          content: input.title,
          transform: createLayerTransform({
            x: Math.round(canvas.width * 0.08),
            y: Math.round(canvas.height * 0.12),
            width: Math.round(canvas.width * 0.78),
            height: Math.round(canvas.height * 0.18),
            zIndex: 10
          }),
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: Math.round(canvas.width * 0.07),
            fontWeight: 900,
            letterSpacing: 0,
            lineHeight: 1.08,
            fill: "#FFFFFF",
            stroke: palette.stroke,
            strokeWidth: Math.max(4, Math.round(canvas.width * 0.004)),
            shadowColor: "rgba(0, 0, 0, 0.28)",
            shadowBlur: 18,
            shadowOffsetX: 0,
            shadowOffsetY: 8,
            align: "left"
          }
        },
        {
          id: `subtitle-${index}`,
          type: "text",
          name: "副标题",
          content: input.subtitle ?? input.keywords.slice(0, 3).join(" / "),
          transform: createLayerTransform({
            x: Math.round(canvas.width * 0.08),
            y: Math.round(canvas.height * 0.33),
            width: Math.round(canvas.width * 0.58),
            height: Math.round(canvas.height * 0.08),
            zIndex: 11
          }),
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: Math.round(canvas.width * 0.035),
            fontWeight: 700,
            letterSpacing: 1,
            lineHeight: 1.2,
            fill: palette.accent,
            align: "left"
          }
        }
      ]
    });

    document.backgroundColor = palette.bg;

    return {
      document,
      imagePrompt: [
        `Create a ${input.platform} cover background`,
        `topic: ${input.title}`,
        `style: ${input.style}`,
        `keywords: ${input.keywords.join(", ")}`,
        "no text, leave clean negative space for title typography"
      ].join("; ")
    };
  }
}
