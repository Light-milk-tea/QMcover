import { GlossySlash, Wedge } from "../canvas/DecorArt";
import { RaisedType } from "../canvas/TextFaces";
import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { useCdnSrc } from "../lib/cdn";
import { blueCutPalette } from "../lib/blueCutPalette";
import { layerZIndex } from "../lib/document";
import { bgGradeFilter } from "../lib/effects";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps, Layer } from "../types";
import { OperatorLayer } from "./OperatorLayer";

const PAPER = "#f5f5f4";
const INK = "#4a4a4a";
const WEDGE = "#2a2a2a";
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
          <Wedge />
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
