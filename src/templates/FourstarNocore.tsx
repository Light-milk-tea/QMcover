import { BottomFade, CheckerFloor, Compass, GoldFrame, StageBar, TealHud, TopGlow, TornPaper } from "../canvas/DecorArt";
import { CoverElement } from "../components/CoverElement";
import { STAGE_BAR_WIDTH_DEFAULT, STAGE_BAR_WIDTH_MAX, STAGE_BAR_WIDTH_MIN } from "../constants";
import { artUrl } from "../data/arts";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { useCdnSrc } from "../lib/cdn";
import { layerZIndex } from "../lib/document";
import { bgGradeFilter } from "../lib/effects";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";

const PAPER = "#f3efe6";
const CREAM = "#f3ead4";

function titleSize(length: number) {
  if (length <= 2) return 236;
  if (length <= 4) return 196;
  if (length <= 6) return 152;
  return 118;
}

function stageSize(length: number) {
  if (length <= 3) return 140;
  if (length <= 5) return 128;
  if (length <= 8) return 90;
  return 70;
}

function GhostArt({ src, x, y, w, rotate }: { src: string; x: number; y: number; w: number; rotate: number }) {
  const remote = useCdnSrc(src);
  return (
    <span className="absolute" style={{ left: x, top: y, width: w, transform: `rotate(${rotate}deg)` }}>
      <i className="absolute left-[46%] -top-[220px] h-[220px] w-px bg-white/35" />
      <img
        src={remote.src}
        alt=""
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        decoding="async"
        className="block w-full opacity-[0.28] grayscale contrast-150 brightness-[0.55]"
      />
    </span>
  );
}

function Puppets() {
  return (
    <div className="absolute inset-0">
      <GhostArt src={artUrl("char_237_gravel_2")} x={40} y={-40} w={420} rotate={-8} />
      <GhostArt src={artUrl("char_133_mm_2")} x={250} y={-80} w={380} rotate={6} />
      <GhostArt src={artUrl("char_328_cammou_2")} x={430} y={20} w={360} rotate={-4} />
      <span className="absolute top-[58px] left-[132px] font-display text-[15px] tracking-[0.32em] text-white/22">UNIT</span>
      <span className="absolute top-[44px] left-[468px] font-display text-[14px] tracking-[0.32em] text-white/16">CAST</span>
    </div>
  );
}

function LayeredTitle({ text }: { text: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap leading-none">
      <span aria-hidden className="pointer-events-none absolute top-[0.05em] left-[0.035em] text-black">
        {text}
      </span>
      <span
        className="relative"
        style={{
          color: PAPER,
          WebkitTextStroke: "0.008em #1a1814",
          paintOrder: "stroke fill",
        }}
      >
        {text}
      </span>
    </span>
  );
}

function stageBarWidth(props: CoverRenderProps) {
  const override = props.elementStyles?.["stage-bar"]?.w;
  const layer = props.layers?.find((item) => item.id === "stage-bar")?.w;
  const raw = override ?? layer ?? STAGE_BAR_WIDTH_DEFAULT;
  return Math.min(STAGE_BAR_WIDTH_MAX, Math.max(STAGE_BAR_WIDTH_MIN, raw));
}

export function FourstarNocore(props: CoverRenderProps) {
  const cover = useCoverOptional();
  const styles = props.elementStyles;
  const title = elementText(styles, "title", props.title.trim() || "四星无核");
  const stage = elementText(styles, "stage", props.subtitle.trim() || "QM-8");
  const micro = elementText(styles, "micro", props.signature.trim() || "NO CORE");
  const bg = getBgPreset(props.bgPreset);
  const barWidth = stageBarWidth(props);
  const layers = cover?.draft.layers ?? props.layers ?? [];
  const zOperator = cover ? layerZIndex(layers, "operator") : 5;
  const zText = cover
    ? Math.max(layerZIndex(layers, "title"), layerZIndex(layers, "stage-bar"), layerZIndex(layers, "stage"))
    : 6;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#2a2a2c]">
      {bg.url ? (
        <img
          data-cover-bg=""
          src={bg.url}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.08] object-cover"
          style={{ objectPosition: "48% 40%", filter: bgGradeFilter(props.effects?.bgGrade) }}
        />
      ) : null}
      <div
        data-cover-bg-veil=""
        className="pointer-events-none absolute inset-0"
        style={{ background: bg.url ? "rgb(16 18 20 / 0.22)" : "rgb(16 18 20 / 0.7)" }}
      />
      <CoverElement id="glow" kind="box" className="pointer-events-none absolute inset-0">
        <TopGlow />
      </CoverElement>

      <CoverElement id="floor" kind="box" className="pointer-events-none absolute inset-0 z-[1]">
        <CheckerFloor />
      </CoverElement>
      <CoverElement id="paper" kind="box" className="pointer-events-none absolute inset-0 z-[1]">
        <TornPaper />
      </CoverElement>
      <CoverElement id="hud" kind="box" className="pointer-events-none absolute inset-0 z-[1]">
        <TealHud />
        <Compass />
      </CoverElement>
      <CoverElement id="puppets" kind="box" className="pointer-events-none absolute inset-0 z-[1]">
        <Puppets />
      </CoverElement>
      <CoverElement
        id="frame"
        kind="box"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ color: "#c4a46a" }}
      >
        <GoldFrame />
      </CoverElement>

      {props.bgDim ? <BgDimLayer on amount={props.bgDimAmount ?? 28} at="26% 44%" className="z-[2]" /> : null}

      <div
        data-operator-slot=""
        className="pointer-events-none absolute inset-y-0 left-[22%] right-[-2%] overflow-visible"
        style={{ zIndex: zOperator }}
      >
        <OperatorLayer
          {...props}
          fadeLeft
          fadeLeftSolid={24}
          objectFit="contain"
          objectPosition="50% bottom"
          transformOrigin="center 24%"
          className="h-full w-full"
        />
      </div>

      <div
        className="absolute top-[390px] left-[160px] origin-left"
        style={{ transform: "rotate(-12deg)", zIndex: zText }}
      >
        <CoverElement
          id="title"
          defaultFont="cn"
          defaultFontSize={titleSize(title.length)}
          className="font-black leading-none tracking-[-0.045em]"
        >
          <LayeredTitle text={title} />
        </CoverElement>
        <div className="relative z-[8] mt-[12px] -ml-[16px] h-[156px]" style={{ width: barWidth }}>
          <CoverElement
            id="stage-bar"
            kind="box"
            defaultX={176}
            className="absolute inset-0"
            style={{ color: CREAM }}
          >
            <StageBar />
          </CoverElement>
          <CoverElement
            id="stage"
            defaultFont="serif"
            defaultFontSize={stageSize(stage.length)}
            defaultX={169}
            defaultY={-11}
            className="absolute inset-0 z-[1] font-black leading-none tracking-[-0.03em] text-[#1c1a18]"
            style={{ fontStyle: "italic" }}
          >
            <span className="flex h-full w-full items-center justify-center whitespace-nowrap">
              {stage}
            </span>
          </CoverElement>
        </div>
      </div>

      <CoverElement
        id="micro"
        defaultFont="display"
        defaultFontSize={15}
        className="absolute bottom-[92px] left-[396px] z-[5] font-medium tracking-[0.32em] text-[#cfc6b4]/70"
      >
        {micro}
      </CoverElement>

      <CoverElement id="fade" kind="box" className="pointer-events-none absolute inset-x-0 bottom-0 z-[7] h-[90px]">
        <BottomFade />
      </CoverElement>
    </div>
  );
}
