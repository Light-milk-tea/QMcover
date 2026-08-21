export type TitleKind = "operator" | "stage" | "operation" | "theme";

export type CoverFontId = "cn" | "display" | "sans";

export type ElementKind = "text" | "box" | "image";

export type ElementOverride = {
  x?: number;
  y?: number;
  fontSize?: number;
  font?: CoverFontId;
  color?: string;
  opacity?: number;
};

export type TemplateId = "firstkill" | "lowspec" | "rogue" | "madness";

export type TemplateMeta = {
  id: TemplateId;
  name: string;
  blurb: string;
  defaultSubtitle: string;
  showEpisode: boolean;
  sampleTitle: string;
  titleKind?: TitleKind;
  titleLabel?: string;
  titlePlaceholder?: string;
  subtitleLabel?: string;
  episodeLabel?: string;
  signatureLabel?: string;
  defaultEpisode?: number;
  sampleEpisode?: number;
  sampleSignature?: string;
  defaultImageScale?: number;
  showBackground?: boolean;
  defaultBgPreset?: string;
  defaultOperatorId?: string;
};

export type Draft = {
  title: string;
  subtitle: string;
  signature: string;
  date: string;
  episode: number;
  operatorName: string;
  operatorId: string;
  artId: string;
  imageUrl: string;
  imageDataUrl: string;
  imageScale: number;
  imageX: number;
  imageY: number;
  showSafeArea: boolean;
  bgPreset: string;
  elementStyles: Record<string, ElementOverride>;
};

export type CoverRenderProps = {
  title: string;
  subtitle: string;
  signature: string;
  episode: number;
  date: string;
  operatorName: string;
  imageUrl: string;
  imageScale: number;
  imageX: number;
  imageY: number;
  previewScale: number;
  onImageDrag: (dx: number, dy: number) => void;
  showPlaceholder?: boolean;
  bgPreset?: string;
  elementStyles?: Record<string, ElementOverride>;
};
