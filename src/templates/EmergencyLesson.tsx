import { useId } from "react";
import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { useCdnSrc } from "../lib/cdn";
import { bgGradeFilter } from "../lib/effects";
import type { CoverRenderProps } from "../types";
import { OperatorLayer } from "./OperatorLayer";

function titleSize(length: number) {
  if (length <= 5) return 270;
  if (length <= 7) return 248;
  return Math.floor(1500 / Math.max(length, 1));
}

function conditionSize(length: number) {
  if (length <= 2) return 210;
  return Math.floor(420 / Math.max(length, 1));
}

// Deterministic vector textures stay editable and survive html-to-image export.
function Shards() {
  const texture = useId().replace(/:/g, "");
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" fill="none" aria-hidden>
      <defs>
        <filter id={texture} x="-15%" y="-30%" width="130%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency=".025 .12" numOctaves="2" seed="8" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" />
        </filter>
      </defs>
      <g stroke="#b0459c" opacity=".24">
        {Array.from({ length: 17 }, (_, i) => (
          <path key={i} d={`M${1880 + i * 12} -100 C${1540 + i * 16} 180 ${2220 + i * 4} 510 ${1070 + i * 23} 1180`} strokeWidth={i % 4 === 0 ? 6 : 2} />
        ))}
      </g>
      <g filter={`url(#${texture})`}>
        {[[1420,260,1700,60],[1590,316,1880,185],[1500,394,1900,378],[1710,626,1890,733],[90,838,324,805],[145,1020,234,930],[675,96,720,118],[1060,12,1100,68]].map(([x,y,x2,y2], i) => (
          <g key={i}>
            <path d={`M${x} ${y} L${x2} ${y2}`} stroke="#bd1b99" strokeWidth="11" opacity=".28" />
            <path d={`M${x} ${y} L${x2} ${y2}`} stroke="#f272df" strokeWidth="4" opacity=".86" strokeDasharray={i % 2 ? "48 18 9 26" : "94 10 12 20"} />
          </g>
        ))}
      </g>
      <path d="M12 245 L112 784 L60 862 Z M1770 842 L1904 562 L1870 838 Z M1560 18 L1490 132 L1530 105 Z" fill="#0d0612" opacity=".8" />
    </svg>
  );
}

function BrushAtmosphere() {
  const texture = useId().replace(/:/g, "");
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" fill="none" aria-hidden>
      <defs>
        <filter id={texture} x="-20%" y="-30%" width="140%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency=".008 .045" numOctaves="3" seed="12" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="95" />
        </filter>
      </defs>
      <g filter={`url(#${texture})`}>
        <path d="M-90 520 Q360 180 690 402 T1540 404 L1970 280" stroke="#190b20" strokeWidth="180" opacity=".32" />
        <path d="M-80 795 Q280 588 590 690 T1180 708 T1970 570" stroke="#521044" strokeWidth="100" opacity=".5" />
        <path d="M-80 867 Q320 645 630 775 T1250 826 T1990 680" stroke="#b01780" strokeWidth="25" opacity=".42" />
        <path d="M10 932 Q360 682 704 916 T1530 798 L1960 940" stroke="#127184" strokeWidth="35" opacity=".25" />
        <path d="M-50 1000 Q470 720 800 960 T1700 832" stroke="#e82a94" strokeWidth="12" opacity=".4" />
      </g>
      <path d="M0 0 L80 440 L198 1080 H0 Z M1920 96 L1840 400 L1790 1080 H1920 Z" fill="#120b1a" opacity=".48" />
    </svg>
  );
}

function GlitchHaze() {
  const smoke = useId().replace(/:/g, "");
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" fill="none" aria-hidden>
      <defs>
        <filter id={smoke} x="-20%" y="-70%" width="140%" height="240%">
          <feTurbulence type="fractalNoise" baseFrequency=".012 .024" numOctaves="3" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="100" />
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g filter={`url(#${smoke})`}>
        <path d="M170 924 Q510 782 810 923 T1640 866" stroke="#c41c75" strokeWidth="28" opacity=".38" />
        <path d="M240 954 Q600 854 920 948 T1630 890" stroke="#138f9c" strokeWidth="20" opacity=".3" />
        <path d="M280 858 Q580 937 930 839 T1700 924" stroke="#e342a8" strokeWidth="14" opacity=".38" />
      </g>
    </svg>
  );
}

function ChromaticTitle({ text }: { text: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap leading-none"
      style={{ transform: "scaleX(0.96)", transformOrigin: "left center", fontFamily: '"Noto Serif SC", serif', fontWeight: 900 }}>
      <span aria-hidden className="pointer-events-none absolute left-[-0.026em] top-[0.028em] text-[#2a9caa] opacity-70"
        style={{ maskImage: "linear-gradient(180deg, transparent 35%, #000 76%)" }}>{text}</span>
      <span aria-hidden className="pointer-events-none absolute left-[0.025em] top-[0.035em] text-[#d32980] opacity-80"
        style={{ maskImage: "linear-gradient(180deg, transparent 30%, #000 82%)" }}>{text}</span>
      <span aria-hidden className="pointer-events-none absolute left-[-0.06em] top-[0.05em] text-[#157f91] opacity-55"
        style={{ clipPath: "polygon(0 72%, 18% 82%, 34% 67%, 53% 85%, 72% 70%, 100% 86%, 100% 100%, 0 100%)", filter: "blur(2px)" }}>{text}</span>
      <span aria-hidden className="pointer-events-none absolute left-[0.055em] top-[0.07em] text-[#b92566] opacity-65"
        style={{ clipPath: "polygon(0 80%, 24% 70%, 42% 86%, 67% 74%, 100% 84%, 100% 100%, 0 100%)", filter: "blur(3px)" }}>{text}</span>
      <span aria-hidden className="pointer-events-none absolute inset-0 text-[#180916]" style={{ filter: "blur(9px)", opacity: .65 }}>{text}</span>
      <span className="relative" data-title-face="" style={{
        background: "radial-gradient(ellipse at 14% 94%, #be2867 0%, transparent 22%), radial-gradient(ellipse at 49% 102%, #256c80 0%, transparent 27%), radial-gradient(ellipse at 82% 98%, #d53c82 0%, transparent 22%), linear-gradient(180deg, #fffefd 0%, #fffefd 65%, #fff7f8 79%, #d688ab 100%)",
        backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent",
      }}>{text}</span>
    </span>
  );
}

function PinkCondition({ text }: { text: string }) {
  return (
    <span
      className="relative inline-block whitespace-nowrap leading-none"
      style={{
        transform: "scaleX(1.04)",
        transformOrigin: "left center",
        fontFamily: '"Songti SC", "STSong", "Noto Serif SC", serif',
        fontWeight: 400,
      }}
    >
      <span aria-hidden className="pointer-events-none absolute top-[0.045em] left-[0.04em] text-[#581b34] opacity-72">
        {text}
      </span>
      <span
        className="relative text-[#ed91cc]"
        style={{
          WebkitTextStroke: "0.006em rgba(255,225,245,0.58)",
          paintOrder: "stroke fill",
          textShadow: "0 8px 14px rgba(24,0,20,0.75)",
        }}
      >
        {text}
      </span>
    </span>
  );
}

export function EmergencyLesson(props: CoverRenderProps) {
  const title = elementText(props.elementStyles, "title", props.title.trim() || "带船紧急授课");
  const condition = elementText(props.elementStyles, "condition", props.subtitle.trim() || "无藏");
  const count = elementText(props.elementStyles, "count", String(props.episode || 5));
  const unit = elementText(props.elementStyles, "unit", props.signature.trim() || "人");
  const seriesMark = elementText(props.elementStyles, "series-mark", "ROGUELIKE");
  const bg = getBgPreset(props.bgPreset);
  const remote = useCdnSrc(bg.url ?? "");

  return (
    <div data-emergency-lesson-canvas="" className="relative h-full w-full overflow-hidden bg-[#17070e]">
      {bg.url ? (
        <img
          data-cover-bg=""
          src={remote.src}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.12] object-cover"
          style={{
            objectPosition: "48% 42%",
            filter: `${bgGradeFilter(props.effects?.bgGrade) ?? ""} blur(2px)`,
          }}
          onLoad={remote.onLoad}
          onError={remote.onError}
        />
      ) : null}

      <CoverElement id="atmosphere" kind="box" className="pointer-events-none absolute inset-0 z-[1]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 38% 64% at 51% 22%, rgba(245,221,235,0.12) 0%, rgba(113,38,73,0.12) 31%, transparent 68%), radial-gradient(ellipse 48% 58% at 20% 42%, rgba(100,46,95,0.22) 0%, transparent 72%), radial-gradient(ellipse 72% 70% at 50% 72%, rgba(91,16,103,0.28) 0%, transparent 68%), linear-gradient(90deg, rgba(22,6,31,0.7) 0%, rgba(54,22,58,0.16) 34%, rgba(51,8,25,0.3) 68%, rgba(10,3,8,0.82) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_34%,rgba(5,2,8,0.72)_100%)]" />
        <BrushAtmosphere />
      </CoverElement>

      <CoverElement id="shards" kind="box" className="pointer-events-none absolute inset-0 z-[4]">
        <Shards />
      </CoverElement>

      <CoverElement
        id="series-mark"
        defaultFont="display"
        defaultFontSize={25}
        className="absolute top-[152px] left-[322px] z-[4] leading-none text-[#efe8e9]"
      >
        <span className="flex items-end gap-3">
          <span className="mb-2 block h-[54px] w-[5px] bg-[#b52377] shadow-[9px_0_0_rgba(25,156,178,0.55)]" />
          <span>
            <small className="block text-[20px] tracking-[0.36em] text-[#dccfd4]/80">{seriesMark}</small>
            <strong className="mt-2 block font-serif text-[52px] tracking-[-0.05em] text-[#f1e9eb]">紧急授课</strong>
          </span>
        </span>
      </CoverElement>

      <div
        data-operator-slot=""
        className="pointer-events-none absolute top-[-110px] left-[150px] z-[3] h-[1190px] w-[1480px]"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 38% 66% at 51% 42%, #000 0%, #000 42%, rgba(0,0,0,0.92) 58%, rgba(0,0,0,0.3) 82%, transparent 100%), radial-gradient(ellipse 27% 17% at 27% 38%, #000 0%, #000 25%, transparent 80%), radial-gradient(ellipse 29% 20% at 72% 38%, #000 0%, #000 24%, transparent 82%)",
          maskImage:
            "radial-gradient(ellipse 38% 66% at 51% 42%, #000 0%, #000 42%, rgba(0,0,0,0.92) 58%, rgba(0,0,0,0.3) 82%, transparent 100%), radial-gradient(ellipse 27% 17% at 27% 38%, #000 0%, #000 25%, transparent 80%), radial-gradient(ellipse 29% 20% at 72% 38%, #000 0%, #000 24%, transparent 82%)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      >
        <OperatorLayer
          {...props}
          objectFit="contain"
          objectPosition="center top"
          transformOrigin="center 20%"
          className="h-full w-full"
          artGrade={{ enabled: true, contrast: 14, saturate: 8, brightness: 0, fringe: 0 }}
        />
      </div>

      <CoverElement id="art-veil" kind="box" className="pointer-events-none absolute inset-0 z-[3]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(26,9,30,0.10) 0%, rgba(41,6,39,0.06) 42%, rgba(36,6,40,0.22) 74%, rgba(19,3,26,0.24) 100%), radial-gradient(ellipse 48% 70% at 50% 30%, transparent 0%, transparent 42%, rgba(29,5,35,0.22) 72%, rgba(10,2,17,0.62) 100%)",
          }}
        />
      </CoverElement>

      <CoverElement
        id="count"
        defaultFont="serif"
        defaultFontSize={450}
        className="absolute top-[170px] left-[1190px] z-[4] font-normal leading-none"
      >
        <span
          className="text-[#fffdfb]"
          style={{
            WebkitTextStroke: "0.01em rgba(255,232,251,0.9)",
            paintOrder: "stroke fill",
            textShadow: "7px 10px 0 rgba(156,31,113,0.58), 0 16px 28px rgba(0,0,0,0.7)",
            fontFamily: '"Times New Roman", "Noto Serif SC", serif',
            fontWeight: 400,
            display: "inline-block",
            transform: "scaleX(1.08)",
            transformOrigin: "left center",
          }}
        >
          {count}
        </span>
      </CoverElement>

      <CoverElement
        id="condition"
        defaultFont="serif"
        defaultFontSize={conditionSize(condition.length)}
        className="absolute top-[470px] left-[780px] z-[5] font-bold leading-none tracking-[-0.08em]"
      >
        <PinkCondition text={condition} />
      </CoverElement>

      <CoverElement
        id="unit"
        defaultFont="serif"
        defaultFontSize={220}
        className="absolute top-[464px] left-[1355px] z-[5] font-normal leading-none text-[#fffdfb]"
        style={{
          textShadow: "5px 8px 0 rgba(156,31,113,0.58), 0 14px 22px rgba(0,0,0,0.7)",
          fontFamily: '"Songti SC", "STSong", "Noto Serif SC", serif',
          fontWeight: 400,
        }}
      >
        {unit}
      </CoverElement>

      <CoverElement id="glitch-debris" kind="box" className="pointer-events-none absolute inset-0 z-[5]">
        <GlitchHaze />
      </CoverElement>

      <CoverElement
        id="title"
        defaultFont="serif"
        defaultFontSize={titleSize(title.length)}
        className="absolute top-[688px] left-[256px] z-[6] font-black leading-none tracking-[-0.015em]"
      >
        <ChromaticTitle text={title} />
      </CoverElement>

      <CoverElement id="bottom-vignette" kind="box" className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[230px]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(35,5,17,0.16)_38%,rgba(11,2,7,0.30)_100%)]" />
      </CoverElement>
    </div>
  );
}
