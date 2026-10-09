import { useId } from "react";
import { DotBand, InsetFrame, RankBadge, ThinBracket, YellowRamp } from "../canvas/DecorArt";
import { FadeDownWord, HaloWord, MotionStreak } from "../canvas/TextFaces";
import { CoverElement } from "../components/CoverElement";
import { IMAGE_EDGE_FADE_DEFAULT, IMAGE_EDGE_FADE_MODE_DEFAULT } from "../constants";
import { artUrl } from "../data/arts";
import { elementText } from "../data/elements";
import { moduleReviewLayers } from "../data/seeds/moduleReview";
import { layerZIndex } from "../lib/document";
import {
  MODULE_BACK_ORIGIN,
  MODULE_COLUMNS,
  MODULE_COLUMN_W,
  MODULE_EPISODE_SCALE,
  MODULE_FRONT_ORIGIN,
  MODULE_GRADE_CURVE,
  MODULE_GRADE_LIFT,
  MODULE_GRADE_TAME,
  MODULE_SLOT_W,
  MODULE_YELLOW,
  gradientMapMatrix,
  moduleTitleSize,
  moduleTone,
  moduleUnitColor,
  saturateMatrix,
} from "../lib/moduleReviewLayout";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps, ImageLayer, Layer } from "../types";
import { OperatorLayer } from "./OperatorLayer";

const UNIT_TOP = 196;
const UNIT_SIZE = 540;
/** 标题行底边固定，字少字多都坐在黄渐变上。 */
const TITLE_BOTTOM = 1030;
/** 期号数字的底边比中文字身底边高一点，和参考一样坐在同一条视觉基线上。 */
const EPISODE_LIFT = 0.05;
const BADGE_TOP = 198;
/** 精二底下垫的灰白竖向渐变，渐变映射后变成代表色的深浅。 */
const BACK_FILL = "linear-gradient(180deg, #ffffff 0%, #bdbdbd 42%, #4a4a4a 100%)";
/** 精二曲线压暗 + 上白下黑蒙版：顶端轻压，底部只剩四成亮度，精二始终暗过前景精一。 */
const BACK_CURVE = "linear-gradient(180deg, rgb(0 0 0 / 0.14) 0%, rgb(0 0 0 / 0.26) 26%, rgb(0 0 0 / 0.5) 58%, rgb(0 0 0 / 0.62) 100%)";
/** 四栏合起来的底部暗带：脸留在亮区，标题那一截压到接近黑，只剩底边的黄。 */
const BAND_SHADE =
  "linear-gradient(180deg, transparent 0%, transparent 50%, rgb(0 0 0 / 0.34) 62%, rgb(0 0 0 / 0.72) 74%, rgb(0 0 0 / 0.86) 86%, rgb(0 0 0 / 0.9) 100%)";

function findImage(layers: Layer[], id: string): ImageLayer | undefined {
  return layers.find((layer): layer is ImageLayer => layer.kind === "image" && layer.id === id);
}

function isHidden(layers: Layer[], id: string): boolean {
  const layer = layers.find((item) => item.id === id);
  return Boolean(layer?.hidden || layer?.removed);
}

function imageOf(layer: ImageLayer | undefined, fallback: ImageLayer | undefined): string {
  const pick = layer ?? fallback;
  if (pick?.imageDataUrl) return pick.imageDataUrl;
  if (pick?.imageUrl) return pick.imageUrl;
  if (pick?.artId) return artUrl(pick.artId);
  return "";
}

const SLOT_STYLE = { left: (MODULE_COLUMN_W - MODULE_SLOT_W) / 2, width: MODULE_SLOT_W } as const;

const OPAQUE = "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0 1";
const INVERT = "-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 0 1";

/**
 * 精一的「废土搭配」：自然饱和度 + 对比度曲线。
 * 先把颜色铺成不透明再算，最后按原图透明度裁回去；arithmetic 合成会连 alpha 一起算，半透明边缘直接算会发黑。
 */
function FrontGrade({ id }: { id: string }) {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values={OPAQUE} result="rgb" />
        <feColorMatrix in="rgb" type="matrix" values="0 1 0 0 0 0 0 1 0 0 1 0 0 0 0 0 0 0 0 1" result="gbr" />
        <feColorMatrix in="rgb" type="matrix" values="0 0 1 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0 0 1" result="brg" />
        <feBlend in="rgb" in2="gbr" mode="lighten" result="max2" />
        <feBlend in="max2" in2="brg" mode="lighten" result="max" />
        <feBlend in="rgb" in2="gbr" mode="darken" result="min2" />
        <feBlend in="min2" in2="brg" mode="darken" result="min" />
        <feColorMatrix in="min" type="matrix" values={INVERT} result="inv-min" />
        <feComposite in="max" in2="inv-min" operator="arithmetic" k2="1" k3="1" k4="-1" result="chroma" />
        <feColorMatrix in="chroma" type="matrix" values={INVERT} result="muted" />
        <feColorMatrix in="rgb" type="matrix" values={saturateMatrix(MODULE_GRADE_TAME)} result="tame" />
        <feColorMatrix in="rgb" type="matrix" values={saturateMatrix(MODULE_GRADE_LIFT)} result="lift" />
        <feComposite in="chroma" in2="tame" operator="arithmetic" k1="1" result="tame-part" />
        <feComposite in="muted" in2="lift" operator="arithmetic" k1="1" result="lift-part" />
        <feComposite in="tame-part" in2="lift-part" operator="arithmetic" k2="1" k3="1" result="vibrance" />
        <feComponentTransfer in="vibrance" result="contrast">
          <feFuncR type="table" tableValues={MODULE_GRADE_CURVE} />
          <feFuncG type="table" tableValues={MODULE_GRADE_CURVE} />
          <feFuncB type="table" tableValues={MODULE_GRADE_CURVE} />
        </feComponentTransfer>
        <feComposite in="contrast" in2="SourceGraphic" operator="in" />
      </filter>
    </svg>
  );
}

const SEED_IMAGES = new Map(
  moduleReviewLayers.filter((layer): layer is ImageLayer => layer.kind === "image").map((layer) => [layer.id, layer]),
);

type ColumnProps = {
  index: number;
  props: CoverRenderProps;
  layers: Layer[];
  z: (id: string) => number;
  unitText: string;
  gradeId: string;
};

function ModuleColumn({ index, props, layers, z, unitText, gradeId }: ColumnProps) {
  const cover = useCoverOptional();
  const mapId = `module-map-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ids = MODULE_COLUMNS[index];
  const styles = props.elementStyles;
  const toneLayer = layers.find((layer) => layer.id === ids.tone);
  const tone = moduleTone(index, styles?.[ids.tone]?.color ?? toneLayer?.color);
  const unitColor = styles?.[ids.unit]?.color ?? moduleUnitColor(tone);
  const back = findImage(layers, ids.back);
  const backSeed = SEED_IMAGES.get(ids.back);
  const front = findImage(layers, ids.front);
  const frontSeed = SEED_IMAGES.get(ids.front);
  const primary = ids.front === "operator";

  const pan = (id: string, layer: ImageLayer | undefined, seed: ImageLayer | undefined) => ({
    imageScale: layer?.scale ?? seed?.scale ?? 100,
    imageX: layer?.imageX ?? seed?.imageX ?? 0,
    imageY: layer?.imageY ?? seed?.imageY ?? 0,
    imageEdgeFade: layer?.edgeFade ?? false,
    imageEdgeFadeAmount: layer?.edgeFadeAmount ?? IMAGE_EDGE_FADE_DEFAULT,
    imageEdgeFadeMode: layer?.edgeFadeMode ?? IMAGE_EDGE_FADE_MODE_DEFAULT,
    onImageDrag: (dx: number, dy: number) => {
      if (!cover) return;
      cover.patchLayer(id, {
        imageX: (layer?.imageX ?? seed?.imageX ?? 0) + dx,
        imageY: (layer?.imageY ?? seed?.imageY ?? 0) + dy,
      });
    },
  });

  return (
    <div
      data-module-column={index + 1}
      data-tone={tone}
      className="pointer-events-none absolute top-0 h-full overflow-hidden"
      style={{ left: index * MODULE_COLUMN_W, width: MODULE_COLUMN_W }}
    >
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={mapId} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={gradientMapMatrix(tone)} />
        </filter>
      </svg>

      <div data-module-back="" className="absolute inset-0" style={{ zIndex: z(ids.tone), filter: `url(#${mapId})` }}>
        <CoverElement id={ids.tone} kind="box" className="pointer-events-none absolute inset-0" style={{ color: tone }}>
          <span className="absolute inset-0 block" style={{ background: BACK_FILL }} />
        </CoverElement>
        <div className="absolute top-0 h-full" style={SLOT_STYLE}>
          <OperatorLayer
            layerId={ids.back}
            fringeRole="back"
            imageUrl={imageOf(back, backSeed)}
            {...pan(ids.back, back, backSeed)}
            previewScale={props.previewScale}
            showPlaceholder={props.showPlaceholder}
            objectFit="contain"
            objectPosition="50% 0%"
            transformOrigin={MODULE_BACK_ORIGIN}
            emptyHint="精二"
            className="h-full w-full"
          />
        </div>
      </div>
      {isHidden(layers, ids.back) ? null : (
        <div data-module-curve="" className="absolute inset-0" style={{ zIndex: z(ids.back), background: BACK_CURVE }} />
      )}

      {unitText.trim() ? (
        <CoverElement
          id={ids.unit}
          defaultFont="caps"
          defaultFontSize={UNIT_SIZE}
          className="absolute whitespace-nowrap uppercase"
          style={{
            left: 0,
            top: UNIT_TOP,
            width: MODULE_COLUMN_W,
            textAlign: "center",
            lineHeight: 0.86,
            letterSpacing: "0.005em",
            color: unitColor,
            fontSynthesis: "none",
            zIndex: z(ids.unit),
          }}
        >
          <FadeDownWord text={unitText} />
        </CoverElement>
      ) : null}

      <div data-module-front="" className="absolute inset-0" style={{ zIndex: z(ids.front), filter: `url(#${gradeId})` }}>
        <div className="absolute top-0 h-full" style={SLOT_STYLE}>
          <OperatorLayer
            {...(primary
              ? props
              : {
                  imageUrl: imageOf(front, frontSeed),
                  ...pan(ids.front, front, frontSeed),
                  previewScale: props.previewScale,
                  showPlaceholder: props.showPlaceholder,
                })}
            layerId={ids.front}
            fringeRole="front"
            artGrade={front?.artGrade}
            objectFit="contain"
            objectPosition="50% 0%"
            transformOrigin={MODULE_FRONT_ORIGIN}
            emptyHint="精一"
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}

export function ModuleReview(props: CoverRenderProps) {
  const cover = useCoverOptional();
  const gradeId = `module-grade-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const styles = props.elementStyles;
  const layers = cover?.draft.layers ?? props.layers ?? moduleReviewLayers;
  const order = layers.length ? layers : moduleReviewLayers;
  const z = (id: string) => layerZIndex(order, id);

  const unitText = props.mark;
  const title = elementText(styles, "title", props.title);
  const episode = `#${props.episode || 1}`;
  const autoSize = moduleTitleSize(title, episode);
  const titleSize = styles?.title?.fontSize ?? autoSize;
  const episodeSize = styles?.episode?.fontSize ?? Math.round(autoSize * MODULE_EPISODE_SCALE);
  const bracketH = Math.round(titleSize * 0.92);
  const bracketW = Math.round(titleSize * 0.17);
  const bracketT = Math.max(4, Math.round(titleSize * 0.058));
  const episodeGap = titleSize * 0.09;
  const rowTop = TITLE_BOTTOM - Math.max(titleSize, episodeSize);
  const rowH = Math.max(titleSize, episodeSize);
  const tagline = elementText(styles, "tagline", props.subtitle).trim();
  const badge = props.signature.trim();
  const titleShift = `translate(${styles?.title?.x ?? 0}px, ${styles?.title?.y ?? 0}px)`;

  return (
    <div data-module-review-canvas="" className="relative h-full w-full overflow-hidden bg-black">
      <FrontGrade id={gradeId} />
      {MODULE_COLUMNS.map((_, index) => (
        <ModuleColumn key={index} index={index} props={props} layers={order} z={z} unitText={unitText} gradeId={gradeId} />
      ))}

      <CoverElement id="shade" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("shade") }}>
        <span className="absolute inset-0 block" style={{ background: BAND_SHADE }} />
      </CoverElement>
      <CoverElement
        id="ramp"
        kind="box"
        className="pointer-events-none absolute left-0 h-[380px] w-full"
        style={{ top: 700, zIndex: z("ramp"), color: MODULE_YELLOW }}
      >
        <YellowRamp />
      </CoverElement>
      <CoverElement
        id="dots"
        kind="box"
        className="pointer-events-none absolute left-0 h-[360px] w-full"
        style={{ top: 720, zIndex: z("dots"), color: "#8f7d22", opacity: 0.7 }}
      >
        <DotBand />
      </CoverElement>

      {badge
        ? MODULE_COLUMNS.map((ids, index) => (
            <CoverElement
              key={ids.badge}
              id={ids.badge}
              kind="box"
              className="absolute h-[90px] w-[80px]"
              style={{ left: index * MODULE_COLUMN_W + 380, top: BADGE_TOP, zIndex: z(ids.badge), color: MODULE_YELLOW }}
            >
              <RankBadge text={badge} height={90} />
            </CoverElement>
          ))
        : null}

      {tagline ? (
        <CoverElement
          id="tagline"
          defaultFont="display"
          defaultFontSize={22}
          className="absolute left-0 w-full text-center whitespace-nowrap uppercase"
          style={{ top: 770, zIndex: z("tagline"), color: "#a08c2c", letterSpacing: "0.95em", lineHeight: 1, fontWeight: 500 }}
        >
          {tagline}
        </CoverElement>
      ) : null}

      <CoverElement
        id="glow"
        kind="box"
        className="pointer-events-none absolute left-0 w-full"
        style={{ top: rowTop, height: rowH, zIndex: z("glow"), color: MODULE_YELLOW }}
      >
        <span
          className="absolute inset-0 flex items-end justify-center font-cn leading-none font-black whitespace-nowrap"
          style={{ transform: titleShift }}
        >
          <MotionStreak size={titleSize} color="currentColor" opacity={0.55}>
            <span style={{ fontSize: titleSize }}>{title}</span>
            <span style={{ fontSize: episodeSize, marginLeft: episodeGap }}>{episode}</span>
          </MotionStreak>
        </span>
      </CoverElement>

      <div
        data-module-title-row=""
        className="pointer-events-none absolute left-0 flex w-full items-end justify-center"
        style={{ top: rowTop, height: rowH }}
      >
        <CoverElement
          id="bracket-l"
          kind="box"
          className="pointer-events-auto shrink-0"
          style={{ width: bracketW, height: bracketH, marginBottom: (titleSize - bracketH) / 2, marginRight: titleSize * 0.04, color: MODULE_YELLOW, zIndex: z("bracket-l") }}
        >
          <ThinBracket side="l" thickness={bracketT} />
        </CoverElement>
        <CoverElement
          id="title"
          defaultFont="cn"
          defaultFontSize={titleSize}
          className="pointer-events-auto shrink-0 font-black whitespace-nowrap"
          style={{ color: "#ffffff", lineHeight: 1, zIndex: z("title") }}
        >
          <HaloWord>{title}</HaloWord>
        </CoverElement>
        <CoverElement
          id="episode"
          defaultFont="cn"
          defaultFontSize={episodeSize}
          className="pointer-events-auto shrink-0 font-black whitespace-nowrap"
          style={{ color: MODULE_YELLOW, lineHeight: 0.86, marginLeft: episodeGap, marginBottom: episodeSize * EPISODE_LIFT, zIndex: z("episode") }}
        >
          <HaloWord>{episode}</HaloWord>
        </CoverElement>
        <CoverElement
          id="bracket-r"
          kind="box"
          className="pointer-events-auto shrink-0"
          style={{ width: bracketW, height: bracketH, marginBottom: (titleSize - bracketH) / 2, marginLeft: titleSize * 0.06, color: MODULE_YELLOW, zIndex: z("bracket-r") }}
        >
          <ThinBracket side="r" thickness={bracketT} />
        </CoverElement>
      </div>

      <CoverElement id="frame" kind="box" className="pointer-events-none absolute inset-0" style={{ zIndex: z("frame"), color: MODULE_YELLOW }}>
        <InsetFrame />
      </CoverElement>
    </div>
  );
}
