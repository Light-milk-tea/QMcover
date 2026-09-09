import { useId } from "react";
import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { useCdnSrc } from "../lib/cdn";
import { bgGradeFilter } from "../lib/effects";
import type { CoverRenderProps } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";
import "./SixVanguard.css";
import goldTexture from "../assets/textures/vanguard-gold.png";

// Small, deterministic paper texture; never embeds the reference artwork.
const paperNoise = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".34" numOctaves="3" seed="19"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity=".5"/></svg>')}")`;


function GoldType({ text, stage = false }: { text: string; stage?: boolean }) {
  const content = stage ? text.split(/([-–])/).map((part, i) => /[-–]/.test(part)
    ? <span key={i} style={{ display: "inline-block", width: ".29em", transform: "scaleX(.76)", transformOrigin: "left center" }}>{part}</span>
    : part) : text;
  return (
    <span className="relative inline-block whitespace-nowrap" data-type-face>
      <span>{content}</span>
      <span aria-hidden className="pointer-events-none absolute inset-0" style={{
        color: "transparent", backgroundImage: `url(${goldTexture})`, backgroundSize: "100% 100%", backgroundClip: "text",
        WebkitBackgroundClip: "text", opacity: 1, maskImage: "linear-gradient(transparent 40%, #000 96%)",
        WebkitMaskImage: "linear-gradient(transparent 40%, #000 96%)",
      }}>{content}</span>
    </span>
  );
}

function printRandom(seed: number) {
  let n = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function PrintGeometry() {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 1920 1080" className="h-full w-full" aria-hidden>
      <defs>
        <pattern id={`${id}-triangles`} width="104" height="87" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <path d="M12 14 30 45H-6Z" fill="#cf2925" />
          <path d="M54 12H88L71 43Z" fill="#111b23" />
          <path d="M14 66H42" stroke="#e9e6df" strokeWidth="7" />
        </pattern>
        <filter id={`${id}-defocus`} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5" /></filter>
        <mask id={`${id}-border`}><rect width="1920" height="1080" fill="white" /><path d="M-60 235 1765-145 1950 820 155 1210Z" fill="black" /></mask>
        <filter id={`${id}-dry-ink`} x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency=".023 .032" numOctaves="4" seed="24" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 5 0 0 0 -1.35" result="rough" />
          <feComposite in="SourceGraphic" in2="rough" operator="in" result="ink" />
          <feDisplacementMap in="ink" in2="noise" scale="36" />
        </filter>
        <filter id={`${id}-cloud`} x="-40%" y="-40%" width="180%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency=".008 .012" numOctaves="4" seed="27" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 6 0 0 0 -2.7" />
          <feComposite in2="SourceGraphic" operator="in" />
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <radialGradient id={`${id}-light`}><stop stopColor="white" /><stop offset="1" stopColor="white" stopOpacity="0" /></radialGradient>
      </defs>
      <g mask={`url(#${id}-border)`}>
        <rect width="1920" height="1080" fill={`url(#${id}-triangles)`} opacity=".6" filter={`url(#${id}-defocus)`} />
        <rect x="280" y="0" width="1000" height="130" fill={`url(#${id}-triangles)`} opacity=".46" />
      </g>
      <path d="M-60 235 1765-145 1950 820 155 1210Z" stroke="#efeee6" strokeWidth="3" fill="#ccd0d3" fillOpacity=".055" />
      <g fill="none" stroke="#111a20">
        <path d="M1020 495 1464 272 1714 737 1270 964Z" strokeWidth="9" opacity=".8" />
        <path d="M1046 541 1453 332 1659 722 1253 926Z" strokeWidth="5" opacity=".58" />
        <path d="M1126 203 1307 255 M1130 203 1085 338 M1746 365 1685 351 1720 439 M1563 810 1515 952 1370 902" strokeWidth="27" opacity=".88" />
      </g>
      <g fill="none" stroke="#f5f4ee" opacity=".63" filter={`url(#${id}-dry-ink)`}>
        <path d="M1680-70 C1630 56 1790 90 1696 257 S1720 430 1620 516" strokeWidth="26" />
        <path d="M1850-60 C1690 62 1810 226 1755 372 S1830 556 1880 604" strokeWidth="15" />
        <path d="M1470-45 C1300 120 1445 182 1410 276 M1530-40 Q1550 60 1495 121" strokeWidth="9" />
        
        {Array.from({ length: 18 }, (_, i) => <path key={i}
          d={`M${1720 + i * 5} ${348 + i * 5} Q${1800 + i * 6} ${418 + i * 4} ${1980 - i * 5} ${318 + i * 14}`}
          strokeWidth={i % 4 === 0 ? 4 : 1.2} />)}
      </g>
      <ellipse cx="1720" cy="45" rx="470" ry="295" fill={`url(#${id}-light)`} opacity=".38" />
      <g filter={`url(#${id}-cloud)`} opacity=".94">
        <ellipse cx="1650" cy="62" rx="425" ry="185" fill="white" />
        <ellipse cx="1700" cy="154" rx="180" ry="310" fill="white" />
      </g>
    </svg>
  );
}

export function SixVanguard(props: CoverRenderProps) {
  const squad = elementText(props.elementStyles, "squad", props.subtitle);
  const stage = elementText(props.elementStyles, "stage", props.title);
  const script = elementText(props.elementStyles, "script", props.signature);
  const mark = elementText(props.elementStyles, "mark", props.mark);
  const bg = useCdnSrc(getBgPreset(props.bgPreset).url ?? "");
  const echo = useCdnSrc(props.imageUrl);
  // Latin glyphs are narrower than CJK. Fit the actual editable strings to the right column.
  const stageUnits = [...stage].reduce((sum, c) => sum + (c.codePointAt(0)! > 255 ? 1 : .65), 0);
  const stageSize = Math.min(350, 940 / Math.max(1, stageUnits));
  const squadSize = Math.min(156, 640 / Math.max(1, [...squad].length));

  return (
    <div data-six-vanguard-canvas className="relative h-full w-full overflow-hidden bg-[#58616a]">
      {bg.src ? <img src={bg.src} alt="" crossOrigin="anonymous" referrerPolicy="no-referrer" decoding="async"
        onLoad={bg.onLoad} onError={bg.onError}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45"
        style={{ filter: bgGradeFilter(props.effects?.bgGrade), objectPosition: "60% 40%" }} /> : null}
      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(115deg, #172026b3 0%, transparent 40%, #b8bbc333 70%, #1a233399 100%), radial-gradient(ellipse at 79% 0%, #fff 0%, transparent 48%)" }} />

      <CoverElement id="echo" kind="box" className="pointer-events-none absolute inset-0 z-[1]">
        {echo.src ? <img src={echo.src} alt="" crossOrigin="anonymous" referrerPolicy="no-referrer" decoding="async"
          onLoad={echo.onLoad} onError={echo.onError} className="absolute"
          style={{ left: 680, top: -40, width: 1250, height: 2110, objectFit: "contain", objectPosition: "center top", filter: "grayscale(1) contrast(.9)", opacity: .6, transform: "rotate(12deg)", transformOrigin: "center top", maskImage: "linear-gradient(#000 60%, transparent 100%)" }} /> : null}
      </CoverElement>
      <CoverElement id="geometry" kind="box" className="pointer-events-none absolute inset-0 z-[2]"><PrintGeometry /></CoverElement>
      <CoverElement id="edge-type-top" defaultFont="sans" defaultFontSize={182} className="pointer-events-none absolute top-[-75px] left-[-120px] z-[3] whitespace-nowrap font-black text-[#d6c18e]" style={{ lineHeight: 1, opacity: .48 }}>
        <span style={{ display: "inline-block", transform: "rotate(-12deg)", filter: "blur(5px)", fontFamily: props.elementStyles?.["edge-type-top"]?.font ? undefined : "'Outfit Variable', sans-serif" }}>{elementText(props.elementStyles, "edge-type-top", "PIONEER")}</span>
      </CoverElement>
      <CoverElement id="edge-type-bottom" defaultFont="sans" defaultFontSize={180} className="pointer-events-none absolute top-[970px] left-[1190px] z-[4] whitespace-nowrap font-black text-[#d9c18d]" style={{ lineHeight: 1, opacity: .5 }}>
        <span style={{ display: "inline-block", transform: "rotate(-12deg)", transformOrigin: "left center", filter: "blur(5px)", fontFamily: props.elementStyles?.["edge-type-bottom"]?.font ? undefined : "'Outfit Variable', sans-serif" }}>{elementText(props.elementStyles, "edge-type-bottom", "VANGUARD")}</span>
      </CoverElement>
      <div data-operator-slot className="pointer-events-none absolute top-0 left-0 z-[7] h-full w-[1400px] overflow-visible">
        <OperatorLayer {...props} objectFit="contain" objectPosition="left top" transformOrigin="left top" fadeRight fadeRightSolid={86} className="h-full w-full" />
      </div>
      <CoverElement id="halftone" kind="box" className="pointer-events-none absolute inset-0 z-[8]">
        <div data-print-dots className="absolute inset-0" style={{ maskImage: "linear-gradient(90deg, #000 8%, transparent 26%, transparent 47%, #000 61%), radial-gradient(ellipse 65% 50% at 86% -3%, transparent 25%, #000 70%)", maskComposite: "intersect" }}>
          <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "radial-gradient(circle, #111a22 1.6px, transparent 2px)", backgroundSize: "8px 8px", transform: "rotate(-13deg) scale(1.24)", maskImage: "radial-gradient(ellipse at 70% 65%, #000, transparent 70%), radial-gradient(ellipse at 10% 32%, #000, transparent 45%)" }} />
          <div className="absolute inset-0 opacity-50" style={{ backgroundImage: paperNoise }} />
        </div>
        <div className="absolute inset-0 opacity-[0.30]" style={{ backgroundImage: paperNoise }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 53% 42%, transparent 40%, #101a235c 100%)" }} />
      </CoverElement>
      <BgDimLayer on={props.bgDim} amount={props.bgDimAmount} at="15% 75%" className="z-[8]" />
      <CoverElement id="gold-rule" kind="box" className="pointer-events-none absolute inset-0 z-[5]" style={{ color: "#dbb64d" }}>
        <svg viewBox="0 0 1920 1080" className="h-full w-full" aria-hidden fill="none">
          <path d="M-10 220 465 115 M-10 231 452 131 M-10 245 440 148 M595 96 1034 14 M1170 28 1470-28" stroke="currentColor" strokeWidth="3" />
          <path d="M1220 932 1890 812 M1430 932 1860 831" stroke="#f5f2e8" strokeWidth="2" opacity=".65" />
        </svg>
      </CoverElement>
      <CoverElement id="mark-bg" kind="box" className="absolute top-[475px] left-[901px] z-[10] h-[38px] w-[170px]" style={{ color: "#d92529" }}>
        <span className="relative block h-full w-full" style={{ background: "currentColor", transform: "skewX(-10deg) rotate(-4deg)" }}>
          <span className="absolute top-0 right-full h-full w-[100px] opacity-30" style={{ background: "linear-gradient(90deg, transparent, currentColor)" }} />
        </span>
      </CoverElement>
      <CoverElement id="mark" defaultFont="sans" defaultFontSize={Math.min(34, 240 / Math.max(1, mark.length))}
        className="absolute top-[472px] left-[910px] z-[11] font-black text-white" style={{ lineHeight: 1.15 }}>
        <span className="inline-block" style={{ transform: "rotate(-4deg)", fontFamily: props.elementStyles?.mark?.font ? undefined : "'Outfit Variable', sans-serif", fontStyle: "italic" }}>{mark}</span>
      </CoverElement>
      <CoverElement id="squad" defaultFont="serif" defaultFontSize={squadSize}
        className="absolute top-[364px] left-[1040px] z-[12] font-black text-[#fffefb]" style={{ lineHeight: 1 }}>
        <span className="inline-block" style={{ transform: "skewX(-10deg) rotate(-3deg) scaleX(.96)", transformOrigin: "left bottom", letterSpacing: ".025em" }}><GoldType text={squad} /></span>
      </CoverElement>
      <CoverElement id="stage" defaultFont="sans" defaultFontSize={stageSize}
        className="absolute top-[516px] left-[826px] z-[13] text-[#fffefb]" style={{ lineHeight: .88, fontWeight: 750 }}>
        <span className="inline-block" style={{ transform: "skewX(-9deg) rotate(-4deg) scaleX(1.05)", transformOrigin: "left bottom", letterSpacing: "-.02em", fontFamily: props.elementStyles?.stage?.font ? undefined : "'Outfit Variable', sans-serif" }}><GoldType text={stage} stage /></span>
      </CoverElement>
      <CoverElement id="script" defaultFont="script" defaultFontSize={Math.min(119, 952 / Math.max(1, script.length))}
        className="absolute top-[466px] left-[1200px] z-[14] whitespace-nowrap text-[#070b0e]" style={{ lineHeight: 1 }}>
        <span className="inline-block" style={{ fontFamily: props.elementStyles?.script?.font ? undefined : "'Vanguard Hand', cursive", transform: "rotate(-6deg) skewX(-9deg) scaleX(.96)", transformOrigin: "left center" }}>{script}</span>
      </CoverElement>
      <CoverElement id="flecks" kind="box" className="pointer-events-none absolute inset-0 z-[6]">
        <svg viewBox="0 0 1920 1080" className="h-full w-full" aria-hidden>
          {Array.from({ length: 360 }, (_, i) => {
            const x = printRandom(i * 2 + 87) * 1920;
            const y = printRandom(i * 2 + 88) * 1080;
            // Keep the face clear; flecks sit behind the live text, including its counters.
            if (x > 390 && x < 850 && y < 650) return null;
            return <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 5.5 : 3.1} fill="#fffef5" opacity={.4 + (i % 4) * .16} />;
          })}
        </svg>
      </CoverElement>
    </div>
  );
}
