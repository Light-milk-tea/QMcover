import { useId } from "react";
import { findOperator, operatorSkills, skillUrl, type OperatorSkill } from "../data/arts";
import { ALL_OUT_RINGS, ringBands, type AllOutRings } from "../lib/allOutLayout";
import type { BlueCutPalette } from "../lib/blueCutPalette";
import { useCdnSrc } from "../lib/cdn";
import type { HudTone } from "../lib/garrisonHud";
import { RETRO_DEFAULT_PALETTE, type RetroPalette } from "../lib/retroPalette";
import type { BrushTone, StageTone } from "../lib/unveilTone";
import "./DecorArt.css";

// Deterministic vector textures stay editable and survive html-to-image export.
// Full-canvas pieces are drawn on a 1920×1080 viewBox and fill their container.

/** 紧急授课：斜向紫色光痕和远处弧线。 */
export function VioletStreaks() {
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

/** 紧急授课：紫黑笔触雾带。 */
export function VioletMist() {
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

/** 紧急授课：紫黑渐变和四周暗角，叠上紫雾笔触就是原模板的紫黑氛围。 */
export function VioletAtmosphere() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 38% 64% at 51% 22%, rgba(245,221,235,0.12) 0%, rgba(113,38,73,0.12) 31%, transparent 68%), radial-gradient(ellipse 48% 58% at 20% 42%, rgba(100,46,95,0.22) 0%, transparent 72%), radial-gradient(ellipse 72% 70% at 50% 72%, rgba(91,16,103,0.28) 0%, transparent 68%), linear-gradient(90deg, rgba(22,6,31,0.7) 0%, rgba(54,22,58,0.16) 34%, rgba(51,8,25,0.3) 68%, rgba(10,3,8,0.82) 100%)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_34%,rgba(5,2,8,0.72)_100%)]" />
    </>
  );
}

/** 紧急授课：压在立绘上的紫色暗角，脸部留亮。 */
export function ArtVeil() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(26,9,30,0.10) 0%, rgba(41,6,39,0.06) 42%, rgba(36,6,40,0.22) 74%, rgba(19,3,26,0.24) 100%), radial-gradient(ellipse 48% 70% at 50% 30%, transparent 0%, transparent 42%, rgba(29,5,35,0.22) 72%, rgba(10,2,17,0.62) 100%)",
      }}
    />
  );
}

/** 职业队：左侧文字区压暗、底部压暗和顶部天光。 */
export function CoolWash() {
  return (
    <>
      <div
        className="absolute inset-y-0 left-0 w-[38%]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0 16%, rgb(12 16 20 / 0.16) 36%, rgb(12 16 20 / 0.4) 100%)",
          maskImage: "linear-gradient(90deg, #000 0%, #000 42%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg, #000 0%, #000 42%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgb(248 250 252 / 0.08) 0%, transparent 24%, rgb(3 7 11 / 0.2) 54%, rgb(3 7 11 / 0.76) 100%), radial-gradient(ellipse 46% 34% at 40% -4%, rgb(255 255 255 / 0.24) 0%, rgb(250 252 252 / 0.08) 42%, transparent 72%)",
        }}
      />
    </>
  );
}

/** 紧急授课：底部青红故障烟带。 */
export function GlitchHaze() {
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

/** 仅需一人：红色径向雾和烟带。 */
export function RedSmoke() {
  const smokeId = useId().replace(/:/g, "");
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 88% 78% at 34% 50%, rgb(118 10 16 / 0.88) 0%, rgb(58 6 10 / 0.52) 48%, transparent 76%), radial-gradient(ellipse 56% 46% at 82% 8%, rgb(200 40 34 / 0.34) 0%, transparent 64%), radial-gradient(ellipse 40% 36% at 18% 78%, rgb(40 4 8 / 0.55) 0%, transparent 70%)",
        }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" fill="none" aria-hidden>
        <defs>
          <filter id={smokeId} x="-20%" y="-50%" width="140%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency=".005 .014" numOctaves="3" seed="17" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="100" />
            <feGaussianBlur stdDeviation="24" />
          </filter>
        </defs>
        <g filter={`url(#${smokeId})`}>
          <path d="M-120 200 Q380 -60 960 210 T2000 160" stroke="#d90829" strokeWidth="110" opacity=".65" />
          <path d="M-100 365 Q460 90 970 340 T2030 280" stroke="#65051c" strokeWidth="95" opacity=".75" />
          <path d="M-100 488 Q280 225 920 454" stroke="#ed1233" strokeWidth="48" opacity=".5" />
          <path d="M-120 1000 Q320 680 760 876 T1900 860" stroke="#a91a28" strokeWidth="150" opacity=".65" />
        </g>
      </svg>
    </>
  );
}

/** 全息作战矩阵：圆环、弧线和网格，主色取 currentColor。 */
export function TacticalOrbits() {
  return <svg viewBox="0 0 1920 1080" className="h-full w-full" fill="none" aria-hidden>
    <g stroke="currentColor">
      <ellipse cx="1410" cy="542" rx="432" ry="420" strokeWidth="3.2" opacity=".95" />
      <ellipse cx="1410" cy="542" rx="422" ry="410" strokeWidth="1.8" opacity=".72" />
      <circle cx="1410" cy="549" r="186" strokeWidth="5" opacity=".65" />
      <path d="M420 -70 C345 400 820 834 1590 564 S1730 -160 1790 -60 M750 596 C1210 735 1560 310 2020 512" strokeWidth="1.5" opacity=".65" />
      <path d="M1030 900 L1750 184 M1350 0 V1080" opacity=".18" />
      <path d="M1410 -30 V160 M1410 805 V1110" strokeWidth="42" opacity=".18" />
    </g>
    <g stroke="#d8d9de" opacity=".24" strokeWidth="1.2">
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${40 + i * 160} 0 V1080`} />)}
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M0 ${100 + i * 160} H1920`} />)}
    </g>
    <g fill="#fff4ed" opacity=".65"><rect x="846" y="98" width="4" height="4" /><rect x="1642" y="418" width="4" height="4" /><rect x="1804" y="738" width="4" height="4" /></g>
  </svg>;
}

/** 全息作战矩阵：斜向微光颗粒，主色取 currentColor。 */
export function Embers() {
  return <svg viewBox="0 0 1920 1080" className="h-full w-full" aria-hidden>
    {Array.from({ length: 92 }, (_, i) => {
      const x = (i * 283 + 79) % 1920;
      const y = (i * i * 31 + 167) % 1080;
      return <ellipse key={i} cx={x} cy={y} rx={i % 11 === 0 ? 2.5 : 1} ry={i % 11 === 0 ? 6 : 2} transform={`rotate(32 ${x} ${y})`} fill={i % 5 === 0 ? "#ffe2bb" : "currentColor"} opacity={i % 11 === 0 ? .85 : .28} />;
    })}
  </svg>;
}

/** 全息作战矩阵：左上、右下两角的主色光晕。 */
export function CornerGlow() {
  return <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 42% 32% at 0% 0%, currentColor, transparent 85%), radial-gradient(ellipse 36% 30% at 103% 104%, currentColor, transparent 90%)", opacity: .7 }} />;
}

function printRandom(seed: number) {
  let n = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

// Small, deterministic paper texture; never embeds the reference artwork.
const paperNoise = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".34" numOctaves="3" seed="19"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity=".5"/></svg>')}")`;

/** 特种三人：印刷斜框、三角纹、干笔触和云团。 */
export function PrintGeometry() {
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

/** 特种三人：旋转网点和纸纹，两侧保留、中间留空。 */
export function PrintDots() {
  return (
    <>
      <div data-print-dots className="absolute inset-0" style={{ maskImage: "linear-gradient(90deg, #000 8%, transparent 26%, transparent 47%, #000 61%), radial-gradient(ellipse 65% 50% at 86% -3%, transparent 25%, #000 70%)", maskComposite: "intersect" }}>
        <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "radial-gradient(circle, #111a22 1.6px, transparent 2px)", backgroundSize: "8px 8px", transform: "rotate(-13deg) scale(1.24)", maskImage: "radial-gradient(ellipse at 70% 65%, #000, transparent 70%), radial-gradient(ellipse at 10% 32%, #000, transparent 45%)" }} />
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: paperNoise }} />
      </div>
      <div className="absolute inset-0 opacity-[0.30]" style={{ backgroundImage: paperNoise }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 53% 42%, transparent 40%, #101a235c 100%)" }} />
    </>
  );
}

/** 特种三人：纸面白点。clearFace 时避开默认立绘的脸部区域。 */
export function PaperFlecks({ clearFace = false }: { clearFace?: boolean }) {
  return (
    <svg viewBox="0 0 1920 1080" className="h-full w-full" aria-hidden>
      {Array.from({ length: 360 }, (_, i) => {
        const x = printRandom(i * 2 + 87) * 1920;
        const y = printRandom(i * 2 + 88) * 1080;
        // Keep the face clear; flecks sit behind the live text, including its counters.
        if (clearFace && x > 390 && x < 850 && y < 650) return null;
        return <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 5.5 : 3.1} fill="#fffef5" opacity={.4 + (i % 4) * .16} />;
      })}
    </svg>
  );
}

/** 特种三人：左上和右下的斜向细线，主色取 currentColor。 */
export function GoldRules() {
  return (
    <svg viewBox="0 0 1920 1080" className="h-full w-full" aria-hidden fill="none">
      <path d="M-10 220 465 115 M-10 231 452 131 M-10 245 440 148 M595 96 1034 14 M1170 28 1470-28" stroke="currentColor" strokeWidth="3" />
      <path d="M1220 932 1890 812 M1430 932 1860 831" stroke="#f5f2e8" strokeWidth="2" opacity=".65" />
    </svg>
  );
}

/** 特种三人：倾斜的红标底，左侧带渐隐拖尾。 */
export function SkewTag() {
  return (
    <span className="relative block h-full w-full" style={{ background: "currentColor", transform: "skewX(-10deg) rotate(-4deg)" }}>
      <span className="absolute top-0 right-full h-full w-[100px] opacity-30" style={{ background: "linear-gradient(90deg, transparent, currentColor)" }} />
    </span>
  );
}

/** 四星无核：左上角撕纸。 */
export function TornPaper() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
      <path
        d="M0 0 H520 L498 46 L470 38 L442 92 L400 70 L368 128 L322 102 L286 168 L240 140 L198 206 L150 176 L108 248 L62 214 L0 286 Z"
        fill="#f6f0e6"
      />
      <path
        d="M0 0 H520 L498 46 L470 38 L442 92 L400 70 L368 128 L322 102 L286 168 L240 140 L198 206 L150 176 L108 248 L62 214 L0 286 Z"
        fill="rgba(20,16,12,0.16)"
        transform="translate(10 14)"
      />
      <path
        d="M0 0 H520 L498 46 L470 38 L442 92 L400 70 L368 128 L322 102 L286 168 L240 140 L198 206 L150 176 L108 248 L62 214 L0 286 Z"
        fill="#f6f0e6"
      />
      <path d="M86 40 Q160 70 210 38" stroke="rgba(90,70,50,0.18)" strokeWidth="3" fill="none" />
      <path d="M40 110 Q120 150 190 96" stroke="rgba(90,70,50,0.12)" strokeWidth="2" fill="none" />
    </svg>
  );
}

/** 四星无核：透视棋盘地面。 */
export function CheckerFloor() {
  return (
    <div className="absolute inset-x-[-18%] bottom-[-38%] h-[78%] origin-bottom" style={{ perspective: "920px" }}>
      <div
        className="h-full w-full"
        style={{
          transform: "rotateX(58deg)",
          backgroundImage:
            "linear-gradient(#c8c2b6 2px, transparent 2px), linear-gradient(90deg, #c8c2b6 2px, transparent 2px), repeating-conic-gradient(#3a3a38 0% 25%, #0c0c0c 0% 50%)",
          backgroundSize: "110px 110px, 110px 110px, 110px 110px",
          opacity: 0.82,
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 28%, #000 78%, transparent 100%)",
          maskImage: "linear-gradient(180deg, transparent 0%, #000 28%, #000 78%, transparent 100%)",
        }}
      />
    </div>
  );
}

/** 四星无核：青绿线框。 */
export function TealHud() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" fill="none" aria-hidden>
      <g stroke="#3d9a96" strokeWidth="1.6" opacity="0.55">
        <path d="M48 780 C180 760 240 860 390 820 C520 786 560 900 720 868" />
        <path d="M80 860 C220 910 340 840 480 920 C600 980 760 900 900 960" />
        <path d="M120 980 H340" />
        <path d="M160 1000 H260" />
        <circle cx="980" cy="940" r="78" />
        <circle cx="980" cy="940" r="48" />
        <path d="M980 862 V1018 M902 940 H1058" />
        <path d="M70 70 H228" />
        <path d="M70 70 V210" />
      </g>
      <g stroke="#d7ddd8" strokeWidth="1" opacity="0.16">
        <path d="M0 196 H1920" />
        <path d="M0 888 H1920" />
        <path d="M268 0 V1080" />
      </g>
    </svg>
  );
}

/** 四星无核：左下罗盘。 */
export function Compass() {
  return (
    <svg className="absolute bottom-[70px] left-[188px] h-[196px] w-[196px] opacity-55" viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="42" fill="#2a2418" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#c4a46a" strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        const x1 = 50 + Math.cos(a) * 36;
        const y1 = 50 + Math.sin(a) * 36;
        const x2 = 50 + Math.cos(a) * 46;
        const y2 = 50 + Math.sin(a) * 46;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c4a46a" strokeWidth="4" />;
      })}
      <circle cx="50" cy="50" r="18" fill="none" stroke="#c4a46a" strokeWidth="2" />
      <circle cx="50" cy="50" r="4" fill="#c4a46a" />
    </svg>
  );
}

/** 四星无核：倾斜金框棋盘。 */
export function GoldFrame() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
      <g transform="translate(-90 12) rotate(16 1410 400)">
        <rect x="1136" y="-6" width="648" height="852" fill="#5a4320" />
        <rect x="1148" y="8" width="620" height="820" fill="#8a6a3a" />
        <rect x="1162" y="22" width="592" height="792" fill="#e0c078" />
        <rect x="1174" y="34" width="568" height="768" fill="#6d5428" />
        <rect x="1188" y="48" width="540" height="740" fill="#d2b06a" />
        <rect x="1202" y="62" width="512" height="712" fill="#8a6a3a" />
        <rect x="1214" y="74" width="488" height="688" fill="#1c1a20" />
        <rect x="1148" y="8" width="70" height="70" fill="#f0d090" />
        <rect x="1698" y="8" width="70" height="70" fill="#f0d090" />
        <rect x="1148" y="758" width="70" height="70" fill="#c49850" />
        <rect x="1698" y="758" width="70" height="70" fill="#c49850" />
        <rect x="1162" y="22" width="28" height="28" fill="#5a4320" />
        <rect x="1726" y="22" width="28" height="28" fill="#5a4320" />
        {Array.from({ length: 11 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => {
            const path = (row === 4 && col >= 2 && col <= 5) || (row === 5 && col >= 1 && col <= 4) || (row === 6 && col >= 3 && col <= 6);
            const spawn = (row === 3 && col === 6) || (row === 8 && col === 1);
            return (
              <rect
                key={`${row}-${col}`}
                x={1220 + col * 60}
                y={80 + row * 61}
                width="56"
                height="57"
                fill={spawn ? "#6a4d82" : path ? "#3a3844" : (row + col) % 2 === 0 ? "#2a2832" : "#1a1820"}
              />
            );
          }),
        )}
        <rect x="1148" y="8" width="54" height="54" fill="#e0c07a" />
        <rect x="1714" y="8" width="54" height="54" fill="#e0c07a" />
        <rect x="1148" y="774" width="54" height="54" fill="#e0c07a" />
        <rect x="1714" y="774" width="54" height="54" fill="#e0c07a" />
      </g>
    </svg>
  );
}

/** 四星无核：带硬投影的关卡色条，颜色取 currentColor。 */
export function StageBar() {
  return (
    <span
      aria-hidden
      className="absolute inset-0"
      style={{
        backgroundColor: "currentColor",
        boxShadow: "6px 10px 0 rgba(16,12,10,0.28)",
      }}
    />
  );
}

/** 四星无核：顶部暖色光晕。 */
export function TopGlow() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 42% 52% at 62% -4%, rgba(255,244,220,0.38) 0%, rgba(255,236,200,0.12) 36%, transparent 70%)",
      }}
    />
  );
}

/** 四星无核：底边压暗。 */
export function BottomFade({ ink = "#101214" }: { ink?: string }) {
  return (
    <span
      aria-hidden
      className="absolute inset-0"
      style={{ background: `linear-gradient(180deg, transparent, ${ink}99)` }}
    />
  );
}

/** 干员前瞻分析：双层细边框、大圆角弧线和红色定位点。 */
export function TechnicalFrame() {
  return (
    <div className="relative h-full w-full opacity-90">
      <span className="absolute top-[58px] left-[72px] h-[930px] w-[1776px] border border-[#9eb3be]/20" />
      <span className="absolute top-[94px] left-[116px] h-[850px] w-[1688px] border border-[#9eb3be]/12" />
      <span className="absolute top-[-246px] left-[-180px] h-[570px] w-[1010px] rounded-br-[420px] border-r border-b border-[#9eb3be]/28" />
      <span className="absolute top-[-208px] left-[-122px] h-[566px] w-[982px] rounded-br-[390px] border-r border-b border-[#9eb3be]/18" />
      <span className="absolute right-[-178px] bottom-[-278px] h-[660px] w-[1150px] rounded-tl-[480px] border-t border-l border-[#9eb3be]/25" />
      <span className="absolute right-[-116px] bottom-[-220px] h-[620px] w-[1080px] rounded-tl-[430px] border-t border-l border-[#9eb3be]/15" />
      <span className="absolute top-[70px] left-[690px] h-[42px] w-px bg-[#a83841]/60" />
      <span className="absolute top-[70px] left-[688px] h-[5px] w-[5px] rotate-45 bg-[#a83841]" />
      <span className="absolute top-[110px] right-[286px] h-[5px] w-[5px] rotate-45 border border-[#b9c6cc]/70" />
      <span className="absolute right-[162px] bottom-[150px] h-[5px] w-[5px] rotate-45 border border-[#b9c6cc]/60" />
      <span className="absolute right-[92px] bottom-[194px] h-[108px] w-px bg-[#a83841]/50" />
      <span className="absolute right-[90px] bottom-[190px] h-[5px] w-[5px] rotate-45 bg-[#a83841]" />
    </div>
  );
}

/** 干员前瞻分析：六角栏目条，底色取 currentColor。 */
export function AnalysisBadge() {
  return (
    <span className="relative block h-full w-full">
      <span
        aria-hidden
        className="absolute inset-0 bg-[#082b49]/90"
        style={{
          clipPath: "polygon(6% 0, 94% 0, 100% 50%, 94% 100%, 6% 100%, 0 50%)",
          transform: "translate(8px, 7px)",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background: "currentColor",
          clipPath: "polygon(6% 0, 94% 0, 100% 50%, 94% 100%, 6% 100%, 0 50%)",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(59,161,224,0.48), transparent 58%)",
          clipPath: "polygon(6% 0, 94% 0, 100% 50%, 94% 100%, 6% 100%, 0 50%)",
        }}
      />
      <span className="absolute top-1/2 left-[34px] h-[21px] w-[21px] -translate-y-1/2 rotate-45 border-b-[3px] border-l-[3px] border-white/85" />
      <span className="absolute top-1/2 right-[34px] h-[21px] w-[21px] -translate-y-1/2 rotate-45 border-t-[3px] border-r-[3px] border-white/85" />
    </span>
  );
}

/** V我50：左端尖角的关卡箭头条，颜色取 currentColor。stretch 时跟随图层框拉伸。 */
export function StageArrow({ height = 227, tip = 64, shoulder = 200, stretch = false }: { height?: number; tip?: number; shoulder?: number; stretch?: boolean }) {
  return (
    <svg data-stage-arrow="" className="block h-full w-full" viewBox={`0 0 1920 ${height}`} preserveAspectRatio={stretch ? "none" : undefined} aria-hidden>
      <polygon
        points={`${tip},${height / 2} ${shoulder},0 1920,0 1920,${height} ${shoulder},${height}`}
        fill="currentColor"
      />
    </svg>
  );
}

/** V我50：从左往右变淡的浅色罩。 */
export function LightWash() {
  return (
    <>
      <div
        data-highspec-wash=""
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgb(248 245 240 / 0.94) 0%, rgb(247 244 239 / 0.78) 22%, rgb(246 243 238 / 0.46) 48%, rgb(245 242 237 / 0.24) 74%, rgb(245 242 237 / 0.14) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgb(248 245 240 / 0.72) 0%, rgb(248 245 240 / 0.28) 22%, transparent 48%)",
        }}
      />
    </>
  );
}

const SLOPE = -1.36;

function bandPoints(y0: number, y1: number, rightAt: number, yRef: number, width: number) {
  const xAt = (y: number) => rightAt + SLOPE * (y - yRef);
  return [
    [xAt(y0) - width, y0],
    [xAt(y0), y0],
    [xAt(y1), y1],
    [xAt(y1) - width, y1],
  ]
    .map(([x, y]) => `${Math.round(x)},${Math.round(y)}`)
    .join(" ");
}

function offsetBand(points: string, dx: number, dy: number) {
  return points
    .split(" ")
    .map((pair) => {
      const [x, y] = pair.split(",").map(Number);
      return `${Math.round(x + dx)},${Math.round(y + dy)}`;
    })
    .join(" ");
}

/** 斜切关卡：右上、右下两条带高光的斜切色带。 */
export function GlossySlash({ theme }: { theme: BlueCutPalette }) {
  const uid = useId().replace(/:/g, "");
  const top = bandPoints(-40, 318, 1742, 0, 240);
  const bottom = bandPoints(800, 1200, 1916, 825, 250);
  const topClip = `${uid}-top`;
  const bottomClip = `${uid}-bottom`;
  const topGloss = `${uid}-top-gloss`;
  const bottomGloss = `${uid}-bottom-gloss`;
  return (
    <svg data-slash="" className="h-full w-full overflow-visible" viewBox="0 0 1920 1080" aria-hidden style={{ pointerEvents: "none" }}>
      <defs>
        <linearGradient id={topGloss} gradientUnits="userSpaceOnUse" x1="1488" y1="36" x2="1660" y2="270">
          <stop offset="0" stopColor={theme.depth} />
          <stop offset="0.38" stopColor={theme.accent} />
          <stop offset="0.52" stopColor={theme.gloss} />
          <stop offset="0.68" stopColor={theme.accent} />
          <stop offset="1" stopColor={theme.depth} />
        </linearGradient>
        <linearGradient id={bottomGloss} gradientUnits="userSpaceOnUse" x1="1680" y1="860" x2="1840" y2="1080">
          <stop offset="0" stopColor={theme.depth} />
          <stop offset="0.4" stopColor={theme.accent} />
          <stop offset="0.55" stopColor={theme.glossSoft} />
          <stop offset="0.72" stopColor={theme.accent} />
          <stop offset="1" stopColor={theme.depth} />
        </linearGradient>
        <clipPath id={topClip}>
          <polygon points={top} />
        </clipPath>
        <clipPath id={bottomClip}>
          <polygon points={bottom} />
        </clipPath>
      </defs>
      <polygon points={offsetBand(top, 10, 16)} fill={theme.depth} />
      <polygon points={top} fill={`url(#${topGloss})`} style={{ pointerEvents: "auto" }} />
      <g clipPath={`url(#${topClip})`}>
        <ellipse cx="1636" cy="58" rx="110" ry="16" transform="rotate(-37 1636 58)" fill="white" opacity="0.38" />
        <ellipse cx="1510" cy="148" rx="52" ry="9" transform="rotate(-37 1510 148)" fill="white" opacity="0.2" />
        <ellipse cx="1588" cy="214" rx="28" ry="6" transform="rotate(-37 1588 214)" fill="white" opacity="0.16" />
      </g>
      <polygon points={offsetBand(bottom, 10, 16)} fill={theme.depth} />
      <polygon points={bottom} fill={`url(#${bottomGloss})`} style={{ pointerEvents: "auto" }} />
      <g clipPath={`url(#${bottomClip})`}>
        <ellipse cx="1768" cy="930" rx="96" ry="14" transform="rotate(-37 1768 930)" fill="white" opacity="0.34" />
        <ellipse cx="1644" cy="1024" rx="40" ry="8" transform="rotate(-37 1644 1024)" fill="white" opacity="0.18" />
      </g>
    </svg>
  );
}

/** 斜切关卡：左下黑色斜切，颜色取 currentColor。 */
export function Wedge() {
  return (
    <svg data-wedge="" className="h-full w-full overflow-visible" viewBox="0 0 1920 1080" aria-hidden style={{ pointerEvents: "none" }}>
      <polygon points={offsetBand(bandPoints(700, 1000, 300, 760, 210), 8, 12)} fill="#111111" />
      <polygon points={bandPoints(700, 1000, 300, 760, 210)} fill="currentColor" style={{ pointerEvents: "auto" }} />
    </svg>
  );
}

/** 强度测评：技能图标加金色描边框，首尾两格带四角星。 */
export function SkillFrame({ skill, index }: { skill: OperatorSkill; index: number }) {
  const frameId = useId();
  const remote = useCdnSrc(skillUrl(skill.iconId));
  return (
    <span className="relative block h-full w-full" data-skill-slot={skill.id}>
      <svg viewBox="0 0 188 188" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect x="3" y="3" width="182" height="182" fill="#0b1826" fillOpacity="0.68" />
      </svg>
      <img
        data-skill-icon
        data-skill-id={skill.iconId}
        alt=""
        src={remote.src}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        decoding="async"
        onLoad={remote.onLoad}
        onError={remote.onError}
        className="sr-skill-icon pointer-events-none absolute inset-[4%] h-[92%] w-[92%] object-contain"
      />
      <svg viewBox="0 0 188 188" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`${frameId}-gold`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff0c1" />
            <stop offset="0.3" stopColor="#cc9a48" />
            <stop offset="0.56" stopColor="#785429" />
            <stop offset="0.76" stopColor="#f2d393" />
            <stop offset="1" stopColor="#b38441" />
          </linearGradient>
          <radialGradient id={`${frameId}-glow`}>
            <stop stopColor="#e9f6ff" stopOpacity="0.8" />
            <stop offset="1" stopColor="#cadfff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="5" y="5" width="180" height="180" fill="none" stroke="#08101b" strokeWidth="4" />
        <rect x="3" y="3" width="180" height="180" fill="none" stroke={`url(#${frameId}-gold)`} strokeWidth="2.4" />
        <path d="M3 40 V3 H40 M146 183 H183 V146" fill="none" stroke="#f4dfab" strokeWidth="1" />
        {index !== 1 && (
          <g transform={index === 0 ? "translate(4 4)" : "translate(183 183)"}>
            <circle r="26" fill={`url(#${frameId}-glow)`} />
            <path d="M0 -21 L1.5 -2 L17 0 L1.5 2 L0 21 L-1.5 2 L-17 0 L-1.5 -2 Z" fill="#eff9ff" opacity="0.88" />
          </g>
        )}
      </svg>
    </span>
  );
}

/** 强度测评的技能栏：当前干员的前三个技能排成一行。 */
export function SkillRow({ operatorId }: { operatorId?: string }) {
  const op = (operatorId ? findOperator(operatorId) : undefined) ?? findOperator("char_002_amiya");
  return (
    <span data-skill-row="" className="flex h-full w-full items-center justify-between">
      {operatorSkills(op).map((skill, index) => (
        <span key={skill.id} className="relative block aspect-square h-full">
          <SkillFrame skill={skill} index={index} />
        </span>
      ))}
    </span>
  );
}

/** 特种三人：去色、倾斜、下半淡出的立绘叠影，放在画布右侧。 */
export function ArtEcho({ src }: { src: string }) {
  const echo = useCdnSrc(src);
  return echo.src ? <img src={echo.src} alt="" crossOrigin="anonymous" referrerPolicy="no-referrer" decoding="async"
    onLoad={echo.onLoad} onError={echo.onError} className="absolute"
    style={{ left: 680, top: -40, width: 1250, height: 2110, objectFit: "contain", objectPosition: "center top", filter: "grayscale(1) contrast(.9)", opacity: .6, transform: "rotate(12deg)", transformOrigin: "center top", maskImage: "linear-gradient(#000 60%, transparent 100%)" }} /> : null;
}

/** 文字一侧的局部压暗：从左往右淡出，不整屏抹黑。 */
export function SideShade() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(90deg, rgb(6 9 13 / 0.86) 0%, rgb(6 9 13 / 0.7) 34%, rgb(6 9 13 / 0.34) 66%, transparent 100%)",
      }}
    />
  );
}

/** 总攻击的双层聚焦圆环：两道同心黑环，30% 压暗底色，中间夹一道亮缝。 */
export function FocusRing({
  color = "#000000",
  opacity = 0.3,
  rings = ALL_OUT_RINGS,
}: {
  color?: string;
  opacity?: number;
  rings?: AllOutRings;
}) {
  return (
    <svg
      data-focus-ring=""
      className="absolute inset-0 h-full w-full overflow-visible"
      viewBox="0 0 1920 1080"
      fill="none"
      overflow="visible"
      aria-hidden
    >
      <g opacity={opacity}>
        {ringBands(rings).map(({ r, width }) => (
          <circle key={r} cx={rings.cx} cy={rings.cy} r={r} stroke={color} strokeWidth={width} />
        ))}
      </g>
    </svg>
  );
}

/** 模组测评的「2nd」角标：屋顶形黄牌，SVG 多边形，导出不会变成整块方板。 */
export function RankBadge({ text = "2nd", height, color = "currentColor" }: { text?: string; height: number; color?: string }) {
  const match = text.trim().match(/^(\d+)(\D*)$/);
  const lead = match ? match[1] : text.trim();
  const tail = match ? match[2] : "";
  return (
    <span data-rank-badge="" className="relative block h-full w-full">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 80 90" preserveAspectRatio="none" aria-hidden>
        <polygon points="0,36 40,0 80,36 80,90 0,90" fill={color} />
      </svg>
      <span
        className="absolute inset-x-0 flex items-start justify-center font-cn leading-none font-bold whitespace-nowrap text-[#0b0b0b]"
        style={{ bottom: height * 0.1, fontSize: height * 0.5, letterSpacing: "-0.03em" }}
      >
        <span>{lead}</span>
        {tail ? <span style={{ fontSize: "0.52em", marginTop: "0.1em" }}>{tail}</span> : null}
      </span>
    </span>
  );
}

/** 模组测评底边的黄渐变：底边最实，向上淡出，不拉进人物脸部。 */
export function YellowRamp({ color = "currentColor" }: { color?: string }) {
  return (
    <span aria-hidden className="absolute inset-0 block overflow-hidden">
      <span
        className="absolute inset-0 block"
        style={{
          background: color,
          WebkitMaskImage: "linear-gradient(0deg, rgb(0 0 0 / 0.3) 0%, rgb(0 0 0 / 0.14) 30%, rgb(0 0 0 / 0.04) 66%, transparent 100%)",
          maskImage: "linear-gradient(0deg, rgb(0 0 0 / 0.3) 0%, rgb(0 0 0 / 0.14) 30%, rgb(0 0 0 / 0.04) 66%, transparent 100%)",
        }}
      />
    </span>
  );
}

/** 模组测评标题暗带里的细点阵：只铺在底部，顶端淡出。 */
export function DotBand() {
  return (
    <span
      aria-hidden
      className="absolute inset-0 block"
      style={{
        backgroundImage: "radial-gradient(circle, currentColor 1.3px, transparent 1.7px)",
        backgroundSize: "15px 15px",
        WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 45%, #000 100%)",
        maskImage: "linear-gradient(180deg, transparent 0%, #000 45%, #000 100%)",
      }}
    />
  );
}

/** 贴着画布四边的细框，用四条实心 DOM，不用 border。 */
export function InsetFrame({ inset = 10, thickness = 3 }: { inset?: number; thickness?: number }) {
  const bar = { background: "currentColor", position: "absolute" } as const;
  return (
    <span aria-hidden className="absolute block" style={{ inset }}>
      <i style={{ ...bar, top: 0, left: 0, right: 0, height: thickness }} />
      <i style={{ ...bar, bottom: 0, left: 0, right: 0, height: thickness }} />
      <i style={{ ...bar, top: 0, bottom: 0, left: 0, width: thickness }} />
      <i style={{ ...bar, top: 0, bottom: 0, right: 0, width: thickness }} />
    </span>
  );
}

/** 细方括号：三块实心 DOM 拼成，不用 border。 */
export function ThinBracket({ side, thickness }: { side: "l" | "r"; thickness: number }) {
  const bar = { background: "currentColor", position: "absolute" } as const;
  return (
    <span aria-hidden data-thin-bracket={side} className="relative block h-full w-full">
      <i style={{ ...bar, top: 0, left: 0, right: 0, height: thickness }} />
      <i style={{ ...bar, bottom: 0, left: 0, right: 0, height: thickness }} />
      <i style={{ ...bar, top: 0, bottom: 0, width: thickness, ...(side === "l" ? { left: 0 } : { right: 0 }) }} />
    </span>
  );
}

function svgId(prefix: string, raw: string) {
  return `${prefix}-${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/** 四角闪星：四条内凹弧边，`size` 是中心到尖的距离。 */
function sparklePath(cx: number, cy: number, size: number) {
  const c = size * 0.16;
  return [
    `M${cx} ${cy - size}`,
    `Q${cx + c} ${cy - c} ${cx + size} ${cy}`,
    `Q${cx + c} ${cy + c} ${cx} ${cy + size}`,
    `Q${cx - c} ${cy + c} ${cx - size} ${cy}`,
    `Q${cx - c} ${cy - c} ${cx} ${cy - size}`,
    "Z",
  ].join(" ");
}

function starPoints(cx: number, cy: number, outer: number, inner: number, startDeg: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = ((startDeg + i * 36) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

/** 复古未来：青蓝天空、右下云团、左上几道淡光。 */
export function RetroSky({ palette: p = RETRO_DEFAULT_PALETTE }: { palette?: RetroPalette }) {
  const id = svgId("retro-sky", useId());
  return (
    <svg data-retro-sky="" className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="1" y2="0.55">
          <stop offset="0" stopColor={p.skyTop} />
          <stop offset="0.42" stopColor={p.skyMid} />
          <stop offset="1" stopColor={p.skyLow} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.3" cy="0.62" r="0.55">
          <stop offset="0" stopColor={p.glow} stopOpacity="0.55" />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-cloud`} x="-20%" y="-40%" width="140%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="11" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="70" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <rect width="1920" height="1080" fill={`url(#${id}-sky)`} />
      <rect width="1920" height="1080" fill={`url(#${id}-glow)`} />
      <g fill="#ffffff" opacity="0.6">
        <polygon points="500,-40 548,-40 400,190 386,190" />
        <polygon points="560,-40 590,-40 450,150 440,150" />
        <polygon points="640,-40 700,-40 520,240 500,240" opacity="0.6" />
      </g>
      <g filter={`url(#${id}-cloud)`} fill={p.cloud}>
        <ellipse cx="1560" cy="1040" rx="260" ry="90" />
        <ellipse cx="1760" cy="990" rx="170" ry="80" />
        <ellipse cx="1880" cy="1060" rx="200" ry="70" />
        <ellipse cx="1420" cy="1090" rx="200" ry="60" />
        <ellipse cx="20" cy="510" rx="90" ry="40" opacity="0.7" />
      </g>
    </svg>
  );
}

/** 复古未来：从人物身后横穿画面的橙色喷枪带，边缘是干刷颗粒。 */
export function RetroBrush({ palette: p = RETRO_DEFAULT_PALETTE }: { palette?: RetroPalette }) {
  const id = svgId("retro-brush", useId());
  return (
    <svg data-retro-brush="" className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
      <defs>
        <filter id={id} x="-10%" y="-60%" width="120%" height="220%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.03" numOctaves="3" seed="5" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="80" xChannelSelector="R" yChannelSelector="G" result="shape" />
          <feGaussianBlur in="shape" stdDeviation="9" result="soft" />
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="9" result="grit" />
          <feColorMatrix in="grit" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.4 -0.9" result="speck" />
          <feComposite in="soft" in2="speck" operator="arithmetic" k1="0.35" k2="0.85" k3="0" k4="0" />
        </filter>
        <radialGradient id={`${id}-sunset`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={p.sunset} />
          <stop offset="0.45" stopColor={p.sunsetMid} stopOpacity="0.95" />
          <stop offset="0.75" stopColor={p.sunsetEdge} stopOpacity="0.55" />
          <stop offset="1" stopColor={p.sunsetEdge} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="230" cy="720" rx="420" ry="260" fill={`url(#${id}-sunset)`} />
      <g filter={`url(#${id})`}>
        <path d="M-80 320 L700 345 L1050 372 L700 410 L-80 420 Z" fill={p.band} />
        <path d="M-80 650 L620 680 L980 740 L620 820 L-80 880 Z" fill={p.bandLow} />
        <path d="M-80 730 L560 735 L860 750 L560 780 L-80 800 Z" fill={p.bandLight} opacity="0.75" />
        <path d="M1650 448 L2000 438 L2000 470 L1650 462 Z" fill={p.streak} opacity="0.85" />
        <path d="M1700 712 L2000 690 L2000 770 L1700 742 Z" fill={p.streakLow} />
      </g>
    </svg>
  );
}

/** 复古未来：压在立绘左侧的夕阳暖光，把原画的冷色场景和手臂染成橙调。 */
export function RetroHaze({ palette: p = RETRO_DEFAULT_PALETTE }: { palette?: RetroPalette }) {
  const id = svgId("retro-haze", useId());
  return (
    <svg data-retro-haze="" className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
      <defs>
        <radialGradient id={`${id}-warm`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={p.haze} stopOpacity="0.55" />
          <stop offset="0.6" stopColor={p.hazeEdge} stopOpacity="0.3" />
          <stop offset="1" stopColor={p.hazeEdge} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={p.hazeRect} stopOpacity="0.4" />
          <stop offset="1" stopColor={p.hazeRect} stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="700" rx="380" ry="300" fill={`url(#${id}-warm)`} />
      <rect x="0" y="420" width="260" height="660" fill={`url(#${id}-edge)`} />
    </svg>
  );
}

/** 复古未来：人物头后的半透明大光圈，和左上一颗藕色小星球。 */
export function RetroHalo({ palette: p = RETRO_DEFAULT_PALETTE }: { palette?: RetroPalette }) {
  const id = svgId("retro-halo", useId());
  return (
    <svg data-retro-halo="" className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
      <defs>
        <radialGradient id={`${id}-disc`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={p.halo} stopOpacity="0.34" />
          <stop offset="0.86" stopColor={p.haloMid} stopOpacity="0.42" />
          <stop offset="1" stopColor={p.haloRim} stopOpacity="0.6" />
        </radialGradient>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <circle cx="620" cy="460" r="430" fill={`url(#${id}-disc)`} />
      <circle cx="1030" cy="268" r="58" fill={p.flare} opacity="0.75" filter={`url(#${id}-soft)`} />
      <circle cx="1062" cy="200" r="94" fill={p.planet} opacity="0.8" />
      <circle cx="1112" cy="206" r="28" fill={p.moon} opacity="0.9" />
    </svg>
  );
}

/** 复古未来：绕着人物和标题的两道细轨道，各挂一颗红球，再加几根放射细线。 */
export function RetroOrbits({ palette: p = RETRO_DEFAULT_PALETTE }: { palette?: RetroPalette }) {
  const id = svgId("retro-orbit", useId());
  const ball = (cx: number, cy: number, r: number) => (
    <g key={`${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-ball)`} filter={`url(#${id}-rough)`} />
      <circle cx={cx - r * 0.32} cy={cy + r * 0.3} r={r * 0.24} fill={p.ballSpot} />
    </g>
  );
  return (
    <svg data-retro-orbits="" className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" fill="none" aria-hidden>
      <defs>
        <radialGradient id={`${id}-ball`} cx="0.6" cy="0.35" r="0.75">
          <stop offset="0" stopColor={p.ballHi} />
          <stop offset="0.55" stopColor={p.ball} />
          <stop offset="1" stopColor={p.ballLow} />
        </radialGradient>
        <filter id={`${id}-rough`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="21" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.05  0 0 0 0 0.03  3 0 0 0 -1.5" result="speck" />
          <feComposite in="speck" in2="SourceAlpha" operator="in" result="grit" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="grit" />
          </feMerge>
        </filter>
        <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.cloud} />
          <stop offset="1" stopColor={p.ringLow} />
        </linearGradient>
      </defs>
      <g stroke={p.rays} strokeWidth="1.6" opacity="0.7">
        <line x1="640" y1="570" x2="1460" y2="90" />
        <line x1="640" y1="570" x2="1920" y2="330" />
        <line x1="640" y1="570" x2="1380" y2="1080" />
        <line x1="640" y1="570" x2="0" y2="640" />
        <line x1="640" y1="570" x2="160" y2="1080" />
      </g>
      <ellipse cx="1330" cy="500" rx="440" ry="340" transform="rotate(-12 1330 500)" stroke={`url(#${id}-ring)`} strokeWidth="7" />
      <path d="M300 1100 C110 990 80 760 237 662 S360 562 390 548" stroke={`url(#${id}-ring)`} strokeWidth="7" strokeLinecap="round" />
      {ball(1662, 231, 36)}
      {ball(237, 662, 35)}
    </svg>
  );
}

/** 复古未来：标题背后的橄榄绿长三角和斜放的红五角星，三角尖朝左上顺着人物动线。 */
export function RetroPennant({ palette: p = RETRO_DEFAULT_PALETTE }: { palette?: RetroPalette }) {
  const id = svgId("retro-pennant", useId());
  return (
    <svg data-retro-pennant="" className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1920 1080" aria-hidden>
      <defs>
        <linearGradient id={`${id}-green`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={p.pennant} />
          <stop offset="1" stopColor={p.pennantLow} />
        </linearGradient>
        <linearGradient id={`${id}-red`} x1="0" y1="0" x2="1" y2="0.2">
          <stop offset="0" stopColor={p.star} />
          <stop offset="0.6" stopColor={p.starMid} />
          <stop offset="1" stopColor={p.starTail} />
        </linearGradient>
        <linearGradient id={`${id}-wedge`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.wedge} />
          <stop offset="1" stopColor={p.wedgeHi} />
        </linearGradient>
      </defs>
      <polygon points="706,376 1745,276 1068,870" fill={p.pennantShade} opacity="0.55" transform="translate(8 10)" />
      <polygon points="700,369 1737,262 1062,862" fill={`url(#${id}-green)`} stroke={p.pennantRim} strokeWidth="6" strokeLinejoin="round" />
      <polygon points="1560,700 1700,590 1870,795" fill={`url(#${id}-wedge)`} />
      <polygon points={starPoints(1670, 420, 200, 85, -90)} fill={`url(#${id}-red)`} />
    </svg>
  );
}

/** 复古未来：白色四角星和奶油色三连圆点。 */
export function RetroSparkles({ palette: p = RETRO_DEFAULT_PALETTE }: { palette?: RetroPalette }) {
  const stars: [number, number, number][] = [
    [1275, 81, 30], [1131, 119, 24], [1412, 94, 28], [1550, 156, 22], [1012, 194, 20], [1419, 956, 25], [1550, 862, 18],
  ];
  const dots: [number, number, number][] = [
    [175, 106, 21], [231, 106, 21], [175, 162, 21], [1750, 919, 14], [1712, 956, 14], [1750, 956, 14],
  ];
  return (
    <svg data-retro-sparkles="" className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
      <g fill={p.sparkle} opacity="0.92">
        {stars.map(([x, y, s]) => (
          <path key={`${x}-${y}`} d={sparklePath(x, y, s)} />
        ))}
      </g>
      <g fill={p.dot} stroke={p.dotEdge} strokeWidth="2.5">
        {dots.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
      </g>
    </svg>
  );
}

/** 复古未来：整幅印刷颗粒，亮暗两层噪点，固定 seed，预览和导出一致。 */
export function RetroGrain({ palette: p = RETRO_DEFAULT_PALETTE }: { palette?: RetroPalette }) {
  const id = svgId("retro-grain", useId());
  return (
    <svg data-retro-grain="" className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
      <defs>
        <filter id={`${id}-dark`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="3" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.1  0 0 0 0 0.08  -2.2 0 0 0 1.05" />
        </filter>
        <filter id={`${id}-light`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="2" seed="17" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.98  0 0 0 0 0.92  2.2 0 0 0 -1.15" />
        </filter>
        <pattern id={`${id}-scan`} width="8" height="5" patternUnits="userSpaceOnUse">
          <rect width="8" height="1.6" fill={p.scan} opacity="0.07" />
        </pattern>
      </defs>
      <rect width="1920" height="1080" fill={`url(#${id}-scan)`} />
      <rect width="1920" height="1080" filter={`url(#${id}-dark)`} opacity="0.3" />
      <rect width="1920" height="1080" filter={`url(#${id}-light)`} opacity="0.28" />
    </svg>
  );
}

/* ───────── 卫戍协议式 HUD：两套模板共用，几何由模板传入，颜色来自 HudTone ───────── */

export type HudArea = [x: number, y: number, w: number, h: number];

/** 方格底：若干矩形区域里画细线方格。 */
export function HudGrid({ tone, areas, pitch = 60, width = 1.5 }: { tone: HudTone; areas: HudArea[]; pitch?: number; width?: number }) {
  const id = svgId("hud-grid", useId());
  return (
    <svg data-hud-grid="" className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
      <defs>
        <pattern id={id} width={pitch} height={pitch} patternUnits="userSpaceOnUse">
          <path d={`M ${pitch} 0 V ${pitch} M 0 ${pitch} H ${pitch}`} fill="none" stroke={tone.grid} strokeWidth={width} />
        </pattern>
      </defs>
      <g opacity={tone.gridOpacity}>
        {areas.map(([x, y, w, h]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
        ))}
      </g>
    </svg>
  );
}

export type HudRingSpec = { cx: number; cy: number; r: number; width: number; opacity?: number };

/** 粗圆环；`grain` 给白纸版加斑驳的印刷质感。 */
export function HudRings({ tone, rings, grain = false }: { tone: HudTone; rings: HudRingSpec[]; grain?: boolean }) {
  const id = svgId("hud-rings", useId());
  return (
    <svg data-hud-rings="" className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
      {grain ? (
        <defs>
          <filter id={id} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" seed="11" result="noise" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.9" result="speck" />
            <feComposite in="SourceGraphic" in2="speck" operator="in" />
          </filter>
        </defs>
      ) : null}
      <g fill="none" stroke={tone.ring} opacity={tone.ringOpacity} filter={grain ? `url(#${id})` : undefined}>
        {rings.map((ring) => (
          <circle key={`${ring.cx}-${ring.cy}-${ring.r}`} cx={ring.cx} cy={ring.cy} r={ring.r} strokeWidth={ring.width} opacity={ring.opacity ?? 1} />
        ))}
      </g>
    </svg>
  );
}

export type HudDialSpec = {
  cx: number;
  cy: number;
  /** 大号三位数所在半径 */
  r: number;
  size: number;
  /** 刻度线内外半径；整 30° 的长刻度从 `majorInner` 起 */
  tickInner: number;
  tickOuter: number;
  majorInner: number;
  /** 细圆周 */
  circles: number[];
  /** 小号数字：角度列表与半径 */
  small: number[];
  smallR: number;
  smallSize: number;
  /** 不画的角度区间，避开标题等主体 */
  skip?: [from: number, to: number][];
};

function dialPoint(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy + r * Math.cos(a)];
}

function dialSkipped(spec: HudDialSpec, deg: number) {
  const d = ((deg % 360) + 360) % 360;
  return (spec.skip ?? []).some(([from, to]) => (from <= to ? d >= from && d <= to : d >= from || d <= to));
}

/** 罗盘刻度盘：0 在正下方、顺着右侧往上增大；每个数字转 −角度，正上方 180 倒置。 */
export function HudDial({ tone, spec }: { tone: HudTone; spec: HudDialSpec }) {
  const { cx, cy } = spec;
  const ticks = Array.from({ length: 60 }, (_, i) => i * 6).filter((d) => !dialSkipped(spec, d));
  const majors = Array.from({ length: 12 }, (_, i) => i * 30).filter((d) => !dialSkipped(spec, d));
  const label = (d: number) => String(d).padStart(3, "0");
  return (
    <svg data-hud-dial="" className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1920 1080" aria-hidden>
      <g opacity={tone.dialOpacity}>
        <g fill="none" stroke={tone.dial} strokeWidth="2">
          {spec.circles.map((r) => (
            <circle key={r} cx={cx} cy={cy} r={r} />
          ))}
        </g>
        <g stroke={tone.dial} strokeLinecap="butt">
          {ticks.map((d) => {
            const major = d % 30 === 0;
            const [x1, y1] = dialPoint(cx, cy, major ? spec.majorInner : spec.tickInner, d);
            const [x2, y2] = dialPoint(cx, cy, spec.tickOuter, d);
            return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={major ? 6 : 3} />;
          })}
        </g>
        <g fontFamily="'Press Start 2P', monospace" textAnchor="middle" dominantBaseline="central">
          {majors.map((d) => {
            const [x, y] = dialPoint(cx, cy, spec.r, d);
            return (
              <g key={d} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${-d})`}>
                <text x={spec.size * 0.12} y={spec.size * 0.12} fontSize={spec.size} fill={tone.dialShadow}>
                  {label(d)}
                </text>
                <text fontSize={spec.size} fill={tone.dial}>
                  {label(d)}
                </text>
              </g>
            );
          })}
        </g>
        <g fontFamily="Oswald, 'Noto Sans SC', sans-serif" fontWeight="500" textAnchor="middle" dominantBaseline="central" fill={tone.dial}>
          {spec.small.map((d) => {
            const [x, y] = dialPoint(cx, cy, spec.smallR, d);
            const text = String(((d % 360) + 360) % 360);
            return (
              <text key={d} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${-d})`} fontSize={spec.smallSize}>
                {text}
              </text>
            );
          })}
        </g>
      </g>
    </svg>
  );
}

export type HudStroke = { d: string; width: number; color?: keyof Pick<HudTone, "frame" | "accent" | "accentDeep" | "dial" | "muted" | "paper">; opacity?: number; fill?: boolean };

/** 细框线、对角线、箭头：一组 path。 */
export function HudLines({ tone, strokes }: { tone: HudTone; strokes: HudStroke[] }) {
  return (
    <svg data-hud-lines="" className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
      {strokes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill={s.fill ? tone[s.color ?? "frame"] : "none"}
          stroke={s.fill ? "none" : tone[s.color ?? "frame"]}
          strokeWidth={s.width}
          strokeLinecap="square"
          opacity={s.opacity ?? 1}
        />
      ))}
    </svg>
  );
}

/** 像素块簇：`rows` 每个字符一格，a=强调色 d=深色 g=灰 p=纸色 k=字色，其余留空。 */
export type HudPixelCluster = { x: number; y: number; cell: number; rows: string[] };

const PIXEL_COLOR: Record<string, keyof HudTone> = { a: "accent", d: "accentDeep", g: "muted", p: "paper", k: "ink", f: "frame" };

export function HudPixels({ tone, clusters }: { tone: HudTone; clusters: HudPixelCluster[] }) {
  return (
    <svg data-hud-pixels="" className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
      {clusters.flatMap((c) =>
        c.rows.flatMap((row, j) =>
          [...row].map((ch, i) => {
            const key = PIXEL_COLOR[ch];
            if (!key) return null;
            return <rect key={`${c.x}-${c.y}-${i}-${j}`} x={c.x + i * c.cell} y={c.y + j * c.cell} width={c.cell} height={c.cell} fill={String(tone[key])} />;
          }),
        ),
      )}
    </svg>
  );
}

/** 全幅扫描线：`axis="x"` 为竖线（屏幕像素感），`"y"` 为横线。 */
export function HudScan({ tone, axis = "x", pitch = 4, line = 1.5 }: { tone: HudTone; axis?: "x" | "y"; pitch?: number; line?: number }) {
  const id = svgId("hud-scan", useId());
  return (
    <svg data-hud-scan="" className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
      <defs>
        <pattern id={id} width={axis === "x" ? pitch : 8} height={axis === "x" ? 8 : pitch} patternUnits="userSpaceOnUse">
          <rect width={axis === "x" ? line : 8} height={axis === "x" ? 8 : line} fill={tone.scan} />
        </pattern>
      </defs>
      <rect width="1920" height="1080" fill={`url(#${id})`} opacity={tone.scanOpacity} />
    </svg>
  );
}

/** 斜纹条：真实 DOM 背景，导出稳定。 */
export function HudHatch({ color, stripe = 7, gap = 9 }: { color: string; stripe?: number; gap?: number }) {
  return (
    <div
      data-hud-hatch=""
      className="h-full w-full"
      style={{ background: `repeating-linear-gradient(-45deg, ${color} 0 ${stripe}px, transparent ${stripe}px ${stripe + gap}px)` }}
    />
  );
}

// ---- 紫幕爆炸框 / 红蓝黑卡：漫画舞台 ----

/** 定种子的伪随机数，导出前后形状一致。 */
function seededUnit(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

const pts = (list: [number, number][]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** 舞台底：紫墙、左侧追光圆、几道浅色光片、右侧网点和细斜纹。 */
export function StageBackdrop({ tone }: { tone: StageTone }) {
  const id = svgId("stage-bg", useId());
  return (
    <svg data-stage-backdrop="" className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
      <defs>
        <radialGradient id={`${id}-spot`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={tone.light} stopOpacity="0.9" />
          <stop offset="0.82" stopColor={tone.light} stopOpacity="0.62" />
          <stop offset="1" stopColor={tone.light} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.5" stopColor={tone.deep} stopOpacity="0" />
          <stop offset="1" stopColor={tone.deep} stopOpacity="0.72" />
        </linearGradient>
        <pattern id={`${id}-dots`} width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
          <circle cx="5.5" cy="5.5" r="2.3" fill={tone.deep} />
        </pattern>
        <pattern id={`${id}-hatch`} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-34)">
          <rect width="2" height="16" fill={tone.light} />
        </pattern>
        <linearGradient id={`${id}-dotfade`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0.85" />
        </linearGradient>
        <mask id={`${id}-dotmask`}>
          <rect width="1920" height="1080" fill={`url(#${id}-dotfade)`} />
        </mask>
      </defs>
      <rect width="1920" height="1080" fill={tone.base} />
      <path d="M0 250 L980 70 L760 1080 L0 1080 Z" fill={tone.mid} opacity="0.55" />
      <circle cx="235" cy="640" r="330" fill={`url(#${id}-spot)`} />
      <g fill={tone.light} opacity="0.34">
        <path d="M120 1080 L420 560 L560 610 L420 1080 Z" />
        <path d="M660 1080 L760 640 L880 700 L900 1080 Z" />
        <path d="M0 470 L80 430 L140 520 L210 455 L250 600 L0 640 Z" />
      </g>
      <rect width="1920" height="1080" fill={`url(#${id}-shade)`} />
      <g mask={`url(#${id}-dotmask)`}>
        <rect width="1920" height="1080" fill={`url(#${id}-dots)`} opacity="0.5" />
        <rect width="1920" height="1080" fill={`url(#${id}-hatch)`} opacity="0.12" />
      </g>
    </svg>
  );
}

/** 顶部暗色斜条：浅紫汽车剪影，条边两行重复英文小字。 */
export function StageBand({ tone, text }: { tone: StageTone; text: string }) {
  const row = `${(text.trim() || "THREE OPERATOR").toUpperCase()}   ✦   `.repeat(5);
  return (
    <svg data-stage-band="" className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1920 1080" aria-hidden>
      <path d="M0 0 L1120 0 L1070 58 L0 238 Z" fill={tone.deep} opacity="0.92" />
      <path d="M1460 0 L1920 0 L1920 92 L1490 30 Z" fill={tone.deep} opacity="0.8" />
      <g transform="translate(150 118) rotate(-9.6) scale(1.05)" fill={tone.mid}>
        <path d="M0 72 L18 44 L84 38 L126 6 L236 4 L282 38 L328 44 L340 74 L304 80 A23 23 0 0 0 258 80 L92 82 A23 23 0 0 0 46 82 L0 80 Z" />
        <circle cx="69" cy="84" r="19" />
        <circle cx="281" cy="82" r="19" />
        <path d="M136 14 L178 12 L178 38 L104 40 Z M192 12 L232 12 L262 38 L192 38 Z" fill={tone.deep} />
      </g>
      <g fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="17" letterSpacing="2.4" fill={tone.light}>
        <text transform="translate(12 268) rotate(-9.6)" opacity="0.75">
          {row}
        </text>
        <text transform="translate(-260 196) rotate(-9.6)" opacity="0.4">
          {row}
        </text>
        <text transform="translate(1515 58) rotate(4)" opacity="0.55" fontSize="14">
          {row}
        </text>
      </g>
    </svg>
  );
}

/** 左下观众席：几把高背椅剪影，和墙上的灰色箭头、淡闪星。 */
export function StageCrowd({ tone }: { tone: StageTone }) {
  const chair = (x: number, y: number, s: number, rot: number, key: number) => (
    <g key={key} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M14 8 Q26 -14 44 -6 Q60 -24 76 -6 Q94 -14 106 8 L112 150 L8 150 Z" fill={tone.ink} />
      <path d="M26 20 Q60 2 94 20 L98 132 L22 132 Z" fill="none" stroke={tone.edge} strokeWidth="3" opacity="0.55" />
      <path d="M38 34 V120 M60 28 V120 M82 34 V120" stroke={tone.deep} strokeWidth="5" opacity="0.8" />
      <path d="M-8 150 H128 Q132 172 120 184 H0 Q-12 172 -8 150 Z" fill={tone.ink} />
      <path d="M8 184 Q2 220 -6 250 M112 184 Q118 220 126 250" fill="none" stroke={tone.ink} strokeWidth="9" />
    </g>
  );
  return (
    <svg data-stage-crowd="" className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1920 1080" aria-hidden>
      <g opacity="0.94">
        {chair(-30, 800, 0.9, -16, 0)}
        {chair(70, 880, 0.95, -8, 1)}
        {chair(196, 948, 1, 2, 2)}
        {chair(-56, 950, 1.05, -12, 3)}
      </g>
      <g fill={tone.gray} opacity="0.55">
        <path d="M40 368 L150 360 L148 336 L196 380 L152 420 L150 396 L42 402 Z" />
        <path d="M1080 1040 L1180 1000 L1172 980 L1226 990 L1196 1036 L1188 1016 L1090 1060 Z" opacity="0.6" />
      </g>
      <g fill={tone.light} opacity="0.5">
        <path d={sparklePath(118, 168, 14)} />
        <path d={sparklePath(668, 1004, 12)} />
        <path d={sparklePath(1830, 640, 16)} />
      </g>
    </svg>
  );
}

export type TargetDiscSpec = { cx: number; cy: number; r: number };

/** 靶心圆盘：奶黄粗环、红色圆盘、白色锯齿圈和紫色笔刷斜条，边缘做毛。 */
export function TargetDisc({ tone, spec }: { tone: StageTone; spec: TargetDiscSpec }) {
  const id = svgId("target-disc", useId());
  const { cx, cy, r } = spec;
  const dx = cx - r * 0.07;
  const dy = cy - r * 0.03;
  const disc = r * 0.87;
  const teeth: [number, number][][] = [];
  for (let a = 198; a <= 300; a += 12.5) {
    teeth.push([polar(dx, dy, disc * 0.95, a - 5), polar(dx, dy, disc * 0.95, a + 5), polar(dx, dy, disc * 0.76, a)]);
  }
  return (
    <svg data-target-disc="" className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1920 1080" aria-hidden>
      <defs>
        <filter id={`${id}-rough`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <circle cx={dx} cy={dy} r={disc} />
        </clipPath>
      </defs>
      <g filter={`url(#${id}-rough)`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={tone.cream} strokeWidth={r * 0.115} strokeDasharray={`${r * 1.9} ${r * 0.09} ${r * 1.15} ${r * 0.06} ${r * 2.6} ${r * 0.12}`} />
        <circle cx={dx} cy={dy} r={disc} fill={tone.red} />
        <g clipPath={`url(#${id}-clip)`}>
          <circle cx={dx + disc * 0.86} cy={dy + disc * 0.3} r={disc * 0.5} fill={tone.mid} />
          <g transform={`rotate(-34 ${dx} ${dy})`}>
            <rect x={dx - disc} y={dy + disc * 0.2} width={disc * 2} height={disc * 0.13} fill={tone.edge} opacity="0.9" />
            <rect x={dx - disc} y={dy + disc * 0.42} width={disc * 2} height={disc * 0.07} fill={tone.blue} />
            <rect x={dx - disc} y={dy - disc * 0.08} width={disc * 2} height={disc * 0.05} fill={tone.blue} opacity="0.8" />
          </g>
          <path
            d={`M${pts([polar(dx, dy, disc * 0.76, 186)])} A${disc * 0.76} ${disc * 0.76} 0 0 1 ${pts([polar(dx, dy, disc * 0.76, 318)])}`}
            fill="none"
            stroke={tone.edge}
            strokeWidth={disc * 0.09}
          />
          {teeth.map((t, i) => (
            <polygon key={i} points={pts(t)} fill={tone.cream} />
          ))}
        </g>
      </g>
      <g fill={tone.red}>
        <circle cx={cx - r * 0.73} cy={cy - r * 0.58} r={r * 0.066} />
        <circle cx={cx - r * 0.58} cy={cy - r * 0.5} r={r * 0.036} />
        <rect x={cx + r * 0.8} y={cy - r * 0.66} width={r * 0.13} height={r * 0.13} transform={`rotate(22 ${cx + r * 0.86} ${cy - r * 0.6})`} />
      </g>
      <g transform={`translate(${cx + r * 0.62} ${cy - r * 0.34}) rotate(12)`}>
        <rect x={-r * 0.1} y={-r * 0.1} width={r * 0.2} height={r * 0.2} fill={tone.red} />
        <path d={`M${r * 0.045} ${-r * 0.06} L${-r * 0.045} 0 L${r * 0.045} ${r * 0.06}`} fill="none" stroke={tone.cream} strokeWidth={r * 0.03} />
      </g>
    </svg>
  );
}

export type ComicBurstSpec = { cx: number; cy: number; outer: number; inner: number; spikes?: number; seed?: number };

/** 爆炸框：黑色尖刺多边形，左上错出一层浅紫边，下方几道放射虚线。 */
export function ComicBurst({ tone, spec }: { tone: StageTone; spec: ComicBurstSpec }) {
  const { cx, cy, outer, inner, spikes = 24, seed = 7 } = spec;
  const rnd = seededUnit(seed);
  const step = 360 / spikes;
  const ring: [number, number][] = [];
  for (let i = 0; i < spikes; i += 1) {
    const a = -90 + i * step + (rnd() - 0.5) * step * 0.5;
    ring.push(polar(cx, cy, outer * (0.84 + rnd() * 0.22), a));
    ring.push(polar(cx, cy, inner * (0.88 + rnd() * 0.2), a + step * (0.42 + rnd() * 0.16)));
  }
  const rays = Array.from({ length: 16 }, (_, i) => {
    const a = 70 + i * 7 + (rnd() - 0.5) * 4;
    return [polar(cx, cy, outer * 1.02, a), polar(cx, cy, outer * (1.12 + rnd() * 0.16), a)];
  });
  return (
    <svg data-comic-burst="" className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1920 1080" aria-hidden>
      <polygon points={pts(ring)} fill={tone.edge} transform="translate(-18 -14)" />
      <polygon points={pts(ring)} fill={tone.ink} />
      <g stroke={tone.light} strokeWidth="3" strokeDasharray="16 10" opacity="0.55">
        {rays.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
        ))}
      </g>
    </svg>
  );
}

/** 爆炸框周围的贴纸：红闪电、红色尖星、浅棕四角星、紫色拼图和光标徽章。 */
export function ComicStickers({ tone }: { tone: StageTone }) {
  const jag = (x: number, y: number, r: number, key: number) => (
    <polygon key={key} points={starPoints(x, y, r, r * 0.5, -90)} fill={tone.red} />
  );
  return (
    <svg data-comic-stickers="" className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1920 1080" aria-hidden>
      <g transform="translate(222 288)">
        <path d="M56 0 L104 0 L76 54 L108 54 L24 150 L48 80 L14 80 Z" fill={tone.edge} transform="translate(-12 8)" />
        <path d="M56 0 L104 0 L76 54 L108 54 L24 150 L48 80 L14 80 Z" fill={tone.red} />
      </g>
      {jag(498, 246, 36, 0)}
      {jag(584, 236, 40, 1)}
      <g fill={tone.ink}>
        <circle cx="498" cy="250" r="6" />
        <circle cx="584" cy="240" r="6" />
      </g>
      <g fill={tone.tan}>
        <path d={sparklePath(292, 456, 38)} />
        <path d={sparklePath(772, 884, 30)} />
        <path d={sparklePath(408, 206, 18)} />
      </g>
      <path
        d="M470 870 h28 a14 14 0 1 1 26 0 h28 v28 a14 14 0 1 0 0 26 v28 h-28 a14 14 0 1 1 -26 0 h-28 v-28 a14 14 0 1 0 0 -26 Z"
        fill={tone.blue}
        transform="rotate(-12 511 911)"
      />
      <g transform="translate(902 742)">
        <polygon points={starPoints(0, 0, 98, 62, -90)} fill={tone.tan} transform="rotate(14)" />
        <circle r="70" fill={tone.blue} />
        <path d="M-26 -30 L30 -6 L6 2 L22 26 L12 32 L-4 8 L-20 22 Z" fill={tone.cream} />
      </g>
    </svg>
  );
}

/** 红蓝黑卡底：暗色舞台、几团虚化暗影和左侧大网点。 */
export function BrushBackdrop({ tone }: { tone: BrushTone }) {
  const id = svgId("brush-bg", useId());
  return (
    <svg data-brush-backdrop="" className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
      <defs>
        <radialGradient id={`${id}-glow`} cx="0.24" cy="0.42" r="0.7">
          <stop offset="0" stopColor={tone.dusk} />
          <stop offset="1" stopColor={tone.base} />
        </radialGradient>
        <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
        <pattern id={`${id}-dots`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <circle cx="7" cy="7" r="3.4" fill="#000" />
        </pattern>
        <linearGradient id={`${id}-dotfade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="0.75" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.6" />
        </linearGradient>
        <mask id={`${id}-dotmask`}>
          <rect width="1920" height="1080" fill={`url(#${id}-dotfade)`} />
        </mask>
      </defs>
      <rect width="1920" height="1080" fill={`url(#${id}-glow)`} />
      <g filter={`url(#${id}-blur)`} opacity="0.75">
        <ellipse cx="180" cy="300" rx="190" ry="120" fill="#4a2a33" />
        <ellipse cx="560" cy="520" rx="220" ry="160" fill="#2e1c26" />
        <ellipse cx="1180" cy="160" rx="200" ry="150" fill="#3a2e34" />
        <ellipse cx="1760" cy="700" rx="200" ry="260" fill="#1f1830" />
        <rect x="60" y="560" width="260" height="40" fill="#5a3a3c" transform="rotate(-8 190 580)" />
      </g>
      <rect width="1920" height="1080" fill={`url(#${id}-dots)`} mask={`url(#${id}-dotmask)`} opacity="0.55" />
    </svg>
  );
}

/** 干笔刷大斜道：红、紫、蓝几层，用拉长的噪点挖出飞白。 */
export function BrushStrokes({ tone }: { tone: BrushTone }) {
  const id = svgId("brush-strokes", useId());
  /** 横向笔道（y, x1, x2, 宽），整组旋转 -16°，飞白噪点跟着笔道方向走。 */
  const strokes: { y: number; x1: number; x2: number; w: number; c: string; o?: number }[] = [
    { y: -200, x1: -200, x2: 900, w: 46, c: tone.blue, o: 0.75 },
    { y: -128, x1: -260, x2: 1120, w: 120, c: tone.red, o: 0.9 },
    { y: -40, x1: -200, x2: 640, w: 36, c: tone.violet, o: 0.7 },
    { y: 600, x1: -300, x2: 720, w: 210, c: tone.red, o: 0.92 },
    { y: 735, x1: -300, x2: 820, w: 120, c: tone.violet, o: 0.88 },
    { y: 850, x1: -220, x2: 1000, w: 130, c: tone.red, o: 0.9 },
    { y: 935, x1: 0, x2: 1120, w: 60, c: tone.blue, o: 0.8 },
    { y: 369, x1: 1320, x2: 2300, w: 96, c: tone.red, o: 0.9 },
    { y: 444, x1: 1460, x2: 2300, w: 40, c: tone.violet, o: 0.8 },
    { y: 1020, x1: 1300, x2: 2200, w: 44, c: tone.blue, o: 0.8 },
    { y: 1100, x1: 1100, x2: 2300, w: 150, c: tone.violet, o: 0.88 },
    { y: 1200, x1: 1200, x2: 2300, w: 80, c: tone.red, o: 0.92 },
  ];
  return (
    <svg data-brush-strokes="" className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1920 1080" aria-hidden>
      <defs>
        <filter id={`${id}-dry`} x="-20%" y="-30%" width="140%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.003 0.035" numOctaves="3" seed="4" result="streak" />
          <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.6 -0.62" result="mask" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" result="dry" />
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="9" result="wobble" />
          <feDisplacementMap in="dry" in2="wobble" scale="30" />
        </filter>
      </defs>
      <g transform="rotate(-16 960 540)">
        <g filter={`url(#${id}-dry)`} fill="none" strokeLinecap="round">
          {strokes.map((s, i) => (
            <path key={i} d={`M${s.x1} ${s.y} L${s.x2} ${s.y}`} stroke={s.c} strokeWidth={s.w} opacity={s.o ?? 1} />
          ))}
        </g>
      </g>
    </svg>
  );
}

export type SawDiscSpec = { cx: number; cy: number; r: number };

/** 人物后的红色圆盘：内圈一道暗红八角框，右缘一列朝内的红三角，旁边一根光圈刻度尺。 */
export function SawDisc({ tone, spec }: { tone: BrushTone; spec: SawDiscSpec }) {
  const id = svgId("saw-disc", useId());
  const { cx, cy, r } = spec;
  const octagon = Array.from({ length: 8 }, (_, i) => polar(cx, cy, r * 0.8, 22.5 + i * 45));
  const teeth = [0, 1, 2, 3, 4].map((i) => {
    const tx = cx + r * 0.88 + i * r * 0.097;
    const ty = cy - r * 0.54 + i * r * 0.176;
    return [
      [tx + r * 0.09, ty - r * 0.08],
      [tx + r * 0.09, ty + r * 0.08],
      [tx - r * 0.09, ty],
    ] as [number, number][];
  });
  const gx = cx + r * 0.99;
  const gy = cy - r * 0.18;
  const stops = ["22", "16", "11", "8", "5.6", "4", "2.8", "2"];
  return (
    <svg data-saw-disc="" className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1920 1080" aria-hidden>
      <defs>
        <filter id={`${id}-rough`} x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="12" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="46" />
        </filter>
        <radialGradient id={`${id}-shade`} cx="0.45" cy="0.4" r="0.6">
          <stop offset="0.55" stopColor={tone.base} stopOpacity="0" />
          <stop offset="1" stopColor={tone.base} stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <g filter={`url(#${id}-rough)`}>
        <circle cx={cx} cy={cy} r={r} fill={tone.red} opacity="0.92" />
        <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-shade)`} />
        <polygon points={pts(octagon)} fill="none" stroke={tone.redDeep} strokeWidth={r * 0.1} opacity="0.85" />
        <path d={`M${cx - r * 0.2} ${cy - r * 1.02} L${cx + r * 0.95} ${cy + r * 0.5}`} stroke={tone.violet} strokeWidth={r * 0.18} opacity="0.65" />
        <path d={`M${cx - r * 0.95} ${cy + r * 0.1} L${cx + r * 0.5} ${cy + r * 1.05}`} stroke={tone.blue} strokeWidth={r * 0.12} opacity="0.55" />
        <path d={`M${cx + r * 0.73} ${cy - r * 0.69} Q${cx + r * 1.13} ${cy - r * 0.1} ${cx + r * 1.11} ${cy + r * 0.83}`} fill="none" stroke="#262270" strokeWidth={r * 0.12} opacity="0.9" />
      </g>
      {teeth.map((t, i) => (
        <polygon key={i} points={pts(t)} fill={tone.red} />
      ))}
      <g transform={`translate(${gx} ${gy})`}>
        <rect x="-6" y="0" width="58" height={r * 1.02} fill={tone.blue} opacity="0.85" />
        <rect x="0" y="0" width="22" height="44" fill="#7fe0c0" />
        <rect x="2" y={r * 0.86} width="20" height="40" fill={tone.neon} opacity="0.9" />
        <line x1="-4" y1={r * 0.43} x2="70" y2={r * 0.43} stroke={tone.paper} strokeWidth="3" />
        <g fill={tone.paper} fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="15" textAnchor="end">
          {stops.map((s, i) => (
            <text key={s} x="44" y={64 + i * ((r * 0.8) / stops.length)}>
              {s}
            </text>
          ))}
        </g>
        <g stroke={tone.paper} strokeWidth="2" opacity="0.8">
          {Array.from({ length: 16 }, (_, i) => (
            <line key={i} x1="48" x2={i % 2 ? 54 : 60} y1={58 + i * ((r * 0.8) / 16)} y2={58 + i * ((r * 0.8) / 16)} />
          ))}
        </g>
      </g>
    </svg>
  );
}

export type NeonCardSpec = { x: number; y: number; w: number; h: number; rotate: number; offset: number };

/** 黑卡：向左下错出一道霓虹黄边，边外两片黄色网点。 */
export function NeonCard({ tone, spec }: { tone: BrushTone; spec: NeonCardSpec }) {
  const { w, h, offset } = spec;
  const dots = (c: string) => `radial-gradient(circle, ${c} 34%, transparent 38%)`;
  return (
    <div data-neon-card="" className="absolute" style={{ left: spec.x, top: spec.y, width: w, height: h, transform: `rotate(${spec.rotate}deg)`, transformOrigin: "0 0" }}>
      <div
        className="absolute"
        style={{ left: -offset - 70, top: h * 0.62, width: 160, height: h * 0.5, backgroundImage: dots(tone.neon), backgroundSize: "11px 11px", opacity: 0.75, WebkitMaskImage: "linear-gradient(90deg, transparent, #000 40%, transparent)", maskImage: "linear-gradient(90deg, transparent, #000 40%, transparent)" }}
      />
      <div
        className="absolute"
        style={{ left: w * 0.32, top: h + offset - 8, width: w * 0.6, height: 70, backgroundImage: dots(tone.neon), backgroundSize: "11px 11px", opacity: 0.7, WebkitMaskImage: "linear-gradient(180deg, #000, transparent)", maskImage: "linear-gradient(180deg, #000, transparent)" }}
      />
      <div className="absolute" style={{ left: -offset, top: offset, width: w, height: h, border: `9px solid ${tone.neon}`, boxShadow: `0 0 18px rgba(229, 255, 46, 0.35)` }} />
      <div className="absolute inset-0" style={{ background: tone.ink, boxShadow: "0 24px 50px rgba(0,0,0,0.55)" }} />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 30%, transparent 34%)", backgroundSize: "7px 7px" }}
      />
    </div>
  );
}

/** 黑卡周围的小件：星星、箭头、警示三角、红色印章、圆脸图标（画布坐标）。 */
export function CardBadges({ tone }: { tone: BrushTone }) {
  const seal = (x: number, y: number, r: number, key: number) => (
    <g key={key} transform={`translate(${x} ${y})`}>
      <polygon points={pts(Array.from({ length: 24 }, (_, i) => polar(0, 0, i % 2 ? r * 0.84 : r, i * 15)))} fill={tone.red} />
      <path d={`M${-r * 0.4} ${-r * 0.35} L${r * 0.45} ${r * 0.35} M${r * 0.1} ${r * 0.38} l${r * 0.36} ${-r * 0.02}`} stroke={tone.paper} strokeWidth={r * 0.08} fill="none" />
      <circle cx={-r * 0.42} cy={-r * 0.38} r={r * 0.12} fill="none" stroke={tone.paper} strokeWidth={r * 0.07} />
    </g>
  );
  const warn = (x: number, y: number, s: number, key: number) => (
    <g key={key} transform={`translate(${x} ${y}) rotate(-8)`}>
      <rect x={-s / 2} y={-s / 2} width={s} height={s} fill={tone.blue} />
      <path d={`M0 ${-s * 0.3} L${s * 0.32} ${s * 0.26} H${-s * 0.32} Z`} fill={tone.paper} />
      <rect x={-s * 0.04} y={-s * 0.08} width={s * 0.08} height={s * 0.18} fill={tone.blue} />
    </g>
  );
  const arrow = (x: number, y: number, dir: 1 | -1, key: number) => (
    <path key={key} d={`M${x} ${y} h${dir * 34} m${-dir * 16} -18 l${dir * 18} 18 l${-dir * 18} 18`} fill="none" stroke={tone.paper} strokeWidth="9" strokeLinejoin="miter" />
  );
  return (
    <svg data-card-badges="" className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1920 1080" aria-hidden>
      <polygon points={starPoints(400, 244, 42, 18, -90)} fill={tone.cream} transform="rotate(-10 400 244)" />
      <polygon points={starPoints(912, 748, 20, 8, -90)} fill={tone.cream} />
      <polygon points={starPoints(316, 314, 18, 8, -90)} fill={tone.red} />
      {seal(276, 712, 56, 0)}
      {seal(936, 206, 42, 1)}
      {warn(958, 418, 66, 2)}
      {warn(396, 834, 30, 3)}
      {warn(920, 830, 30, 4)}
      {arrow(262, 578, 1, 5)}
      {arrow(962, 518, -1, 6)}
      <g transform="translate(464 834)" fill="none" stroke={tone.paper} strokeWidth="3">
        <circle r="22" />
        <circle cx="-7" cy="-2" r="2.5" fill={tone.paper} />
        <circle cx="7" cy="-2" r="2.5" fill={tone.paper} />
        <path d="M-8 9 h16" />
      </g>
    </svg>
  );
}

/** 棋盘格衬底：紫黑小方格，两端略淡出。 */
export function CheckerPlate({ a, b, cell = 13 }: { a: string; b: string; cell?: number }) {
  const fade = "linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)";
  return (
    <div
      data-checker-plate=""
      className="h-full w-full"
      style={{
        backgroundImage: `repeating-conic-gradient(${a} 0 25%, ${b} 0 50%)`,
        backgroundSize: `${cell * 2}px ${cell * 2}px`,
        WebkitMaskImage: fade,
        maskImage: fade,
      }}
    />
  );
}
