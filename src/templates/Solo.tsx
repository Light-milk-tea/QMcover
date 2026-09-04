import { CoverElement } from "../components/CoverElement";
import { renderBoxChrome } from "../canvas/LayerChrome";
import { BILI_COVER, STAGE_BAR_WIDTH_MAX, STAGE_BAR_WIDTH_MIN } from "../constants";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { LightUnderlay } from "../effects/CoverEffectsStage";
import { layerZIndex } from "../lib/document";
import { bgGradeFilter } from "../lib/effects";
import { useCoverOptional } from "../store/CoverContext";
import type { BoxLayer, CoverRenderProps } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";

const WHITE = "#ffffff";
const RED_RULE = "#8a121c";
const TEXT_STACK_WIDTH = 820;
const STACK_LEFT = 128;
const STACK_TOP = 268;
const TITLE_GAP = 28;
const TITLE_BAR_PAD = 72;
const RULE_WIDTH_DEFAULT = 788;
const RED_RULE_WIDTH_DEFAULT = 800;

function titleSize(length: number) {
  if (length <= 2) return 216;
  if (length <= 4) return 176;
  if (length <= 6) return 138;
  return 108;
}

function stageSize(length: number) {
  if (length <= 5) return 228;
  if (length <= 7) return 212;
  if (length <= 9) return 176;
  return 148;
}

function GlowWord({ text, stroke = "0.01em #101014" }: { text: string; stroke?: string }) {
  return (
    <span data-solo-title-face="" className="relative inline-block whitespace-nowrap leading-none">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 text-white/55"
        style={{ filter: "blur(8px)" }}
      >
        {text}
      </span>
      <span
        className="relative"
        style={{
          color: WHITE,
          WebkitTextStroke: stroke,
          paintOrder: "stroke fill",
        }}
      >
        {text}
      </span>
    </span>
  );
}

function TitleBarFace() {
  return (
    <span aria-hidden className="absolute inset-0" style={{ background: "currentColor" }} />
  );
}

function barWidth(props: CoverRenderProps, id: string, fallback: number) {
  const override = props.elementStyles?.[id]?.w;
  const layer = props.layers?.find((item) => item.id === id)?.w;
  const raw = override ?? layer ?? fallback;
  return Math.min(STAGE_BAR_WIDTH_MAX, Math.max(STAGE_BAR_WIDTH_MIN, raw));
}

export function Solo(props: CoverRenderProps) {
  const cover = useCoverOptional();
  const styles = props.elementStyles;
  const title = elementText(styles, "title", props.title.trim() || "酒神单人");
  const stage = elementText(styles, "stage", props.subtitle.trim() || "QM-EX-8");
  const slogan = elementText(styles, "slogan", props.signature.trim() || "ONE OPERATOR ONLY");
  const bg = getBgPreset(props.bgPreset);
  const ruleW = barWidth(props, "rule", RULE_WIDTH_DEFAULT);
  const redRuleW = barWidth(props, "rule-red", RED_RULE_WIDTH_DEFAULT);
  const stackW = Math.max(TEXT_STACK_WIDTH, ruleW, redRuleW);
  const stageFontSize = styles?.stage?.fontSize ?? stageSize(stage.length);
  const titleFontSize = styles?.title?.fontSize ?? titleSize(title.length);
  const stageRowH = Math.round(stageFontSize * 0.8);
  const titleBarH = titleFontSize + TITLE_BAR_PAD;
  const titleBarTop = STACK_TOP + stageRowH + TITLE_GAP;
  const layers = cover?.draft.layers ?? props.layers ?? [];
  const washAmount = styles?.wash?.opacity ?? layers.find((layer) => layer.id === "wash")?.opacity;
  const zBar = cover ? layerZIndex(layers, "title-bar") : 3;
  const zOperator = cover ? layerZIndex(layers, "operator") : 4;
  const lightFront = props.effects?.light.depth === "front";
  const zLight = lightFront ? zOperator + 1 : Math.max(1, zOperator - 1);
  const markLayer = layers.find((layer): layer is BoxLayer => layer.id === "ak-mark" && layer.kind === "box");
  const zText = cover
    ? Math.max(
        layerZIndex(layers, "stage"),
        layerZIndex(layers, "title"),
        layerZIndex(layers, "rule"),
        layerZIndex(layers, "rule-red"),
        layerZIndex(layers, "slogan"),
      )
    : 6;

  return (
    <div data-solo-canvas="" className="relative h-full w-full overflow-hidden bg-[#080406]">
      {bg.url ? (
        <img
          data-cover-bg=""
          src={bg.url}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.08] object-cover"
          style={{ objectPosition: "46% 38%", filter: bgGradeFilter(props.effects?.bgGrade) }}
        />
      ) : null}
      <CoverElement
        id="wash"
        kind="box"
        className="pointer-events-none absolute inset-0"
        style={washAmount == null ? undefined : { opacity: Math.min(1, Math.max(0, washAmount / 100)) }}
      >
        <div
          data-cover-bg-veil=""
          className="absolute inset-0"
          style={{ background: bg.url ? "rgb(52 6 10 / 0.58)" : "rgb(12 4 6 / 0.78)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 88% 78% at 34% 50%, rgb(118 10 16 / 0.88) 0%, rgb(58 6 10 / 0.52) 48%, transparent 76%), radial-gradient(ellipse 56% 46% at 82% 8%, rgb(200 40 34 / 0.34) 0%, transparent 64%), radial-gradient(ellipse 40% 36% at 18% 78%, rgb(40 4 8 / 0.55) 0%, transparent 70%)",
          }}
        />
      </CoverElement>

      <div data-solo-light="" className="pointer-events-none absolute inset-0" style={{ zIndex: zLight }}>
        <CoverElement id="light" kind="box" className="absolute inset-0">
          <LightUnderlay effect={props.effects?.light} />
        </CoverElement>
      </div>

      <CoverElement
        id="ak-mark"
        kind="box"
        defaultX={48}
        defaultY={36}
        className="pointer-events-none absolute left-0 top-0"
        style={{ width: 320, height: 78, color: styles?.["ak-mark"]?.color ?? markLayer?.color ?? "#eef6e4" }}
      >
        {renderBoxChrome({
          id: "ak-mark",
          kind: "box",
          label: "方舟标",
          x: 0,
          y: 0,
          w: 320,
          h: 78,
          chrome: "ak-mark",
          color: styles?.["ak-mark"]?.color ?? markLayer?.color ?? "#eef6e4",
        })}
      </CoverElement>

      {props.bgDim ? <BgDimLayer on amount={props.bgDimAmount ?? 32} at="24% 48%" className="z-[3]" /> : null}

      <div
        data-solo-title-bar=""
        className="pointer-events-none absolute left-0"
        style={{ top: titleBarTop, height: titleBarH, width: BILI_COVER.width, zIndex: zBar }}
      >
        <CoverElement
          id="title-bar"
          kind="box"
          className="absolute inset-0"
          style={{ color: "#0a0a0c" }}
        >
          <TitleBarFace />
        </CoverElement>
      </div>

      <div
        data-operator-slot=""
        className="pointer-events-none absolute inset-y-0 left-[38%] right-[-6%] overflow-visible"
        style={{ zIndex: zOperator }}
      >
        <OperatorLayer
          {...props}
          fadeLeft
          fadeLeftSolid={22}
          objectFit="contain"
          objectPosition="52% 18%"
          transformOrigin="center 16%"
          className="h-full w-full"
        />
      </div>

      <div
        className="absolute"
        style={{
          top: STACK_TOP,
          left: STACK_LEFT,
          width: stackW,
          zIndex: zText,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        data-solo-type=""
      >
        <CoverElement
          id="stage"
          defaultFont="cn"
          defaultFontSize={stageSize(stage.length)}
          defaultX={-22}
          defaultY={-52}
          className="w-full text-center font-black tracking-[-0.02em] whitespace-nowrap"
          style={{ lineHeight: 0.8, width: "100%", height: stageRowH, textAlign: "center" }}
        >
          <GlowWord text={stage} stroke="0.014em #101014" />
        </CoverElement>

        <div className="relative w-full" style={{ marginTop: TITLE_GAP, height: titleBarH }}>
          <CoverElement
            id="title"
            defaultFont="serif"
            defaultFontSize={titleSize(title.length)}
            defaultX={11}
            defaultY={-10}
            className="absolute inset-0 z-[1] overflow-visible font-black tracking-[-0.02em]"
          >
            <span
              className="flex h-full w-full items-center justify-center whitespace-nowrap"
              style={{
                display: "flex",
                height: "100%",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GlowWord text={title} stroke="0.008em #141018" />
            </span>
          </CoverElement>
        </div>

        <CoverElement
          id="rule"
          kind="box"
          className="relative mt-[26px] h-[3px] shrink-0"
          style={{ width: ruleW, color: WHITE, marginLeft: "auto", marginRight: "auto" }}
        >
          <span aria-hidden className="absolute inset-0" style={{ background: "currentColor" }} />
        </CoverElement>
        <CoverElement
          id="rule-red"
          kind="box"
          className="relative mt-[4px] h-[6px] shrink-0"
          style={{ width: redRuleW, color: RED_RULE, marginLeft: "auto", marginRight: "auto" }}
        >
          <span aria-hidden className="absolute inset-0" style={{ background: "currentColor" }} />
        </CoverElement>

        <CoverElement
          id="slogan"
          defaultFont="display"
          defaultFontSize={22}
          className="relative mt-[10px] w-full text-center font-medium tracking-[0.32em] whitespace-nowrap"
          style={{ color: WHITE, width: "100%", textAlign: "center" }}
        >
          {slogan}
        </CoverElement>
      </div>
    </div>
  );
}
