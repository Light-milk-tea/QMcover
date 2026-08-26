export type TitleKind = "operator" | "stage" | "operation" | "theme";

export type CoverFontId = "cn" | "display" | "sans" | "serif";

export type ElementKind = "text" | "box" | "image";

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
  | "five-star";

export type CanvasSkin = "plain" | "firstkill" | "lowspec" | "rogue" | "madness" | "nocore" | "endfield" | "specialist";

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
  | "squad";

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
  scale?: number;
  imageX?: number;
  imageY?: number;
  edgeFade?: boolean;
  edgeFadeAmount?: number;
  fadeRight?: boolean;
  fadeRightSolid?: number;
  objectFit?: "contain" | "cover";
  objectPosition?: string;
  transformOrigin?: string;
  effect?: LayerEffect;
  operatorId?: string;
  artId?: string;
  imageUrl?: string;
  imageDataUrl?: string;
};

export type BoxLayer = LayerBase & {
  kind: "box";
  fill?: string;
  radius?: number;
  chrome?: LayerChrome;
  effect?: LayerEffect;
};

export type Layer = TextLayer | ImageLayer | BoxLayer;

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
  ornamentId?: string;
  paper?: string;
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

export type ElementOverride = {
  x?: number;
  y?: number;
  fontSize?: number;
  font?: CoverFontId;
  color?: string;
  opacity?: number;
  text?: string;
  rotation?: number;
};

export type ResolvedElement = {
  fontSize?: number;
  font?: CoverFontId;
  color?: string;
  x?: number;
  y?: number;
};

export type BuiltinTemplateId = "firstkill" | "lowspec" | "rogue" | "madness" | "nocore" | "endfield" | "specialist";

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
  ornamentId?: string;
  elementStyles?: Record<string, ElementOverride>;
  layers?: Layer[];
  canvasSkin?: CanvasSkin;
  paper?: string;
  templateId?: TemplateId;
};
