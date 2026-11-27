import { CheckerPlate, ComicBurst, ComicStickers, StageBackdrop, StageBand, StageCrowd, TargetDisc, type ComicBurstSpec, type TargetDiscSpec } from "../canvas/DecorArt";
import { ComicShadowText, PixelQuote } from "../canvas/TextFaces";
import { CoverElement } from "../components/CoverElement";
import { elementText } from "../data/elements";
import { layerZIndex } from "../lib/document";
import { STAGE_TONE as T } from "../lib/unveilTone";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps } from "../types";
import { OperatorLayer } from "./OperatorLayer";

/** 立绘框 1000 见方，从画布左上角起；缩放原点在脸上。 */
const ART_BOX = 1000;
const ART_ORIGIN = "493px 95px";

const RING: TargetDiscSpec = { cx: 1342, cy: 482, r: 468 };
const BURST: ComicBurstSpec = { cx: 590, cy: 530, outer: 500, inner: 300, spikes: 17, seed: 11 };

/** 中间大字：西文 Anton 字墨高 0.88em，压到 0.8 宽；中文用思源黑体 Heavy，不压窄。 */
const MAIN = { left: 205, top: 440, latinSize: 341, cjkSize: 200, maxW: 820, squash: 0.74, spacing: 0.045, rotate: -7 };
/** 首尾两行思源黑体 Heavy，略微拉宽成扁字。 */
const TOP = { dx: 125, top: 290, size: 122, maxW: 650, widen: 1.07, rotate: -3 };
const BOTTOM = { size: 150, maxW: 520, rotate: -6 };
const MAIN_FONT = '"Anton", "Noto Sans SC", sans-serif';
/** 标题图层的左上角；各行在这个框里绝对定位。 */
const BOX = { x: 140, y: 240 };

const LATIN = /^[\x20-\x7e]+$/;

/** 估算字宽（em），按 Anton 实测：大写 0.46、数字 0.49、连字符 0.31；中文一个字宽。 */
function advance(text: string) {
  let sum = 0;
  for (const ch of text) {
    if (/[MW]/i.test(ch)) sum += 0.62;
    else if (/[I1]/.test(ch)) sum += 0.25;
    else if (/[0-9]/.test(ch)) sum += 0.49;
    else if (/[A-Z]/i.test(ch)) sum += 0.46;
    else if (ch === " ") sum += 0.2;
    else if (ch.charCodeAt(0) < 128) sum += 0.31;
    else sum += 1;
  }
  return Math.max(sum, 0.5);
}

function titleParts(raw: string) {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length <= 1) return { top: "", main: lines[0] ?? "", bottom: "" };
  if (lines.length === 2) return { top: lines[0], main: lines[1], bottom: "" };
  return { top: lines[0], main: lines[1], bottom: lines.slice(2).join(" ") };
}

export function UnveilStage(props: CoverRenderProps) {
  const cover = useCoverOptional();
  const styles = props.elementStyles;
  const layers = cover?.draft.layers ?? props.layers ?? [];
  const z = (id: string, fallback: number) => (cover ? layerZIndex(layers, id) : fallback);

  const { top, main, bottom } = titleParts(elementText(styles, "title", props.title));
  const latin = LATIN.test(main);
  const squash = latin ? MAIN.squash : 1;
  const spacing = latin ? MAIN.spacing : 0.02;
  const mainEm = (advance(main) + [...main].length * spacing) * squash;
  const autoSize = Math.min(latin ? MAIN.latinSize : MAIN.cjkSize, Math.floor(MAIN.maxW / mainEm));
  const mainSize = styles?.title?.fontSize ?? autoSize;
  const k = mainSize / autoSize;
  const mainW = mainEm * mainSize;
  const mainInk = mainSize * (latin ? 0.86 : 1);

  const topSize = Math.min(TOP.size * k, (TOP.maxW * k) / (advance(top) * TOP.widen));
  const topW = advance(top) * topSize * TOP.widen;
  const topLeft = MAIN.left + TOP.dx * k;
  const mainTop = top ? MAIN.top : TOP.top;
  const bottomSize = Math.min(BOTTOM.size * k, (BOTTOM.maxW * k) / advance(bottom));
  const bottomW = advance(bottom) * bottomSize;
  const bottomLeft = MAIN.left + mainW * 0.43;
  const bottomTop = mainTop + mainInk - mainSize * 0.16;
  const titleH = (bottom ? bottomTop + bottomSize * 1.15 : mainTop + mainInk) - BOX.y;
  const titleW = Math.max(mainW, topLeft - MAIN.left + topW, bottomLeft - MAIN.left + bottomW + bottomSize * 0.6) + (MAIN.left - BOX.x) + 60;

  const signature = elementText(styles, "en", props.signature);
  const enLines = (signature.includes("\n") ? signature.split(/\r?\n/) : signature.trim().split(/\s+/)).filter(Boolean);
  const band = props.subtitle;

  return (
    <div data-unveil-stage="" className="relative h-full w-full overflow-hidden" style={{ background: T.base }}>
      <CoverElement id="stage" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("stage", 0) }}>
        <StageBackdrop tone={T} />
      </CoverElement>
      <CoverElement id="band" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("band", 1) }}>
        <StageBand tone={T} text={band} />
      </CoverElement>
      <CoverElement id="crowd" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("crowd", 2) }}>
        <StageCrowd tone={T} />
      </CoverElement>
      <CoverElement id="ring" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("ring", 3) }}>
        <TargetDisc tone={T} spec={RING} />
      </CoverElement>
      <CoverElement id="burst" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("burst", 4) }}>
        <ComicBurst tone={T} spec={BURST} />
      </CoverElement>
      <CoverElement id="stickers" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("stickers", 5) }}>
        <ComicStickers tone={T} />
      </CoverElement>

      <div data-unveil-art="" className="pointer-events-none absolute left-0 top-0" style={{ width: ART_BOX, height: ART_BOX, zIndex: z("operator", 6) }}>
        <OperatorLayer {...props} objectFit="contain" objectPosition="0% 0%" transformOrigin={ART_ORIGIN} className="h-full w-full" />
      </div>

      <CoverElement id="plates" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("plates", 7) }}>
        {top ? (
          <div className="absolute" style={{ left: topLeft - 30, top: TOP.top + topSize * 0.12, width: topW + 50, height: topSize * 0.84, transform: `rotate(${TOP.rotate}deg)`, transformOrigin: "0 0" }}>
            <CheckerPlate a="#17112f" b="#3f2f8e" />
          </div>
        ) : null}
        {bottom ? (
          <div className="absolute" style={{ left: bottomLeft - 16, top: bottomTop + bottomSize * 0.04, width: bottomW + 34, height: bottomSize * 1.04, transform: `rotate(${BOTTOM.rotate}deg)`, transformOrigin: "0 0" }}>
            <CheckerPlate a="#17112f" b="#3f2f8e" />
          </div>
        ) : null}
      </CoverElement>

      {main || top || bottom ? (
        <CoverElement
          id="title"
          defaultFont="cn"
          defaultFontSize={mainSize}
          className="absolute font-black leading-none"
          style={{ left: BOX.x, top: BOX.y, width: titleW, height: titleH, zIndex: z("title", 8), color: T.cream }}
        >
          {top ? (
            <span
              data-title-line="top"
              className="absolute whitespace-nowrap"
              style={{ left: topLeft - BOX.x, top: TOP.top - BOX.y, fontSize: topSize, color: T.yellow, transform: `rotate(${TOP.rotate}deg) scaleX(${TOP.widen})`, transformOrigin: "0 100%" }}
            >
              <span aria-hidden className="absolute" style={{ left: "-0.62em", top: "-0.12em" }}>
                <PixelQuote side="open" color={T.orange} shade={T.yellow} />
              </span>
              {top}
            </span>
          ) : null}
          {main ? (
            <span
              data-title-line="main"
              className="absolute whitespace-nowrap"
              style={{
                left: MAIN.left - BOX.x,
                top: mainTop - BOX.y,
                fontSize: mainSize,
                fontFamily: styles?.title?.font ? undefined : MAIN_FONT,
                letterSpacing: `${spacing}em`,
                transform: `rotate(${MAIN.rotate}deg)`,
                transformOrigin: "0 100%",
              }}
            >
              <ComicShadowText text={main} shadow={T.redDeep} squash={squash} dx={0.022 / squash} dy={0.026} />
            </span>
          ) : null}
          {bottom ? (
            <span
              data-title-line="bottom"
              className="absolute whitespace-nowrap"
              style={{ left: bottomLeft - BOX.x, top: bottomTop - BOX.y, fontSize: bottomSize, color: T.yellow, transform: `rotate(${BOTTOM.rotate}deg)`, transformOrigin: "0 100%" }}
            >
              {bottom}
              <span aria-hidden className="absolute" style={{ right: "-0.62em", top: "-0.1em" }}>
                <PixelQuote side="close" color={T.orange} shade={T.yellow} />
              </span>
            </span>
          ) : null}
        </CoverElement>
      ) : null}

      {enLines.length ? (
        <CoverElement
          id="en"
          defaultFont="anton"
          defaultFontSize={44}
          className="absolute whitespace-pre text-center uppercase leading-[1.04]"
          style={{ left: 346, top: 726, zIndex: z("en", 9), color: T.yellow, transform: "rotate(-8deg)", transformOrigin: "0 0", letterSpacing: "0.02em" }}
        >
          {enLines.join("\n")}
        </CoverElement>
      ) : null}
    </div>
  );
}
