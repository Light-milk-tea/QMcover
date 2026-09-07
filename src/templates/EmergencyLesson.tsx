import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { useCdnSrc } from "../lib/cdn";
import { bgGradeFilter } from "../lib/effects";
import type { CoverRenderProps } from "../types";
import { OperatorLayer } from "./OperatorLayer";

function titleSize(length: number) {
  if (length <= 5) return 270;
  if (length <= 7) return 260;
  if (length <= 9) return 206;
  return 166;
}

function conditionSize(length: number) {
  if (length <= 2) return 200;
  if (length <= 4) return 158;
  return 116;
}

function Shards() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" fill="none" aria-hidden>
      <g stroke="#f03ce2" strokeLinecap="round">
        <path d="M64 544 L358 404" strokeWidth="4" opacity=".18" />
        <path d="M1302 284 L1698 106" strokeWidth="5" opacity=".42" />
        <path d="M1522 380 L1870 224" strokeWidth="3" opacity=".28" />
        <path d="M1360 650 L1822 544" strokeWidth="4" opacity=".22" />
        <path d="M142 1010 L476 824" strokeWidth="4" opacity=".2" />
      </g>
      <g stroke="#9654aa" opacity=".25">
        <path d="M1500 0 Q1320 310 1700 660" strokeWidth="3" />
        <path d="M1560 0 Q1384 322 1794 720" strokeWidth="2" />
        <path d="M0 782 Q320 642 496 1080" strokeWidth="3" />
      </g>
      <g strokeLinecap="round">
        <path d="M1378 204 L1718 86" stroke="#ff50e9" strokeWidth="5" opacity=".54" />
        <path d="M1510 280 L1890 154" stroke="#f6dff5" strokeWidth="2" opacity=".38" />
        <path d="M1492 493 L1848 430" stroke="#ff3fdf" strokeWidth="4" opacity=".38" />
        <path d="M109 979 L404 858" stroke="#f222c8" strokeWidth="3" opacity=".34" />
        <path d="M1170 930 L1544 1018" stroke="#19a9bb" strokeWidth="5" opacity=".24" />
      </g>
    </svg>
  );
}

function BrushAtmosphere() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" fill="none" aria-hidden>
      <path d="M-80 930 L286 214 L432 114 L312 584 L570 1080 H-80 Z" fill="#170d1b" opacity=".68" />
      <path d="M1920 82 L1650 286 L1736 508 L1510 684 L1850 1080 H1920 Z" fill="#110714" opacity=".78" />
      <path d="M0 774 C302 666 468 744 642 840 C820 936 1038 880 1244 788 C1450 696 1702 730 1920 826 V1080 H0 Z" fill="#170916" opacity=".44" />
      <path d="M-40 730 C210 600 374 626 566 730 C726 816 864 788 1014 706" stroke="#762447" strokeWidth="118" opacity=".18" />
      <path d="M1250 746 C1480 596 1690 630 1970 520" stroke="#69204c" strokeWidth="132" opacity=".16" />
      <path d="M40 948 C384 772 660 982 970 848 C1260 724 1520 898 1900 704" stroke="#8c1f68" strokeWidth="42" opacity=".2" />
      <path d="M-40 1008 C356 852 650 1036 944 920 C1270 792 1510 982 1960 802" stroke="#db2d9f" strokeWidth="10" opacity=".22" />
      <g stroke="#d553bb" opacity=".18">
        <path d="M1508 132 C1370 326 1404 564 1742 708" strokeWidth="8" />
        <path d="M1580 96 C1452 350 1512 580 1844 684" strokeWidth="3" />
        <path d="M1644 78 C1540 318 1602 506 1910 584" strokeWidth="2" />
      </g>
    </svg>
  );
}

function GlitchHaze() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" fill="none" aria-hidden>
      <defs>
        <filter id="emergency-smoke" x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="34" />
        </filter>
      </defs>
      <g filter="url(#emergency-smoke)">
        <ellipse cx="238" cy="884" rx="270" ry="92" fill="#d51f7e" opacity=".2" />
        <ellipse cx="1010" cy="956" rx="330" ry="72" fill="#0c96a8" opacity=".14" />
        <ellipse cx="1582" cy="862" rx="300" ry="82" fill="#c4248c" opacity=".17" />
      </g>
      <g strokeLinecap="square">
        <path d="M122 846 H426" stroke="#fa4ab1" strokeWidth="5" opacity=".38" />
        <path d="M570 990 H890" stroke="#1cb2be" strokeWidth="6" opacity=".34" />
        <path d="M1180 890 H1450" stroke="#e640a6" strokeWidth="4" opacity=".36" />
        <path d="M1450 1018 H1812" stroke="#1ca0b2" strokeWidth="5" opacity=".28" />
      </g>
    </svg>
  );
}

function ChromaticTitle({ text }: { text: string }) {
  return (
    <span
      className="relative inline-block whitespace-nowrap leading-none"
      style={{
        transform: "scaleX(0.96)",
        transformOrigin: "left center",
        fontFamily: '"Songti SC", "STSong", "Noto Serif SC", serif',
        fontWeight: 900,
      }}
    >
      <span aria-hidden className="pointer-events-none absolute top-[0.075em] left-[-0.055em] text-[#247f91] opacity-75">
        {text}
      </span>
      <span aria-hidden className="pointer-events-none absolute top-[0.13em] left-[0.055em] text-[#c52669] opacity-82">
        {text}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute left-[-0.07em] top-[0.055em] text-[#247f91] opacity-82"
        style={{ clipPath: "inset(47% 0 38% 0)" }}
      >
        {text}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute left-[0.08em] top-[0.11em] text-[#c52669] opacity-84"
        style={{ clipPath: "inset(65% 0 18% 0)" }}
      >
        {text}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute left-[-0.03em] top-[-0.025em] text-[#542039] opacity-68"
        style={{ clipPath: "inset(22% 0 68% 0)" }}
      >
        {text}
      </span>
      <span
        className="relative text-[#fffdfb]"
        style={{
          WebkitTextStroke: "0.018em rgba(255,255,255,0.75)",
          paintOrder: "stroke fill",
          textShadow: "0 14px 24px rgba(0,0,0,0.72)",
        }}
      >
        {text}
      </span>
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
        fontWeight: 700,
      }}
    >
      <span aria-hidden className="pointer-events-none absolute top-[0.045em] left-[0.04em] text-[#581b34] opacity-72">
        {text}
      </span>
      <span
        className="relative text-[#dc8aad]"
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
              "radial-gradient(ellipse 38% 64% at 51% 22%, rgba(255,224,217,0.34) 0%, rgba(161,58,73,0.2) 31%, transparent 68%), radial-gradient(ellipse 48% 58% at 20% 42%, rgba(148,60,41,0.28) 0%, transparent 72%), radial-gradient(ellipse 72% 70% at 50% 72%, rgba(135,16,57,0.3) 0%, transparent 68%), linear-gradient(90deg, rgba(31,7,13,0.7) 0%, rgba(79,26,30,0.24) 34%, rgba(51,8,25,0.3) 68%, rgba(10,3,8,0.82) 100%)",
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
            "radial-gradient(ellipse 38% 66% at 51% 42%, #000 0%, #000 42%, rgba(0,0,0,0.92) 58%, transparent 82%), radial-gradient(ellipse 27% 17% at 27% 38%, #000 0%, #000 25%, transparent 80%), radial-gradient(ellipse 29% 20% at 72% 38%, #000 0%, #000 24%, transparent 82%)",
          maskImage:
            "radial-gradient(ellipse 38% 66% at 51% 42%, #000 0%, #000 42%, rgba(0,0,0,0.92) 58%, transparent 82%), radial-gradient(ellipse 27% 17% at 27% 38%, #000 0%, #000 25%, transparent 80%), radial-gradient(ellipse 29% 20% at 72% 38%, #000 0%, #000 24%, transparent 82%)",
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
        />
      </div>

      <CoverElement id="art-veil" kind="box" className="pointer-events-none absolute inset-0 z-[3]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(91,18,38,0.12) 0%, rgba(53,6,25,0.18) 58%, rgba(58,6,22,0.25) 100%), radial-gradient(ellipse 38% 62% at 50% 34%, transparent 0%, transparent 38%, rgba(29,5,15,0.32) 68%, rgba(10,2,7,0.68) 100%)",
          }}
        />
      </CoverElement>

      <CoverElement
        id="count"
        defaultFont="serif"
        defaultFontSize={440}
        className="absolute top-[200px] left-[1220px] z-[4] font-normal leading-none"
      >
        <span
          className="text-[#fffdfb]"
          style={{
            WebkitTextStroke: "0.01em rgba(255,232,251,0.9)",
            paintOrder: "stroke fill",
            textShadow: "7px 10px 0 rgba(156,31,113,0.58), 0 16px 28px rgba(0,0,0,0.7)",
            fontFamily: '"Songti SC", "STSong", "Noto Serif SC", serif',
            fontWeight: 400,
            display: "inline-block",
            transform: "scaleX(1.18)",
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
        className="absolute top-[508px] left-[816px] z-[5] font-bold leading-none tracking-[-0.08em]"
      >
        <PinkCondition text={condition} />
      </CoverElement>

      <CoverElement
        id="unit"
        defaultFont="serif"
        defaultFontSize={220}
        className="absolute top-[470px] left-[1428px] z-[5] font-normal leading-none text-[#fffdfb]"
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
        className="absolute top-[718px] left-[256px] z-[6] font-black leading-none tracking-[-0.015em]"
      >
        <ChromaticTitle text={title} />
      </CoverElement>

      <CoverElement id="bottom-vignette" kind="box" className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[230px]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(35,5,17,0.16)_38%,rgba(11,2,7,0.58)_100%)]" />
      </CoverElement>
    </div>
  );
}
