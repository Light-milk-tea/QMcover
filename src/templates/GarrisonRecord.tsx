import type { CSSProperties } from "react";
import { HudDial, HudGrid, HudHatch, HudLines, HudPixels, HudRings, type HudDialSpec, type HudPixelCluster, type HudStroke } from "../canvas/DecorArt";
import { FadeInkText, HudIslandBar, HudPixelX, HudTag } from "../canvas/TextFaces";
import { CoverElement } from "../components/CoverElement";
import { elementText } from "../data/elements";
import { artCutoutMask, hasArtCutout } from "../lib/artCutouts";
import { RECORD_TONE as T, garrisonOnlyText } from "../lib/garrisonHud";
import { layerZIndex } from "../lib/document";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps, Layer } from "../types";
import { OperatorLayer } from "./OperatorLayer";

/** 卡片左上角、尺寸、倾角；立绘比卡片再多转 1.6°，和参考图里的取景一致。 */
const CARD = { x: 258, y: 226, w: 590, h: 600, rotate: -3.5 };
const ART_TILT = -1.6;
/** 照片窗（卡片内坐标） */
const WINDOW = { x: 30, y: 92, w: 545, h: 453 };
/** 立绘框 1000 见方；缤纷奇境按宽度装入，缩放原点在脸上。 */
const ART_BOX = 1000;
const ART_ORIGIN = "532px 432px";

const TITLE = { left: 1092, top: 336, maxW: 620, size: 156 };
const SUB = { left: 866, top: 492, maxW: 846, size: 196, widen: 1.13, stretch: 1.26 };

const DIAL: HudDialSpec = {
  cx: 595,
  cy: 467,
  r: 466,
  size: 34,
  tickInner: 412,
  tickOuter: 442,
  majorInner: 396,
  circles: [456, 384],
  small: [-18, -12, -6, 0, 6, 12, 18],
  smallR: 364,
  smallSize: 22,
};

const RINGS = [
  { cx: 112, cy: 244, r: 128, width: 58 },
  { cx: 1052, cy: 70, r: 120, width: 50 },
  { cx: 905, cy: 985, r: 175, width: 64 },
  { cx: 1690, cy: 950, r: 190, width: 62 },
  { cx: 1760, cy: 105, r: 105, width: 42, opacity: 0.7 },
];

const LINES: HudStroke[] = [
  { d: "M 1722 300 H 1920 M 1000 846 H 1580", width: 2, opacity: 0.7 },
  { d: "M 1540 862 h 26 m -13 -13 v 26 M 1840 870 h 26 m -13 -13 v 26 M 1876 548 h 26 m -13 -13 v 26 M 1012 132 h 22 m -11 -11 v 22", width: 2.5, color: "dial" },
  { d: "M 1035 330 H 1722 V 712 H 1000 V 510", width: 2, opacity: 0.45 },
  { d: "M 22 128 L 82 188 M 82 128 L 22 188", width: 16, color: "frame", opacity: 0.75 },
];

const PIXELS: HudPixelCluster[] = [
  { x: 150, y: 202, cell: 10, rows: ["..a", "aa.", ".ga"] },
  { x: 862, y: 136, cell: 9, rows: ["a..", ".aa", "g.a"] },
  { x: 920, y: 836, cell: 10, rows: [".a.", "aga", "..a"] },
  { x: 1730, y: 646, cell: 10, rows: ["a.a", ".a.", "aga"] },
  { x: 236, y: 846, cell: 10, rows: ["aa", ".ag"] },
  { x: 1588, y: 700, cell: 9, rows: ["g.a", ".a."] },
];

function hiddenLayer(layers: Layer[] | undefined, id: string) {
  const layer = layers?.find((item) => item.id === id);
  return Boolean(layer?.hidden || layer?.removed);
}

const glyphs = (text: string) => [...text].length;

/** 细竖纹：红字里压深一档的竖线，靠 background-clip 落在字面上。 */
const stripeFace = (base: string, line: string, pitch: number): CSSProperties => ({
  backgroundImage: `repeating-linear-gradient(90deg, ${base} 0 ${pitch * 0.62}px, ${line} ${pitch * 0.62}px ${pitch}px)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
});

export function GarrisonRecord(props: CoverRenderProps) {
  const cover = useCoverOptional();
  const styles = props.elementStyles;
  const layers = cover?.draft.layers ?? props.layers ?? [];
  const z = (id: string, fallback: number) => (cover ? layerZIndex(layers, id) : fallback);

  const title = elementText(styles, "title", props.title).replace(/\s*\n\s*/g, "");
  const subtitle = elementText(styles, "subtitle", props.subtitle).replace(/\s*\n\s*/g, " ");
  const mark = elementText(styles, "mark", props.mark ?? "");
  const signature = elementText(styles, "backdrop", props.signature);
  const enName = (props.signature || "OPERATOR").toUpperCase();
  const island = elementText(styles, "island", "RHODES ISLAND");
  const only = elementText(styles, "only", garrisonOnlyText(props.signature));
  const tagTop = elementText(styles, "tag-top", "HARD MODE");
  const tagBottom = elementText(styles, "tag-bottom", "HARD MODE");
  const record = elementText(styles, "record", "PRTS RECORD\nWELCOME DOCTOR");

  const titleSize = styles?.title?.fontSize ?? Math.min(TITLE.size, Math.floor(TITLE.maxW / (Math.max(glyphs(title), 1) * 0.98)));
  const subSize = styles?.subtitle?.fontSize ?? Math.min(SUB.size, Math.floor(SUB.maxW / (Math.max(glyphs(subtitle), 1) * 0.7 * SUB.widen)));
  const markSize = styles?.mark?.fontSize ?? 46;
  const backdropSize = styles?.backdrop?.fontSize ?? Math.min(318, Math.floor(1380 / (Math.max(glyphs(signature), 1) * 0.86)));
  const showPop = hasArtCutout(props.imageUrl) && !hiddenLayer(layers, "pop");
  const cardHidden = hiddenLayer(layers, "card");

  const artBox = (echo: boolean) => (
    <div className="absolute left-0 top-0" style={{ width: ART_BOX, height: ART_BOX, transform: `rotate(${ART_TILT}deg)`, transformOrigin: "0 0" }}>
      <OperatorLayer
        {...props}
        echo={echo}
        objectFit="contain"
        objectPosition="0% 0%"
        transformOrigin={ART_ORIGIN}
        pictureMask={echo ? artCutoutMask(props.imageUrl) : undefined}
        className="h-full w-full"
      />
    </div>
  );

  return (
    <div data-garrison-record="" className="relative h-full w-full overflow-hidden" style={{ background: T.base }}>
      <CoverElement id="grid" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("grid", 0) }}>
        <HudGrid tone={T} pitch={60} width={1.2} areas={[[0, 0, 1920, 1080]]} />
      </CoverElement>
      <CoverElement id="rings" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("rings", 1) }}>
        <HudRings tone={T} rings={RINGS} grain />
      </CoverElement>
      <CoverElement id="dial" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("dial", 2) }}>
        <HudDial tone={T} spec={DIAL} />
      </CoverElement>

      {signature.trim() ? (
        <CoverElement
          id="backdrop"
          defaultFont="unbounded"
          defaultFontSize={backdropSize}
          className="pointer-events-none absolute whitespace-nowrap font-black leading-none"
          style={{ left: 172, top: 72, width: 1500, height: 840, zIndex: z("backdrop", 3), color: T.accent, opacity: 0.9 }}
        >
          <span className="absolute left-0 top-0 block w-max" style={{ ...stripeFace("currentColor", "rgba(150, 10, 18, 0.55)", 6), transform: "scaleX(1.08)", transformOrigin: "left top" }}>
            {signature.toUpperCase()}
          </span>
          <span
            className="absolute left-0 block w-max"
            style={{
              ...stripeFace("currentColor", "rgba(150, 10, 18, 0.55)", 6),
              top: "1.52em",
              fontSize: "1.06em",
              opacity: 0.62,
              transform: "scaleX(1.02)",
              transformOrigin: "left top",
              WebkitMaskImage: "linear-gradient(180deg, #000 30%, transparent 96%)",
              maskImage: "linear-gradient(180deg, #000 30%, transparent 96%)",
            }}
          >
            {signature.toUpperCase()}
          </span>
        </CoverElement>
      ) : null}

      <CoverElement id="lines" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("lines", 4) }}>
        <HudLines tone={T} strokes={LINES} />
      </CoverElement>

      <div
        data-garrison-card=""
        className="pointer-events-none absolute"
        style={{ left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, transform: `rotate(${CARD.rotate}deg)`, transformOrigin: "0 0", zIndex: z("operator", 5) }}
      >
        {cardHidden ? null : <div className="absolute inset-0" style={{ background: T.paper, boxShadow: "0 22px 40px rgba(60, 20, 20, 0.22)" }} />}
        <div className="absolute overflow-hidden" style={{ left: WINDOW.x, top: WINDOW.y, width: WINDOW.w, height: WINDOW.h, background: "#7cc4ea" }}>
          <div className="absolute" style={{ left: -WINDOW.x, top: -WINDOW.y, width: CARD.w, height: CARD.h }}>
            {artBox(false)}
          </div>
        </div>
        <CoverElement id="card" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: 6 }}>
          <CardChrome />
        </CoverElement>
        {showPop ? (
          <CoverElement id="pop" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: 7 }}>
            {artBox(true)}
          </CoverElement>
        ) : null}
        {cardHidden ? null : <CardFooter enName={enName} subtitle={subtitle} />}
      </div>

      <CoverElement id="panel" kind="box" className="pointer-events-none absolute" style={{ left: 1000, top: 318, width: 735, height: 404, zIndex: z("panel", 9) }}>
        <TitlePanel />
      </CoverElement>

      {title ? (
        <CoverElement
          id="title"
          defaultFont="cn"
          defaultFontSize={titleSize}
          className="absolute whitespace-nowrap font-black leading-none"
          style={{ left: TITLE.left, top: TITLE.top, zIndex: z("title", 10), letterSpacing: "-0.01em" }}
        >
          <span aria-hidden className="absolute" style={{ left: "-0.12em", top: "0.1em", width: "0.16em", height: "0.86em", borderLeft: `0.06em solid ${T.accent}`, borderTop: `0.06em solid ${T.accent}`, borderBottom: `0.06em solid ${T.accent}` }} />
          <FadeInkText text={title} ink={T.ink} fade={T.accent} from={48} period={0.045} gap={0.01} />
        </CoverElement>
      ) : null}

      {subtitle.trim() ? (
        <CoverElement
          id="subtitle"
          defaultFont="unbounded"
          defaultFontSize={subSize}
          className="absolute whitespace-nowrap font-black leading-none"
          style={{ left: SUB.left, top: SUB.top, zIndex: z("subtitle", 11), color: T.accent, letterSpacing: "-0.02em" }}
        >
          <span className="relative block" style={{ transform: `scale(${SUB.widen}, ${SUB.stretch})`, transformOrigin: "left top" }}>
            <span aria-hidden className="absolute left-0 top-0" style={{ transform: "translate(0.035em, 0.04em)", color: "rgba(229, 54, 42, 0.22)" }}>
              {subtitle.toUpperCase()}
            </span>
            <span className="relative" style={stripeFace("currentColor", "#b8141d", 7)}>
              {subtitle.toUpperCase()}
            </span>
          </span>
        </CoverElement>
      ) : null}

      <CoverElement id="rail" kind="box" className="pointer-events-none absolute" style={{ left: 1727, top: 362, width: 46, height: 300, zIndex: z("rail", 12) }}>
        <Rail letter={enName.slice(0, 1)} enName={enName} />
      </CoverElement>

      {mark.trim() ? (
        <CoverElement
          id="mark"
          defaultFont="cn"
          defaultFontSize={markSize}
          className="absolute whitespace-nowrap font-black leading-none"
          style={{ left: 1606, top: 636, zIndex: z("mark", 13), color: T.accentInk, background: T.accent, padding: "0.08em 0.14em 0.1em" }}
        >
          {mark}
        </CoverElement>
      ) : null}

      {island.trim() ? (
        <CoverElement id="island" defaultFont="outfit" defaultFontSize={21} className="absolute" style={{ left: 870, top: 715, width: 330, height: 36, zIndex: z("island", 14) }}>
          <HudIslandBar title={island} sub="OPERATOR SELECTING SYSTEM" bg={T.accent} ink={T.accentInk} dots={6} />
        </CoverElement>
      ) : null}

      <CoverElement id="hatch" kind="box" className="pointer-events-none absolute" style={{ left: 1205, top: 715, width: 164, height: 36, zIndex: z("hatch", 15) }}>
        <HudHatch color={T.hatch} stripe={7} gap={8} />
      </CoverElement>

      {only.trim() ? (
        <CoverElement id="only" defaultFont="outfit" defaultFontSize={15} className="absolute leading-none" style={{ left: 1588, top: 316, zIndex: z("only", 16) }}>
          <HudTag text={only} bg={T.accent} ink={T.accentInk} />
        </CoverElement>
      ) : null}

      {tagTop.trim() ? (
        <CoverElement id="tag-top" defaultFont="outfit" defaultFontSize={15} className="absolute leading-none" style={{ left: 1598, top: 134, zIndex: z("tag-top", 17) }}>
          <HudTag text={tagTop} bg={T.accent} ink={T.accentInk} icon />
        </CoverElement>
      ) : null}

      {tagBottom.trim() ? (
        <CoverElement id="tag-bottom" defaultFont="outfit" defaultFontSize={15} className="absolute leading-none" style={{ left: 1598, top: 920, zIndex: z("tag-bottom", 18) }}>
          <HudTag text={tagBottom} bg={T.accent} ink={T.accentInk} icon />
        </CoverElement>
      ) : null}

      {record.trim() ? (
        <CoverElement id="record" defaultFont="pixel" defaultFontSize={10} className="absolute whitespace-pre leading-[1.7]" style={{ left: 1652, top: 866, zIndex: z("record", 19), color: T.muted }}>
          {record}
        </CoverElement>
      ) : null}

      <CoverElement id="pixels" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("pixels", 20) }}>
        <HudPixels tone={T} clusters={PIXELS} />
      </CoverElement>
    </div>
  );
}

/** 卡片红框、抬头和 ONLY 徽标（卡片内坐标）。 */
function CardChrome() {
  return (
    <>
      <div className="absolute" style={{ left: 70, top: 0, width: 520, height: 10, background: T.accentDeep }} />
      <div className="absolute" style={{ left: 0, top: 0, width: 13, height: 600, background: T.accentDeep }} />
      <div className="absolute" style={{ left: 18, top: WINDOW.y, width: 8, height: WINDOW.h, background: T.accent }} />
      <div className="absolute" style={{ left: 575, top: 380, width: 15, height: 165, background: T.accentDeep }} />
      <div className="absolute grid place-items-center" style={{ left: 24, top: 30, width: 46, height: 50, background: T.accentDeep }}>
        <HudPixelX size={20} color={T.paper} />
        <span className="font-outfit text-[11px] font-extrabold leading-none" style={{ color: T.paper }}>
          ONLY
        </span>
      </div>
      <div className="absolute whitespace-nowrap font-outfit font-black leading-none" style={{ left: 82, top: 28, fontSize: 44, color: T.ink, letterSpacing: "0.01em" }}>
        RHODES ISLAND
      </div>
      <div className="absolute whitespace-nowrap font-outfit font-semibold leading-none" style={{ left: 84, top: 74, fontSize: 15, color: T.accentDeep, letterSpacing: "0.12em" }}>
        OPERATOR SELECTING SYSTEM
      </div>
      <div className="absolute whitespace-nowrap font-outfit font-extrabold leading-none" style={{ left: 452, top: 22, fontSize: 12, color: T.ink, letterSpacing: "0.06em" }}>
        PRTS ARCHIVE
      </div>
    </>
  );
}

/** 卡片底部白条：英文名档案 + 红色大字小注，压在出框立绘之上。 */
function CardFooter({ enName, subtitle }: { enName: string; subtitle: string }) {
  return (
    <div className="absolute" style={{ left: 0, top: 0, width: CARD.w, height: CARD.h, zIndex: 8 }}>
      <div className="absolute flex items-center justify-between" style={{ left: 30, top: 540, width: 595, height: 46, background: T.paper, boxShadow: "0 6px 14px rgba(60, 20, 20, 0.18)" }}>
        <span className="absolute left-0 top-0 h-full" style={{ width: 16, background: T.accentDeep }} />
        <span className="whitespace-nowrap pl-[34px] font-outfit font-extrabold leading-none" style={{ fontSize: 22, color: T.ink, letterSpacing: "0.08em" }}>
          {enName} ARKNIGHTS RECORD
        </span>
        <span className="whitespace-nowrap pr-[18px] font-outfit font-medium leading-none" style={{ fontSize: 13, color: T.ink, letterSpacing: "0.04em" }}>
          {subtitle.toUpperCase()} HARD MODE
        </span>
      </div>
      <div className="absolute" style={{ left: 44, top: 590, width: 220, height: 12, background: T.accentDeep }} />
      <div className="absolute" style={{ left: 104, top: 602, width: 96, height: 6, background: T.ink }} />
    </div>
  );
}

/** 标题后的白板：两块错位白底，内衬细方格。 */
function TitlePanel() {
  const grid = {
    backgroundColor: "rgba(255,255,255,0.94)",
    backgroundImage: "linear-gradient(90deg, rgba(150,150,150,0.22) 1px, transparent 1px), linear-gradient(0deg, rgba(150,150,150,0.22) 1px, transparent 1px)",
    backgroundSize: "30px 30px",
    boxShadow: "0 10px 26px rgba(0,0,0,0.08)",
  } as const;
  return (
    <>
      <div className="absolute" style={{ left: 50, top: -92, width: 88, height: 92, background: T.paper, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}>
        <svg className="absolute" style={{ left: 30, top: 8 }} width="28" height="36" viewBox="0 0 7 9" aria-hidden>
          <path d="M0 0h1v1h1V0h3v1h1V0h1v3H6v5h1v1H0V8h1V3H0z" fill={T.accentDeep} />
          <rect x="3" y="4" width="1" height="2" fill={T.paper} />
        </svg>
        <span className="absolute left-0 right-0 text-center font-outfit font-extrabold leading-none" style={{ top: 50, fontSize: 10, color: T.accentDeep }}>
          RHODES ISLAND
        </span>
        <span className="absolute left-0 right-0 text-center font-outfit leading-[1.3]" style={{ top: 64, fontSize: 7, color: T.muted }}>
          NO.1
          <br />
          COLLECTING DATA
        </span>
      </div>
      <div className="absolute" style={{ left: 35, top: 12, width: 687, height: 180, ...grid }} />
      <div className="absolute" style={{ left: 0, top: 186, width: 735, height: 210, ...grid }} />
    </>
  );
}

/** 右侧红色竖条：顶上 S 徽标，条内竖排英文。 */
function Rail({ letter, enName }: { letter: string; enName: string }) {
  return (
    <>
      <div className="absolute grid place-items-center font-unbounded font-black leading-none" style={{ left: 0, top: 0, width: 46, height: 46, background: T.accent, color: T.paper, fontSize: 30 }}>
        {letter || "S"}
      </div>
      <div className="absolute flex items-end justify-center pb-3" style={{ left: 4, top: 50, width: 38, height: 232, background: T.accent }}>
        <span className="whitespace-nowrap font-outfit font-extrabold leading-none" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 12, color: T.paper, letterSpacing: "0.18em" }}>
          {enName} · ARKNIGHTS
        </span>
      </div>
      <div className="absolute" style={{ left: 30, top: 284, width: 16, height: 16, background: T.accentDeep }} />
    </>
  );
}
