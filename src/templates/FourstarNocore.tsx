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
const INK = "#101214";
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

function TornPaper() {
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

function Floor() {
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

function TealHud() {
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

function Compass() {
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

function GoldFrame() {
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

function StageBar() {
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
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 42% 52% at 62% -4%, rgba(255,244,220,0.38) 0%, rgba(255,236,200,0.12) 36%, transparent 70%)",
          }}
        />
      </CoverElement>

      <CoverElement id="floor" kind="box" className="pointer-events-none absolute inset-0 z-[1]">
        <Floor />
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
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, transparent, ${INK}99)` }}
        />
      </CoverElement>
    </div>
  );
}
