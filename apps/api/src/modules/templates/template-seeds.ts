import { createBlankDocument, createLayerTransform, type CanvasDocument } from "@qmcover/shared";

export interface TemplateSeed {
  id: string;
  name: string;
  description: string;
  platform: string;
  scene: string;
  width: number;
  height: number;
  thumbnailUrl: string;
  document: CanvasDocument;
}

export const templateSeeds: TemplateSeed[] = [
  {
    id: "tpl-xhs-knowledge",
    name: "小红书知识封面",
    description: "适合课程、教程、经验分享类内容。",
    platform: "xiaohongshu",
    scene: "knowledge",
    width: 1242,
    height: 1660,
    thumbnailUrl: "/templates/xhs-knowledge.svg",
    document: createBlankDocument({
      id: "tpl-xhs-knowledge-doc",
      name: "小红书知识封面",
      platform: "xiaohongshu",
      layers: [
        {
          id: "title",
          type: "text",
          name: "主标题",
          content: "7 天学会 AI 绘画",
          transform: createLayerTransform({ x: 92, y: 180, width: 1058, height: 180, zIndex: 10 }),
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: 88,
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1.1,
            fill: "#FFFFFF",
            stroke: "#7C3AED",
            strokeWidth: 6,
            shadowColor: "rgba(76, 29, 149, 0.35)",
            shadowBlur: 18,
            shadowOffsetX: 0,
            shadowOffsetY: 8,
            align: "left"
          }
        },
        {
          id: "subtitle",
          type: "text",
          name: "副标题",
          content: "零基础入门教程",
          transform: createLayerTransform({ x: 110, y: 390, width: 760, height: 82, zIndex: 11 }),
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: 1,
            lineHeight: 1.2,
            fill: "#FDE68A",
            align: "left"
          }
        }
      ]
    })
  },
  {
    id: "tpl-bili-tech",
    name: "B 站科技缩略图",
    description: "适合横版科技评测和工具教程。",
    platform: "bilibili",
    scene: "tech",
    width: 1920,
    height: 1080,
    thumbnailUrl: "/templates/bili-tech.svg",
    document: createBlankDocument({
      id: "tpl-bili-tech-doc",
      name: "B 站科技缩略图",
      platform: "bilibili",
      layers: [
        {
          id: "title",
          type: "text",
          name: "主标题",
          content: "AI 工具效率翻倍",
          transform: createLayerTransform({ x: 120, y: 190, width: 1000, height: 160, zIndex: 10 }),
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: 0,
            lineHeight: 1.05,
            fill: "#FFFFFF",
            stroke: "#111827",
            strokeWidth: 8,
            shadowColor: "rgba(0, 0, 0, 0.35)",
            shadowBlur: 16,
            shadowOffsetX: 0,
            shadowOffsetY: 10,
            align: "left"
          }
        }
      ]
    })
  }
];
