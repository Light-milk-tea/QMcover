import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { getOrnament } from "../data/ornaments";
import type { CoverRenderProps } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";

function goldSize(len: number) {
  if (len <= 2) return 220;
  if (len <= 3) return 204;
  if (len <= 4) return 180;
  if (len <= 6) return 136;
  return 104;
}

function guideSize(len: number) {
  if (len <= 4) return 220;
  if (len <= 6) return 152;
  return 118;
}

function splitEventTitle(raw: string): { gold: string; white: string } {
  const t = raw.trim() || "行动";
  const i = t.indexOf("的");
  if (i > 0 && i < t.length - 1) {
    return { gold: t.slice(0, i), white: t.slice(i) };
  }
  return { gold: t, white: "" };
}

function BandScene({
  url,
  objectPosition,
  veil,
}: {
  url: string | null;
  objectPosition: string;
  veil: string;
}) {
  return (
    <>
      {url ? (
        <img
          src={url}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.12] object-cover"
          style={{ objectPosition }}
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[#0c2430]" />
      )}
      <div className="pointer-events-none absolute inset-0" style={{ background: veil }} />
      <div className="ls-grain pointer-events-none absolute inset-0 opacity-[0.42]" />
    </>
  );
}

function GoldTitle({ text }: { text: string }) {
  return (
    <span className="relative inline-block pr-[0.22em] whitespace-nowrap font-black leading-none" style={{ fontFamily: "var(--font-serif)" }}>
      <span aria-hidden className="pointer-events-none absolute top-[0.1em] left-[0.07em] text-black">
        {text}
      </span>
      <span
        className="relative"
        style={{
          color: "#e8b54a",
          WebkitTextStroke: "0.068em #120806",
          paintOrder: "stroke fill",
        }}
      >
        {text}
      </span>
    </span>
  );
}

function SignatureMark({ text }: { text: string }) {
  const chars = Array.from(text);
  if (chars.length === 0) return null;
  return (
    <span className="inline-flex shrink-0 items-baseline font-black italic leading-none" style={{ letterSpacing: "-0.06em" }}>
      {chars.map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className="relative"
          style={{
            color: i % 2 === 1 ? "#e8b400" : "#1d4ed8",
            WebkitTextStroke: "0.07em #111",
            paintOrder: "stroke fill",
            textShadow: "3px 4px 0 rgba(0,0,0,0.4)",
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

function ornamentImg(src: string, className: string) {
  return <img src={src} alt="" className={`pointer-events-none absolute object-contain ${className}`} />;
}

function BannerOrnament({ id }: { id?: string }) {
  const item = getOrnament(id);
  if (!item.src || item.kind === "none") return null;

  if (item.kind === "side") {
    return (
      <>
        {ornamentImg(item.src, "top-4 right-6 h-[22%] w-[108px] object-right opacity-[0.78]")}
        {ornamentImg(item.src, "right-6 bottom-4 h-[22%] w-[108px] origin-center -scale-y-100 object-right opacity-[0.78]")}
      </>
    );
  }

  return (
    <>
      {ornamentImg(item.src, "top-4 right-6 h-[78px] w-[78px] object-right-top opacity-[0.76]")}
      {ornamentImg(item.src, "right-6 bottom-4 h-[78px] w-[78px] origin-center -scale-y-100 object-right-top opacity-[0.76]")}
    </>
  );
}

export function LowSpec(props: CoverRenderProps) {
  const styles = props.elementStyles;
  const { gold: goldSplit, white: whiteSplit } = splitEventTitle(props.title);
  const goldText = elementText(styles, "operation", goldSplit);
  const whiteText = elementText(styles, "operation-sub", whiteSplit);
  const goldLabel = elementText(styles, "cc-gold", "活动");
  const operationEn = elementText(styles, "operation-en", "OPERATION");
  const guide = elementText(styles, "guide", props.subtitle.trim() || "平民攻略");
  const sign = elementText(styles, "sign", props.signature.trim());
  const slogan = elementText(styles, "slogan", "阵容平民 语音详解");
  const sloganParts = slogan.split(/\s+/).filter(Boolean);
  const bg = getBgPreset(props.bgPreset);
  const scene = bg.url;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#080a0e]">
      <BgDimLayer on={props.bgDim} amount={props.bgDimAmount ?? 38} at="28% 48%" className="z-[1]" />
      <div className="absolute inset-y-0 left-[-10%] w-[58%]">
        <OperatorLayer
          {...props}
          fadeRight
          objectFit="contain"
          className="h-full w-full object-contain object-left-bottom"
        />
      </div>

      <div
        className="absolute inset-0 z-[2] flex flex-col"
        style={{ clipPath: "polygon(34% 0, 100% 0, 100% 100%, 22% 100%)" }}
      >
        <div className="relative flex min-h-0 flex-1 items-end">
          <BandScene
            url={scene}
            objectPosition="78% 18%"
            veil="linear-gradient(180deg, rgba(8,28,36,0.12) 0%, rgba(6,22,30,0.38) 100%), linear-gradient(90deg, rgba(4,12,18,0.28), transparent 42%)"
          />
          <div className="relative z-[1] flex w-full items-end pb-[26px] pl-[38%] pr-[56px]">
            <CoverElement
              id="cc-gold"
              defaultFontSize={28}
              className="pointer-events-none absolute opacity-0"
            >
              {goldLabel}
            </CoverElement>
            <div className="flex shrink-0 items-end">
              <div className="shrink-0">
                <CoverElement
                  id="operation"
                  defaultFont="serif"
                  defaultFontSize={goldSize(goldText.length)}
                  defaultX={-70}
                  defaultY={-7}
                  className="font-black"
                >
                  <GoldTitle text={goldText} />
                </CoverElement>
                {whiteText ? null : (
                  <CoverElement
                    id="operation-en"
                    defaultFont="display"
                    defaultFontSize={15}
                    className="mt-1 font-semibold tracking-[0.32em] text-[#e8c86a]"
                    style={{ textShadow: "0 2px 0 #0a2030" }}
                  >
                    {operationEn}
                  </CoverElement>
                )}
              </div>
              {whiteText ? (
                <div
                  className="mb-[0.06em] flex shrink-0 flex-col justify-end gap-1.5"
                  style={{ marginLeft: Math.round(goldSize(goldText.length) * 0.28) }}
                >
                  <CoverElement
                    id="operation-sub"
                    defaultFont="serif"
                    defaultFontSize={156}
                    defaultX={-145}
                    defaultY={8}
                    className="font-black tracking-[0.02em] whitespace-nowrap text-white"
                    style={{ textShadow: "0 3px 0 #0a1820, 0 8px 16px rgba(0,0,0,0.4)" }}
                  >
                    {whiteText}
                  </CoverElement>
                  <CoverElement
                    id="operation-en"
                    defaultFont="display"
                    defaultFontSize={15}
                    className="font-semibold tracking-[0.36em] text-[#e8c86a]"
                    style={{ textShadow: "0 2px 0 #0a2030" }}
                  >
                    {operationEn}
                  </CoverElement>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <CoverElement id="banner" kind="box" className="relative z-[3] block min-h-0 flex-1 overflow-visible">
          <div className="ls-paper absolute inset-0 shadow-[0_14px_36px_rgba(0,0,0,0.4)]" />
          <div className="ls-halftone pointer-events-none absolute inset-y-0 left-0 w-[30%] opacity-50" />
          <BannerOrnament id={props.ornamentId} />
          <div className="relative flex h-full items-center gap-8 overflow-visible pl-[34%] pr-16">
            {sign ? (
              <CoverElement
                id="sign"
                defaultFont="display"
                defaultFontSize={sign.length <= 2 ? 200 : sign.length <= 4 ? 92 : 68}
                className="inline-flex items-center overflow-visible"
              >
                <SignatureMark text={sign} />
              </CoverElement>
            ) : null}
            <CoverElement
              id="guide"
              defaultFont="serif"
              defaultFontSize={guideSize(guide.length)}
              defaultX={46}
              defaultY={3}
              className="ls-guide overflow-visible font-black tracking-[-0.04em] whitespace-nowrap"
              style={{ lineHeight: 1.18, paddingBottom: "0.08em" }}
            >
              {guide}
            </CoverElement>
          </div>
        </CoverElement>

        <div className="relative min-h-0 flex-1">
          <BandScene
            url={scene}
            objectPosition="78% 86%"
            veil="linear-gradient(180deg, rgba(4,10,16,0.48) 0%, rgba(2,6,12,0.72) 100%), linear-gradient(90deg, rgba(2,8,12,0.3), transparent 40%)"
          />
          <div className="relative flex h-full items-center pl-[34%] pr-[56px]">
            <CoverElement
              id="slogan"
              defaultFont="serif"
              defaultFontSize={110}
              className="flex gap-16 font-black tracking-[0.08em] text-white"
              style={{ lineHeight: 1, textShadow: "0 3px 0 #04080c, 0 10px 18px rgba(0,0,0,0.5)" }}
            >
              {sloganParts.map((part) => (
                <span key={part}>{part}</span>
              ))}
            </CoverElement>
          </div>
        </div>
      </div>
    </div>
  );
}
