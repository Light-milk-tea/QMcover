import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import type { CoverRenderProps } from "../types";
import { OperatorLayer } from "./OperatorLayer";

function themeSize(len: number) {
  if (len <= 3) return 168;
  if (len <= 4) return 148;
  if (len <= 6) return 112;
  return 86;
}

function tagSize(len: number) {
  if (len <= 4) return 86;
  if (len <= 6) return 68;
  return 54;
}

export function Rogue(props: CoverRenderProps) {
  const theme = props.title.trim() || "主题";
  const cond = props.subtitle.trim();
  const redTag = props.signature.trim();
  const node = `N${props.episode || 15}`;
  const bg = getBgPreset(props.bgPreset);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#161412]">
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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_36%_40%,#3a342c_0%,#1a1714_46%,#0e0c0b_100%)]" />
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.12) 0%, transparent 42%), linear-gradient(90deg, transparent 38%, rgba(16,14,12,0.35) 62%, rgba(12,10,9,0.7) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute right-0 bottom-0 h-[42%] w-[48%] opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 1.2px, transparent 1.6px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="absolute inset-y-0 left-[-8%] w-[58%]">
        <OperatorLayer
          {...props}
          objectFit="contain"
          className="h-full w-full object-contain object-left-bottom"
        />
      </div>

      <div className="pointer-events-none absolute top-[10%] right-[56px] z-10 flex h-[80%] w-[36px] flex-col items-center justify-between">
        <span
          className="font-display text-[18px] font-semibold tracking-[0.4em] text-white/70"
          style={{ writingMode: "vertical-rl" }}
        >
          IS
        </span>
        <span className="h-full w-px bg-white/35" />
        <svg width="28" height="64" viewBox="0 0 28 64" fill="none" aria-hidden>
          <path d="M14 2 L24 22 L14 18 L4 22 Z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" />
          <path d="M14 26 V62" stroke="rgba(255,255,255,0.45)" strokeWidth="1.6" />
        </svg>
      </div>

      <div className="absolute top-[210px] right-[110px] z-10 w-[1020px]">
        <CoverElement
          id="watermark"
          defaultFont="display"
          defaultFontSize={200}
          className="absolute -top-[120px] left-0 font-bold tracking-[0.18em]"
          style={{
            color: "transparent",
            WebkitTextStroke: "2px rgba(255,255,255,0.16)",
            lineHeight: 1,
          }}
        >
          IS
        </CoverElement>

        <CoverElement
          id="theme"
          defaultFontSize={themeSize(theme.length)}
          className="relative font-black tracking-[-0.07em] text-[#f4f0e8]"
          style={{
            lineHeight: 0.92,
            WebkitTextStroke: "3px #1c1612",
            paintOrder: "stroke fill",
            textShadow: "0 8px 20px rgba(0,0,0,0.45)",
          }}
        >
          {theme}
        </CoverElement>

        <div className="mt-5 flex items-end gap-5">
          {redTag ? (
            <CoverElement
              id="red-tag"
              defaultFontSize={72}
              className="font-black tracking-tight text-[#c41c1c]"
              style={{
                lineHeight: 0.9,
                textShadow: "0 3px 0 #1a0a0a, 0 8px 16px rgba(0,0,0,0.4)",
              }}
            >
              {redTag}
            </CoverElement>
          ) : null}
          {cond ? (
            <CoverElement
              id="cond"
              defaultFontSize={tagSize(cond.length)}
              className="font-black tracking-tight text-[#f4f0e8]"
              style={{
                lineHeight: 0.9,
                WebkitTextStroke: "2px #1c1612",
                paintOrder: "stroke fill",
                textShadow: "0 6px 16px rgba(0,0,0,0.4)",
              }}
            >
              {cond}
            </CoverElement>
          ) : null}
        </div>

        <CoverElement
          id="node"
          defaultFont="display"
          defaultFontSize={58}
          className="mt-6 font-semibold tracking-[0.22em]"
          style={{
            color: "transparent",
            WebkitTextStroke: "2px rgba(255,255,255,0.72)",
            lineHeight: 1,
          }}
        >
          {node}
        </CoverElement>
      </div>
    </div>
  );
}
