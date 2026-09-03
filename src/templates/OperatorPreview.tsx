import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { bgGradeFilter } from "../lib/effects";
import type { CoverRenderProps } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";

const INK = "#101923";
const PAPER = "#e9e4e1";
const BLUE = "#125d9f";

function titleSize(length: number) {
  if (length <= 4) return 232;
  if (length <= 6) return 190;
  if (length <= 8) return 156;
  return 126;
}

function badgeSize(length: number) {
  if (length <= 4) return 56;
  if (length <= 6) return 48;
  return 40;
}

function TechnicalFrame() {
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

function LayeredTitle({ text }: { text: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap leading-[0.92]">
      <span
        aria-hidden
        className="pointer-events-none absolute top-[0.058em] left-[0.042em] text-[#5a3038]"
        style={{
          WebkitTextStroke: "0.026em #111920",
          paintOrder: "stroke fill",
        }}
      >
        {text}
      </span>
      <span
        className="relative"
        style={{
          color: PAPER,
          WebkitTextStroke: "0.011em #252b30",
          paintOrder: "stroke fill",
          textShadow: "0 9px 16px rgba(3,8,12,0.32)",
        }}
      >
        {text}
      </span>
    </span>
  );
}

function AnalysisBadge() {
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

export function OperatorPreview(props: CoverRenderProps) {
  const styles = props.elementStyles;
  const title = elementText(styles, "title", props.title.trim() || "强度预测");
  const badge = elementText(styles, "badge", props.subtitle.trim() || "技能解析");
  const watermark = elementText(styles, "watermark", props.signature.trim() || "OPERATOR");
  const mark = elementText(styles, "mark", props.mark.trim() || "OPERATOR INTEL");
  const subject = elementText(styles, "subject", "干员");
  const series = elementText(styles, "series", "前瞻分析");
  const episode = elementText(styles, "episode", `#${props.episode || 1}`);
  const analysis = elementText(styles, "analysis", "ANALYSIS");
  const micro = elementText(
    styles,
    "micro",
    "WHISPERS FROM THE FUTURE · UNVEILING THE NEW OPERATOR\nPREPARE FOR THE CLASSIFIED OPERATOR ANALYSIS",
  );
  const bg = getBgPreset(props.bgPreset);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#101923]">
      {bg.url ? (
        <img
          src={bg.url}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.04] object-cover"
          style={{ objectPosition: "54% 42%", filter: bgGradeFilter(props.effects?.bgGrade) }}
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-[#0b2433]/35" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,17,25,0.1)_0%,rgba(7,28,38,0.3)_42%,rgba(6,24,34,0.52)_72%,rgba(4,16,25,0.7)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_34%_28%,rgba(68,119,151,0.3)_0%,transparent_48%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 24%, rgba(255,255,255,0.12) 0 1px, transparent 1.4px), radial-gradient(circle at 72% 68%, rgba(0,0,0,0.22) 0 1px, transparent 1.3px)",
          backgroundSize: "5px 5px, 3px 3px",
        }}
      />

      <CoverElement id="frame" kind="box" className="pointer-events-none absolute inset-0 z-[1]">
        <TechnicalFrame />
      </CoverElement>

      <CoverElement
        id="watermark"
        defaultFont="serif"
        defaultFontSize={340}
        className="pointer-events-none absolute top-[160px] left-[40px] z-[2] font-black tracking-[-0.07em] whitespace-nowrap"
        style={{
          color: "rgba(135,35,44,0.13)",
          WebkitTextStroke: "2px rgba(159,50,58,0.13)",
          lineHeight: 0.88,
          transform: "scaleX(1)",
          transformOrigin: "left center",
        }}
      >
        {watermark}
      </CoverElement>

      {props.bgDim ? <BgDimLayer on amount={props.bgDimAmount ?? 36} at="22% 48%" className="z-[2]" /> : null}

      <div className="pointer-events-none absolute inset-y-0 left-[-5%] z-[3] w-[70%] overflow-visible">
        <OperatorLayer
          {...props}
          fadeRight
          fadeRightSolid={78}
          objectFit="contain"
          objectPosition="center bottom"
          transformOrigin="center 26%"
          className="h-full w-full"
        />
      </div>

      <CoverElement
        id="mark"
        defaultFont="display"
        defaultFontSize={23}
        className="absolute top-[198px] left-[1028px] z-[5] flex items-center gap-[14px] font-medium tracking-[0.07em] text-[#aeb9bd]"
        style={{ lineHeight: 1 }}
      >
        <span className="h-[14px] w-[14px] rotate-45 border-2 border-[#a83841]/80" />
        {mark}
      </CoverElement>

      <div className="absolute top-[342px] left-[948px] z-[5] flex items-end whitespace-nowrap">
        <CoverElement
          id="subject"
          defaultFont="serif"
          defaultFontSize={138}
          className="font-black tracking-[-0.08em] text-[#e9e7e2]"
          style={{ lineHeight: 0.92, textShadow: "0 7px 18px rgba(0,0,0,0.5)" }}
        >
          {subject}
        </CoverElement>
        <CoverElement
          id="series"
          defaultFont="serif"
          defaultFontSize={106}
          className="ml-[30px] font-black tracking-[-0.06em] text-[#e9e7e2]"
          style={{ lineHeight: 0.96, textShadow: "0 7px 18px rgba(0,0,0,0.5)" }}
        >
          {series}
        </CoverElement>
        <CoverElement
          id="episode"
          defaultFont="display"
          defaultFontSize={70}
          className="ml-[18px] pb-[4px] font-semibold tracking-[-0.02em] text-[#e9e7e2]"
          style={{ lineHeight: 1 }}
        >
          {episode}
        </CoverElement>
      </div>

      <CoverElement
        id="title"
        defaultFont="serif"
        defaultFontSize={titleSize(title.length)}
        className="absolute top-[414px] left-[804px] z-[6] font-black tracking-[-0.045em]"
      >
        <LayeredTitle text={title} />
      </CoverElement>

      <CoverElement
        id="analysis"
        defaultFont="display"
        defaultFontSize={22}
        className="absolute top-[710px] left-[1314px] z-[6] font-medium tracking-[1.65em] text-[#b8bec1]/75"
        style={{ lineHeight: 1 }}
      >
        {analysis}
      </CoverElement>

      <CoverElement
        id="badge-bg"
        kind="box"
        className="absolute top-[766px] left-[1286px] z-[6] h-[104px] w-[430px]"
        style={{ color: BLUE }}
      >
        <AnalysisBadge />
      </CoverElement>
      <CoverElement
        id="badge"
        defaultFontSize={badgeSize(badge.length)}
        className="absolute top-[766px] left-[1286px] z-[7] grid h-[104px] w-[430px] place-items-center px-[70px] font-black tracking-[0.03em] whitespace-nowrap text-[#f7f5ef]"
      >
        {badge}
      </CoverElement>

      <CoverElement
        id="micro"
        defaultFont="display"
        defaultFontSize={14}
        className="absolute right-[164px] bottom-[84px] z-[5] max-w-[690px] text-right font-medium tracking-[0.12em] whitespace-pre-line text-[#91a3ad]/55"
        style={{ lineHeight: 1.25 }}
      >
        {micro}
      </CoverElement>

      <div className="pointer-events-none absolute top-[236px] right-[122px] z-[4] h-[398px] w-[430px] opacity-30">
        <span className="absolute inset-0 border-t border-r border-[#7f919c]/30" />
        <span className="absolute top-[42px] right-[42px] h-[1px] w-[272px] rotate-[-18deg] bg-[#7f919c]/24" />
        <span className="absolute top-[100px] right-[18px] h-[1px] w-[300px] rotate-[-18deg] bg-[#7f919c]/16" />
        <span className="absolute top-[156px] right-[-6px] h-[1px] w-[328px] rotate-[-18deg] bg-[#7f919c]/12" />
      </div>

      <div
        className="pointer-events-none absolute top-0 right-0 z-[3] h-[360px] w-[720px] opacity-55"
        style={{
          background:
            "radial-gradient(circle at 78% 8%, rgba(142,38,48,0.7) 0 1px, transparent 2px), radial-gradient(circle at 62% 20%, rgba(142,38,48,0.5) 0 1px, transparent 2px), repeating-linear-gradient(166deg, transparent 0 14px, rgba(142,38,48,0.1) 14px 17px, transparent 17px 29px)",
          backgroundSize: "7px 7px, 11px 11px, auto",
          WebkitMaskImage: "radial-gradient(ellipse at 82% 0%, #000 0%, transparent 72%)",
          maskImage: "radial-gradient(ellipse at 82% 0%, #000 0%, transparent 72%)",
        }}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[7] h-[90px]"
        style={{ background: `linear-gradient(180deg, transparent, ${INK}99)` }}
      />
    </div>
  );
}
