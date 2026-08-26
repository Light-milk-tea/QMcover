import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { autoFontSize } from "../lib/document";
import type { CoverRenderProps } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";

const RED = "#e10600";
const WHITE = "#f4f4f2";

function BlockWord({ text }: { text: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span aria-hidden className="pointer-events-none absolute top-[0.045em] left-[0.035em] text-black">
        {text}
      </span>
      <span className="cover-type-shadow relative" style={{ color: WHITE }}>
        {text}
      </span>
    </span>
  );
}

function Ruler({ color }: { color: string }) {
  const ticks = [0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96];
  return (
    <svg width="980" height="28" viewBox="0 0 980 28" fill="none" aria-hidden>
      <line x1="0" y1="18" x2="980" y2="18" stroke={color} strokeWidth="3" />
      {ticks.map((t) => (
        <line
          key={t}
          x1={(t / 100) * 980}
          y1={t % 24 === 0 ? 4 : 10}
          x2={(t / 100) * 980}
          y2="18"
          stroke={color}
          strokeWidth={t % 24 === 0 ? 3 : 2}
        />
      ))}
    </svg>
  );
}

export function Specialist(props: CoverRenderProps) {
  const styles = props.elementStyles;
  const squad = elementText(styles, "squad", props.title.trim() || "5特种");
  const stage = elementText(styles, "stage", props.subtitle.trim() || "H15-4");
  const script = elementText(styles, "script", props.signature.trim());
  const mark = elementText(styles, "mark", props.mark.trim());
  const rulerColor = styles?.ruler?.color || RED;
  const triColor = styles?.tri?.color || WHITE;
  const scriptColor = styles?.script?.color || RED;
  const bg = getBgPreset(props.bgPreset);
  const squadPx = autoFontSize("squad", squad.length, 200);
  const stagePx = autoFontSize("squad", stage.length, 188);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#16181c]">
      {bg.url ? (
        <img
          src={bg.url}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.06] object-cover"
          style={{ objectPosition: "58% 40%", filter: "saturate(0.72) contrast(1.12) brightness(1.08)" }}
        />
      ) : null}

      <BgDimLayer on={props.bgDim} amount={props.bgDimAmount ?? 36} at="28% 48%" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-[#101114]/72 via-[#101114]/28 to-transparent" />
      <div className="sp-scan pointer-events-none absolute inset-0 opacity-[0.22]" />
      <div className="sp-grain pointer-events-none absolute inset-0 opacity-[0.4]" />

      <div className="absolute inset-y-0 right-[-4%] w-[66%]">
        <OperatorLayer
          {...props}
          fadeLeft
          fadeLeftSolid={18}
          objectFit="contain"
          objectPosition="right bottom"
          className="h-full w-full object-contain object-right-bottom"
        />
      </div>

      <CoverElement id="ruler" kind="box" className="absolute top-[248px] left-[64px] z-[3]">
        <Ruler color={rulerColor} />
      </CoverElement>

      <CoverElement id="tri" kind="box" className="absolute top-[196px] left-[72px] z-[3]">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
          <polygon points="14,2 26,26 2,26" fill={triColor} />
        </svg>
      </CoverElement>

      <CoverElement
        id="squad"
        defaultFontSize={squadPx}
        className="absolute top-[300px] left-[88px] z-[4] font-black tracking-[-0.06em] whitespace-nowrap"
        style={{ lineHeight: 0.92 }}
      >
        <BlockWord text={squad} />
      </CoverElement>

      <CoverElement
        id="stage"
        defaultFontSize={stagePx}
        className="absolute top-[528px] left-[88px] z-[4] font-black tracking-[-0.05em] whitespace-nowrap"
        style={{ lineHeight: 0.92 }}
      >
        <BlockWord text={stage} />
      </CoverElement>

      {script ? (
        <CoverElement
          id="script"
          defaultFont="serif"
          defaultFontSize={92}
          className="absolute top-[392px] left-[168px] z-[5] font-black tracking-[-0.02em] whitespace-nowrap italic"
          style={{ color: scriptColor, lineHeight: 1 }}
        >
          <span className="relative inline-block" style={{ transform: "rotate(-11deg)", transformOrigin: "left center" }}>
            <span aria-hidden className="pointer-events-none absolute top-[0.04em] left-[0.03em] text-black">
              {script}
            </span>
            <span className="relative">{script}</span>
          </span>
        </CoverElement>
      ) : null}

      {mark ? (
        <CoverElement
          id="mark"
          defaultFont="display"
          defaultFontSize={18}
          className="absolute top-[948px] left-[88px] z-[4] font-semibold tracking-[0.28em] whitespace-nowrap"
          style={{ color: WHITE }}
        >
          <span className="inline-flex items-center gap-3 px-2 py-1 ring-1 ring-white/70">
            {mark}
          </span>
        </CoverElement>
      ) : null}
    </div>
  );
}
