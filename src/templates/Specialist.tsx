import { CoverElement } from "../components/CoverElement";
import { IMAGE_EDGE_FADE_DEFAULT } from "../constants";
import { artUrl } from "../data/arts";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { SpecialistLightUnderlay } from "../effects/CoverEffectsStage";
import { autoFontSize, layerZIndex } from "../lib/document";
import { bgGradeFilter } from "../lib/effects";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps, ImageLayer } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";

const RED = "#e10600";
const WHITE = "#ffffff";
const ANGEL_ART = "char_1041_angel2_1";

function BlockWord({ text }: { text: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span aria-hidden className="pointer-events-none absolute top-[0.055em] left-[0.04em] text-black/70">
        {text}
      </span>
      <span className="sp-type relative" style={{ color: WHITE }}>
        {text}
      </span>
    </span>
  );
}

function AtmosphereWash() {
  return (
    <CoverElement id="atmosphere" kind="box" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-y-0 left-0 w-[38%] bg-gradient-to-r from-[#0c1014]/42 via-[#0c1014]/12 to-transparent" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgb(248 250 252 / 0.08) 0%, transparent 24%, rgb(3 7 11 / 0.2) 54%, rgb(3 7 11 / 0.76) 100%), radial-gradient(ellipse 46% 34% at 40% -4%, rgb(255 255 255 / 0.24) 0%, rgb(250 252 252 / 0.08) 42%, transparent 72%)",
        }}
      />
    </CoverElement>
  );
}

function Shards() {
  return (
    <CoverElement id="bg-shards" kind="box" className="pointer-events-none absolute inset-0">
      <svg className="h-full w-full" viewBox="0 0 1920 1080" fill="none" aria-hidden>
        <polygon points="1180,40 1410,210 1264,248" fill="rgb(246 246 248 / 0.22)" />
        <polygon points="1388,8 1688,168 1540,214" fill="rgb(236 238 242 / 0.14)" />
        <polygon points="1608,90 1918,40 1918,280" fill="rgb(250 250 252 / 0.1)" />
        <polygon points="1048,220 1176,318 1088,352" fill="rgb(255 255 255 / 0.08)" />
        <polygon points="1720,620 1918,520 1918,760" fill="rgb(230 232 236 / 0.06)" />
      </svg>
    </CoverElement>
  );
}

function ReferenceGeometry() {
  return (
    <CoverElement id="guides" kind="box" className="pointer-events-none absolute inset-0">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" fill="none">
        <path d="M0 132 H1920" stroke="rgb(220 20 28 / 0.4)" strokeWidth="1.4" />
        <path d="M0 466 H1920" stroke="rgb(220 20 28 / 0.28)" strokeWidth="1.2" />
        <path d="M186 0 V1080" stroke="rgb(220 20 28 / 0.32)" strokeWidth="1.2" />
        <path d="M0 198 H1030" stroke="rgb(236 242 246 / 0.12)" />
        <path d="M0 930 H1880" stroke="rgb(236 242 246 / 0.1)" />

        <path d="M34 710 H350 M34 716 H254" stroke="rgb(238 242 244 / 0.22)" />
        <path d="M902 872 H1168 M924 878 H1088" stroke="rgb(238 242 244 / 0.18)" />
        <path d="M1278 930 H1454" stroke="rgb(238 242 244 / 0.2)" />
        <path d="M1450 194 h18 M1459 185 v18" stroke="rgb(238 242 244 / 0.32)" />
        <path d="M1020 936 h20 M1030 926 v20" stroke="rgb(238 242 244 / 0.3)" />
      </svg>
      <span className="absolute top-[706px] left-[40px] font-display text-[11px] tracking-[0.28em] text-white/35">
        SPECIALIST ARRAY
      </span>
      <span className="absolute top-[930px] left-[904px] font-display text-[10px] tracking-[0.34em] text-white/32">
        RESTRICTED OPERATION
      </span>
      <span className="absolute top-[958px] left-[1370px] font-display text-[9px] tracking-[0.3em] text-white/30">
        TACTICAL COVER
      </span>
    </CoverElement>
  );
}

function CornerShards() {
  return (
    <CoverElement
      id="corner-shards"
      kind="box"
      className="pointer-events-none absolute top-[560px] left-[1480px] z-[12] h-[520px] w-[440px]"
    >
      <svg className="pointer-events-none h-full w-full" viewBox="0 0 440 520" fill="none" aria-hidden>
        <polygon points="180,520 440,520 440,0 354,42" fill="rgb(8 12 16 / 0.5)" />
        <polygon points="230,520 292,520 440,158 440,14" fill="rgb(246 248 248 / 0.72)" />
        <polygon points="312,520 370,520 440,354 440,210" fill="rgb(226 231 234 / 0.54)" />
        <polygon points="8,386 118,334 192,178 104,206" fill="rgb(225 10 20 / 0.9)" />
        <polygon points="78,444 180,392 256,238 168,266" fill="rgb(243 245 245 / 0.74)" />
        <polygon points="160,492 256,446 324,310 244,336" fill="rgb(225 10 20 / 0.76)" />
      </svg>
    </CoverElement>
  );
}

function layerImage(layer: ImageLayer | undefined, fallbackArt: string) {
  if (layer?.imageDataUrl) return layer.imageDataUrl;
  if (layer?.imageUrl) return layer.imageUrl;
  if (layer?.artId) return artUrl(layer.artId);
  return artUrl(fallbackArt);
}

export function Specialist(props: CoverRenderProps) {
  const cover = useCoverOptional();
  const styles = props.elementStyles;
  const squad = elementText(styles, "squad", props.title.trim() || "五特种");
  const stage = elementText(styles, "stage", props.subtitle.trim() || "H15-4");
  const script = elementText(styles, "script", props.signature.trim());
  const mark = elementText(styles, "mark", props.mark.trim());
  const scriptColor = styles?.script?.color || RED;
  const bg = getBgPreset(props.bgPreset);
  const squadPx = Math.min(autoFontSize("squad", squad.length, 186), 186);
  const stagePx = Math.min(autoFontSize("stageCode", stage.length, 340), 340);
  const layers = cover?.draft.layers ?? props.layers ?? [];
  const layerA = layers.find((layer): layer is ImageLayer => layer.kind === "image" && layer.id === "operator");
  const layerB = layers.find((layer): layer is ImageLayer => layer.kind === "image" && layer.id === "operator-b");
  const zOperator = cover ? layerZIndex(layers, "operator") : 2;
  const zOperatorB = cover ? layerZIndex(layers, "operator-b") : 1;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#101216]">
      {bg.url ? (
        <img
          src={bg.url}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.12] object-cover"
          style={{
            objectPosition: "58% 28%",
            filter: bgGradeFilter(props.effects?.bgGrade),
          }}
        />
      ) : null}

      <BgDimLayer on={props.bgDim} amount={props.bgDimAmount ?? 36} at="78% 62%" />
      <AtmosphereWash />
      <SpecialistLightUnderlay effect={props.effects?.light} />
      <Shards />

      <div
        className="pointer-events-none absolute inset-y-0 right-[-10%] left-[58%] overflow-visible"
        style={{ zIndex: zOperatorB }}
      >
        <OperatorLayer
          layerId="operator-b"
          fringeRole="back"
          artGrade={layerB?.artGrade}
          imageUrl={layerImage(layerB, ANGEL_ART)}
          imageScale={layerB?.scale ?? 300}
          imageX={layerB?.imageX ?? -120}
          imageY={layerB?.imageY ?? 260}
          imageEdgeFade={layerB?.edgeFade ?? false}
          imageEdgeFadeAmount={layerB?.edgeFadeAmount ?? IMAGE_EDGE_FADE_DEFAULT}
          previewScale={props.previewScale}
          showPlaceholder={props.showPlaceholder}
          transformOrigin="center 18%"
          objectFit="contain"
          objectPosition="64% 14%"
          emptyHint="立绘B"
          className="h-full w-full object-contain"
          onImageDrag={(dx, dy) => {
            if (!cover || !layerB) return;
            cover.patchLayer("operator-b", {
              imageX: (layerB.imageX ?? -120) + dx,
              imageY: (layerB.imageY ?? 260) + dy,
            });
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 right-[-2%] left-[28%] overflow-visible"
        style={{ zIndex: zOperator }}
      >
        <OperatorLayer
          {...props}
          layerId="operator"
          fringeRole="front"
          artGrade={layerA?.artGrade}
          fadeLeft
          fadeLeftSolid={18}
          transformOrigin="center 14%"
          objectFit="contain"
          objectPosition="48% 10%"
          className="h-full w-full object-contain"
        />
      </div>

      <CoverElement
        id="squad"
        defaultFontSize={squadPx}
        className="absolute top-[350px] left-[170px] z-[8] font-black whitespace-nowrap"
        style={{ lineHeight: 0.86 }}
      >
        <span className="sp-squad inline-block">
          <BlockWord text={squad} />
        </span>
      </CoverElement>

      <CoverElement
        id="stage"
        defaultFont="display"
        defaultFontSize={stagePx}
        className="absolute top-[510px] left-[154px] z-[8] font-bold whitespace-nowrap"
        style={{ lineHeight: 0.78 }}
      >
        <span className="sp-stage inline-block">
          <BlockWord text={stage} />
        </span>
      </CoverElement>

      {script ? (
        <CoverElement
          id="script"
          defaultFont="script"
          defaultFontSize={88}
          className="absolute top-[420px] left-[442px] z-[10] whitespace-nowrap"
          style={{ color: scriptColor, lineHeight: 0.78, transformOrigin: "18% 70%" }}
        >
          <span className="sp-script relative inline-block">
            <span aria-hidden className="pointer-events-none absolute top-[0.04em] left-[0.03em] text-black/40">
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
          defaultFontSize={15}
          className="absolute top-[992px] left-[170px] z-[8] font-semibold tracking-[0.48em] whitespace-nowrap"
          style={{ color: WHITE }}
        >
          <span className="inline-flex items-center gap-3">
            <i className="block h-px w-10 bg-current opacity-80" />
            {mark}
            <i className="block h-px w-10 bg-current opacity-80" />
          </span>
        </CoverElement>
      ) : null}

      <ReferenceGeometry />
      <CornerShards />
    </div>
  );
}
