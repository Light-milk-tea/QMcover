import { useId } from "react";
import { FocusRing } from "../canvas/DecorArt";
import { SpeedType } from "../canvas/TextFaces";
import { CoverElement } from "../components/CoverElement";
import { elementText, fontClass } from "../data/elements";
import {
  ALL_OUT_RINGS,
  GROUND_LEADING,
  QUOTE_LEADING,
  QUOTE_RIGHT,
  QUOTE_TRACKING,
  allOutGroundLines,
  allOutGroundSize,
  allOutLines,
  allOutQuoteSize,
  placeRings,
  ringMaskStyle,
  screenTintMatrix,
  sizeRings,
  splitHanging,
} from "../lib/allOutLayout";
import { allOutPalette } from "../lib/allOutPalette";
import { layerZIndex } from "../lib/document";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps, Layer } from "../types";
import { OperatorLayer } from "./OperatorLayer";

const W = 1920;
const SLOT = { left: "40%", top: "-6%", width: "64%", height: "128%" } as const;
const SHADOW_X = 20;
const SHADOW_Y = 28;
/** 教程是背景色滤色 75%；青这类很亮的底色压到六成，暗部衣服才不会洗成一片白。 */
const TINT = 0.6;
const GROUND_LEFT = -40;
const GROUND_BOTTOM = 1340;
const GROUND_TRACKING = "-0.01em";
const QUOTE_MIDDLE = 518;
/** Anton 只有 400，一个字重；关掉合成粗体，中文回落到 Noto Sans SC 900。 */
const NO_FAUX_BOLD = { fontSynthesis: "none" } as const;

function hiddenLayer(layers: Layer[] | undefined, id: string) {
  const layer = layers?.find((item) => item.id === id);
  return Boolean(layer?.hidden || layer?.removed);
}

function GroundLines({ lines }: { lines: string[] }) {
  return (
    <SpeedType>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className="block">
          {line}
        </span>
      ))}
    </SpeedType>
  );
}

function HangingLine({ line }: { line: string }) {
  const [body, mark] = splitHanging(line);
  if (!mark) return <>{line}</>;
  return (
    <>
      {body}
      <span data-hanging-mark="" style={{ marginRight: `-${mark.length * 0.26}em` }}>
        {mark}
      </span>
    </>
  );
}

export function AllOut(props: CoverRenderProps) {
  const cover = useCoverOptional();
  const tintId = `all-out-tint-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const styles = props.elementStyles;
  const theme = allOutPalette(props.colorway);
  const layers = cover?.draft.layers ?? props.layers;

  const ringStyle = styles?.ring;
  const ringRotation = ringStyle?.rotation ?? layers?.find((layer) => layer.id === "ring")?.rotation ?? 0;
  const ringShape = sizeRings(ALL_OUT_RINGS, ringStyle?.radius, ringStyle?.thickness);
  const ringMask = ringMaskStyle(placeRings(ringShape, ringStyle?.x, ringStyle?.y, ringRotation));

  const groundLines = allOutGroundLines(elementText(styles, "ground", props.mark));
  const groundSize = styles?.ground?.fontSize ?? allOutGroundSize(groundLines);
  const groundTop = GROUND_BOTTOM - groundSize * GROUND_LEADING * Math.max(groundLines.length, 1);
  const groundFont = styles?.ground?.font ?? "anton";
  const groundShift = `translate(${styles?.ground?.x ?? 0}px, ${styles?.ground?.y ?? 0}px)`;

  const quoteLines = allOutLines(elementText(styles, "quote", props.title));
  const quoteSize = styles?.quote?.fontSize ?? allOutQuoteSize(quoteLines);
  const kicker = elementText(styles, "kicker", props.subtitle).trim();
  const kickerSize = styles?.kicker?.fontSize ?? Math.round(quoteSize * 0.62);
  const kickerH = kicker ? kickerSize * 0.9 : 0;
  const blockH = quoteSize * QUOTE_LEADING * Math.max(quoteLines.length, 1);
  const quoteTop = Math.max(96 + kickerH, QUOTE_MIDDLE - (blockH - kickerH) / 2);
  const creditLines = elementText(styles, "credit", props.signature)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const z = (id: string, fallback: number) => (cover ? layerZIndex(layers ?? [], id) : fallback);
  const slotStyle = { left: SLOT.left, top: SLOT.top, width: SLOT.width, height: SLOT.height };

  return (
    <div
      data-all-out-canvas=""
      data-colorway={theme.base}
      className="relative h-full w-full overflow-hidden"
      style={{ background: theme.base }}
    >
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={tintId} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={screenTintMatrix(theme.base, TINT)} />
        </filter>
      </svg>

      {groundLines.length > 0 && !hiddenLayer(layers, "ground") ? (
        <div data-all-out-ground="" className="pointer-events-none absolute inset-0" style={{ zIndex: z("ground", 1) }}>
          <div
            aria-hidden
            data-ground-outline=""
            className={`absolute font-black uppercase whitespace-nowrap ${fontClass(groundFont)}`}
            style={{
              ...NO_FAUX_BOLD,
              left: GROUND_LEFT,
              top: groundTop,
              fontSize: groundSize,
              lineHeight: GROUND_LEADING,
              letterSpacing: styles?.ground?.letterSpacing ?? GROUND_TRACKING,
              color: "transparent",
              WebkitTextStroke: `0.01em ${theme.outline}`,
              transform: groundShift,
            }}
          >
            <GroundLines lines={groundLines} />
          </div>
          <div data-ground-solid="" className="absolute inset-0" style={ringMask}>
            <CoverElement
              id="ground"
              defaultFont="anton"
              defaultFontSize={groundSize}
              className="absolute font-black uppercase whitespace-nowrap"
              style={{
                ...NO_FAUX_BOLD,
                letterSpacing: GROUND_TRACKING,
                left: GROUND_LEFT,
                top: groundTop,
                color: styles?.ground?.color ?? theme.ink,
                lineHeight: GROUND_LEADING,
                width: "max-content",
                pointerEvents: "auto",
              }}
            >
              <GroundLines lines={groundLines} />
            </CoverElement>
          </div>
        </div>
      ) : null}

      <div
        data-operator-slot=""
        className="pointer-events-none absolute overflow-visible"
        style={{ ...slotStyle, zIndex: z("operator", 2), filter: `drop-shadow(${SHADOW_X}px ${SHADOW_Y}px 0 ${theme.ink}80)` }}
      >
        <OperatorLayer
          {...props}
          objectFit="contain"
          objectPosition="50% 0%"
          transformOrigin="50% 4%"
          className="h-full w-full"
        />
      </div>

      {hiddenLayer(layers, "ring") ? null : (
        <CoverElement
          id="ring"
          kind="box"
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: z("ring", 3), color: styles?.ring?.color ?? "#000000" }}
        >
          <FocusRing color="currentColor" rings={ringShape} />
        </CoverElement>
      )}

      {hiddenLayer(layers, "tint") ? null : (
        <CoverElement
          id="tint"
          kind="box"
          className="pointer-events-none absolute inset-0"
          style={{ ...ringMask, zIndex: z("tint", 4) }}
        >
          <div
            data-operator-tint=""
            className="pointer-events-none absolute overflow-visible"
            style={{ ...slotStyle, filter: `url(#${tintId}) drop-shadow(${SHADOW_X}px ${SHADOW_Y}px 0 ${theme.base})` }}
          >
            <OperatorLayer
              {...props}
              echo
              objectFit="contain"
              objectPosition="50% 0%"
              transformOrigin="50% 4%"
              className="h-full w-full"
            />
          </div>
        </CoverElement>
      )}

      {kicker && !hiddenLayer(layers, "kicker") ? (
        <CoverElement
          id="kicker"
          defaultFont="outfit"
          defaultFontSize={kickerSize}
          className="absolute font-extralight uppercase whitespace-nowrap"
          style={{
            right: W - QUOTE_RIGHT,
            top: quoteTop - kickerH,
            color: "#ffffff",
            zIndex: z("kicker", 6),
            textAlign: "right",
            letterSpacing: "-0.02em",
            lineHeight: 0.9,
            width: "max-content",
          }}
        >
          {kicker}
        </CoverElement>
      ) : null}

      {quoteLines.length > 0 && !hiddenLayer(layers, "quote") ? (
        <CoverElement
          id="quote"
          defaultFont="outfit"
          defaultFontSize={quoteSize}
          className="absolute font-black uppercase whitespace-nowrap"
          style={{
            right: W - QUOTE_RIGHT,
            top: quoteTop,
            color: "#ffffff",
            zIndex: z("quote", 5),
            textAlign: "right",
            letterSpacing: `${QUOTE_TRACKING}em`,
            width: "max-content",
          }}
        >
          {quoteLines.map((line, index) => (
            <span key={`${line}-${index}`} data-all-out-line="" className="block" style={{ lineHeight: QUOTE_LEADING }}>
              <HangingLine line={line} />
            </span>
          ))}
        </CoverElement>
      ) : null}

      {creditLines.length > 0 && !hiddenLayer(layers, "credit") ? (
        <CoverElement
          id="credit"
          defaultFont="cn"
          defaultFontSize={18}
          className="absolute whitespace-nowrap"
          style={{
            right: 64,
            top: 1036 - creditLines.length * 24,
            color: "#ffffff",
            zIndex: z("credit", 7),
            textAlign: "right",
            lineHeight: "24px",
            width: "max-content",
          }}
        >
          {creditLines.map((line, index) => (
            <span key={`${line}-${index}`} className="block">
              {line}
            </span>
          ))}
        </CoverElement>
      ) : null}
    </div>
  );
}
