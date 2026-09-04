export type TitleKind = "operator" | "stage" | "operation" | "theme";

export type CoverFontId = "cn" | "display" | "sans" | "serif" | "script";

export type ElementKind = "text" | "box" | "image";

export type ImageFrame = "polaroid";

export type TextBind = "custom" | "title" | "subtitle" | "episode" | "signature" | "mark" | "operatorName";

export type LayerEffect =
  | "slant"
  | "stroke"
  | "hollow"
  | "scratch"
  | "polaroid"
  | "diag-clip"
  | "split-de"
  | "split-stage"
  | "split-limit"
  | "sign-stripe"
  | "gold-title"
  | "glass"
  | "chapter"
  | "episode-zh"
  | "node"
  | "series-wrap"
  | "tag-prefix"
  | "en-name"
  | "face-word"
  | "guide"
  | "sign-dots";

export type LayerChrome =
  | "cc-triangle"
  | "side-emblem"
  | "vignette"
  | "paper"
  | "bracket-l"
  | "bracket-r"
  | "ef-triangle"
  | "bar-accent"
  | "sign-dots"
  | "five-star"
  | "yellow-dashes"
  | "dot-grid"
  | "halftone-fade"
  | "halftone-side"
  | "soft-shards"
  | "corner-shards"
  | "tactical-guides"
  | "ornament-corner"
  | "ornament-lace"
  | "ak-star"
  | "radar-arcs"
  | "dash-ticks"
  | "originium"
  | "reticle"
  | "hex-cell"
  | "ring-ticks"
  | "chain-rule"
  | "ak-mark";

export type CanvasSkin =
  | "plain"
  | "firstkill"
  | "lowspec"
  | "rogue"
  | "madness"
  | "nocore"
  | "endfield"
  | "specialist"
  | "operator-preview"
  | "fourstar-nocore"
  | "solo";

export type ShaftLightKind = "bloom" | "beam";
export type LightDepth = "behind" | "front";

export type AmountEffect = {
  enabled: boolean;
  amount: number;
};

export type LightEffect = AmountEffect & {
  kind: ShaftLightKind;
  depth: LightDepth;
  x: number;
  y: number;
  rotate: number;
};

export type ArtGradeEffect = {
  enabled: boolean;
  contrast: number;
  saturate: number;
  brightness: number;
  fringe: number;
};

export type BgGradeEffect = {
  enabled: boolean;
  blur: number;
  grayscale: number;
  contrast: number;
  brightness: number;
};

export type CoverEffects = {
  light: LightEffect;
  artGrade: ArtGradeEffect;
  bgGrade: BgGradeEffect;
  scanlines: AmountEffect;
  grain: AmountEffect;
  chromatic: AmountEffect;
  glitch: AmountEffect;
  slashes: AmountEffect;
  vignette: AmountEffect;
};

export type CoverEffectsInput = {
  [K in keyof CoverEffects]?: Partial<CoverEffects[K]>;
};

export type AutoSize =
  | "stage"
  | "operation"
  | "gold"
  | "guide"
  | "theme"
  | "tag"
  | "series"
  | "chapter"
  | "sub"
  | "enName"
  | "row"
  | "name"
  | "seriesBar"
  | "sign"
  | "level"
  | "squad"
  | "stageCode";

export type LayerBase = {
  id: string;
  kind: ElementKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity?: number;
  locked?: boolean;
  hidden?: boolean;
  removed?: boolean;
  rotation?: number;
  color?: string;
};

export type TextLayer = LayerBase & {
  kind: "text";
  text: string;
  font: CoverFontId;
  fontSize: number;
  bind: TextBind;
  effect?: LayerEffect;
  autoSize?: AutoSize;
  letterSpacing?: number;
};

export type ImageLayer = LayerBase & {
  kind: "image";
  source: "operator" | "upload";
  frame?: ImageFrame;
  frameBgPreset?: string;
  frameBgScale?: number;
  frameBgX?: number;
  frameBgY?: number;
  scale?: number;
  imageX?: number;
  imageY?: number;
  edgeFade?: boolean;
  edgeFadeAmount?: number;
  fadeRight?: boolean;
  fadeRightSolid?: number;
  fadeLeft?: boolean;
  fadeLeftSolid?: number;
  objectFit?: "contain" | "cover";
  objectPosition?: string;
  transformOrigin?: string;
  effect?: LayerEffect;
  operatorId?: string;
  artId?: string;
  imageUrl?: string;
  imageDataUrl?: string;
  artGrade?: ArtGradeEffect;
};

export type BoxLayer = LayerBase & {
  kind: "box";
  fill?: string;
  radius?: number;
  chrome?: LayerChrome;
  effect?: LayerEffect;
};

export type Layer = TextLayer | ImageLayer | BoxLayer;

export type ElementOverride = {
  x?: number;
  y?: number;
  w?: number;
  fontSize?: number;
  font?: CoverFontId;
  color?: string;
  opacity?: number;
  text?: string;
  rotation?: number;
};

export type CoverDocument = {
  layers: Layer[];
  canvasSkin?: CanvasSkin;
  title?: string;
  subtitle?: string;
  signature?: string;
  mark?: string;
  episode?: number;
  operatorName?: string;
  operatorId?: string;
  artId?: string;
  imageUrl?: string;
  imageScale?: number;
  imageX?: number;
  imageY?: number;
  imageEdgeFade?: boolean;
  imageEdgeFadeAmount?: number;
  bgPreset?: string;
  textBgPreset?: string;
  bgDim?: boolean;
  bgDimAmount?: number;
  shaftLight?: boolean;
  shaftLightAmount?: number;
  shaftLightKind?: ShaftLightKind;
  shaftLightX?: number;
  shaftLightY?: number;
  shaftLightRotate?: number;
  effects?: CoverEffectsInput;
  ornamentId?: string;
  paper?: string;
  elementStyles?: Record<string, ElementOverride>;
};

export type SavedTemplate = {
  id: string;
  name: string;
  blurb: string;
  createdAt: string;
  basedOn?: string;
  seed: CoverDocument;
  thumbDataUrl?: string;
};

export type ResolvedElement = {
  fontSize?: number;
  font?: CoverFontId;
  color?: string;
  x?: number;
  y?: number;
};

export type BuiltinTemplateId =
  | "firstkill"
  | "lowspec"
  | "rogue"
  | "madness"
  | "nocore"
  | "endfield"
  | "specialist"
  | "operator-preview"
  | "fourstar-nocore"
  | "solo";

export type TemplateId = string;

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
  showMark?: boolean;
  markLabel?: string;
  sampleMark?: string;
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
  showShaftLight?: boolean;
  defaultShaftLight?: boolean;
  defaultShaftLightAmount?: number;
  defaultShaftLightKind?: ShaftLightKind;
  defaultShaftLightX?: number;
  defaultShaftLightY?: number;
  defaultShaftLightRotate?: number;
  defaultOperatorId?: string;
  defaultArtId?: string;
  showOrnament?: boolean;
  defaultOrnamentId?: string;
  canvasSkin?: CanvasSkin;
};

export type Draft = {
  title: string;
  subtitle: string;
  signature: string;
  mark: string;
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
  imageEdgeFade: boolean;
  imageEdgeFadeAmount: number;
  showSafeArea: boolean;
  bgPreset: string;
  textBgPreset: string;
  bgDim: boolean;
  bgDimAmount: number;
  shaftLight: boolean;
  shaftLightAmount: number;
  shaftLightKind: ShaftLightKind;
  shaftLightX: number;
  shaftLightY: number;
  shaftLightRotate: number;
  effects: CoverEffects;
  ornamentId: string;
  layers: Layer[];
  canvasSkin: CanvasSkin;
  paper?: string;
  elementStyles: Record<string, ElementOverride>;
};

export type CoverRenderProps = {
  title: string;
  subtitle: string;
  signature: string;
  mark: string;
  episode: number;
  date: string;
  operatorName: string;
  imageUrl: string;
  imageScale: number;
  imageX: number;
  imageY: number;
  imageEdgeFade?: boolean;
  imageEdgeFadeAmount?: number;
  previewScale: number;
  onImageDrag: (dx: number, dy: number) => void;
  showPlaceholder?: boolean;
  bgPreset?: string;
  textBgPreset?: string;
  bgDim?: boolean;
  bgDimAmount?: number;
  shaftLight?: boolean;
  shaftLightAmount?: number;
  shaftLightKind?: ShaftLightKind;
  shaftLightX?: number;
  shaftLightY?: number;
  shaftLightRotate?: number;
  effects?: CoverEffects;
  ornamentId?: string;
  elementStyles?: Record<string, ElementOverride>;
  layers?: Layer[];
  canvasSkin?: CanvasSkin;
  paper?: string;
  templateId?: TemplateId;
};
