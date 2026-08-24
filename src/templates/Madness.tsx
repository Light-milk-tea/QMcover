import { CoverElement } from "../components/CoverElement";
import { findOperatorByName } from "../data/arts";
import { getBgPreset } from "../data/backgrounds";
import type { CoverRenderProps } from "../types";
import { OperatorLayer } from "./OperatorLayer";

const ACCENT = "#e3943a";
const PAPER = "#f3eee4";
const PAPER_BACK = "#e6dfd2";

function seriesSize(len: number) {
  if (len <= 6) return 148;
  if (len <= 8) return 122;
  return 100;
}

function chapterSize(len: number) {
  if (len <= 4) return 58;
  if (len <= 6) return 50;
  return 42;
}

function subSize(len: number) {
  if (len <= 6) return 58;
  if (len <= 10) return 50;
  return 40;
}

function enNameSize(len: number) {
  if (len <= 10) return 30;
  if (len <= 16) return 24;
  return 18;
}

function VignetteBlob({ amount }: { amount: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: amount / 100,
        background:
          "radial-gradient(ellipse at 40% 46%, rgba(12,16,22,0.92) 0%, rgba(12,16,22,0.58) 34%, rgba(12,16,22,0.2) 58%, transparent 74%)",
      }}
    />
  );
}

function FaceWord({ text }: { text: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap leading-none">
      <span aria-hidden className="pointer-events-none absolute top-[0.055em] left-[0.04em] text-black">
        {text}
      </span>
      <span
        className="relative"
        style={{
          WebkitTextStroke: "0.042em #0a1218",
          paintOrder: "stroke fill",
        }}
      >
        {text}
      </span>
    </span>
  );
}

function FiveStarMark() {
  return (
    <svg width="168" height="20" viewBox="0 0 168 20" fill="none" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <polygon
          key={i}
          points="10,1.2 12.2,7.6 19,7.6 13.6,11.6 15.7,18 10,14 4.3,18 6.4,11.6 1,7.6 7.8,7.6"
          transform={`translate(${i * 28} 0)`}
          fill={i === 2 ? ACCENT : "rgba(244,240,232,0.92)"}
        />
      ))}
      <path d="M146 10 H168" stroke="rgba(244,240,232,0.42)" strokeWidth="1.4" />
    </svg>
  );
}

export function Madness(props: CoverRenderProps) {
  const name = props.title.trim() || props.operatorName.trim() || "干员";
  const subtitle = props.subtitle.trim();
  const episode = `第${props.episode || 1}期`;
  const enTag = props.signature.trim() || "FIVE STAR MADNESS";
  const nameEn = findOperatorByName(name)?.nameEn || findOperatorByName(props.operatorName)?.nameEn || "";
  const bg = getBgPreset(props.bgPreset);
  const series = "决战五星之癫";

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0c1016]">
      {bg.url ? (
        <img
          src={bg.url}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_40%,#3a424c_0%,#14181e_46%,#0c1016_100%)]" />
      )}

      {props.bgDim !== false ? (
        <CoverElement
          id="vignette"
          kind="box"
          defaultX={-123}
          defaultY={-460}
          className="absolute top-[-80px] left-[-140px] z-[5] h-[1240px] w-[1120px]"
        >
          <VignetteBlob amount={props.bgDimAmount ?? 70} />
        </CoverElement>
      ) : null}

      <div className="absolute top-[80px] left-[176px] z-10 w-[980px]">
        <FiveStarMark />
        <div className="h-[200px]" />

        <CoverElement
          id="episode"
          defaultFontSize={36}
          className="flex items-center gap-3 font-bold tracking-[0.12em] text-[#f4f0e8]"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.7), 0 0 18px rgba(0,0,0,0.35)" }}
        >
          <CoverElement
            id="episode-bar"
            kind="box"
            className="h-[32px] w-[7px] shrink-0"
            style={{ color: "#007af5", background: "currentColor" }}
          />
          {episode}
        </CoverElement>

        <div className="mt-6 flex items-baseline gap-1">
          <CoverElement
            id="series"
            defaultFont="serif"
            defaultFontSize={seriesSize(series.length)}
            defaultX={-17}
            defaultY={-13}
            className="font-black tracking-[-0.03em]"
            style={{
              lineHeight: 1,
              color: "#32b4f5",
              textShadow: "0 10px 22px rgba(0,0,0,0.45)",
            }}
          >
            <FaceWord text="决战五星" />
          </CoverElement>
          <CoverElement
            id="series-accent"
            defaultFont="cn"
            defaultFontSize={seriesSize(series.length)}
            className="pb-1 font-black tracking-[-0.06em]"
            style={{
              lineHeight: 1,
              color: "#00bcf5",
              transform: "skewX(-8deg)",
              textShadow: "0 8px 20px rgba(0,0,0,0.4)",
            }}
          >
            之癫
          </CoverElement>
        </div>

        <div className="mt-7 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <CoverElement
            id="chapter"
            defaultFontSize={chapterSize(name.length + 1)}
            className="font-black tracking-tight text-[#f4f0e8]"
            style={{ lineHeight: 1.05, textShadow: "0 3px 12px rgba(0,0,0,0.55)" }}
          >
            {name}篇
          </CoverElement>
          {subtitle ? (
            <CoverElement
              id="subtitle"
              defaultFontSize={subSize(subtitle.length)}
              className="font-bold tracking-tight"
              style={{ lineHeight: 1.05, color: "#b080e0", textShadow: "0 3px 12px rgba(0,0,0,0.55)" }}
            >
              {subtitle}
            </CoverElement>
          ) : null}
        </div>

        <CoverElement
          id="en-tag"
          defaultFont="display"
          defaultFontSize={26}
          className="mt-8 flex items-center gap-4 font-semibold text-[#f4f0e8]/80"
          style={{ letterSpacing: "0.28em", textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}
        >
          {enTag}
          <span className="tracking-[0.45em] text-[#f4f0e8]/45">····</span>
        </CoverElement>
      </div>

      <div
        className="pointer-events-none absolute top-[18px] right-[148px] z-[2] h-[860px] w-[700px] p-[18px] pb-[60px]"
        style={{
          transform: "rotate(-8.8deg)",
          background: PAPER_BACK,
          boxShadow: "0 16px 36px rgba(0,0,0,0.3)",
        }}
      >
        <div className="relative h-full overflow-hidden bg-[#1a1e24]">
          {bg.url ? (
            <img
              src={bg.url}
              alt=""
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-80"
              style={{ objectPosition: "68% 40%" }}
            />
          ) : null}
          {props.imageUrl ? (
            <img
              src={props.imageUrl}
              alt=""
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-75"
              style={{ objectPosition: "center 70%" }}
            />
          ) : null}
        </div>
      </div>

      <CoverElement
        id="polaroid"
        kind="box"
        className="absolute top-[52px] right-[68px] z-[3] h-[920px] w-[740px] p-[22px] pb-[76px]"
        style={{
          transform: "rotate(3.4deg)",
          background: PAPER,
          boxShadow:
            "0 28px 64px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 0 0 1px rgba(80,60,40,0.08)",
        }}
      >
        <div className="relative h-full overflow-hidden bg-[#161a20]">
          {bg.url ? (
            <img
              src={bg.url}
              alt=""
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              decoding="async"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#3a444e_0%,#161a20_70%)]" />
          )}
          <OperatorLayer
            {...props}
            objectFit="cover"
            className="absolute inset-0 h-full w-full"
          />
        </div>
        {nameEn ? (
          <CoverElement
            id="en-name"
            defaultFont="display"
            defaultFontSize={enNameSize(nameEn.length)}
            className="absolute right-[28px] bottom-[22px] font-medium italic tracking-wide text-[#3a342c]"
            style={{ lineHeight: 1 }}
          >
            {nameEn}
          </CoverElement>
        ) : null}
      </CoverElement>
    </div>
  );
}
