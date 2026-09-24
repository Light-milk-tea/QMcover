import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { useCdnSrc } from "../lib/cdn";
import { layerZIndex } from "../lib/document";
import { bgGradeFilter } from "../lib/effects";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";

const BAR = "#1c1917";
const CHIP = "#b26f54";
const INK = "#1a1614";
const BAR_TOP = 358;
const BAR_H = 227;
const TIP_X = 64;
const SHOULDER_X = 200;
const CHIP_X = 189;
const CHIP_Y = 668;
const CHIP_H = 220;
const CHIP_GAP = 32;
const EVENT_X = 208;
const EVENT_Y = 64;
const ART_LEFT = 1140;
const ART_TOP = -16;
const ART_SIZE = 1160;
const STAGE_NUDGE_X = 2.6779059884937237;
const STAGE_NUDGE_Y = -13.389039618200837;
const VERB_NUDGE_X = -10.711256210774058;
const VERB_NUDGE_Y = -8.03347280334728;

function eventSize(length: number) {
  if (length <= 4) return 128;
  if (length <= 6) return 104;
  if (length <= 8) return 84;
  return Math.min(72, Math.floor(980 / Math.max(length, 1)));
}

function stageSize(length: number) {
  if (length <= 5) return 200;
  if (length <= 8) return 186;
  if (length <= 10) return 148;
  return Math.min(124, Math.floor(1480 / Math.max(length, 1)));
}

function chipSize(length: number) {
  if (length <= 2) return 168;
  if (length <= 3) return 132;
  if (length <= 4) return 108;
  return Math.min(92, Math.floor(640 / Math.max(length, 1)));
}

function chipWidth(length: number, font: number) {
  return Math.round(font * Math.max(length, 1) + 147);
}

function verbSize(length: number) {
  if (length <= 2) return 214;
  if (length <= 3) return 176;
  if (length <= 4) return 140;
  return Math.min(112, Math.floor(900 / Math.max(length, 1)));
}

export function HighspecNocore(props: CoverRenderProps) {
  const cover = useCoverOptional();
  const styles = props.elementStyles;
  const event = elementText(styles, "event", props.signature.trim() || "众生行记");
  const stage = elementText(styles, "stage", props.subtitle.trim() || "QM-EX-8");
  const tag = elementText(styles, "tag", (props.mark ?? "").trim() || "好吃");
  const verb = elementText(styles, "verb", props.title.trim() || "首杀");
  const kicker = elementText(styles, "kicker", "NEW SIDESTORY");
  const bg = getBgPreset(props.bgPreset);
  const remoteBg = useCdnSrc(bg.url ?? "");
  const layers = cover?.draft.layers ?? props.layers ?? [];
  const eventFont = styles?.event?.fontSize ?? eventSize(event.length);
  const stageFont = styles?.stage?.fontSize ?? stageSize(stage.length);
  const tagFont = styles?.tag?.fontSize ?? chipSize(tag.length);
  const verbFont = styles?.verb?.fontSize ?? verbSize(verb.length);
  const chipW = styles?.chip?.w ?? chipWidth(tag.length, tagFont);
  const stageTop = BAR_TOP + Math.round((BAR_H - stageFont) / 2);
  const verbX = CHIP_X + chipW + CHIP_GAP;
  const verbY = CHIP_Y + Math.round((CHIP_H - verbFont) / 2);
  const zWash = cover ? layerZIndex(layers, "wash") : 1;
  const zArrow = cover ? layerZIndex(layers, "arrow") : 2;
  const zChip = cover ? layerZIndex(layers, "chip") : 3;
  const zOperator = cover ? layerZIndex(layers, "operator") : 4;
  const zText = cover
    ? Math.max(
        layerZIndex(layers, "event"),
        layerZIndex(layers, "kicker"),
        layerZIndex(layers, "stage"),
        layerZIndex(layers, "tag"),
        layerZIndex(layers, "verb"),
      )
    : 6;
  const washAmount = styles?.wash?.opacity ?? layers.find((layer) => layer.id === "wash")?.opacity ?? 100;

  return (
    <div data-highspec-canvas="" className="relative h-full w-full overflow-hidden bg-[#f6f3ee]">
      {bg.url ? (
        <img
          data-cover-bg=""
          src={remoteBg.src}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "62% 42%", filter: bgGradeFilter(props.effects?.bgGrade) }}
          onLoad={remoteBg.onLoad}
          onError={remoteBg.onError}
        />
      ) : null}
      <CoverElement
        id="wash"
        kind="box"
        className="pointer-events-none absolute inset-0"
        style={{ zIndex: zWash, opacity: Math.min(1, Math.max(0, washAmount / 100)) }}
      >
        <div
          data-highspec-wash=""
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgb(248 245 240 / 0.94) 0%, rgb(247 244 239 / 0.78) 22%, rgb(246 243 238 / 0.46) 48%, rgb(245 242 237 / 0.24) 74%, rgb(245 242 237 / 0.14) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgb(248 245 240 / 0.72) 0%, rgb(248 245 240 / 0.28) 22%, transparent 48%)",
          }}
        />
      </CoverElement>
      {props.bgDim ? <BgDimLayer on amount={props.bgDimAmount ?? 18} at="22% 42%" className="z-[2]" /> : null}

      <CoverElement
        id="arrow"
        kind="box"
        className="absolute left-0"
        style={{ top: BAR_TOP, width: 1920, height: BAR_H, color: styles?.arrow?.color ?? BAR, zIndex: zArrow }}
      >
        <svg data-stage-arrow="" className="block h-full w-full" viewBox={`0 0 1920 ${BAR_H}`} aria-hidden>
          <polygon
            points={`${TIP_X},${BAR_H / 2} ${SHOULDER_X},0 1920,0 1920,${BAR_H} ${SHOULDER_X},${BAR_H}`}
            fill="currentColor"
          />
        </svg>
      </CoverElement>

      <CoverElement
        id="chip"
        kind="box"
        className="absolute"
        style={{
          left: CHIP_X,
          top: CHIP_Y,
          width: chipW,
          height: CHIP_H,
          color: styles?.chip?.color ?? CHIP,
          background: "currentColor",
          zIndex: zChip,
        }}
      />

      <div
        data-operator-slot=""
        className="pointer-events-none absolute"
        style={{ left: ART_LEFT, top: ART_TOP, width: ART_SIZE, height: ART_SIZE, zIndex: zOperator }}
      >
        <OperatorLayer
          {...props}
          objectFit="contain"
          objectPosition="50% 50%"
          transformOrigin="58% 62%"
          className="h-full w-full"
        />
      </div>

      <CoverElement
        id="event"
        defaultFont="serif"
        defaultFontSize={eventFont}
        className="absolute font-black leading-none whitespace-nowrap"
        style={{ left: EVENT_X, top: EVENT_Y, color: INK, zIndex: zText, width: "max-content" }}
      >
        {event}
      </CoverElement>
      {kicker.trim() ? (
        <CoverElement
          id="kicker"
          defaultFont="cn"
          defaultFontSize={28}
          className="absolute font-bold leading-none tracking-[0.22em] whitespace-nowrap uppercase"
          style={{ left: 248, top: 214, color: "#2a2622", zIndex: zText, width: "max-content" }}
        >
          {kicker}
        </CoverElement>
      ) : null}
      <CoverElement
        id="stage"
        defaultFont="cn"
        defaultFontSize={stageFont}
        className="absolute font-black leading-none tracking-[-0.04em] whitespace-nowrap text-white"
        style={{ left: 228 + STAGE_NUDGE_X, top: stageTop + STAGE_NUDGE_Y, zIndex: zText, width: "max-content" }}
      >
        {stage}
      </CoverElement>
      <CoverElement
        id="tag"
        defaultFont="cn"
        defaultFontSize={tagFont}
        className="absolute grid place-items-center font-black leading-none whitespace-nowrap text-white"
        style={{ left: CHIP_X, top: CHIP_Y, width: chipW, height: CHIP_H, zIndex: zText }}
      >
        {tag}
      </CoverElement>
      <CoverElement
        id="verb"
        defaultFont="cn"
        defaultFontSize={verbFont}
        className="absolute font-black leading-none tracking-[-0.04em] whitespace-nowrap"
        style={{ left: verbX + VERB_NUDGE_X, top: verbY + VERB_NUDGE_Y, color: INK, zIndex: zText, width: "max-content" }}
      >
        {verb}
      </CoverElement>
    </div>
  );
}
