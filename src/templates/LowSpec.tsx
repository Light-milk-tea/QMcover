import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import type { CoverRenderProps } from "../types";
import { OperatorLayer } from "./OperatorLayer";

function opSize(len: number) {
  if (len <= 2) return 82;
  if (len <= 4) return 64;
  return 50;
}

function guideSize(len: number) {
  if (len <= 4) return 132;
  if (len <= 6) return 100;
  return 76;
}

function GoldTitle({ children }: { children: string }) {
  return (
    <span className="relative inline-block font-black leading-none">
      <span className="absolute inset-0 translate-y-[4px] text-[#4a2408] select-none" aria-hidden>
        {children}
      </span>
      <span
        className="relative"
        style={{
          color: "#f3d36a",
          WebkitTextStroke: "0.04em #6e3f0c",
          paintOrder: "stroke fill",
          textShadow: "0 1px 0 #fff4c4, 0 8px 14px rgba(0,0,0,0.4)",
        }}
      >
        {children}
      </span>
    </span>
  );
}

function SignatureMark({ text }: { text: string }) {
  const chars = Array.from(text);
  if (chars.length === 0) return null;
  return (
    <span
      className="inline-flex shrink-0 items-center font-bold italic leading-none"
      style={{
        letterSpacing: "-0.08em",
        transform: "skewX(-14deg)",
        textShadow: "0 6px 0 rgba(20,10,8,0.2)",
      }}
    >
      {chars.map((ch, i) => (
        <span key={`${ch}-${i}`} style={{ color: i % 2 === 1 ? "#e8c000" : "#1e5ef0" }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

export function LowSpec(props: CoverRenderProps) {
  const operation = props.title.trim() || "行动";
  const guide = props.subtitle.trim() || "平民攻略";
  const sign = props.signature.trim();
  const bg = getBgPreset(props.bgPreset);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#12080a]">
      {bg.url ? (
        <img
          src={bg.url}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[72%_center]"
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_42%,#6a2e16_0%,#241018_48%,#10080a_100%)]" />
      )}

      <svg className="pointer-events-none absolute inset-y-0 left-0 h-full w-[40%]" viewBox="0 0 768 1080" aria-hidden>
        <polygon points="0,0 768,0 540,1080 0,1080" fill="#140608" />
        <polygon points="0,0 720,0 480,1080 0,1080" fill="#2a0a0e" />
        <polygon points="30,0 360,70 230,1080 0,1080 0,0" fill="#5c1218" />
        <polygon points="140,0 430,0 280,1080 50,1080" fill="#3a0c12" opacity="0.9" />
        <polygon points="0,0 190,0 130,500 0,620" fill="#8a1c22" />
        <polygon points="200,30 340,10 280,360 140,400" fill="#4a1016" />
        <polygon points="40,600 260,540 200,1080 0,1080" fill="#6a141c" />
        <polygon points="330,180 480,140 400,680 240,720" fill="#1a0608" />
        <line x1="768" y1="0" x2="540" y2="1080" stroke="#c43a3a" strokeWidth="4" opacity="0.4" />
      </svg>

      <div className="absolute inset-y-0 left-[-4%] w-[42%]">
        <OperatorLayer
          {...props}
          objectFit="contain"
          className="h-full w-full object-contain object-left-bottom"
        />
      </div>

      <div className="absolute inset-y-0 right-0 left-[40%] z-10 flex flex-col justify-between py-[78px] pr-[64px] pl-[28px]">
        <div className="relative flex items-end gap-6 pb-2">
          <CoverElement
            id="operation"
            defaultFontSize={opSize(operation.length)}
            className="font-black tracking-tight"
            style={{
              lineHeight: 0.95,
              color: "#f6ecd8",
              WebkitTextStroke: "4px #5a1410",
              paintOrder: "stroke fill",
              textShadow: "0 4px 0 rgba(40,8,8,0.4), 0 8px 16px rgba(0,0,0,0.35)",
            }}
          >
            {operation}
          </CoverElement>
          <div className="relative pb-1">
            <CoverElement id="cc-gold" defaultFontSize={148} className="font-black">
              <GoldTitle>危机合约</GoldTitle>
            </CoverElement>
            <CoverElement
              id="operation-en"
              defaultFont="display"
              defaultFontSize={22}
              className="absolute right-1 bottom-[-6px] font-semibold tracking-[0.34em] text-white"
              style={{ textShadow: "0 2px 0 #1a0c0c, 0 6px 12px rgba(0,0,0,0.55)" }}
            >
              OPERATION
            </CoverElement>
          </div>
        </div>

        <CoverElement
          id="banner"
          kind="box"
          className={`flex h-[248px] items-center gap-7 overflow-hidden rounded-[124px] pr-12 ${
            sign ? "pl-[72px]" : "justify-center px-16"
          }`}
          style={{
            background:
              "repeating-linear-gradient(90deg, rgba(80,50,30,0.05) 0 2px, transparent 2px 5px), repeating-linear-gradient(0deg, rgba(80,50,30,0.04) 0 2px, transparent 2px 4px), linear-gradient(180deg, #f7f1e6 0%, #e9e0d1 100%)",
            boxShadow: "0 8px 0 rgba(50,20,16,0.16), 0 18px 38px rgba(0,0,0,0.3)",
          }}
        >
          <svg
            className="pointer-events-none absolute inset-[16px]"
            viewBox="0 0 200 80"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M16 20 C16 12 22 8 30 8" fill="none" stroke="#b9a48a" strokeWidth="1.5" />
            <path d="M184 20 C184 12 178 8 170 8" fill="none" stroke="#b9a48a" strokeWidth="1.5" />
            <path d="M16 60 C16 68 22 72 30 72" fill="none" stroke="#b9a48a" strokeWidth="1.5" />
            <path d="M184 60 C184 68 178 72 170 72" fill="none" stroke="#b9a48a" strokeWidth="1.5" />
          </svg>
          {sign ? (
            <CoverElement
              id="sign"
              defaultFont="display"
              defaultFontSize={sign.length <= 2 ? 140 : sign.length <= 4 ? 96 : 70}
            >
              <SignatureMark text={sign} />
            </CoverElement>
          ) : null}
          <CoverElement
            id="guide"
            defaultFontSize={guideSize(guide.length)}
            className="min-w-0 flex-1 font-black tracking-[-0.05em] text-[#541410]"
            style={{ lineHeight: 0.9 }}
          >
            {guide}
          </CoverElement>
        </CoverElement>

        <CoverElement
          id="slogan"
          defaultFontSize={86}
          className="flex gap-12 font-black tracking-wide text-white"
          style={{
            lineHeight: 1,
            textShadow: "0 4px 0 #140808, 0 12px 24px rgba(0,0,0,0.55)",
          }}
        >
          <span>操作轻松</span>
          <span>语音详解</span>
        </CoverElement>
      </div>
    </div>
  );
}
