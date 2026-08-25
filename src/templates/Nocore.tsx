import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import type { CoverRenderProps } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";

const GOLD = "#f4d06f";
const IVORY = "#fff6ea";
const LAVENDER = "#b8a6ff";
const SIGN = "#4076ea";

function rowSize(len: number) {
  if (len <= 6) return 164;
  if (len <= 10) return 158;
  if (len <= 14) return 126;
  return 102;
}

function splitStage(raw: string): { code: string; mode: string } {
  const t = raw.trim() || "关卡";
  const m = t.match(/^([A-Za-z0-9][A-Za-z0-9\-.]*)\s+(.+)$/);
  if (m) return { code: m[1], mode: m[2] };
  return { code: t, mode: "" };
}

function splitLimit(raw: string): { lead: string; tail: string } {
  const t = raw.trim() || "无核";
  const i = t.indexOf(" ");
  if (i > 0) return { lead: t.slice(0, i), tail: t.slice(i + 1).trim() };
  for (const suffix of ["首杀", "突袭"]) {
    if (t.endsWith(suffix) && t.length > suffix.length) {
      return { lead: t.slice(0, -suffix.length), tail: suffix };
    }
  }
  return { lead: t, tail: "" };
}

function GoldWord({ text }: { text: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span aria-hidden className="pointer-events-none absolute top-[0.04em] left-[0.03em] text-black">
        {text}
      </span>
      <span className="relative" style={{ color: GOLD }}>
        {text}
      </span>
    </span>
  );
}

function StrokeWord({ text }: { text: string }) {
  return (
    <span className="nc-ivory inline-block whitespace-nowrap font-serif" style={{ color: IVORY }}>
      {text}
    </span>
  );
}

function SignMark() {
  return (
    <span className="nc-sign-mark" aria-hidden>
      <i />
      <i />
      <i />
    </span>
  );
}

export function Nocore(props: CoverRenderProps) {
  const styles = props.elementStyles;
  const stageRaw = elementText(styles, "stage", props.title);
  const limitRaw = elementText(styles, "limit", props.subtitle);
  const { code, mode } = splitStage(stageRaw);
  const { lead, tail } = splitLimit(limitRaw);
  const sign = elementText(styles, "sign", props.signature.trim());
  const bg = getBgPreset(props.bgPreset);
  const stageLen = (code + mode).length;
  const limitLen = (lead + tail).length;
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0c0c0e]">
      {bg.url ? (
        <img
          src={bg.url}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "62% 42%" }}
        />
      ) : null}
      <BgDimLayer on={props.bgDim} amount={props.bgDimAmount ?? 42} at="28% 48%" />
      <div className="nc-night pointer-events-none absolute inset-0" />

      <CoverElement id="line" kind="box" className="absolute top-[538px] left-0 z-[2] h-[4px] w-[64%]">
        <div className="absolute inset-0" style={{ background: LAVENDER }} />
      </CoverElement>

      <CoverElement
        id="stage"
        defaultFontSize={rowSize(stageLen)}
        className="absolute top-[255px] left-[58px] z-[3] font-black tracking-[-0.04em] whitespace-nowrap text-white"
        style={{ lineHeight: 1 }}
      >
        <span className="inline-flex items-baseline gap-[0.28em]">
          <GoldWord text={code} />
          {mode ? <StrokeWord text={mode} /> : null}
        </span>
      </CoverElement>

      <CoverElement
        id="limit"
        defaultFontSize={rowSize(limitLen)}
        className="absolute top-[643px] left-[88px] z-[3] font-black tracking-[-0.04em] whitespace-nowrap text-white"
        style={{ lineHeight: 1 }}
      >
        <span className="inline-flex items-baseline gap-[0.32em]">
          <StrokeWord text={lead} />
          {tail ? <GoldWord text={tail} /> : null}
        </span>
      </CoverElement>

      {sign ? (
        <CoverElement
          id="sign"
          defaultFontSize={36}
          className="absolute top-[888px] left-[80px] z-[3] font-bold tracking-[0.42em] whitespace-nowrap"
          style={{ color: SIGN }}
        >
          <span className="inline-flex items-center gap-5">
            <SignMark />
            {sign}
            <SignMark />
          </span>
        </CoverElement>
      ) : null}

      <div className="absolute inset-y-0 right-[-2%] w-[40%]">
        <OperatorLayer
          {...props}
          objectFit="contain"
          className="h-full w-full object-contain object-right-bottom"
        />
      </div>
    </div>
  );
}
