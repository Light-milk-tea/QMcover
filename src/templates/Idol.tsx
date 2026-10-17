import { useId } from "react";
import { CoverElement } from "../components/CoverElement";
import { findOperator, findOperatorByName } from "../data/arts";
import { resolveChibiUrl } from "../data/chibis";
import { elementText } from "../data/elements";
import { layerZIndex } from "../lib/document";
import { bandBottomText, nameRows, splitTitleWords } from "../lib/idolLayout";
import { IDOL_INK, IDOL_SCRIPT, IDOL_STROKE, IDOL_TITLE, idolBase } from "../lib/idolPalette";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps, ImageLayer, Layer } from "../types";
import { OperatorLayer } from "./OperatorLayer";

const W = 1920;
const DEFAULT_OP = "char_4048_doroth";

// 参考图：空心字上紫下粉细描边；两行粗黑字（没有黑底）；棕标题 y≈400-680；
// 小人贴在标题两侧，不在四角。
const NAME_TOP = { top: -88, size: 360 } as const;
const NAME_BOT = { top: 674, size: 400 } as const;
const BAND_TOP = { top: 338, size: 42 } as const;
const BAND_BOT = { top: 718, size: 40 } as const;
const HEAD_TOP = 356;
const HEAD_SIZE = 300;
const HEAD_INSET = 96;
const HAND_NOTE = { right: 150, top: 408, size: 72 } as const;
/** 左外、左内（压标题）、右内（压标题）、右外。都在标题高度。 */
const CHIBIS = [
  { id: "chibi-tl", left: 28, top: 508 },
  { id: "chibi-bl", left: 348, top: 492 },
  { id: "chibi-tr", left: 1324, top: 492 },
  { id: "chibi-br", left: 1648, top: 508 },
] as const;
const CHIBI_W = 146;
const CHIBI_H = 198;
/** 参考图空心字是一根连续细线：上沿深紫，下沿洋红。只画一层，不能切片。 */
const HOLLOW_TOP = "#470857";
const HOLLOW_MID = "#7a1064";
const HOLLOW_BOT = "#c43a88";
const HOLLOW_WIDTH = "0.008em";

function hiddenLayer(layers: Layer[] | undefined, id: string) {
  const layer = layers?.find((item) => item.id === id);
  return Boolean(layer?.hidden || layer?.removed);
}

function bandRepeat(text: string, size: number) {
  const unit = Math.max(1, text.length * size * 0.62);
  return Array.from({ length: Math.ceil((W * 1.3) / unit) }, () => text).join(" ");
}

/** 空心字：一根描边。自定义色走 CSS；默认色用 SVG 竖向渐变，避免切片接缝交叉。 */
function HollowWord({ text, flat }: { text: string; flat?: string }) {
  const gid = `idol-line-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  if (flat) {
    return (
      <span data-idol-hollow="" className="relative inline-block whitespace-nowrap leading-none" style={{ fontWeight: 400, fontSynthesis: "none" }}>
        <span style={{ WebkitTextFillColor: "transparent", WebkitTextStroke: `${HOLLOW_WIDTH} ${flat}` }}>{text}</span>
      </span>
    );
  }
  return (
    <span data-idol-hollow="" className="relative inline-block whitespace-nowrap leading-none" style={{ fontWeight: 400, fontSynthesis: "none" }}>
      <svg className="pointer-events-none absolute inset-0 overflow-visible" width="100%" height="100%" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={HOLLOW_TOP} />
            <stop offset="48%" stopColor={HOLLOW_MID} />
            <stop offset="100%" stopColor={HOLLOW_BOT} />
          </linearGradient>
        </defs>
        <text
          x="0"
          y="0"
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={HOLLOW_WIDTH}
          dominantBaseline="text-before-edge"
          style={{ font: "inherit", letterSpacing: "inherit" }}
        >
          {text}
        </text>
      </svg>
      <span className="invisible">{text}</span>
    </span>
  );
}

/** 主标题只用字重，不再加描边，避免笔画糊死。 */
function HeadText({ text }: { text: string }) {
  return (
    <span data-idol-head="" className="relative inline-block whitespace-nowrap font-black leading-none">
      <span className="relative">{text}</span>
    </span>
  );
}

export function Idol(props: CoverRenderProps) {
  const cover = useCoverOptional();
  const layers = cover?.draft.layers ?? props.layers ?? [];
  const base = idolBase(props.colorway);
  const styles = props.elementStyles;

  const primary = layers.find((layer): layer is ImageLayer => layer.kind === "image" && layer.id === "operator");
  const op =
    (primary?.operatorId ? findOperator(primary.operatorId) : undefined) ??
    findOperatorByName(props.operatorName) ??
    findOperator(DEFAULT_OP);

  const rows = nameRows(op?.nameEn);
  const bandMode = cover?.draft.bandMode ?? props.bandMode ?? "vol";
  const bgPattern = cover?.draft.bgPattern ?? props.bgPattern;
  const names = {
    "name-t1": elementText(styles, "name-t1", rows.t1),
    "name-t2": elementText(styles, "name-t2", rows.t2),
    "name-b1": elementText(styles, "name-b1", rows.b1),
    "name-b2": elementText(styles, "name-b2", rows.b2),
  };
  const [defaultHeadL, defaultHeadR] = splitTitleWords(props.title);
  const headL = elementText(styles, "head-l", defaultHeadL);
  const headR = elementText(styles, "head-r", defaultHeadR);
  const bandTop = elementText(styles, "band-top", "QMcover");
  const bandBottom = elementText(
    styles,
    "band-bottom",
    bandMode === "name"
      ? op.nameEn?.trim().toUpperCase() || bandBottomText(props.episode)
      : bandBottomText(props.episode),
  );
  const handBg = elementText(styles, "hand-bg", "QMcover");
  const handNote = elementText(styles, "hand-note", "special with");

  const z = (id: string, fallback: number) => (cover ? layerZIndex(layers, id) : fallback);

  return (
    <div
      data-idol-canvas=""
      data-colorway={base}
      className="relative h-full w-full overflow-hidden"
      style={{ background: base }}
    >
      {bgPattern === "stripes" ? (
        <div
          aria-hidden
          data-idol-stripes=""
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(38,6,32,0.07) 0 26px, transparent 26px 52px)",
          }}
        />
      ) : null}

      {handBg && !hiddenLayer(layers, "hand-bg") ? (
        <CoverElement
          id="hand-bg"
          defaultFont="hand"
          defaultFontSize={120}
          className="absolute"
          style={{
            left: -80,
            top: -40,
            right: -80,
            bottom: -40,
            color: styles?.["hand-bg"]?.color ?? IDOL_STROKE,
            opacity: styles?.["hand-bg"]?.opacity ?? 0.14,
            zIndex: z("hand-bg", 0),
            lineHeight: 1.35,
            transform: "rotate(-6deg)",
            overflow: "hidden",
          }}
        >
          {Array.from({ length: 72 }, () => handBg).join(" ")}
        </CoverElement>
      ) : null}

      {(["name-t1", "name-t2"] as const).map((id, index) =>
        names[id] && !hiddenLayer(layers, id) ? (
          <CoverElement
            key={id}
            id={id}
            defaultFont="anton"
            defaultFontSize={NAME_TOP.size}
            className="absolute"
            style={{
              top: NAME_TOP.top,
              ...(index === 0 ? { left: -14 } : { right: -14 }),
              color: styles?.[id]?.color ?? IDOL_STROKE,
              letterSpacing: "0.02em",
              lineHeight: 1,
              zIndex: z(id, index + 1),
              width: "max-content",
            }}
          >
            <HollowWord text={names[id]} flat={styles?.[id]?.color} />
          </CoverElement>
        ) : null,
      )}

      {bandTop && !hiddenLayer(layers, "band-top") ? (
        <CoverElement
          id="band-top"
          defaultFont="sans"
          defaultFontSize={BAND_TOP.size}
          className="absolute font-black italic"
          style={{
            left: -24,
            top: BAND_TOP.top,
            width: W + 48,
            backgroundColor: "transparent",
            color: styles?.["band-top"]?.color ?? IDOL_INK,
            zIndex: z("band-top", 5),
            overflow: "hidden",
            whiteSpace: "nowrap",
            lineHeight: 1,
            letterSpacing: "0.02em",
          }}
        >
          <span className="whitespace-nowrap">{bandRepeat(bandTop, BAND_TOP.size)}</span>
        </CoverElement>
      ) : null}

      {(["name-b1", "name-b2"] as const).map((id, index) =>
        names[id] && !hiddenLayer(layers, id) ? (
          <CoverElement
            key={id}
            id={id}
            defaultFont="anton"
            defaultFontSize={NAME_BOT.size}
            className="absolute"
            style={{
              top: NAME_BOT.top,
              ...(index === 0 ? { left: -14 } : { right: -14 }),
              color: styles?.[id]?.color ?? IDOL_STROKE,
              letterSpacing: "0.02em",
              lineHeight: 1,
              zIndex: z(id, index + 3),
              width: "max-content",
            }}
          >
            <HollowWord text={names[id]} flat={styles?.[id]?.color} />
          </CoverElement>
        ) : null,
      )}

      {bandBottom && !hiddenLayer(layers, "band-bottom") ? (
        <CoverElement
          id="band-bottom"
          defaultFont="sans"
          defaultFontSize={BAND_BOT.size}
          className="absolute font-black italic"
          style={{
            left: -24,
            top: BAND_BOT.top,
            width: W + 48,
            backgroundColor: "transparent",
            color: styles?.["band-bottom"]?.color ?? IDOL_INK,
            zIndex: z("band-bottom", 6),
            overflow: "hidden",
            whiteSpace: "nowrap",
            lineHeight: 1,
            letterSpacing: "0.02em",
          }}
        >
          <span className="whitespace-nowrap">{bandRepeat(bandBottom, BAND_BOT.size)}</span>
        </CoverElement>
      ) : null}

      {!hiddenLayer(layers, "operator") ? (
        <div
          data-operator-slot=""
          className="pointer-events-none absolute overflow-visible"
          style={{ left: "34%", top: "-14%", width: "54%", height: "150%", zIndex: z("operator", 11) }}
        >
          <OperatorLayer
            {...props}
            objectFit="contain"
            objectPosition="50% 0%"
            transformOrigin="50% 0%"
            className="h-full w-full"
          />
        </div>
      ) : null}

      {CHIBIS.map(({ id, left, top }, index) => {
        if (hiddenLayer(layers, id)) return null;
        const layer = layers.find((item) => item.id === id) as ImageLayer | undefined;
        const src = resolveChibiUrl(layer ?? {});
        return (
          <CoverElement
            key={id}
            id={id}
            kind="box"
            className="absolute overflow-visible"
            style={{ left, top, width: CHIBI_W, height: CHIBI_H, zIndex: z(id, 13 + index) }}
          >
            {src ? (
              <OperatorLayer
                layerId={id}
                imageUrl={src}
                imageScale={layer?.scale ?? 100}
                imageX={layer?.imageX ?? 0}
                imageY={layer?.imageY ?? 0}
                previewScale={props.previewScale}
                showPlaceholder={false}
                transformOrigin="center bottom"
                objectFit="contain"
                objectPosition="center bottom"
                emptyHint="小人"
                className="h-full w-full object-contain"
              />
            ) : null}
          </CoverElement>
        );
      })}

      {handNote && !hiddenLayer(layers, "hand-note") ? (
        <CoverElement
          id="hand-note"
          defaultFont="hand"
          defaultFontSize={HAND_NOTE.size}
          className="absolute"
          style={{
            right: HAND_NOTE.right,
            top: HAND_NOTE.top,
            color: styles?.["hand-note"]?.color ?? IDOL_SCRIPT,
            zIndex: z("hand-note", 12),
            lineHeight: 1.15,
            width: "max-content",
            transform: "rotate(14deg)",
            transformOrigin: "100% 0%",
          }}
        >
          {handNote.split(" ").map((word) => (
            <span key={word} className="block">
              {word}
            </span>
          ))}
        </CoverElement>
      ) : null}

      {headL && !hiddenLayer(layers, "head-l") ? (
        <CoverElement
          id="head-l"
          defaultFont="cn"
          defaultFontSize={HEAD_SIZE}
          className="absolute font-black"
          style={{
            left: HEAD_INSET,
            top: HEAD_TOP,
            color: styles?.["head-l"]?.color ?? IDOL_TITLE,
            zIndex: z("head-l", 8),
            lineHeight: 1,
            letterSpacing: "0.04em",
            width: "max-content",
          }}
        >
          <HeadText text={headL} />
        </CoverElement>
      ) : null}

      {headR && !hiddenLayer(layers, "head-r") ? (
        <CoverElement
          id="head-r"
          defaultFont="cn"
          defaultFontSize={HEAD_SIZE}
          className="absolute font-black"
          style={{
            right: HEAD_INSET,
            top: HEAD_TOP,
            color: styles?.["head-r"]?.color ?? IDOL_TITLE,
            zIndex: z("head-r", 9),
            lineHeight: 1,
            letterSpacing: "0.04em",
            width: "max-content",
          }}
        >
          <HeadText text={headR} />
        </CoverElement>
      ) : null}
    </div>
  );
}