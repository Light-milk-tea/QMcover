import { CoverElement, useElementEdit } from "../components/CoverElement";
import { BILI_COVER } from "../constants";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { useCdnSrc } from "../lib/cdn";
import type { CoverRenderProps } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";

const IVORY = "#f3efe6";
const BG_POS = "42% 40%";

function themeSize(len: number) {
  if (len <= 2) return 268;
  if (len <= 3) return 248;
  if (len <= 4) return 228;
  if (len <= 6) return 168;
  return 128;
}

function tagSize(len: number) {
  if (len <= 2) return 160;
  if (len <= 4) return 130;
  if (len <= 6) return 96;
  return 72;
}

function HollowMark({ text }: { text: string }) {
  return (
    <span className="rg-hollow relative inline-block whitespace-nowrap font-black tracking-[0.12em]">
      <span
        aria-hidden
        className="pointer-events-none absolute top-[0.03em] left-[0.03em] text-transparent"
        style={{ WebkitTextStroke: "0.02em rgba(243,239,230,0.28)" }}
      >
        {text}
      </span>
      <span className="relative text-transparent" style={{ WebkitTextStroke: "0.018em rgba(243,239,230,0.78)" }}>
        {text}
      </span>
    </span>
  );
}

function GlassWord({
  id,
  text,
  left,
  top,
  url,
  className = "",
}: {
  id: string;
  text: string;
  left: number;
  top: number;
  url: string | null;
  className?: string;
}) {
  const edit = useElementEdit();
  const x = edit?.styles[id]?.x ?? 0;
  const y = edit?.styles[id]?.y ?? 0;
  if (!url) {
    return <span className={`inline-block whitespace-nowrap text-[#f3efe6] ${className}`}>{text}</span>;
  }
  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 text-transparent"
        style={{ WebkitTextStroke: "0.03em rgba(10,8,6,0.45)" }}
      >
        {text}
      </span>
      <span
        className="rg-glass relative"
        style={{
          backgroundImage: `url("${url}")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${BILI_COVER.width}px ${BILI_COVER.height}px`,
          backgroundPosition: `${-(left + x)}px ${-(top + y)}px`,
        }}
      >
        {text}
      </span>
    </span>
  );
}

function SideEmblem() {
  return (
    <svg width="22" height="118" viewBox="0 0 22 118" fill="none" aria-hidden>
      <path d="M4 6 H18" stroke={IVORY} strokeWidth="2.2" />
      <path d="M11 6 V112" stroke={IVORY} strokeWidth="2.2" />
      <path d="M4 112 H18" stroke={IVORY} strokeWidth="2.2" />
    </svg>
  );
}

export function Rogue(props: CoverRenderProps) {
  const styles = props.elementStyles;
  const theme = elementText(styles, "theme", props.title.trim() || "主题");
  const cond = elementText(styles, "cond", props.subtitle.trim());
  const redTag = elementText(styles, "red-tag", props.signature.trim());
  const node = elementText(styles, "node", `N${props.episode || 15}`);
  const watermark = elementText(styles, "watermark", "ISW-NO");
  const watermarkFlip = elementText(styles, "watermark-flip", "ISW-NO");
  const canvasBg = getBgPreset(props.bgPreset);
  const fillBg = getBgPreset(props.textBgPreset || props.bgPreset);
  const canvasRemote = useCdnSrc(canvasBg.url ?? "");
  const fillRemote = useCdnSrc(fillBg.url ?? "");
  const canvasUrl = canvasRemote.src || null;
  const glassUrl = fillRemote.src || null;
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#16110e]">
      {canvasUrl ? (
        <img
          src={canvasUrl}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: BG_POS }}
          onLoad={canvasRemote.onLoad}
          onError={canvasRemote.onError}
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_28%_30%,#6a6258_0%,#2a221c_42%,#0e0b09_100%)]" />
      )}

      {glassUrl ? (
        <img
          src={glassUrl}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          onLoad={fillRemote.onLoad}
          onError={fillRemote.onError}
        />
      ) : null}

      <BgDimLayer on={props.bgDim} amount={props.bgDimAmount ?? 100} at="72% 48%" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 22% 18%, rgba(255,255,255,0.14) 0%, transparent 38%)",
        }}
      />
      <div className="rg-grain pointer-events-none absolute inset-0 opacity-[0.55]" />
      <div className="rg-dots pointer-events-none absolute right-[86px] bottom-[78px] h-[64px] w-[118px] opacity-80" />

      <CoverElement
        id="watermark"
        defaultFont="serif"
        defaultFontSize={140}
        className="absolute top-[185px] left-[902px] z-[2] leading-none"
      >
        <HollowMark text={watermark} />
      </CoverElement>
      <CoverElement
        id="watermark-flip"
        defaultFont="serif"
        defaultFontSize={140}
        className="absolute top-[809px] left-[899px] z-[2] leading-none"
        style={{ transform: "scaleY(-1)", transformOrigin: "center" }}
      >
        <HollowMark text={watermarkFlip} />
      </CoverElement>

      <div className="absolute inset-y-0 left-[-6%] w-[52%]">
        <OperatorLayer
          {...props}
          fadeRight
          objectFit="contain"
          className="h-full w-full object-contain object-left-bottom"
        />
      </div>

      <CoverElement
        id="theme"
        defaultFont="serif"
        defaultFontSize={themeSize(theme.length)}
        className="absolute top-[334px] left-[809px] z-[4] font-black leading-none"
      >
        <GlassWord id="theme" text={theme} left={809} top={334} url={glassUrl} className="rg-theme" />
      </CoverElement>

      {redTag ? (
        <CoverElement
          id="red-tag"
          defaultFontSize={160}
          className="absolute top-[613px] left-[823px] z-[4] font-black leading-none tracking-tight"
        >
          <GlassWord id="red-tag" text={redTag} left={823} top={613} url={glassUrl} />
        </CoverElement>
      ) : null}

      {cond ? (
        <CoverElement
          id="cond"
          defaultFont="serif"
          defaultFontSize={tagSize(cond.length)}
          className="absolute top-[624px] left-[1204px] z-[4] font-black leading-none tracking-tight"
        >
          <GlassWord id="cond" text={cond} left={1204} top={624} url={glassUrl} />
        </CoverElement>
      ) : null}

      <CoverElement
        id="node"
        defaultFont="display"
        defaultFontSize={32}
        className="absolute top-[838px] left-[744px] z-[4] font-semibold tracking-[0.18em]"
        style={{ color: "rgba(243,239,230,0.34)" }}
      >
        {node}
      </CoverElement>

      <CoverElement id="emblem" kind="box" className="absolute top-[352px] left-[1708px] z-[4]">
        <SideEmblem />
      </CoverElement>
    </div>
  );
}
