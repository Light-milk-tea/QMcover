import type { ReactNode } from "react";
import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import type { CoverRenderProps } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";

function stageSize(len: number) {
  if (len <= 4) return 220;
  if (len <= 6) return 168;
  if (len <= 8) return 128;
  return 96;
}

function operationSize(len: number) {
  if (len <= 4) return 118;
  if (len <= 6) return 92;
  return 72;
}

function SlantText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`cover-type-slant cover-type-shadow inline-block max-w-full ${className}`}>
      {children}
    </span>
  );
}

function OffsetTitle({ text }: { text: string }) {
  return (
    <span className="cover-type-slant relative inline-block whitespace-nowrap">
      <span
        aria-hidden
        className="cover-type-stroke pointer-events-none absolute top-[0.08em] left-[0.06em] whitespace-nowrap text-transparent"
      >
        {text}
      </span>
      <span className="cover-type-shadow relative whitespace-nowrap">{text}</span>
    </span>
  );
}

export function FirstKill(props: CoverRenderProps) {
  const styles = props.elementStyles;
  const stage = elementText(styles, "stage", props.title.trim() || "地图名");
  const subtitle = elementText(styles, "subtitle", props.subtitle);
  const levelLabel = elementText(styles, "level-label", "危机等级");
  const operation = elementText(styles, "operation", props.signature.trim());
  const level = elementText(styles, "level", String(props.episode || 1));
  const ccEn = elementText(styles, "cc-en", "CONTINGENCY\nCONTRACT");
  const ccCn = elementText(styles, "cc-cn", "危机合约");
  const levelPx = level.length >= 3 ? 84 : 104;

  const bg = getBgPreset(props.bgPreset);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#141618]">
      {bg.url ? (
        <img
          src={bg.url}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      <BgDimLayer on={props.bgDim} amount={props.bgDimAmount ?? 42} at="22% 42%" />

      <div className="absolute inset-y-0 right-[-6%] w-[76%]">
        <OperatorLayer
          {...props}
          objectFit="contain"
          className="h-full w-full object-contain object-right-bottom"
        />
      </div>

      <div className="absolute inset-y-0 left-0 w-[36%] bg-gradient-to-r from-[#141618]/78 via-[#141618]/32 to-transparent" />

      <div className="absolute top-[96px] left-[80px] w-[1080px]">
        <CoverElement
          id="stage"
          defaultFontSize={stageSize(stage.length)}
          className="font-black tracking-[-0.06em] break-words text-white"
          style={{ lineHeight: 1.02, maxWidth: 1020 }}
        >
          <SlantText>{stage}</SlantText>
        </CoverElement>

        <div className="mt-2 flex items-baseline gap-5">
          {subtitle ? (
            <CoverElement
              id="subtitle"
              defaultFontSize={88}
              className="font-black tracking-wide text-white"
              style={{ lineHeight: 1 }}
            >
              <span className="cover-type-shadow">{subtitle}</span>
            </CoverElement>
          ) : null}
          <CoverElement
            id="level-label"
            defaultFontSize={88}
            className="font-black tracking-wide text-white"
            style={{ lineHeight: 1 }}
          >
            <span className="cover-type-shadow">{levelLabel}</span>
          </CoverElement>
          <CoverElement
            id="level"
            defaultFontSize={levelPx}
            className="font-black text-white"
            style={{ lineHeight: 0.92, letterSpacing: "-0.04em" }}
          >
            <span className="cover-type-shadow">{level}</span>
          </CoverElement>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <CoverElement id="cc-mark" kind="box" className="shrink-0">
            <svg width="68" height="68" viewBox="0 0 58 58" fill="none" aria-hidden>
              <polygon points="29,3 55,53 3,53" stroke="#f2f2f2" strokeWidth="2.4" fill="none" />
              <polygon points="29,16 44,48 14,48" fill="#f2f2f2" />
            </svg>
          </CoverElement>
          <CoverElement
            id="cc-en"
            defaultFont="display"
            defaultFontSize={26}
            className="leading-[1.2] font-semibold tracking-[0.16em] text-[#d0d0d0]"
          >
            {ccEn.split(/\n/).map((line, i) => (
              <span key={`${line}-${i}`}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </CoverElement>
        </div>

        {operation ? (
          <div className="mt-4 flex items-end gap-4">
            <CoverElement
              id="operation"
              defaultFontSize={operationSize(operation.length)}
              className="shrink-0 font-black tracking-tight text-white"
              style={{ lineHeight: 1 }}
            >
              <OffsetTitle text={operation} />
            </CoverElement>
            <CoverElement
              id="cc-cn"
              defaultFontSize={24}
              className="mb-1.5 font-bold tracking-wide text-[#c8c8c8]"
            >
              <span className="cover-type-shadow">{ccCn}</span>
            </CoverElement>
          </div>
        ) : null}
      </div>
    </div>
  );
}
