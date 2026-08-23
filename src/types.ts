export type TitleKind = "operator" | "stage" | "operation" | "theme";

export type CoverFontId = "cn" | "display" | "sans" | "serif";

export type ElementKind = "text" | "box" | "image";

export type ElementOverride = {
  x?: number;
  y?: number;
  fontSize?: number;
  font?: CoverFontId;
  color?: string;
  opacity?: number;
};

export type ResolvedElement = {
  fontSize?: number;
  font?: CoverFontId;
  color?: string;
  x?: number;
  y?: number;
};

export type TemplateId = "firstkill" | "lowspec" | "rogue" | "madness" | "nocore";

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
  defaultImageX?: number;
  defaultImageY?: number;
  showBackground?: boolean;
  defaultBgPreset?: string;
  showTextBackground?: boolean;
  defaultTextBgPreset?: string;
  showBgDim?: boolean;
  defaultBgDim?: boolean;
  defaultBgDimAmount?: number;
  defaultOperatorId?: string;
  defaultArtId?: string;
  showOrnament?: boolean;
  defaultOrnamentId?: string;
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
  textBgPreset: string;
  bgDim: boolean;
  bgDimAmount: number;
  ornamentId: string;
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
  textBgPreset?: string;
  bgDim?: boolean;
  bgDimAmount?: number;
  ornamentId?: string;
  elementStyles?: Record<string, ElementOverride>;
};
