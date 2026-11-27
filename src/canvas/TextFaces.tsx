import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";
import goldTexture from "../assets/textures/vanguard-gold.png";
import "./TextFaces.css";

/** 紧急授课：白字底部局部青红晕染。 */
export function ChromaticTitle({ text, style }: { text: string; style?: CSSProperties }) {
  return (
    <span className="relative inline-block whitespace-nowrap leading-none"
      style={{ transform: "scaleX(0.96)", transformOrigin: "left center", ...style }}>
      <span aria-hidden className="pointer-events-none absolute left-[-0.026em] top-[0.028em] text-[#2a9caa] opacity-70"
        style={{ maskImage: "linear-gradient(180deg, transparent 35%, #000 76%)" }}>{text}</span>
      <span aria-hidden className="pointer-events-none absolute left-[0.025em] top-[0.035em] text-[#d32980] opacity-80"
        style={{ maskImage: "linear-gradient(180deg, transparent 30%, #000 82%)" }}>{text}</span>
      <span aria-hidden className="pointer-events-none absolute left-[-0.06em] top-[0.05em] text-[#157f91] opacity-55"
        style={{ clipPath: "polygon(0 72%, 18% 82%, 34% 67%, 53% 85%, 72% 70%, 100% 86%, 100% 100%, 0 100%)", filter: "blur(2px)" }}>{text}</span>
      <span aria-hidden className="pointer-events-none absolute left-[0.055em] top-[0.07em] text-[#b92566] opacity-65"
        style={{ clipPath: "polygon(0 80%, 24% 70%, 42% 86%, 67% 74%, 100% 84%, 100% 100%, 0 100%)", filter: "blur(3px)" }}>{text}</span>
      <span aria-hidden className="pointer-events-none absolute inset-0 text-[#180916]" style={{ filter: "blur(9px)", opacity: .65 }}>{text}</span>
      <span className="relative" data-title-face="" style={{
        background: "radial-gradient(ellipse at 14% 94%, #be2867 0%, transparent 22%), radial-gradient(ellipse at 49% 102%, #256c80 0%, transparent 27%), radial-gradient(ellipse at 82% 98%, #d53c82 0%, transparent 22%), linear-gradient(180deg, #fffefd 0%, #fffefd 65%, #fff7f8 79%, #d688ab 100%)",
        backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent",
      }}>{text}</span>
    </span>
  );
}

/** 紧急授课的条件字：粉色字面、细亮边和暗红错位影。 */
export function PinkCondition({ text, color = "#ed91cc", style }: { text: string; color?: string; style?: CSSProperties }) {
  return (
    <span
      className="relative inline-block whitespace-nowrap leading-none"
      style={{ transform: "scaleX(1.04)", transformOrigin: "left center", ...style }}
    >
      <span aria-hidden className="pointer-events-none absolute top-[0.045em] left-[0.04em] text-[#581b34] opacity-72">
        {text}
      </span>
      <span
        className="relative"
        style={{
          color,
          WebkitTextStroke: "0.006em rgba(255,225,245,0.58)",
          paintOrder: "stroke fill",
          textShadow: "0 8px 14px rgba(24,0,20,0.75)",
        }}
      >
        {text}
      </span>
    </span>
  );
}

/** 紧急授课的人数字：细亮边加品红错位影，影距按字号缩放。 */
export function MagentaShadowWord({ text }: { text: string }) {
  return (
    <span
      className="inline-block whitespace-nowrap"
      style={{
        WebkitTextStroke: "0.01em rgba(255,232,251,0.9)",
        paintOrder: "stroke fill",
        textShadow: "0.016em 0.022em 0 rgba(156,31,113,0.58), 0 0.036em 0.062em rgba(0,0,0,0.7)",
      }}
    >
      {text}
    </span>
  );
}

/** 仅需一人：细描边白字加柔和黑影。 */
export function GlowWord({ text, stroke = "0.01em #101014", color = "#ffffff" }: { text: string; stroke?: string; color?: string }) {
  return (
    <span data-solo-title-face="" className="relative inline-block whitespace-nowrap leading-none">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 text-black/65"
        style={{ filter: "blur(4px)" }}
      >
        {text}
      </span>
      <span
        className="relative"
        style={{
          color,
          WebkitTextStroke: stroke,
          paintOrder: "stroke fill",
        }}
      >
        {text}
      </span>
    </span>
  );
}

/** 干员前瞻分析：纸色字面压在错位的暗红描边层上。 */
export function LayeredTitle({ text, color = "#e9e4e1" }: { text: string; color?: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap leading-[0.92]">
      <span
        aria-hidden
        className="pointer-events-none absolute top-[0.058em] left-[0.042em] text-[#5a3038]"
        style={{
          WebkitTextStroke: "0.026em #111920",
          paintOrder: "stroke fill",
        }}
      >
        {text}
      </span>
      <span
        className="relative"
        style={{
          color,
          WebkitTextStroke: "0.011em #252b30",
          paintOrder: "stroke fill",
          textShadow: "0 9px 16px rgba(3,8,12,0.32)",
        }}
      >
        {text}
      </span>
    </span>
  );
}

/** 职业队：硬投影加分层阴影。 */
export function BlockWord({ text, color = "#ffffff" }: { text: string; color?: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span aria-hidden className="pointer-events-none absolute top-[0.055em] left-[0.04em] text-black/70">
        {text}
      </span>
      <span className="sp-type relative" style={{ color }}>
        {text}
      </span>
    </span>
  );
}

const METAL_INK = "#322313";
const METAL_RIM = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
] as const;

/** 强度测评：金属渐变字面、金色细边和暗色厚度。字面颜色取 currentColor。 */
export function MetalType({ text }: { text: string }) {
  return (
    <span className="sr-gold-type relative inline-block whitespace-nowrap" data-type-face>
      <span aria-hidden className="sr-gold-depth pointer-events-none absolute" style={{ color: METAL_INK }}>{text}</span>
      {METAL_RIM.map(([x, y]) => (
        <span
          key={`${x},${y}`}
          aria-hidden
          className="sr-gold-rim pointer-events-none absolute"
          style={{ left: `${x * 0.008}em`, top: `${y * 0.008}em` }}
        >
          {text}
        </span>
      ))}
      <span className="sr-gold-fill relative">{text}</span>
    </span>
  );
}

/** 特种三人：字面下半部渐显金色颗粒纹理。stage 模式收窄连字符。 */
export function GrainGoldType({ text, stage = false }: { text: string; stage?: boolean }) {
  const content = stage ? text.split(/([-–])/).map((part, i) => /[-–]/.test(part)
    ? <span key={i} style={{ display: "inline-block", width: ".29em", transform: "scaleX(.76)", transformOrigin: "left center" }}>{part}</span>
    : part) : text;
  return (
    <span className="relative inline-block whitespace-nowrap" data-type-face>
      <span>{content}</span>
      <span aria-hidden className="pointer-events-none absolute inset-0" style={{
        color: "transparent", backgroundImage: `url(${goldTexture})`, backgroundSize: "100% 100%", backgroundClip: "text",
        WebkitBackgroundClip: "text", opacity: 1, maskImage: "linear-gradient(transparent 40%, #000 96%)",
        WebkitMaskImage: "linear-gradient(transparent 40%, #000 96%)",
      }}>{content}</span>
    </span>
  );
}

// Smooth, mostly opaque ink: localized highlights and a saturated lower wash.
// A small amount of alpha lets the illustration tint the ink without cutting
// clear silhouettes through the letters.
function layeredInk(tint: string): CSSProperties {
  return {
    backgroundImage: `radial-gradient(ellipse at 22% 73%, color-mix(in srgb, currentColor 48%, transparent), transparent 43%), radial-gradient(ellipse at 78% 36%, color-mix(in srgb, currentColor 65%, transparent), transparent 42%), linear-gradient(164deg, currentColor 16%, color-mix(in srgb, currentColor 93%, ${tint}) 34%, color-mix(in srgb, color-mix(in srgb, currentColor 60%, ${tint}) 94%, transparent) 53%, color-mix(in srgb, color-mix(in srgb, currentColor 24%, ${tint}) 91%, transparent) 78%, color-mix(in srgb, currentColor 46%, ${tint}) 96%)`,
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };
}

function captionInk(tint: string): CSSProperties {
  return {
    backgroundImage: `linear-gradient(168deg, color-mix(in srgb, currentColor 90%, ${tint}) 20%, color-mix(in srgb, currentColor 74%, ${tint}) 58%, color-mix(in srgb, currentColor 58%, ${tint}) 100%)`,
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };
}

/** 全息作战矩阵：半透明分层墨色字面加深色轮廓。 */
export function MatrixText({ text, tint, depth, stage = false, caption = false }: { text: string; tint: string; depth: string; stage?: boolean; caption?: boolean }) {
  const depthId = `matrix-depth-${useId().replace(/:/g, "")}`;
  return <span className="relative inline-block" style={stage ? { transform: "scale(.92, 1.17)", transformOrigin: "center top" } : undefined}>
    {caption ? null : <>
      <svg width="0" height="0" className="absolute" aria-hidden><defs>
        {/* Outline the painted silhouette, avoiding seams between CJK contours. */}
        <filter id={depthId} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius={stage ? 2.5 : .9} result="expanded" />
          <feComposite in="expanded" in2="SourceAlpha" operator="out" result="edge" />
          <feFlood floodColor={depth} />
          <feComposite in2="edge" operator="in" />
        </filter>
      </defs></svg>
      <span data-matrix-depth aria-hidden className="pointer-events-none absolute inset-0" style={{
        color: depth, filter: `url(#${depthId})`,
        transform: "translate(max(1px, .007em), max(2px, .012em))", opacity: .85,
      }}>{text}</span>
    </>}
    <span data-matrix-ink data-matrix-caption={caption ? "" : undefined} data-stage-face={stage ? "" : undefined} className="relative" style={caption ? captionInk(tint) : layeredInk(tint)}>{text}</span>
  </span>;
}

const GRAIN_FADE = "linear-gradient(transparent 8%, #000 46%)";
const tintedGrainCache = new Map<string, string>();

function paintTintedGrain(source: CanvasImageSource, tint: string) {
  const width = "naturalWidth" in source ? source.naturalWidth : 512;
  const height = "naturalHeight" in source ? source.naturalHeight : 192;
  const canvas = document.createElement("canvas");
  canvas.width = width || 512;
  canvas.height = height || 192;
  const ctx = canvas.getContext("2d");
  if (!ctx) return goldTexture;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "color";
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

function useTintedGrain(tint: string) {
  const [url, setUrl] = useState(() => tintedGrainCache.get(tint) ?? "");
  useEffect(() => {
    const cached = tintedGrainCache.get(tint);
    if (cached) {
      setUrl(cached);
      return;
    }
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      const next = paintTintedGrain(image, tint);
      tintedGrainCache.set(tint, next);
      if (!cancelled) setUrl(next);
    };
    image.src = goldTexture;
    return () => {
      cancelled = true;
    };
  }, [tint]);
  return url;
}

function StageGrain({ text, tint }: { text: string; tint: string }) {
  const texture = useTintedGrain(tint);
  return (
    <span
      data-stage-grain=""
      data-grain-tint={tint}
      data-grain-ready={texture ? "true" : "false"}
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        color: "transparent",
        backgroundImage: texture ? `url("${texture}")` : undefined,
        backgroundSize: "100% 100%",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        maskImage: GRAIN_FADE,
        WebkitMaskImage: GRAIN_FADE,
      }}
    >
      {text}
    </span>
  );
}

function StageFace({ text, fringe, tint }: { text: string; fringe?: string; tint: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap leading-none">
      {fringe ? (
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 left-0"
          style={{ color: fringe, transform: "translate(-6px, 1px)", opacity: 0.9 }}
        >
          {text}
        </span>
      ) : null}
      <span className="relative inline-block">
        {text}
        <StageGrain text={text} tint={tint} />
      </span>
    </span>
  );
}

/** 斜切关卡的浮起字：轻淡的错位暗影；给 fringe 和 tint 时字面加主题色颗粒和色边。 */
export function RaisedType({
  fringe,
  tint,
  children,
}: {
  fringe?: string;
  tint?: string;
  children: ReactNode;
}) {
  return (
    <span className="relative inline-block whitespace-nowrap leading-none">
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 left-0"
        style={{ color: "#121212", transform: "translate(5px, 8px)", opacity: 0.28 }}
      >
        {children}
      </span>
      {fringe && tint ? <StageFace text={String(children)} fringe={fringe} tint={tint} /> : <span className="relative">{children}</span>}
    </span>
  );
}

/** 无核论文的米白字：深色外描边压在字面下。 */
export function OutlineWord({ text }: { text: string }) {
  return (
    <span className="inline-block whitespace-nowrap" style={{ WebkitTextStroke: "0.05em #0e1218", paintOrder: "stroke fill" }}>
      {text}
    </span>
  );
}

/** 特种三人的虚焦边缘字，模糊半径随字号缩放（180px 时约 5px）。 */
export function DefocusWord({ text }: { text: string }) {
  return <span className="inline-block whitespace-nowrap" style={{ filter: "blur(0.028em)" }}>{text}</span>;
}

/** 总攻击背景字的斜切：PS 自由变换斜切 H −11、V −18，字身前倾、整行向右上扬。 */
export function SpeedType({ children }: { children: ReactNode }) {
  return (
    <span data-speed-type="" className="inline-block whitespace-pre" style={{ transform: "skew(-11deg, -18deg)", transformOrigin: "0 100%" }}>
      {children}
    </span>
  );
}

/** 模组测评栏内大字：上实下虚，下半淡进暗区。`solid` 是保持不透明的上段比例；`thicken` 用同色描边把超窄体加粗。 */
export function FadeDownWord({ text, solid = 0.34, thicken = 0.03 }: { text: string; solid?: number; thicken?: number }) {
  const mask = `linear-gradient(180deg, #000 ${Math.round(solid * 100)}%, rgb(0 0 0 / 0.35) ${Math.round((solid + 0.3) * 100)}%, transparent 100%)`;
  return (
    <span
      data-fade-down=""
      className="inline-block whitespace-nowrap"
      style={{ WebkitMaskImage: mask, maskImage: mask, WebkitTextStroke: `${thicken}em currentColor`, paintOrder: "stroke fill" }}
    >
      {text}
    </span>
  );
}

/** 模组测评标题：距离 0、大小 25px、85% 黑的贴字暗边，双层 DOM。 */
export function HaloWord({ children, color = "currentColor" }: { children: ReactNode; color?: string }) {
  return (
    <span data-halo-word="" className="relative inline-block whitespace-nowrap">
      <span aria-hidden className="pointer-events-none absolute inset-0 text-black" style={{ filter: "blur(0.05em)", opacity: 0.85 }}>
        {children}
      </span>
      <span className="relative" style={{ color }}>
        {children}
      </span>
    </span>
  );
}

/** 横向动感模糊的光痕：只在水平方向拉开，按字号缩放。 */
export function MotionStreak({ children, size, color, opacity = 0.7 }: { children: ReactNode; size: number; color: string; opacity?: number }) {
  const id = `motion-streak-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <span data-motion-streak="" aria-hidden className="pointer-events-none relative inline-block whitespace-nowrap" style={{ color, opacity }}>
      <svg width="0" height="0" className="absolute">
        <filter id={id} x="-60%" y="-20%" width="220%" height="140%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation={`${Math.round(size * 0.3)} ${Math.max(1, Math.round(size * 0.012))}`} />
        </filter>
      </svg>
      <span className="inline-block" style={{ filter: `url(#${id})` }}>
        {children}
      </span>
    </span>
  );
}

/** 光痕垫底 + 贴字暗边的白字，空白画布用的整套模组测评标题字效。 */
export function StreakWord({ text, size, streak = "#fedd00" }: { text: string; size: number; streak?: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap leading-none">
      <span className="absolute inset-0">
        <MotionStreak size={size} color={streak}>{text}</MotionStreak>
      </span>
      <HaloWord>{text}</HaloWord>
    </span>
  );
}

const RETRO_DEPTH_STEPS = 7;

/**
 * 复古未来立体字，四层真实 DOM，由外到内：奶油外边包住整块厚度；橄榄侧面沿左下错位叠出厚度；
 * 字面外一圈细深橄榄线；最上面是上浅下黄的字面。侧面不比细线宽，字的上沿和右沿只露出
 * 「细线 + 奶油边」，字内空隙才不会被糊满。尺寸全用 em，跟字号一起缩放。
 */
export function RetroBlockWord({
  text,
  face = "#fff6dc",
  lower = "#f6dc94",
  line = "#4f5c25",
  side = "#738240",
  rim = "#f5dfa8",
  depth = [-0.03, 0.036],
  weight = 0.04,
}: {
  text: string;
  face?: string;
  lower?: string;
  /** 紧贴字面的细描边。 */
  line?: string;
  side?: string;
  rim?: string;
  depth?: [number, number];
  /** 细描边的线宽（em），侧面同宽，奶油外边再各宽出半个线宽。 */
  weight?: number;
}) {
  const steps = Array.from({ length: RETRO_DEPTH_STEPS + 1 }, (_, i) => i / RETRO_DEPTH_STEPS);
  const at = (t: number) => `translate(${(depth[0] * t).toFixed(4)}em, ${(depth[1] * t).toFixed(4)}em)`;
  const layer = (kind: "rim" | "side", color: string, width: number) =>
    steps.map((t) => (
      <span
        key={`${kind}-${t}`}
        aria-hidden
        {...{ [`data-retro-${kind}`]: "" }}
        className="pointer-events-none absolute top-0 left-0"
        style={{ color, WebkitTextStroke: `${width}em ${color}`, transform: at(t) }}
      >
        {text}
      </span>
    ));
  return (
    <span data-retro-block="" className="relative inline-block whitespace-nowrap leading-none">
      {layer("rim", rim, weight * 2)}
      {layer("side", side, weight)}
      <span
        aria-hidden
        data-retro-line-stroke=""
        className="pointer-events-none absolute top-0 left-0"
        style={{ color: line, WebkitTextStroke: `${weight}em ${line}` }}
      >
        {text}
      </span>
      <span
        data-retro-face=""
        className="relative"
        style={{
          background: `linear-gradient(180deg, ${face} 0%, ${face} 68%, ${lower} 71%, ${lower} 100%)`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        {text}
      </span>
    </span>
  );
}

/**
 * 复古未来两行立体标题：整体右倾，第二行右移约一个字。`indent` 以画布上的字号为单位，
 * 横向拉宽不会把缩进一起放大。
 */
export function RetroBlockTitle({
  lines,
  stretch = 1,
  skew = -7,
  leading = 1.08,
  indent = 1,
  colors,
}: {
  lines: string[];
  stretch?: number;
  skew?: number;
  leading?: number;
  indent?: number;
  colors?: { face?: string; lower?: string; line?: string; side?: string; rim?: string };
}) {
  return (
    <span
      data-retro-title=""
      className="block"
      style={{ width: "max-content", transform: `skewX(${skew}deg) scaleX(${stretch})`, transformOrigin: "0 50%" }}
    >
      {lines.map((line, index) => (
        <span
          key={`${line}-${index}`}
          data-retro-line=""
          className="block whitespace-pre"
          style={{ lineHeight: leading, paddingLeft: index > 0 ? `${indent / stretch}em` : 0 }}
        >
          <RetroBlockWord text={line || "\u00a0"} {...colors} />
        </span>
      ))}
    </span>
  );
}

/** 复古未来的英文小字：珊瑚红字面，奶油内描边，外面再包一圈橄榄深边。 */
export function RetroSerifTag({ text, fill = "#ea5a4b", rim = "#fbedc9", edge = "#5f6a2c" }: { text: string; fill?: string; rim?: string; edge?: string }) {
  return (
    <span data-retro-serif="" className="relative inline-block whitespace-nowrap leading-none">
      <span aria-hidden className="pointer-events-none absolute top-0 left-0" style={{ color: edge, WebkitTextStroke: `0.2em ${edge}`, transform: "translate(0.02em, 0.03em)" }}>
        {text}
      </span>
      <span aria-hidden className="pointer-events-none absolute top-0 left-0" style={{ color: rim, WebkitTextStroke: `0.11em ${rim}` }}>
        {text}
      </span>
      <span className="relative" style={{ color: fill }}>
        {text}
      </span>
    </span>
  );
}

/* ───────── 卫戍协议式 HUD 文字件 ───────── */

/** 3×3 像素叉号。 */
export function HudPixelX({ size, color = "currentColor" }: { size: number | string; color?: string }) {
  return (
    <svg data-hud-pixel-x="" width={size} height={size} viewBox="0 0 3 3" className="shrink-0" aria-hidden>
      {[
        [0, 0],
        [2, 0],
        [1, 1],
        [0, 2],
        [2, 2],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} />
      ))}
    </svg>
  );
}

/** 实心色块小标签，可带像素叉号；字号跟随外层 font-size。 */
export function HudTag({ text, bg, ink, icon, iconColor }: { text: string; bg: string; ink: string; icon?: boolean; iconColor?: string }) {
  return (
    <span data-hud-tag="" className="inline-flex items-center gap-[0.45em] whitespace-nowrap leading-none">
      {icon ? <HudPixelX size="1.05em" color={iconColor ?? bg} /> : null}
      <span className="inline-block px-[0.55em] py-[0.22em] font-bold uppercase tracking-[0.04em]" style={{ background: bg, color: ink }}>
        {text}
      </span>
    </span>
  );
}

/** RHODES ISLAND 色条：左侧圆点、两行字、右侧箭头框。宽高由外层给定。 */
export function HudIslandBar({ title, sub, bg, ink, dots = 6 }: { title: string; sub: string; bg: string; ink: string; dots?: number }) {
  return (
    <span data-hud-island="" className="flex h-full w-full items-center leading-none" style={{ background: bg, color: ink }}>
      <span className="flex min-w-0 flex-1 items-center gap-[0.9em] overflow-hidden pl-[0.9em]">
        {Array.from({ length: dots }, (_, i) => (
          <span key={i} className="inline-block rounded-full" style={{ width: "0.32em", height: "0.32em", background: ink }} />
        ))}
      </span>
      <span className="flex shrink-0 flex-col items-start justify-center whitespace-nowrap pr-[0.6em]">
        <span className="font-black tracking-[0.02em]" style={{ fontSize: "1em" }}>
          {title}
        </span>
        <span className="mt-[0.18em] tracking-[0.12em] opacity-90" style={{ fontSize: "0.34em" }}>
          {sub}
        </span>
      </span>
      <span className="mr-[0.5em] grid place-items-center" style={{ width: "1.05em", height: "1.05em", border: `0.09em solid ${ink}` }}>
        <svg viewBox="0 0 10 10" style={{ width: "0.6em", height: "0.6em" }} aria-hidden>
          <path d="M8 2 L2 8 M2 3.5 V8 H6.5" fill="none" stroke={ink} strokeWidth="1.6" />
        </svg>
      </span>
    </span>
  );
}

/** 横向扫描缝：字面按固定周期挖掉细横条，周期和缝宽以 em 计，随字号缩放。 */
export function ScanText({ text, color, period = 0.034, gap = 0.012, style }: { text: string; color: string; period?: number; gap?: number; style?: CSSProperties }) {
  const mask = `repeating-linear-gradient(180deg, #000 0 ${period - gap}em, transparent ${period - gap}em ${period}em)`;
  return (
    <span data-scan-text="" className="inline-block whitespace-nowrap" style={{ color, WebkitMaskImage: mask, maskImage: mask, ...style }}>
      {text}
    </span>
  );
}

/** 黑字从腰部往下渐变成红：底层黑字，上层红字用竖向渐变蒙版，再压一层横扫描缝。 */
export function FadeInkText({ text, ink, fade, from = 45, period = 0.05, gap = 0.014 }: { text: string; ink: string; fade: string; from?: number; period?: number; gap?: number }) {
  const scan = `repeating-linear-gradient(180deg, #000 0 ${period - gap}em, transparent ${period - gap}em ${period}em)`;
  const lower = `linear-gradient(180deg, transparent ${from}%, #000 92%)`;
  return (
    <span data-fade-ink="" className="relative inline-block whitespace-nowrap" style={{ WebkitMaskImage: scan, maskImage: scan }}>
      <span style={{ color: ink }}>{text}</span>
      <span aria-hidden className="pointer-events-none absolute left-0 top-0" style={{ color: fade, WebkitMaskImage: lower, maskImage: lower }}>
        {text}
      </span>
    </span>
  );
}

/** 每个字的上下错位（em）和倾角（度），循环套用。 */
const COMIC_JITTER: [number, number][] = [
  [0.02, -1.6],
  [-0.016, 1.3],
  [0.01, -0.7],
  [-0.012, 1.8],
  [0.016, -1.2],
  [-0.006, 0.9],
  [0.012, -1.9],
];

/** 漫画大字：逐字错落、微倾，字后压一层深红错位影子（两层真实 DOM）。 */
export function ComicShadowText({
  text,
  face = "currentColor",
  shadow,
  dx = 0.03,
  dy = 0.034,
  jitter = 1,
  squash = 1,
  style,
}: {
  text: string;
  face?: string;
  shadow: string;
  dx?: number;
  dy?: number;
  jitter?: number;
  squash?: number;
  style?: CSSProperties;
}) {
  const chars = [...text];
  const glyphs = (color: string) =>
    chars.map((ch, i) => {
      const [y, r] = COMIC_JITTER[i % COMIC_JITTER.length];
      return (
        <span key={i} className="inline-block" style={{ color, transform: jitter ? `translateY(${y * jitter}em) rotate(${r * jitter}deg)` : undefined }}>
          {ch === " " ? "\u00a0" : ch}
        </span>
      );
    });
  return (
    <span
      data-comic-text=""
      className="relative inline-block whitespace-nowrap"
      style={{ transform: squash !== 1 ? `scaleX(${squash})` : undefined, transformOrigin: "left top", ...style }}
    >
      <span aria-hidden className="pointer-events-none absolute left-0 top-0 whitespace-nowrap" style={{ transform: `translate(${dx}em, ${dy}em)` }}>
        {glyphs(shadow)}
      </span>
      <span className="relative">{glyphs(face)}</span>
    </span>
  );
}

/** 立体网点字：字面压一层细网点，向右下挤出几层深色厚度（真实 DOM 叠层，不用阴影）。 */
export function ExtrudeText({
  text,
  side,
  dot,
  depth = 0.045,
  steps = 6,
  pitch = 0.055,
  style,
}: {
  text: string;
  side: string;
  dot: string;
  depth?: number;
  steps?: number;
  pitch?: number;
  style?: CSSProperties;
}) {
  const face: CSSProperties = {
    backgroundImage: `radial-gradient(circle, ${dot} 32%, transparent 36%), linear-gradient(currentColor, currentColor)`,
    backgroundSize: `${pitch}em ${pitch}em, 100% 100%`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };
  return (
    <span data-extrude-text="" className="relative inline-block whitespace-nowrap" style={style}>
      {Array.from({ length: steps }, (_, i) => {
        const d = (depth * (steps - i)) / steps;
        return (
          <span key={i} aria-hidden className="pointer-events-none absolute left-0 top-0 whitespace-nowrap" style={{ color: side, transform: `translate(${d}em, ${d}em)` }}>
            {text}
          </span>
        );
      })}
      <span className="relative" style={face}>
        {text}
      </span>
    </span>
  );
}

/** 像素引号：两枚三格小逗号，`open` 尾巴朝上，`close` 倒过来。 */
export function PixelQuote({ side, color, shade }: { side: "open" | "close"; color: string; shade?: string }) {
  const cells: [number, number][] = [
    [1, 0],
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 1],
  ];
  return (
    <svg data-pixel-quote={side} viewBox="0 0 5 3" style={{ width: "0.5em", height: "0.3em", transform: side === "close" ? "rotate(180deg)" : undefined }} aria-hidden>
      {[0, 3].flatMap((ox) =>
        cells.map(([x, y], i) => <rect key={`${ox}-${i}`} x={ox + x} y={y} width="1.02" height="1.02" fill={shade && i === 4 ? shade : color} />),
      )}
    </svg>
  );
}
