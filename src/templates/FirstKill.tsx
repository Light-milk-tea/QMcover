import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import type { CoverRenderProps } from "../types";
import { OperatorLayer } from "./OperatorLayer";

const TYPE_SHADOW = "0 2px 0 #07080a, 0 8px 20px rgba(0,0,0,0.5)";

function stageSize(len: number) {
  if (len <= 4) return 164;
  if (len <= 6) return 118;
  if (len <= 8) return 92;
  return 72;
}

function operationSize(len: number) {
  if (len <= 4) return 80;
  if (len <= 6) return 64;
  return 52;
}

export function FirstKill(props: CoverRenderProps) {
  const stage = props.title.trim() || "地图名";
  const operation = props.signature.trim();
  const level = String(props.episode || 1);
  const levelPx = level.length >= 3 ? 72 : 100;

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

      <div className="absolute inset-y-0 right-[-6%] w-[76%]">
        <OperatorLayer
          {...props}
          objectFit="contain"
          className="h-full w-full object-contain object-right-bottom"
        />
      </div>

      <div className="absolute inset-y-0 left-0 w-[36%] bg-gradient-to-r from-[#141618]/78 via-[#141618]/32 to-transparent" />

      <div
        className="absolute left-[80px] top-[64px] z-10 w-[1080px]"
        style={{ textShadow: TYPE_SHADOW }}
      >
        <CoverElement
          id="stage"
          defaultFontSize={stageSize(stage.length)}
          className="font-black tracking-[-0.04em] break-words text-white"
          style={{ lineHeight: 1.02, maxWidth: 1020 }}
        >
          {stage}
        </CoverElement>

        <div className="mt-3 flex items-baseline gap-4">
          {props.subtitle ? (
            <CoverElement
              id="subtitle"
              defaultFontSize={50}
              className="font-black tracking-wide text-white"
              style={{ lineHeight: 1 }}
            >
              {props.subtitle}
            </CoverElement>
          ) : null}
          <CoverElement
            id="level-label"
            defaultFontSize={50}
            className="font-black tracking-wide text-white"
            style={{ lineHeight: 1 }}
          >
            危机等级
          </CoverElement>
          <CoverElement
            id="level"
            defaultFont="display"
            defaultFontSize={levelPx}
            className="font-bold text-white"
            style={{ lineHeight: 0.85, letterSpacing: "-0.04em" }}
          >
            {level}
          </CoverElement>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <svg width="58" height="58" viewBox="0 0 58 58" fill="none" aria-hidden>
            <polygon points="29,3 55,53 3,53" stroke="#f2f2f2" strokeWidth="2.4" fill="none" />
            <polygon points="29,16 44,48 14,48" fill="#f2f2f2" />
          </svg>
          <CoverElement
            id="cc-en"
            defaultFont="display"
            defaultFontSize={22}
            className="leading-[1.2] tracking-[0.22em] text-[#d0d0d0]"
          >
            CONTINGENCY
            <br />
            CONTRACT
          </CoverElement>
        </div>

        {operation ? (
          <div className="mt-5 flex items-end gap-4">
            <CoverElement
              id="operation"
              defaultFontSize={operationSize(operation.length)}
              className="font-black tracking-tight text-white"
              style={{ lineHeight: 1 }}
            >
              {operation}
            </CoverElement>
            <CoverElement
              id="cc-cn"
              defaultFontSize={28}
              className="mb-2 font-bold tracking-wider text-[#c8c8c8]"
            >
              危机合约
            </CoverElement>
          </div>
        ) : null}
      </div>
    </div>
  );
}
