import { useId } from "react";
import { findOperator, operatorSkills, skillUrl, type OperatorSkill } from "../data/arts";
import type { BlueCutPalette } from "../lib/blueCutPalette";
import { useCdnSrc } from "../lib/cdn";
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
