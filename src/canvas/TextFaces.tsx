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
