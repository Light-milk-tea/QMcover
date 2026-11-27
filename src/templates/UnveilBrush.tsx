import { BrushBackdrop, BrushStrokes, CardBadges, NeonCard, SawDisc, type NeonCardSpec, type SawDiscSpec } from "../canvas/DecorArt";
import { ExtrudeText } from "../canvas/TextFaces";
import { CoverElement } from "../components/CoverElement";
import { elementText } from "../data/elements";
import { layerZIndex } from "../lib/document";
import { BRUSH_TONE as T } from "../lib/unveilTone";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps } from "../types";
import { artCutoutMask } from "../lib/artCutouts";
import { OperatorLayer } from "./OperatorLayer";

/** 立绘框 1000 见方，从画布左上角起；荒芜拉普兰德精英 0 按宽度装入，缩放原点在脸上。 */
const ART_BOX = 1000;
const ART_ORIGIN = "498px 141px";

const DISC: SawDiscSpec = { cx: 1330, cy: 420, r: 380 };
const CARD: NeonCardSpec = {
  x: 246,
  y: 232,
  w: 736,
  h: 616,
  rotate: -5,
  offset: 18,
};

/** 中文标题：思源宋体 Heavy；关卡码：Fraunces 软衬线压窄到 0.6。 */
const TITLE = { left: 392, top: 268, size: 158, maxW: 474 };
const CODE = { left: 336, top: 340, size: 520, maxW: 600, squash: 0.6 };
const CODE_VARIATION = '"SOFT" 100, "WONK" 1, "opsz" 144';

/** 丝网印刷的斑驳：噪点高处挖成细碎缺口，用 mask-image 叠在大字上，导出也保留。 */
const GRUNGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.09 0.3" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -22 0 0 0 17"/></filter><rect width="320" height="320" filter="url(#g)"/></svg>`;
const GRUNGE_URL = `url("data:image/svg+xml,${encodeURIComponent(GRUNGE_SVG)}")`;
/** 蒙版只盖住自身边框盒，向外撑开一圈再用负边距收回，挤出的侧面不被裁掉。 */
const GRUNGE = {
  WebkitMaskImage: GRUNGE_URL,
  maskImage: GRUNGE_URL,
  WebkitMaskSize: "320px 320px",
  maskSize: "320px 320px",
  padding: "0.1em 0.14em 0.14em 0.1em",
  margin: "-0.1em -0.14em -0.14em -0.1em",
} as const;

/** Fraunces 粗体字宽（em）：数字约 0.62，大写约 0.78，连字符换成红星占 0.16。 */
function codeAdvance(text: string) {
  let sum = 0;
  for (const ch of text) {
    if (ch === "-") sum += 0.16;
    else if (/[0-9]/.test(ch)) sum += 0.62;
    else if (/[MW]/i.test(ch)) sum += 1;
    else if (/[IJ1]/i.test(ch)) sum += 0.42;
    else if (/[A-Z]/i.test(ch)) sum += 0.78;
    else if (ch === " ") sum += 0.25;
    else sum += 1;
  }
  return Math.max(sum, 0.5);
}

export function UnveilBrush(props: CoverRenderProps) {
  const cover = useCoverOptional();
  const styles = props.elementStyles;
  const layers = cover?.draft.layers ?? props.layers ?? [];
  const z = (id: string, fallback: number) => (cover ? layerZIndex(layers, id) : fallback);

  const title = elementText(styles, "title", props.title).replace(/\s*\n\s*/g, "");
  const code = elementText(styles, "code", props.subtitle)
    .replace(/\s*\n\s*/g, "")
    .toUpperCase();
  const name = elementText(styles, "name", props.signature);
  const caption = elementText(styles, "caption", props.mark ?? "");
  const record = elementText(styles, "record", ":: ARKNIGHTS RECORD");
  const tag = elementText(styles, "tag", "FOR\nARKNIGHTS TACTIC GROUP");
  const countdown = elementText(styles, "countdown", "...3   ...2   ...1   |   1...   2...   3...");

  const titleSize = styles?.title?.fontSize ?? Math.min(TITLE.size, Math.floor(TITLE.maxW / Math.max([...title].length, 1)));
  const codeSize = styles?.code?.fontSize ?? Math.min(CODE.size, Math.floor(CODE.maxW / (codeAdvance(code) * CODE.squash)));
  const codeParts = code.split("-");

  return (
    <div data-unveil-brush="" className="relative h-full w-full overflow-hidden" style={{ background: T.base }}>
      <CoverElement id="backdrop" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("backdrop", 0) }}>
        <BrushBackdrop tone={T} />
      </CoverElement>
      <CoverElement id="ghost" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("ghost", 1), opacity: 0.18 }}>
        <div
          className="absolute left-0 top-0"
          style={{
            width: ART_BOX,
            height: ART_BOX,
            transform: "translate(-458px, -169px) scale(1.2)",
            transformOrigin: "0 0",
            filter: "grayscale(1) brightness(0.8) blur(2px)",
          }}
        >
          <OperatorLayer {...props} echo objectFit="contain" objectPosition="0% 0%" transformOrigin={ART_ORIGIN} pictureMask={artCutoutMask(props.imageUrl)} className="h-full w-full" />
        </div>
      </CoverElement>
      <CoverElement id="brush" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("brush", 2) }}>
        <BrushStrokes tone={T} />
      </CoverElement>
      <CoverElement id="disc" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("disc", 3) }}>
        <SawDisc tone={T} spec={DISC} />
      </CoverElement>

      <div data-unveil-art="" className="pointer-events-none absolute left-0 top-0" style={{ width: ART_BOX, height: ART_BOX, zIndex: z("operator", 4) }}>
        <OperatorLayer {...props} objectFit="contain" objectPosition="0% 0%" transformOrigin={ART_ORIGIN} pictureMask={artCutoutMask(props.imageUrl)} className="h-full w-full" />
      </div>

      <CoverElement id="card" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("card", 5) }}>
        <NeonCard tone={T} spec={CARD} />
      </CoverElement>
      <CoverElement id="badges" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("badges", 6) }}>
        <CardBadges tone={T} />
      </CoverElement>

      {name.trim() ? (
        <CoverElement
          id="name"
          defaultFont="fraunces"
          defaultFontSize={48}
          className="absolute whitespace-nowrap font-semibold uppercase leading-none"
          style={{
            left: 560,
            top: 172,
            zIndex: z("name", 7),
            color: T.cream,
            transform: "rotate(-4deg)",
            transformOrigin: "0 0",
            letterSpacing: "0.02em",
          }}
        >
          <span
            aria-hidden
            className="absolute"
            style={{
              left: "-0.32em",
              top: "-0.28em",
              right: "-1.6em",
              bottom: "-0.3em",
              background: T.ink,
              border: `0.06em solid ${T.neon}`,
              borderRightColor: "transparent",
              borderBottomColor: "transparent",
            }}
          />
          <span className="relative">{name}</span>
        </CoverElement>
      ) : null}

      {title ? (
        <CoverElement
          id="title"
          defaultFont="serif"
          defaultFontSize={titleSize}
          className="absolute whitespace-nowrap font-black leading-none"
          style={{
            left: TITLE.left,
            top: TITLE.top,
            zIndex: z("title", 8),
            color: T.cream,
            transform: "rotate(-6deg)",
            transformOrigin: "0 100%",
          }}
        >
          <span
            aria-hidden
            className="absolute font-fraunces"
            style={{
              left: "-0.72em",
              top: "0.48em",
              fontSize: "0.9em",
              fontVariationSettings: CODE_VARIATION,
            }}
          >
            “
          </span>
          <span className="relative inline-block" style={GRUNGE}>
            <ExtrudeText text={title} side={T.redDeep} dot="rgba(122, 13, 39, 0.18)" depth={0.06} steps={7} pitch={0.05} />
          </span>
        </CoverElement>
      ) : null}

      {code ? (
        <CoverElement
          id="code"
          defaultFont="fraunces"
          defaultFontSize={codeSize}
          className="absolute whitespace-nowrap font-black leading-none"
          style={{
            left: CODE.left,
            top: CODE.top,
            zIndex: z("code", 9),
            color: T.cream,
            transform: "rotate(-6deg)",
            transformOrigin: "0 100%",
          }}
        >
          <span
            className="relative inline-block"
            style={{
              transform: `scaleX(${CODE.squash})`,
              transformOrigin: "left top",
              fontVariationSettings: CODE_VARIATION,
              letterSpacing: "-0.035em",
            }}
          >
            <span className="relative inline-block" style={GRUNGE}>
              {codeParts.map((part, i) => (
                <span key={i} className="relative inline-block">
                  {i > 0 ? (
                    <span data-code-star="" aria-hidden className="relative inline-block align-top" style={{ width: "0.16em", height: "1em" }}>
                      <svg
                        className="absolute overflow-visible"
                        style={{
                          left: "-0.12em",
                          top: "0.38em",
                          width: "0.4em",
                          height: "0.4em",
                        }}
                        viewBox="-50 -50 100 100"
                      >
                        <polygon points="0,-50 11,-20 45,-30 20,-6 42,24 10,16 0,48 -10,16 -42,24 -20,-6 -45,-30 -11,-20" fill={T.red} />
                      </svg>
                    </span>
                  ) : null}
                  <ExtrudeText text={part} side={T.redDeep} dot="rgba(122, 13, 39, 0.14)" depth={0.06} steps={9} pitch={0.028} />
                </span>
              ))}
            </span>
            <span
              data-code-quote=""
              aria-hidden
              className="absolute font-fraunces"
              style={{
                left: "100%",
                top: "1.7em",
                marginLeft: "0.95em",
                fontSize: "0.3em",
                transform: `scaleX(${1 / CODE.squash})`,
                transformOrigin: "left top",
                color: T.cream,
              }}
            >
              ”
            </span>
          </span>
        </CoverElement>
      ) : null}

      {caption.trim() ? (
        <CoverElement
          id="caption"
          defaultFont="fraunces"
          defaultFontSize={26}
          className="absolute whitespace-pre text-right font-medium uppercase leading-[1.05]"
          style={{
            right: 1920 - 866,
            top: 758,
            zIndex: z("caption", 10),
            color: T.cream,
            transform: "rotate(-6deg)",
            transformOrigin: "100% 0",
            letterSpacing: "0.03em",
          }}
        >
          {caption}
        </CoverElement>
      ) : null}

      {record.trim() ? (
        <CoverElement
          id="record"
          defaultFont="outfit"
          defaultFontSize={11}
          className="absolute whitespace-nowrap font-bold leading-none"
          style={{
            left: 650,
            top: 792,
            zIndex: z("record", 11),
            color: T.paper,
            transform: "rotate(-6deg)",
            letterSpacing: "0.08em",
          }}
        >
          {record}
        </CoverElement>
      ) : null}

      {tag.trim() ? (
        <CoverElement
          id="tag"
          defaultFont="fraunces"
          defaultFontSize={16}
          className="absolute whitespace-pre text-right font-medium uppercase leading-[1.15]"
          style={{
            left: 716,
            top: 866,
            zIndex: z("tag", 12),
            color: T.paper,
            background: T.ink,
            padding: "0.5em 0.9em 0.55em 2.2em",
            transform: "rotate(-12deg)",
            transformOrigin: "0 0",
            letterSpacing: "0.04em",
            boxShadow: `-0.35em 0.35em 0 ${T.neon}`,
          }}
        >
          {tag}
        </CoverElement>
      ) : null}

      {countdown.trim() ? (
        <CoverElement
          id="countdown"
          defaultFont="outfit"
          defaultFontSize={20}
          className="absolute whitespace-pre font-semibold leading-none"
          style={{
            left: 770,
            top: 1022,
            zIndex: z("countdown", 13),
            color: T.muted,
            letterSpacing: "0.06em",
          }}
        >
          {countdown}
        </CoverElement>
      ) : null}
    </div>
  );
}
