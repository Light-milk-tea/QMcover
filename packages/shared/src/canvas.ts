export type PlatformPreset = "xiaohongshu" | "bilibili" | "douyin" | "ecommerce" | "custom";

export type LayerType = "text" | "image" | "shape" | "group";

export interface CanvasSize {
  width: number;
  height: number;
  platform: PlatformPreset;
}

export interface LayerTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  align: "left" | "center" | "right";
}

export interface ImageStyle {
  opacity: number;
  cornerRadius?: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ShapeStyle {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  opacity: number;
  radius?: number;
}

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  transform: LayerTransform;
  metadata?: Record<string, string | number | boolean>;
}

export interface TextLayer extends BaseLayer {
  type: "text";
  content: string;
  style: TextStyle;
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  assetId?: string;
  src: string;
  alt?: string;
  style: ImageStyle;
}

export interface ShapeLayer extends BaseLayer {
  type: "shape";
  shape: "rect" | "circle" | "line";
  style: ShapeStyle;
}

export interface GroupLayer extends BaseLayer {
  type: "group";
  children: CanvasLayer[];
}

export type CanvasLayer = TextLayer | ImageLayer | ShapeLayer | GroupLayer;

export interface CanvasDocument {
  id: string;
  name: string;
  version: number;
  canvas: CanvasSize;
  backgroundColor: string;
  layers: CanvasLayer[];
  createdAt: string;
  updatedAt: string;
}

export interface GenerateCoverInput {
  title: string;
  subtitle?: string;
  keywords: string[];
  style: string;
  brand?: string;
  platform: PlatformPreset;
  templateId?: string;
  count: number;
}

export type GenerationJobStatus = "queued" | "planning" | "generating" | "succeeded" | "failed";

export interface GenerationCandidate {
  id: string;
  previewUrl: string;
  document: CanvasDocument;
}

export interface GenerationResult {
  jobId: string;
  status: GenerationJobStatus;
  candidates: GenerationCandidate[];
  error?: string;
}
