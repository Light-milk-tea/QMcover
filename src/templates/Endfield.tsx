import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import type { CoverRenderProps } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";

const LEMON = "#fdfe3e";
const BAR = "#282828";
const PAPER = "#f3f3f1";
const INK = "#282828";

function nameSize(len: number) {
  if (len <= 2) return 356;
  if (len <= 3) return 312;
  if (len <= 4) return 280;
  if (len <= 6) return 196;
  return 152;
}

function nameLeft(len: number) {
  if (len <= 2) return 760;
  if (len <= 3) return 656;
  if (len <= 4) return 588;
  return 528;
}

function seriesSize(len: number) {
  if (len <= 6) return 140;
  if (len <= 8) return 128;
  if (len <= 12) return 92;
  return 70;
}

function bracketH(len: number) {
  return Math.round(nameSize(len) * 1.06 + 24);
}

function BracketBars({ side, thickness: t }: { side: "l" | "r"; thickness: number }) {
  return (
    <span className="relative block h-full w-full">
      <i className="absolute top-0 right-0 left-0" style={{ height: t, background: "currentColor" }} />
      <i className="absolute right-0 bottom-0 left-0" style={{ height: t, background: "currentColor" }} />
      <i
        className={`absolute top-0 bottom-0 ${side === "l" ? "left-0" : "right-0"}`}
        style={{ width: t, background: "currentColor" }}
      />
    </span>
  );
}

function Bracket({ side }: { side: "l" | "r" }) {
  const t = 32;
  return (
    <span className="relative block h-full w-full">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ color: "rgba(22,18,12,0.34)", transform: "translate(7px, 8px)" }}
      >
        <BracketBars side={side} thickness={t} />
      </span>
      <span className="relative block h-full w-full">
        <BracketBars side={side} thickness={t} />
      </span>
    </span>
  );
}

const TRI_POINTS = "0,0 1180,0 640,860";

const TRI_TOPO = [
  "M30 90 C300 40, 680 70, 980 220 C1100 300, 1150 420, 1170 540",
  "M10 180 C280 130, 640 170, 920 330 C1060 420, 1130 540, 1160 680",
  "M0 280 C250 230, 600 280, 860 450 C1020 550, 1100 680, 1140 800",
  "M0 390 C220 350, 560 400, 800 560 C960 660, 1060 760, 1100 840",
  "M40 500 C260 470, 520 530, 740 670 C880 750, 980 820, 1040 860",
  "M80 610 C280 590, 480 650, 660 760 C760 820, 840 850, 920 860",
];

function YellowTriangle() {
  return (
    <span className="relative block h-full w-full">
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1180 860"
        preserveAspectRatio="none"
        style={{ transform: "translate(12px, 14px)" }}
      >
        <polygon points={TRI_POINTS} fill="rgba(22,18,12,0.26)" />
      </svg>
      <svg className="relative h-full w-full" viewBox="0 0 1180 860" preserveAspectRatio="none" aria-hidden>
        <defs>
          <clipPath id="ef-tri-clip" clipPathUnits="userSpaceOnUse">
            <polygon points={TRI_POINTS} />
          </clipPath>
        </defs>
        <polygon points={TRI_POINTS} fill="currentColor" />
        <g clipPath="url(#ef-tri-clip)" fill="none" stroke="#b89620" strokeWidth="2.1" opacity="0.38">
          {TRI_TOPO.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </svg>
    </span>
  );
}

function YellowDashes() {
  const marks = [
    { x: 1216, y: 156, w: 92, h: 11, r: -16 },
    { x: 1368, y: 188, w: 58, h: 9, r: 14 },
    { x: 1508, y: 142, w: 76, h: 10, r: -7 },
    { x: 1644, y: 214, w: 50, h: 8, r: -26 },
    { x: 1124, y: 208, w: 44, h: 8, r: 20 },
    { x: 1440, y: 268, w: 36, h: 7, r: 8 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-[4]">
      {marks.map((m) => (
        <span
          key={`${m.x}-${m.y}`}
          className="absolute"
          style={{
            left: m.x,
            top: m.y,
            width: m.w,
            height: m.h,
            transform: `rotate(${m.r}deg)`,
          }}
        >
          <i
            aria-hidden
            className="absolute inset-0"
            style={{ background: "rgba(22,18,12,0.3)", transform: "translate(5px, 6px)" }}
          />
          <i className="absolute inset-0" style={{ background: LEMON }} />
        </span>
      ))}
    </div>
  );
}

export function Endfield(props: CoverRenderProps) {
  const name = props.title.trim() || props.operatorName.trim() || "角色";
  const series = props.subtitle.trim() || "数据与实战测评";
  const tag = props.signature.trim() || "ARKNIGHTS: ENDFIELD";
  const mark = props.mark.trim() || "明日方舟测评";
  const bg = getBgPreset(props.bgPreset);
  const n = name.length;
  const bh = bracketH(n);

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: PAPER }}>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-0 w-[44%]"
        style={{
          background: "linear-gradient(90deg, #d5dbe3 0%, #e4e7ec 52%, transparent 100%)",
        }}
      />

      {bg.url ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 z-0 w-[46%] overflow-hidden">
          <img
            src={bg.url}
            alt=""
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            decoding="async"
            className="h-full w-full object-cover"
            style={{
              objectPosition: "38% 42%",
              WebkitMaskImage: "linear-gradient(90deg, #000 0%, #000 58%, transparent 100%)",
              maskImage: "linear-gradient(90deg, #000 0%, #000 58%, transparent 100%)",
            }}
          />
        </div>
      ) : null}

      <div className="ef-halftone pointer-events-none absolute top-0 right-0 z-[1] h-[46%] w-[58%] opacity-[0.5]" />
      <YellowDashes />

      <CoverElement
        id="triangle"
        kind="box"
        className="absolute top-[517px] left-[601px] z-[2] h-[860px] w-[1180px]"
        style={{ color: LEMON }}
      >
        <YellowTriangle />
      </CoverElement>

      {props.bgDim ? <BgDimLayer on amount={props.bgDimAmount ?? 28} at="22% 48%" className="z-[2]" /> : null}

      <div className="absolute inset-y-0 left-[-4%] z-[3] w-[54%] overflow-visible">
        <OperatorLayer
          {...props}
          fadeRight
          fadeRightSolid={68}
          transformOrigin="center 20%"
          objectFit="contain"
          objectPosition="center 18%"
          className="h-full w-full"
        />
      </div>

      <CoverElement
        id="mark"
        defaultFontSize={24}
        className="absolute top-[56px] right-[96px] z-[6] font-black tracking-[0.18em] text-[#5c5c5c]"
        style={{ lineHeight: 1 }}
      >
        {mark}
      </CoverElement>

      <div
        className="absolute z-[6] flex items-center gap-[8px]"
        style={{ top: 318, left: nameLeft(n) }}
      >
        <CoverElement
          id="bracket-l"
          kind="box"
          className="shrink-0"
          style={{ color: LEMON, width: 100, height: bh }}
        >
          <Bracket side="l" />
        </CoverElement>
        <CoverElement
          id="name"
          defaultFontSize={nameSize(n)}
          className="font-black tracking-[-0.055em] whitespace-nowrap"
          style={{ color: INK, lineHeight: 0.94, paddingBottom: "0.02em" }}
        >
          {name}
        </CoverElement>
        <CoverElement
          id="bracket-r"
          kind="box"
          className="shrink-0"
          style={{ color: LEMON, width: 100, height: bh }}
        >
          <Bracket side="r" />
        </CoverElement>
      </div>

      <CoverElement
        id="bar"
        kind="box"
        className="absolute top-[690px] left-[692px] z-[6] flex h-[216px] w-[1188px] items-center pr-[48px] pl-[56px]"
        style={{ color: BAR, background: "currentColor" }}
      >
        <CoverElement
          id="bar-accent"
          kind="box"
          className="absolute top-0 left-[-14px] h-full w-[14px]"
        >
          <span className="flex h-full w-full flex-col">
            <i className="block flex-1" style={{ background: "#e85aa8" }} />
            <i className="block flex-1" style={{ background: "#8d8d8d" }} />
            <i className="block flex-1" style={{ background: "#3dcc6a" }} />
            <i className="block flex-1" style={{ background: LEMON }} />
          </span>
        </CoverElement>
        <CoverElement
          id="series"
          defaultFontSize={seriesSize(series.length)}
          className="font-black tracking-[-0.01em] whitespace-nowrap text-white"
          style={{ lineHeight: 0.92, paddingBottom: "0.04em" }}
        >
          {`[ ${series} ]`}
        </CoverElement>
      </CoverElement>

      <CoverElement
        id="tag"
        defaultFont="display"
        defaultFontSize={20}
        className="absolute right-[96px] bottom-[80px] z-[6] font-semibold tracking-[0.16em] text-[#8a8a8a]"
        style={{ lineHeight: 1 }}
      >
        {`▼ // ${tag}`}
      </CoverElement>
    </div>
  );
}
