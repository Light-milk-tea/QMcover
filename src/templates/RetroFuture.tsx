import { useId } from "react";
import { RetroBrush, RetroGrain, RetroHalo, RetroHaze, RetroOrbits, RetroPennant, RetroSky, RetroSparkles } from "../canvas/DecorArt";
import { RetroBlockTitle, RetroSerifTag } from "../canvas/TextFaces";
import { CoverElement } from "../components/CoverElement";
import { elementText } from "../data/elements";
import { artCutoutMask } from "../lib/artCutouts";
import { layerZIndex } from "../lib/document";
import {
  RETRO_TITLE_FONT,
  RETRO_TITLE_INDENT,
  RETRO_TITLE_LEADING,
  RETRO_TITLE_LEFT,
  RETRO_TITLE_TOP,
  retroLineWidths,
  retroTitleLines,
  retroTitleMetrics,
  retroTitleSize,
} from "../lib/retroFutureLayout";
import { retroPalette } from "../lib/retroPalette";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps, Layer } from "../types";
import { OperatorLayer } from "./OperatorLayer";

/** 立绘框 1920×2160，精二按宽度装进去；缩放原点落在默认立绘的两眼中点。 */
const RETRO_ART_ORIGIN = "1038px 705px";

const TITLE_LEFT = RETRO_TITLE_LEFT;
const TITLE_TOP = RETRO_TITLE_TOP;
const TITLE_LEADING = RETRO_TITLE_LEADING;
const TITLE_INDENT = RETRO_TITLE_INDENT;

const VERTICAL_SERIF = { fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 72', fontWeight: 900 } as const;

function hiddenLayer(layers: Layer[] | undefined, id: string) {
  const layer = layers?.find((item) => item.id === id);
  return Boolean(layer?.hidden || layer?.removed);
}

export function RetroFuture(props: CoverRenderProps) {
  const cover = useCoverOptional();
  const styles = props.elementStyles;
  const layers = cover?.draft.layers ?? props.layers;
  const outlineId = `retro-outline-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const z = (id: string, fallback: number) => (cover ? layerZIndex(layers ?? [], id) : fallback);

  const palette = retroPalette(props.colorway);
  const titleColors = { face: palette.titleFace, lower: palette.titleLower, line: palette.titleLine, side: palette.titleSide, rim: palette.titleRim };
  const titleLines = retroTitleLines(elementText(styles, "title", props.title));
  const titleFont = styles?.title?.font ?? RETRO_TITLE_FONT;
  const { stretch, advance: GLYPH_ADVANCE } = retroTitleMetrics(titleFont);
  const titleSize = styles?.title?.fontSize ?? retroTitleSize(titleLines, GLYPH_ADVANCE);
  const kicker = elementText(styles, "kicker", props.subtitle).trim();
  const prefix = props.signature;
  const episode = elementText(styles, "episode", String(props.episode ?? ""));
  const titleBottom = TITLE_TOP + titleSize * TITLE_LEADING * Math.max(titleLines.length, 1);
  const lastIndent = titleLines.length > 1 ? TITLE_INDENT * titleSize : 0;
  const lastWidth = [...(titleLines[titleLines.length - 1] ?? "")].length * GLYPH_ADVANCE * titleSize;
  const kickerSize = styles?.kicker?.fontSize ?? Math.round(titleSize * 0.3);
  const episodeSize = styles?.episode?.fontSize ?? Math.round(titleSize * 0.5);
  const firstWidth = [...(titleLines[0] ?? "")].length * GLYPH_ADVANCE * titleSize;
  const titleWidth = Math.ceil(Math.max(0, ...retroLineWidths(titleLines, GLYPH_ADVANCE)) * titleSize);

  return (
    <div data-retro-future-canvas="" data-colorway={palette.theme} className="relative h-full w-full overflow-hidden" style={{ background: palette.skyMid }}>
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={outlineId} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius="8" result="outer" />
          <feFlood floodColor={palette.artEdge} floodOpacity="0.75" />
          <feComposite in2="outer" operator="in" result="edge" />
          <feMorphology in="SourceAlpha" operator="dilate" radius="6" result="inner" />
          <feFlood floodColor={palette.artRim} />
          <feComposite in2="inner" operator="in" result="rim" />
          <feMerge>
            <feMergeNode in="edge" />
            <feMergeNode in="rim" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </svg>

      {hiddenLayer(layers, "sky") ? null : (
        <CoverElement id="sky" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("sky", 0) }}>
          <RetroSky palette={palette} />
        </CoverElement>
      )}
      {hiddenLayer(layers, "brush") ? null : (
        <CoverElement id="brush" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("brush", 1) }}>
          <RetroBrush palette={palette} />
        </CoverElement>
      )}
      {hiddenLayer(layers, "halo") ? null : (
        <CoverElement id="halo" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("halo", 2) }}>
          <RetroHalo palette={palette} />
        </CoverElement>
      )}

      <div
        data-operator-slot=""
        className="pointer-events-none absolute overflow-visible"
        style={{
          left: 0,
          top: 0,
          width: 1920,
          height: 2160,
          zIndex: z("operator", 3),
          filter: `url(#${outlineId}) saturate(1.12) contrast(1.05)`,
        }}
      >
        <OperatorLayer
          {...props}
          objectFit="contain"
          objectPosition="0% 0%"
          transformOrigin={RETRO_ART_ORIGIN}
          pictureMask={artCutoutMask(props.imageUrl)}
          className="h-full w-full"
        />
      </div>

      {hiddenLayer(layers, "haze") ? null : (
        <CoverElement id="haze" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("haze", 3) }}>
          <RetroHaze palette={palette} />
        </CoverElement>
      )}

      {hiddenLayer(layers, "pennant") ? null : (
        <CoverElement id="pennant" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("pennant", 4) }}>
          <RetroPennant palette={palette} />
        </CoverElement>
      )}
      {hiddenLayer(layers, "orbits") ? null : (
        <CoverElement id="orbits" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("orbits", 5) }}>
          <RetroOrbits palette={palette} />
        </CoverElement>
      )}
      {hiddenLayer(layers, "grain") ? null : (
        <CoverElement id="grain" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("grain", 6) }}>
          <RetroGrain palette={palette} />
        </CoverElement>
      )}

      {titleLines.length > 0 && !hiddenLayer(layers, "title") ? (
        <CoverElement
          id="title"
          defaultFont={RETRO_TITLE_FONT}
          defaultFontSize={titleSize}
          className="absolute whitespace-nowrap"
          style={{
            left: TITLE_LEFT,
            top: TITLE_TOP,
            zIndex: z("title", 7),
            width: titleWidth,
            fontWeight: titleFont === "qingke" ? undefined : 900,
          }}
        >
          <RetroBlockTitle lines={titleLines} stretch={stretch} leading={TITLE_LEADING} indent={TITLE_INDENT} colors={titleColors} />
        </CoverElement>
      ) : null}

      {kicker && !hiddenLayer(layers, "kicker") ? (
        <CoverElement
          id="kicker"
          defaultFont="fraunces"
          defaultFontSize={kickerSize}
          className="absolute whitespace-nowrap"
          style={{
            left: TITLE_LEFT + firstWidth - kickerSize * kicker.length * 0.5,
            top: TITLE_TOP - kickerSize * 0.8,
            zIndex: z("kicker", 8),
            width: "max-content",
            transform: "rotate(-2deg)",
            ...VERTICAL_SERIF,
          }}
        >
          <RetroSerifTag text={kicker} fill={palette.tag} rim={palette.tagRim} edge={palette.tagEdge} />
        </CoverElement>
      ) : null}

      {episode.trim() && !hiddenLayer(layers, "episode") ? (
        <CoverElement
          id="episode"
          defaultFont="fraunces"
          defaultFontSize={episodeSize}
          className="absolute whitespace-nowrap"
          style={{
            left: TITLE_LEFT + lastIndent + lastWidth * 0.35,
            top: titleBottom - episodeSize * 0.7,
            zIndex: z("episode", 9),
            width: "max-content",
            transform: "rotate(-6deg)",
            ...VERTICAL_SERIF,
          }}
        >
          <RetroSerifTag text={`${prefix}${episode}`} fill={palette.tag} rim={palette.tagRim} edge={palette.tagEdge} />
        </CoverElement>
      ) : null}

      {hiddenLayer(layers, "sparkles") ? null : (
        <CoverElement id="sparkles" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("sparkles", 10) }}>
          <RetroSparkles palette={palette} />
        </CoverElement>
      )}
    </div>
  );
}
