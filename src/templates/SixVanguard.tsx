import { ArtEcho, GoldRules, PaperFlecks, PrintDots, PrintGeometry, SkewTag } from "../canvas/DecorArt";
import { GrainGoldType } from "../canvas/TextFaces";
import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { useCdnSrc } from "../lib/cdn";
import { bgGradeFilter } from "../lib/effects";
import type { CoverRenderProps } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";

export function SixVanguard(props: CoverRenderProps) {
  const squad = elementText(props.elementStyles, "squad", props.subtitle);
  const stage = elementText(props.elementStyles, "stage", props.title);
  const script = elementText(props.elementStyles, "script", props.signature);
  const mark = elementText(props.elementStyles, "mark", props.mark);
  const bg = useCdnSrc(getBgPreset(props.bgPreset).url ?? "");
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
        <ArtEcho src={props.imageUrl} />
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
        <PrintDots />
      </CoverElement>
      <BgDimLayer on={props.bgDim} amount={props.bgDimAmount} at="15% 75%" className="z-[8]" />
      <CoverElement id="gold-rule" kind="box" className="pointer-events-none absolute inset-0 z-[5]" style={{ color: "#dbb64d" }}>
        <GoldRules />
      </CoverElement>
      <CoverElement id="mark-bg" kind="box" className="absolute top-[475px] left-[901px] z-[10] h-[38px] w-[170px]" style={{ color: "#d92529" }}>
        <SkewTag />
      </CoverElement>
      <CoverElement id="mark" defaultFont="sans" defaultFontSize={Math.min(34, 240 / Math.max(1, mark.length))}
        className="absolute top-[472px] left-[910px] z-[11] font-black text-white" style={{ lineHeight: 1.15 }}>
        <span className="inline-block" style={{ transform: "rotate(-4deg)", fontFamily: props.elementStyles?.mark?.font ? undefined : "'Outfit Variable', sans-serif", fontStyle: "italic" }}>{mark}</span>
      </CoverElement>
      <CoverElement id="squad" defaultFont="serif" defaultFontSize={squadSize}
        className="absolute top-[364px] left-[1040px] z-[12] font-black text-[#fffefb]" style={{ lineHeight: 1 }}>
        <span className="inline-block" style={{ transform: "skewX(-10deg) rotate(-3deg) scaleX(.96)", transformOrigin: "left bottom", letterSpacing: ".025em" }}><GrainGoldType text={squad} /></span>
      </CoverElement>
      <CoverElement id="stage" defaultFont="sans" defaultFontSize={stageSize}
        className="absolute top-[516px] left-[826px] z-[13] text-[#fffefb]" style={{ lineHeight: .88, fontWeight: 750 }}>
        <span className="inline-block" style={{ transform: "skewX(-9deg) rotate(-4deg) scaleX(1.05)", transformOrigin: "left bottom", letterSpacing: "-.02em", fontFamily: props.elementStyles?.stage?.font ? undefined : "'Outfit Variable', sans-serif" }}><GrainGoldType text={stage} stage /></span>
      </CoverElement>
      <CoverElement id="script" defaultFont="script" defaultFontSize={Math.min(119, 952 / Math.max(1, script.length))}
        className="absolute top-[466px] left-[1200px] z-[14] whitespace-nowrap text-[#070b0e]" style={{ lineHeight: 1 }}>
        <span className="inline-block" style={{ fontFamily: props.elementStyles?.script?.font ? undefined : "'Vanguard Hand', cursive", transform: "rotate(-6deg) skewX(-9deg) scaleX(.96)", transformOrigin: "left center" }}>{script}</span>
      </CoverElement>
      <CoverElement id="flecks" kind="box" className="pointer-events-none absolute inset-0 z-[6]">
        <PaperFlecks clearFace />
      </CoverElement>
    </div>
  );
}
