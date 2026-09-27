import { useId, type CSSProperties } from "react";
import { CornerGlow, Embers, TacticalOrbits } from "../canvas/DecorArt";
import { MatrixText } from "../canvas/TextFaces";
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

/** Keep the code's tall letterforms while fitting long Latin or CJK input. */
function codeWidth(text: string) {
  return [...text].reduce((sum, char) => sum + ((char.codePointAt(0) ?? 0) > 127 ? 1.12 : /[1Iil]/.test(char) ? .3 : .56), 0);
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
    <CoverElement id="orbits" kind="box" className="pointer-events-none absolute inset-0" style={{ color: palette.accent, zIndex: 1 }}><TacticalOrbits /></CoverElement>
    <BgDimLayer on={props.bgDim} amount={props.bgDimAmount} at="78% 48%" />
    <div data-matrix-operator className="pointer-events-none absolute inset-y-0 left-[-400px] w-[2240px]" style={{ zIndex: 2 }}>
      <OperatorLayer {...props} fadeRight fadeRightSolid={78} objectPosition="center center" className="h-full w-full" />
    </div>
    <CoverElement id="glow" kind="box" className="pointer-events-none absolute inset-0" style={{ color: palette.glow, zIndex: 3 }}>
      {violet ? <VioletBloom /> : <CornerGlow />}
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
