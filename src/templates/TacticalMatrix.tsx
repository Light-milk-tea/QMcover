import { useId, type CSSProperties } from "react";
import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { useCdnSrc } from "../lib/cdn";
import { bgGradeFilter } from "../lib/effects";
import { isMatrixEmber, isMatrixViolet, matrixPalette, storeMatrixColorway } from "../lib/matrixPalette";
import type { CoverRenderProps } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";
import { FilmGrain, FloatingSparks, MineralSurface, PrismaticReflections, VioletBloom, VioletGrade } from "./TacticalMatrixAtmosphere";

function Orbits() {
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

function Embers() {
  return <svg viewBox="0 0 1920 1080" className="h-full w-full" aria-hidden>
    {Array.from({ length: 92 }, (_, i) => {
      const x = (i * 283 + 79) % 1920;
      const y = (i * i * 31 + 167) % 1080;
      return <ellipse key={i} cx={x} cy={y} rx={i % 11 === 0 ? 2.5 : 1} ry={i % 11 === 0 ? 6 : 2} transform={`rotate(32 ${x} ${y})`} fill={i % 5 === 0 ? "#ffe2bb" : "currentColor"} opacity={i % 11 === 0 ? .85 : .28} />;
    })}
  </svg>;
}

/** Keep the code's tall letterforms while fitting long Latin or CJK input. */
function codeWidth(text: string) {
  return [...text].reduce((sum, char) => sum + ((char.codePointAt(0) ?? 0) > 127 ? 1.12 : /[1Iil]/.test(char) ? .3 : .56), 0);
}

// Smooth, mostly opaque ink: localized highlights and a saturated lower wash.
// A small amount of alpha lets the illustration tint the ink without cutting
// clear silhouettes through the letters.
function layeredInk(tint: string): CSSProperties {
  return {
    backgroundImage: `radial-gradient(ellipse at 22% 73%, color-mix(in srgb, currentColor 48%, transparent), transparent 43%), radial-gradient(ellipse at 78% 36%, color-mix(in srgb, currentColor 65%, transparent), transparent 42%), linear-gradient(164deg, currentColor 16%, color-mix(in srgb, currentColor 93%, ${tint}) 34%, color-mix(in srgb, color-mix(in srgb, currentColor 60%, ${tint}) 94%, transparent) 53%, color-mix(in srgb, color-mix(in srgb, currentColor 24%, ${tint}) 91%, transparent) 78%, color-mix(in srgb, currentColor 46%, ${tint}) 96%)`,
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };
}

function captionInk(tint: string): CSSProperties {
  return {
    backgroundImage: `linear-gradient(168deg, color-mix(in srgb, currentColor 90%, ${tint}) 20%, color-mix(in srgb, currentColor 74%, ${tint}) 58%, color-mix(in srgb, currentColor 58%, ${tint}) 100%)`,
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };
}

function MatrixText({ text, tint, depth, stage = false, caption = false }: { text: string; tint: string; depth: string; stage?: boolean; caption?: boolean }) {
  const depthId = `matrix-depth-${useId().replace(/:/g, "")}`;
  return <span className="relative inline-block" style={stage ? { transform: "scale(.92, 1.17)", transformOrigin: "center top" } : undefined}>
    {caption ? null : <>
      <svg width="0" height="0" className="absolute" aria-hidden><defs>
        {/* Outline the painted silhouette, avoiding seams between CJK contours. */}
        <filter id={depthId} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius={stage ? 2.5 : .9} result="expanded" />
          <feComposite in="expanded" in2="SourceAlpha" operator="out" result="edge" />
          <feFlood floodColor={depth} />
          <feComposite in2="edge" operator="in" />
        </filter>
      </defs></svg>
      <span data-matrix-depth aria-hidden className="pointer-events-none absolute inset-0" style={{
        color: depth, filter: `url(#${depthId})`,
        transform: "translate(max(1px, .007em), max(2px, .012em))", opacity: .85,
      }}>{text}</span>
    </>}
    <span data-matrix-ink data-matrix-caption={caption ? "" : undefined} data-stage-face={stage ? "" : undefined} className="relative" style={caption ? captionInk(tint) : layeredInk(tint)}>{text}</span>
  </span>;
}

export function TacticalMatrix(props: CoverRenderProps) {
  const theme = storeMatrixColorway(props.colorway);
  const ember = isMatrixEmber(theme);
  const violet = isMatrixViolet(theme);
  const rich = !ember;
  const gradeId = `matrix-grade-${useId().replace(/:/g, "")}`;
  const palette = matrixPalette(theme);
  const styles = props.elementStyles;
  const stage = elementText(styles, "stage", props.title);
  const squad = elementText(styles, "squad", props.subtitle);
  const mark = elementText(styles, "mark", props.mark);
  const operation = elementText(styles, "operation", props.signature);
  const side = elementText(styles, "side-note", "OPERATION RECORD");
  const bg = useCdnSrc(getBgPreset(props.bgPreset).url ?? "");
  return <div data-tactical-matrix-canvas data-colorway={theme} className="relative h-full w-full overflow-hidden" style={{ background: palette.base, isolation: "isolate", "--matrix-art-filter": violet ? `url(#${gradeId})` : "none" } as CSSProperties}>
    {violet ? <VioletGrade id={gradeId} /> : null}
    {bg.src ? <img src={bg.src} onLoad={bg.onLoad} onError={bg.onError} alt="" crossOrigin="anonymous" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ filter: bgGradeFilter(props.effects?.bgGrade) }} /> : null}
    <CoverElement id="mineral" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: 0 }}><MineralSurface violet={rich} /></CoverElement>
    <CoverElement id="orbits" kind="box" className="pointer-events-none absolute inset-0" style={{ color: palette.accent, zIndex: 1 }}><Orbits /></CoverElement>
    <BgDimLayer on={props.bgDim} amount={props.bgDimAmount} at="78% 48%" />
    <div data-matrix-operator className="pointer-events-none absolute inset-y-0 left-[-400px] w-[2240px]" style={{ zIndex: 2 }}>
      <OperatorLayer {...props} fadeRight fadeRightSolid={78} objectPosition="center center" className="h-full w-full" />
    </div>
    <CoverElement id="glow" kind="box" className="pointer-events-none absolute inset-0" style={{ color: palette.glow, zIndex: 3 }}>
      {violet ? <VioletBloom /> : <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 42% 32% at 0% 0%, currentColor, transparent 85%), radial-gradient(ellipse 36% 30% at 103% 104%, currentColor, transparent 90%)", opacity: .7 }} />}
    </CoverElement>
    {rich ? <CoverElement id="prism" kind="box" className="pointer-events-none absolute inset-0" style={{ mixBlendMode: "multiply", opacity: .95, zIndex: 4 }}><PrismaticReflections {...props} /></CoverElement> : null}
    <CoverElement id="embers" kind="box" className="pointer-events-none absolute inset-0" style={{ color: palette.accent, zIndex: 4 }}>{violet ? <FloatingSparks /> : <Embers />}</CoverElement>
    {rich ? <CoverElement id="film" kind="box" className="pointer-events-none absolute inset-0" style={{ opacity: .11, zIndex: 5 }}><FilmGrain /></CoverElement> : null}
    <CoverElement id="mark" defaultFontSize={Math.min(48, 650 / Math.max(mark.length + 2, 1))} className="absolute top-[78px] left-[1060px] w-[700px] text-center font-black whitespace-nowrap" style={{ color: palette.paper, zIndex: 6 }}>
      <MatrixText text={mark ? `-  ${mark}  -` : ""} tint={palette.ink} depth={palette.depth} />
    </CoverElement>
    <CoverElement id="squad" defaultFontSize={Math.min(174, 630 / Math.max(squad.length, 1))} className="absolute top-[243px] left-[1060px] w-[700px] text-center font-black whitespace-nowrap" style={{ color: palette.paper, lineHeight: 1.2, zIndex: 6 }}>
      <MatrixText text={squad} tint={palette.ink} depth={palette.depth} />
    </CoverElement>
    <CoverElement id="stage" defaultFont="display" defaultFontSize={Math.min(360, 780 / Math.max(codeWidth(stage), 1))} className="absolute top-[383px] left-[1060px] w-[700px] text-center font-bold whitespace-nowrap" style={{ color: violet ? "#ffffff" : palette.paper, lineHeight: 1.1, zIndex: 6 }}>
      <MatrixText text={stage} tint={palette.ink} depth={palette.depth} stage />
    </CoverElement>
    <CoverElement id="operation" defaultFontSize={Math.min(60, 720 / Math.max(operation.length + 2, 1))} className="absolute top-[926px] left-[1060px] w-[700px] text-center font-black whitespace-nowrap" style={{ color: palette.paper, zIndex: 6 }}>
      <MatrixText text={operation ? `-  ${operation}  -` : ""} tint={palette.ink} depth={palette.depth} caption />
    </CoverElement>
    <CoverElement id="side-bar" kind="box" className="absolute top-[426px] left-[1828px] h-[240px] w-[18px]" style={{ color: palette.accent, background: "currentColor", opacity: .7, zIndex: 5 }} />
    <CoverElement id="side-note" defaultFont="display" defaultFontSize={16} className="absolute top-[440px] left-[1826px] font-bold whitespace-nowrap" style={{ color: palette.paper, writingMode: "vertical-rl", zIndex: 6 }}>{side}</CoverElement>
  </div>;
}
