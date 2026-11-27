import { HudDial, HudGrid, HudHatch, HudLines, HudPixels, HudRings, HudScan, type HudDialSpec, type HudPixelCluster, type HudStroke } from "../canvas/DecorArt";
import { HudIslandBar, HudTag, ScanText } from "../canvas/TextFaces";
import { CoverElement } from "../components/CoverElement";
import { elementText } from "../data/elements";
import { TERMINAL_TONE as T } from "../lib/garrisonHud";
import { layerZIndex } from "../lib/document";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps } from "../types";
import { OperatorLayer } from "./OperatorLayer";

/** 卡片左上角、尺寸和倾角（参考图量得）。 */
const CARD = { x: 325, y: 263, w: 458, h: 486, rotate: -2.3 };
/** 立绘框 1024 见方，默认回味冰霜雪正好按原尺寸装入；缩放原点在脸上。 */
const ART_BOX = 1024;
const ART_ORIGIN = "505px 348px";

const TITLE_CX = 1287;
const TITLE_TOP = 278;
const MAIN_SIZE = 256;
const MAIN_MAX_W = 800;

const DIAL: HudDialSpec = {
  cx: 970,
  cy: 563,
  r: 556,
  size: 30,
  tickInner: 486,
  tickOuter: 512,
  majorInner: 470,
  circles: [526, 452],
  small: [-24, -18, -12, -6, 0, 6, 12, 18, 24],
  smallR: 428,
  smallSize: 17,
  skip: [[284, 316]],
};

const RINGS = [
  { cx: 281, cy: 206, r: 112, width: 58 },
  { cx: 1046, cy: 1010, r: 250, width: 64, opacity: 0.45 },
  { cx: 1300, cy: 770, r: 128, width: 34, opacity: 0.5 },
];

const LINES: HudStroke[] = [
  { d: "M 234 98 H 1528 V 845 H 170 V 160", width: 2.5, opacity: 0.55 },
  { d: "M 150 178 H 1494 M 1652 178 H 1752", width: 2, opacity: 0.7 },
  { d: "M 1880 150 V 990 M 1240 990 H 1880", width: 2, opacity: 0.35 },
  { d: "M 40 170 V 990 H 230", width: 2, opacity: 0.4 },
  { d: "M 150 46 L 262 187", width: 3, color: "dial", opacity: 0.9 },
  { d: "M 262 187 l -24 -6 l 17 -17 z", width: 1, color: "dial", fill: true, opacity: 0.9 },
  { d: "M 870 795 L 1014 939", width: 3, color: "dial", opacity: 0.85 },
  { d: "M 1014 939 l -25 -3 l 22 -22 z", width: 1, color: "dial", fill: true, opacity: 0.85 },
  { d: "M 1500 420 L 1610 300", width: 3, color: "dial", opacity: 0.6 },
  { d: "M 46 793 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0 M 93 793 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0 M 140 793 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0", width: 3, color: "muted", opacity: 0.8 },
];

const PIXELS: HudPixelCluster[] = [
  { x: 1690, y: 860, cell: 9, rows: ["a.a", ".a.", "a.a"] },
  { x: 860, y: 166, cell: 8, rows: ["aa.", "a.d", ".dd"] },
  { x: 1838, y: 400, cell: 7, rows: ["a", "a", ".", "a"] },
];

function titleParts(raw: string) {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length <= 1) return { top: "", main: lines[0] ?? "", bottom: "" };
  if (lines.length === 2) return { top: lines[0], main: lines[1], bottom: "" };
  return { top: lines[0], main: lines[1], bottom: lines.slice(2).join(" ") };
}

const glyphs = (text: string) => [...text].length;

export function GarrisonTerminal(props: CoverRenderProps) {
  const cover = useCoverOptional();
  const styles = props.elementStyles;
  const layers = cover?.draft.layers ?? props.layers ?? [];
  const z = (id: string, fallback: number) => (cover ? layerZIndex(layers, id) : fallback);

  const { top, main, bottom } = titleParts(elementText(styles, "title", props.title));
  const mainCount = Math.max(glyphs(main), 1);
  const size = styles?.title?.fontSize ?? Math.min(MAIN_SIZE, Math.floor(MAIN_MAX_W / (mainCount * 1.02)));
  const k = size / MAIN_SIZE;
  const topSize = Math.min(81 * k, (640 * k) / Math.max(glyphs(top), 1) / 1.06);
  const bottomSize = Math.min(97 * k, (680 * k) / Math.max(glyphs(bottom), 1) / 1.14);
  const mainWidth = mainCount * size * 1.02;
  const mainTop = top ? 97 * k : 0;
  const bottomTop = mainTop + 297 * k;
  const titleWidth = Math.max(mainWidth + size * 0.4, 900);

  const enName = elementText(styles, "en-name", props.signature);
  const tagline = elementText(styles, "tagline", props.subtitle);
  const mode = elementText(styles, "mode", props.mark ?? "");
  const island = elementText(styles, "island", "RHODES ISLAND");
  const file = elementText(styles, "file", "FILE\nA B 7.2-12\n3.2217");
  const tag = elementText(styles, "tag", "WHY FOR THIS");
  const record = elementText(styles, "record", "PRTS RECORD\nWELCOME DOCTOR");

  return (
    <div data-garrison-terminal="" className="relative h-full w-full overflow-hidden" style={{ background: `radial-gradient(ellipse 75% 85% at 45% 45%, #15211d 0%, #0e1513 55%, ${T.base} 100%)` }}>
      <CoverElement id="grid" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("grid", 0) }}>
        <HudGrid tone={T} pitch={62} areas={[[40, 90, 880, 900], [920, 90, 960, 900]]} />
      </CoverElement>
      <CoverElement id="rings" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("rings", 1) }}>
        <HudRings tone={T} rings={RINGS} />
      </CoverElement>
      <CoverElement id="dial" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("dial", 2) }}>
        <HudDial tone={T} spec={DIAL} />
      </CoverElement>
      <CoverElement id="lines" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("lines", 3) }}>
        <HudLines tone={T} strokes={LINES} />
      </CoverElement>
      <CoverElement id="frame" kind="box" className="pointer-events-none absolute" style={{ left: 262, top: 212, width: 590, height: 580, zIndex: z("frame", 4) }}>
        <div className="absolute inset-0" style={{ background: "rgba(30, 122, 91, 0.5)", border: `10px solid #2a9b74`, boxShadow: "0 0 30px rgba(42, 155, 116, 0.35)" }} />
        <div className="absolute" style={{ inset: 22, border: `2px solid ${T.accent}`, opacity: 0.22 }} />
      </CoverElement>

      <div
        data-garrison-card=""
        className="pointer-events-none absolute"
        style={{
          left: CARD.x,
          top: CARD.y,
          width: CARD.w,
          height: CARD.h,
          transform: `rotate(${CARD.rotate}deg)`,
          transformOrigin: "0 0",
          zIndex: z("operator", 5),
          boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden" style={{ background: "#eef3f1", filter: "saturate(1.14) contrast(1.07)" }}>
          <div className="absolute left-0 top-0" style={{ width: ART_BOX, height: ART_BOX }}>
            <OperatorLayer {...props} objectFit="contain" objectPosition="0% 0%" transformOrigin={ART_ORIGIN} className="h-full w-full" />
          </div>
        </div>
        <CoverElement id="card" kind="box" className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(90deg, rgba(40,60,52,0.1) 1px, transparent 1px), linear-gradient(0deg, rgba(40,60,52,0.1) 1px, transparent 1px)",
              backgroundSize: "7px 7px",
            }}
          />
          <div className="absolute inset-0" style={{ border: `5px solid ${T.paper}` }} />
        </CoverElement>
      </div>

      {island.trim() ? (
        <CoverElement id="island" defaultFont="outfit" defaultFontSize={20} className="absolute" style={{ left: 275, top: 768, width: 383, height: 39, zIndex: z("island", 6) }}>
          <HudIslandBar title={island} sub="OPERATOR SELECTING SYSTEM" bg={T.accent} ink={T.paper} dots={6} />
        </CoverElement>
      ) : null}

      {enName.trim() ? (
        <CoverElement
          id="en-name"
          defaultFont="anton"
          defaultFontSize={74}
          className="absolute whitespace-nowrap leading-none"
          style={{ left: 272, top: 824, zIndex: z("en-name", 7), color: T.accentDeep, transform: "skewX(-12deg)", letterSpacing: "0.03em" }}
        >
          <ScanText text={enName.toUpperCase()} color="currentColor" period={0.055} gap={0.011} />
        </CoverElement>
      ) : null}

      <CoverElement id="hatch" kind="box" className="pointer-events-none absolute" style={{ left: 596, top: 847, width: 264, height: 36, zIndex: z("hatch", 8), opacity: 0.85 }}>
        <HudHatch color={T.hatch} stripe={8} gap={8} />
      </CoverElement>

      {tagline.trim() ? (
        <CoverElement
          id="tagline"
          defaultFont="outfit"
          defaultFontSize={40}
          className="absolute flex items-center whitespace-nowrap font-extrabold leading-none"
          style={{ left: 382, top: 880, zIndex: z("tagline", 9), color: T.accent, textShadow: `0 0 14px rgba(54, 226, 160, 0.35)` }}
        >
          <span className="mr-[0.35em] grid grid-cols-2 gap-[0.12em]" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="block size-[0.16em]" style={{ background: "currentColor" }} />
            ))}
          </span>
          {tagline.toUpperCase()}
        </CoverElement>
      ) : null}

      {mode.trim() ? (
        <CoverElement id="mode" defaultFont="pixel" defaultFontSize={17} className="absolute whitespace-nowrap leading-none" style={{ left: 596, top: 896, zIndex: z("mode", 10), color: T.muted }}>
          {mode.toUpperCase()}
        </CoverElement>
      ) : null}

      {file.trim() ? (
        <CoverElement id="file" defaultFont="pixel" defaultFontSize={15} className="absolute whitespace-pre leading-[1.9]" style={{ left: 38, top: 930, zIndex: z("file", 11), color: T.muted }}>
          {file}
        </CoverElement>
      ) : null}

      {main || top || bottom ? (
        <CoverElement
          id="title"
          defaultFont="cn"
          defaultFontSize={size}
          className="absolute font-black leading-none"
          style={{ left: TITLE_CX - titleWidth / 2, top: TITLE_TOP, width: titleWidth, height: bottomTop + (bottom ? bottomSize * 1.2 : size * 1.1), zIndex: z("title", 12) }}
        >
          {top ? (
            <span
              data-title-line="top"
              className="absolute left-1/2 whitespace-nowrap"
              style={{ top: 0, fontSize: topSize, color: T.accent, letterSpacing: "0.06em", WebkitTextStroke: "0.02em currentColor", transform: "translateX(-50%) skewX(-12deg)", textShadow: "0 0 18px rgba(54, 226, 160, 0.3)" }}
            >
              {top}
            </span>
          ) : null}
          {main ? (
            <span data-title-line="main" className="absolute left-1/2 whitespace-nowrap" style={{ top: mainTop, transform: "translateX(-50%)" }}>
              <span aria-hidden className="absolute" style={{ left: "-0.15em", top: "0.12em", width: "0.26em", height: "0.96em" }}>
                <ScanBracket side="l" />
              </span>
              <ScanText
                text={main}
                color={T.ink}
                period={0.032}
                gap={0.009}
                style={{ letterSpacing: "0.01em", WebkitTextStroke: "0.011em currentColor", textShadow: "0 0 24px rgba(54, 226, 160, 0.25)" }}
              />
              <span aria-hidden className="absolute" style={{ right: "-0.13em", top: "0.33em", width: "0.26em", height: "0.77em" }}>
                <ScanBracket side="r" />
              </span>
            </span>
          ) : null}
          {bottom ? (
            <span
              data-title-line="bottom"
              className="absolute left-1/2 whitespace-nowrap"
              style={{ top: bottomTop, fontSize: bottomSize, color: T.accent, letterSpacing: "0.12em", WebkitTextStroke: "0.02em currentColor", transform: "translateX(-50%) skewX(-12deg)", textShadow: "0 0 18px rgba(54, 226, 160, 0.3)" }}
            >
              {bottom}
            </span>
          ) : null}
        </CoverElement>
      ) : null}

      {tag.trim() ? (
        <CoverElement id="tag" defaultFont="outfit" defaultFontSize={14} className="absolute leading-none" style={{ left: 1514, top: 180, zIndex: z("tag", 13) }}>
          <HudTag text={tag} bg={T.accent} ink={T.accentInk} />
        </CoverElement>
      ) : null}

      {record.trim() ? (
        <CoverElement id="record" defaultFont="pixel" defaultFontSize={11} className="absolute whitespace-pre leading-[1.7]" style={{ left: 1772, top: 172, zIndex: z("record", 14), color: T.muted }}>
          {record}
        </CoverElement>
      ) : null}

      <CoverElement id="pixels" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("pixels", 15) }}>
        <HudPixels tone={T} clusters={PIXELS} />
      </CoverElement>
      <CoverElement id="scan" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("scan", 16) }}>
        <HudScan tone={T} axis="x" pitch={4} line={1.5} />
      </CoverElement>
    </div>
  );
}

/** 标题大字两侧的直角括号，同样带横扫描缝。 */
function ScanBracket({ side }: { side: "l" | "r" }) {
  const mask = "repeating-linear-gradient(180deg, #000 0 0.023em, transparent 0.023em 0.032em)";
  const bar = { position: "absolute", top: 0, bottom: 0, width: "0.095em", background: T.accent } as const;
  const arm = { position: "absolute", left: 0, right: 0, height: "0.095em", background: T.accent } as const;
  return (
    <span className="absolute inset-0" style={{ WebkitMaskImage: mask, maskImage: mask }}>
      <span style={{ ...bar, [side === "l" ? "left" : "right"]: 0 }} />
      <span style={{ ...arm, [side === "l" ? "top" : "bottom"]: 0 }} />
    </span>
  );
}
