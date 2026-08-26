import { CoverElement } from "../components/CoverElement";
import { artUrl } from "../data/arts";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { autoFontSize } from "../lib/document";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps, ImageLayer } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";

const RED = "#e10600";
const WHITE = "#f4f4f2";
const ANGEL_ART = "char_103_angel_2";

function BlockWord({ text }: { text: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span aria-hidden className="pointer-events-none absolute top-[0.03em] left-[0.025em] text-black/55">
        {text}
      </span>
      <span className="sp-type relative" style={{ color: WHITE }}>
        {text}
      </span>
    </span>
  );
}

function Viewfinder({ color }: { color: string }) {
  return (
    <svg width="86" height="72" viewBox="0 0 86 72" fill="none" aria-hidden>
      <path d="M0 18 H72 M0 0 V48" stroke={color} strokeWidth="2.2" />
      <path d="M0 0 V72" stroke={color} strokeWidth="1.4" opacity="0.7" />
    </svg>
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
  const rulerColor = styles?.ruler?.color || RED;
  const triColor = styles?.tri?.color || RED;
  const scriptColor = styles?.script?.color || RED;
  const bg = getBgPreset(props.bgPreset);
  const squadPx = autoFontSize("squad", squad.length, 252);
  const stagePx = autoFontSize("stageCode", stage.length, 348);
  const layers = cover?.draft.layers ?? props.layers ?? [];
  const layerB = layers.find((layer): layer is ImageLayer => layer.kind === "image" && layer.id === "operator-b");

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#d8dbe0]">
      {bg.url ? (
        <img
          src={bg.url}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.08] object-cover"
          style={{
            objectPosition: "56% 36%",
            filter: "saturate(0.42) contrast(1.14) brightness(1.46) grayscale(0.18)",
          }}
        />
      ) : null}

      <BgDimLayer on={props.bgDim} amount={props.bgDimAmount ?? 14} at="22% 58%" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[38%] bg-gradient-to-r from-[#8ea0b4]/28 via-[#c5ced6]/10 to-transparent" />

      <div className="absolute inset-y-[-6%] right-[-10%] w-[56%]">
        <OperatorLayer
          {...props}
          layerId="operator-b"
          imageUrl={layerImage(layerB, ANGEL_ART)}
          imageScale={layerB?.scale ?? 168}
          imageX={layerB?.imageX ?? 36}
          imageY={layerB?.imageY ?? -28}
          fadeLeft
          fadeLeftSolid={16}
          objectFit="contain"
          objectPosition="right bottom"
          emptyHint="立绘B"
          className="h-full w-full object-contain object-right-bottom"
          onImageDrag={(dx, dy) => {
            if (!cover || !layerB) return;
            cover.patchLayer("operator-b", {
              imageX: (layerB.imageX ?? 36) + dx,
              imageY: (layerB.imageY ?? -28) + dy,
            });
          }}
        />
      </div>

      <div className="absolute inset-y-[-2%] right-[2%] w-[64%]">
        <OperatorLayer
          {...props}
          fadeLeft
          fadeLeftSolid={12}
          objectFit="contain"
          objectPosition="center bottom"
          className="h-full w-full object-contain"
        />
      </div>

      <CoverElement id="tri" kind="box" className="absolute top-[292px] left-[132px] z-[6]">
        <Viewfinder color={triColor} />
      </CoverElement>

      <CoverElement
        id="squad"
        defaultFontSize={squadPx}
        className="absolute top-[318px] left-[168px] z-[4] font-black whitespace-nowrap"
        style={{ lineHeight: 0.88 }}
      >
        <span className="sp-squad inline-block">
          <BlockWord text={squad} />
        </span>
      </CoverElement>

      <CoverElement
        id="stage"
        defaultFont="display"
        defaultFontSize={stagePx}
        className="absolute top-[548px] left-[168px] z-[4] font-bold whitespace-nowrap"
        style={{ lineHeight: 0.84 }}
      >
        <span className="sp-stage inline-block">
          <BlockWord text={stage} />
        </span>
      </CoverElement>

      <CoverElement id="ruler" kind="box" className="absolute top-[464px] left-[120px] z-[5]">
        <div style={{ width: 780, height: 3, background: rulerColor, boxShadow: "0 0 0 0.4px rgb(225 6 0 / 0.4)" }} />
      </CoverElement>

      {script ? (
        <CoverElement
          id="script"
          defaultFont="script"
          defaultFontSize={122}
          className="absolute top-[286px] left-[392px] z-[7] whitespace-nowrap"
          style={{ color: scriptColor, lineHeight: 1 }}
        >
          <span className="relative inline-block" style={{ transform: "rotate(-33deg)", transformOrigin: "left center" }}>
            <span aria-hidden className="pointer-events-none absolute top-[0.03em] left-[0.02em] text-black/35">
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
          defaultFontSize={16}
          className="absolute top-[972px] left-[168px] z-[6] font-semibold tracking-[0.42em] whitespace-nowrap"
          style={{ color: WHITE }}
        >
          <span className="inline-flex items-center gap-3">
            <i className="block h-px w-10 bg-current opacity-80" />
            {mark}
            <i className="block h-px w-10 bg-current opacity-80" />
          </span>
        </CoverElement>
      ) : null}

      <div className="sp-scan pointer-events-none absolute inset-0 z-[20] opacity-[0.55]" />
      <div className="sp-grain pointer-events-none absolute inset-0 z-[21] opacity-[0.38]" />
    </div>
  );
}
