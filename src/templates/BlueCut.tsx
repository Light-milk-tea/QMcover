import { useEffect, useId, useState, type ReactNode } from "react";
import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { useCdnSrc } from "../lib/cdn";
import { blueCutPalette, type BlueCutPalette } from "../lib/blueCutPalette";
import { layerZIndex } from "../lib/document";
import { bgGradeFilter } from "../lib/effects";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps, Layer } from "../types";
import { OperatorLayer } from "./OperatorLayer";
import grain from "../assets/textures/vanguard-gold.png";

const PAPER = "#f5f5f4";
const INK = "#4a4a4a";
const WEDGE = "#2a2a2a";
const SLOPE = -1.36;
const TITLE_LEFT = 1098;
const TITLE_TOP = 276;
const STAGE_LEFT = 980;
const STAGE_TOP = 492;
const EN_TOP = 465;
const EN_SHIFT_X = -63;
const SLASH_SHIFT_X = 156;
const SLASH_SHIFT_Y = -78;
const WEDGE_SHIFT_X = 43;
const WEDGE_SHIFT_Y = -499;
const SAFE_RIGHT = 1832;

function hiddenLayer(layers: Layer[] | undefined, id: string) {
  const layer = layers?.find((item) => item.id === id);
  return Boolean(layer?.hidden || layer?.removed);
}

function bandPoints(y0: number, y1: number, rightAt: number, yRef: number, width: number) {
  const xAt = (y: number) => rightAt + SLOPE * (y - yRef);
  return [
    [xAt(y0) - width, y0],
    [xAt(y0), y0],
    [xAt(y1), y1],
    [xAt(y1) - width, y1],
  ]
    .map(([x, y]) => `${Math.round(x)},${Math.round(y)}`)
    .join(" ");
}

function squadSize(length: number) {
  const byCount = length <= 2 ? 228 : length <= 3 ? 204 : length <= 4 ? 168 : length <= 6 ? 132 : 108;
  const fit = Math.floor((SAFE_RIGHT - TITLE_LEFT) / Math.max(length, 1));
  return Math.max(72, Math.min(byCount, fit));
}

function stageSize(length: number) {
  const byCount = length <= 4 ? 340 : length <= 5 ? 320 : length <= 7 ? 230 : length <= 10 ? 170 : 128;
  const units = Math.max(length, 1) * 0.38 + 0.32;
  const fit = Math.floor((SAFE_RIGHT - STAGE_LEFT) / Math.max(units, 1));
  return Math.max(84, Math.min(byCount, fit));
}

function classSize(length: number) {
  const byCount = length <= 8 ? 82 : length <= 12 ? 72 : length <= 18 ? 56 : 42;
  const fit = Math.floor(760 / Math.max(length * 0.66, 1));
  return Math.max(28, Math.min(byCount, fit));
}

function classLeft(text: string, size: number) {
  const width = Math.max(text.length, 1) * size * 0.5;
  return Math.max(1240, Math.min(1620, SAFE_RIGHT - width - 24));
}

function offsetBand(points: string, dx: number, dy: number) {
  return points
    .split(" ")
    .map((pair) => {
      const [x, y] = pair.split(",").map(Number);
      return `${Math.round(x + dx)},${Math.round(y + dy)}`;
    })
    .join(" ");
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
  if (!ctx) return grain;
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
    image.src = grain;
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

function GlossySlash({ theme }: { theme: BlueCutPalette }) {
  const uid = useId().replace(/:/g, "");
  const top = bandPoints(-40, 318, 1742, 0, 240);
  const bottom = bandPoints(800, 1200, 1916, 825, 250);
  const topClip = `${uid}-top`;
  const bottomClip = `${uid}-bottom`;
  const topGloss = `${uid}-top-gloss`;
  const bottomGloss = `${uid}-bottom-gloss`;
  return (
    <svg data-slash="" className="h-full w-full overflow-visible" viewBox="0 0 1920 1080" aria-hidden style={{ pointerEvents: "none" }}>
      <defs>
        <linearGradient id={topGloss} gradientUnits="userSpaceOnUse" x1="1488" y1="36" x2="1660" y2="270">
          <stop offset="0" stopColor={theme.depth} />
          <stop offset="0.38" stopColor={theme.accent} />
          <stop offset="0.52" stopColor={theme.gloss} />
          <stop offset="0.68" stopColor={theme.accent} />
          <stop offset="1" stopColor={theme.depth} />
        </linearGradient>
        <linearGradient id={bottomGloss} gradientUnits="userSpaceOnUse" x1="1680" y1="860" x2="1840" y2="1080">
          <stop offset="0" stopColor={theme.depth} />
          <stop offset="0.4" stopColor={theme.accent} />
          <stop offset="0.55" stopColor={theme.glossSoft} />
          <stop offset="0.72" stopColor={theme.accent} />
          <stop offset="1" stopColor={theme.depth} />
        </linearGradient>
        <clipPath id={topClip}>
          <polygon points={top} />
        </clipPath>
        <clipPath id={bottomClip}>
          <polygon points={bottom} />
        </clipPath>
      </defs>
      <polygon points={offsetBand(top, 10, 16)} fill={theme.depth} />
      <polygon points={top} fill={`url(#${topGloss})`} style={{ pointerEvents: "auto" }} />
      <g clipPath={`url(#${topClip})`}>
        <ellipse cx="1636" cy="58" rx="110" ry="16" transform="rotate(-37 1636 58)" fill="white" opacity="0.38" />
        <ellipse cx="1510" cy="148" rx="52" ry="9" transform="rotate(-37 1510 148)" fill="white" opacity="0.2" />
        <ellipse cx="1588" cy="214" rx="28" ry="6" transform="rotate(-37 1588 214)" fill="white" opacity="0.16" />
      </g>
      <polygon points={offsetBand(bottom, 10, 16)} fill={theme.depth} />
      <polygon points={bottom} fill={`url(#${bottomGloss})`} style={{ pointerEvents: "auto" }} />
      <g clipPath={`url(#${bottomClip})`}>
        <ellipse cx="1768" cy="930" rx="96" ry="14" transform="rotate(-37 1768 930)" fill="white" opacity="0.34" />
        <ellipse cx="1644" cy="1024" rx="40" ry="8" transform="rotate(-37 1644 1024)" fill="white" opacity="0.18" />
      </g>
    </svg>
  );
}

function RaisedType({
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

function StageWord({ text, fringe, tint }: { text: string; fringe: string; tint: string }) {
  return (
    <RaisedType fringe={fringe} tint={tint}>
      {text}
    </RaisedType>
  );
}

export function BlueCut(props: CoverRenderProps) {
  const cover = useCoverOptional();
  const styles = props.elementStyles;
  const squad = elementText(styles, "squad", props.title);
  const stage = elementText(styles, "stage", props.subtitle);
  const en = elementText(styles, "en", props.signature);
  const squadFont = styles?.squad?.fontSize ?? squadSize(Math.max(squad.trim().length, 1));
  const stageFont = styles?.stage?.fontSize ?? stageSize(Math.max(stage.trim().length, 1));
  const enFont = styles?.en?.fontSize ?? classSize(Math.max(en.trim().length, 1));
  const theme = blueCutPalette(styles?.slash?.color ?? props.colorway);
  const layers = cover?.draft.layers ?? props.layers;
  const bg = getBgPreset(props.bgPreset);
  const remoteBg = useCdnSrc(bg.url ?? "");
  const zSlash = cover ? layerZIndex(layers ?? [], "slash") : 1;
  const zOperator = cover ? layerZIndex(layers ?? [], "operator") : 2;
  const zWedge = cover ? layerZIndex(layers ?? [], "wedge") : 3;
  const zSquad = cover ? layerZIndex(layers ?? [], "squad") : 4;
  const zStage = cover ? layerZIndex(layers ?? [], "stage") : 5;
  const zEn = cover ? layerZIndex(layers ?? [], "en") : 6;

  return (
    <div data-blue-cut-canvas="" data-colorway={theme.accent} className="relative h-full w-full overflow-hidden" style={{ background: PAPER }}>
      {bg.url ? (
        <img
          data-cover-bg=""
          src={remoteBg.src}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "40% 40%", opacity: 0.28, filter: bgGradeFilter(props.effects?.bgGrade) }}
          onLoad={remoteBg.onLoad}
          onError={remoteBg.onError}
        />
      ) : null}
      {bg.url ? <div className="pointer-events-none absolute inset-0" style={{ background: PAPER, opacity: 0.88 }} /> : null}

      {hiddenLayer(layers, "slash") ? null : (
        <CoverElement
          id="slash"
          kind="box"
          className="pointer-events-none absolute inset-0"
          style={{ color: theme.accent, zIndex: zSlash, transform: `translate(${SLASH_SHIFT_X}px, ${SLASH_SHIFT_Y}px)` }}
        >
          <GlossySlash theme={theme} />
        </CoverElement>
      )}

      <div
        data-operator-slot=""
        className="pointer-events-none absolute overflow-visible"
        style={{
          left: "-4%",
          top: "-6%",
          width: "78%",
          height: "128%",
          zIndex: zOperator,
          filter: `drop-shadow(11px 6px 0 rgb(${theme.shadow} / 0.8))`,
        }}
      >
        <OperatorLayer
          {...props}
          objectFit="contain"
          objectPosition="62% 0%"
          transformOrigin="62% 0%"
          className="h-full w-full"
        />
      </div>

      {hiddenLayer(layers, "wedge") ? null : (
        <CoverElement
          id="wedge"
          kind="box"
          className="pointer-events-none absolute inset-0"
          style={{ color: styles?.wedge?.color ?? WEDGE, zIndex: zWedge, transform: `translate(${WEDGE_SHIFT_X}px, ${WEDGE_SHIFT_Y}px)` }}
        >
          <svg data-wedge="" className="h-full w-full overflow-visible" viewBox="0 0 1920 1080" aria-hidden style={{ pointerEvents: "none" }}>
            <polygon points={offsetBand(bandPoints(700, 1000, 300, 760, 210), 8, 12)} fill="#111111" />
            <polygon points={bandPoints(700, 1000, 300, 760, 210)} fill="currentColor" style={{ pointerEvents: "auto" }} />
          </svg>
        </CoverElement>
      )}

      {squad.trim() ? (
        <CoverElement
          id="squad"
          defaultFont="cn"
          defaultFontSize={squadFont}
          className="absolute font-black tracking-[-0.06em] whitespace-nowrap"
          style={{ left: TITLE_LEFT, top: TITLE_TOP, color: INK, zIndex: zSquad, width: "max-content", lineHeight: 1 }}
        >
          <RaisedType>{squad}</RaisedType>
        </CoverElement>
      ) : null}

      {stage.trim() ? (
        <CoverElement
          id="stage"
          defaultFont="cn"
          defaultFontSize={stageFont}
          className="absolute font-black tracking-[-0.055em] whitespace-nowrap"
          style={{ left: STAGE_LEFT, top: STAGE_TOP, color: INK, zIndex: zStage, width: "max-content", lineHeight: 1 }}
        >
          <StageWord text={stage} fringe={theme.fringe} tint={theme.accent} />
        </CoverElement>
      ) : null}

      {en.trim() ? (
        <CoverElement
          id="en"
          defaultFont="cn"
          defaultFontSize={enFont}
          className="absolute font-black leading-none whitespace-nowrap"
          style={{ left: classLeft(en.trim(), enFont) + EN_SHIFT_X, top: EN_TOP, color: styles?.en?.color ?? theme.en, zIndex: zEn, width: "max-content", lineHeight: 1 }}
        >
          <span className="relative inline-block" style={{ transform: "skewX(-14deg)" }}>
            <span
              aria-hidden
              className="pointer-events-none absolute top-0 left-0"
              style={{ color: theme.enShadow, transform: "translate(3px, 4px)", opacity: 0.28 }}
            >
              {en}
            </span>
            <span className="relative">{en}</span>
          </span>
        </CoverElement>
      ) : null}
    </div>
  );
}
