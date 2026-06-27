import type { CanvasDocument, CanvasLayer, CanvasSize, LayerTransform, PlatformPreset } from "./canvas";

export const PLATFORM_SIZES: Record<PlatformPreset, CanvasSize> = {
  xiaohongshu: { width: 1242, height: 1660, platform: "xiaohongshu" },
  bilibili: { width: 1920, height: 1080, platform: "bilibili" },
  douyin: { width: 1080, height: 1920, platform: "douyin" },
  ecommerce: { width: 800, height: 800, platform: "ecommerce" },
  custom: { width: 1200, height: 900, platform: "custom" }
};

export function createLayerTransform(input: Partial<LayerTransform> = {}): LayerTransform {
  return {
    x: input.x ?? 0,
    y: input.y ?? 0,
    width: input.width ?? 100,
    height: input.height ?? 100,
    rotation: input.rotation ?? 0,
    scaleX: input.scaleX ?? 1,
    scaleY: input.scaleY ?? 1,
    zIndex: input.zIndex ?? 0,
    locked: input.locked ?? false,
    visible: input.visible ?? true
  };
}

export function createBlankDocument(input: {
  id: string;
  name: string;
  platform?: PlatformPreset;
  layers?: CanvasLayer[];
}): CanvasDocument {
  const now = new Date().toISOString();
  const canvas = PLATFORM_SIZES[input.platform ?? "xiaohongshu"];

  return {
    id: input.id,
    name: input.name,
    version: 1,
    canvas,
    backgroundColor: "#F7F2FF",
    layers: input.layers ?? [],
    createdAt: now,
    updatedAt: now
  };
}
