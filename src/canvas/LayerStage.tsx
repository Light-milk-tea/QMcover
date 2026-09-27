import { Fragment } from "react";
import { artUrl, findOperatorByName } from "../data/arts";
import { resolveChibiUrl } from "../data/chibis";
import { fontClass } from "../data/elements";
import { IMAGE_EDGE_FADE_DEFAULT, IMAGE_EDGE_FADE_MODE_DEFAULT } from "../constants";
import { LightUnderlay } from "../effects/CoverEffectsStage";
import { isChibiLayer, layerZIndex } from "../lib/document";
import type { CoverRenderProps, Draft, ImageLayer, Layer } from "../types";
import { OperatorLayer } from "../templates/OperatorLayer";
import { CanvasBackdrop, skinGlassUrl } from "./CanvasSkin";
import { renderBoxChrome, renderTextContent } from "./LayerChrome";
import { LayerFrame } from "./LayerFrame";
import { PolaroidFrame } from "./PolaroidFrame";
import { ElementEditProvider } from "../components/CoverElement";
import { useCoverOptional } from "../store/CoverContext";

function imageSrc(layer: ImageLayer, props: CoverRenderProps): string {
  if (isChibiLayer(layer)) return resolveChibiUrl(layer);
  if (layer.imageDataUrl) return layer.imageDataUrl;
  if (layer.imageUrl) return layer.imageUrl;
  if (layer.artId) return artUrl(layer.artId);
  if (layer.source === "upload") return "";
  if (layer.id === "operator") return props.imageUrl;
  return "";
}

/** The art the light is layered against: the main operator, else the lowest plain art layer. */
function lightAnchor(layers: Layer[]): Layer | undefined {
  const art = layers.filter(
    (layer): layer is ImageLayer => layer.kind === "image" && !layer.removed && !layer.hidden && !layer.frame && !isChibiLayer(layer),
  );
  return art.find((layer) => layer.id === "operator") ?? art[0];
}

function ImageView({ layer, props }: { layer: ImageLayer; props: CoverRenderProps }) {
  const src = imageSrc(layer, props);
  const scale = layer.scale ?? props.imageScale;

  if (layer.frame === "polaroid") {
    return (
      <PolaroidFrame
        layer={layer}
        imageUrl={src}
        previewScale={props.previewScale}
        showPlaceholder={props.showPlaceholder}
      />
    );
  }

  return (
    <OperatorLayer
      layerId={layer.id}
      imageUrl={src}
      imageScale={scale}
      imageX={0}
      imageY={0}
      previewScale={props.previewScale}
      objectFit={layer.objectFit ?? "contain"}
      objectPosition={layer.objectPosition}
      transformOrigin={layer.transformOrigin}
      fadeRight={layer.fadeRight}
      fadeRightSolid={layer.fadeRightSolid}
      imageEdgeFade={layer.edgeFade ?? (layer.id === "operator" ? props.imageEdgeFade : false)}
      imageEdgeFadeAmount={layer.edgeFadeAmount ?? props.imageEdgeFadeAmount ?? IMAGE_EDGE_FADE_DEFAULT}
      imageEdgeFadeMode={layer.edgeFadeMode ?? (layer.id === "operator" ? props.imageEdgeFadeMode : undefined) ?? IMAGE_EDGE_FADE_MODE_DEFAULT}
      showPlaceholder={props.showPlaceholder}
      emptyHint={layer.source === "upload" ? "上传本地图片" : isChibiLayer(layer) ? "从小人库点选" : "从立绘库点选"}
      className="h-full w-full"
      framed
      artGrade={layer.artGrade}
      onImageDrag={() => undefined}
    />
  );
}

export function LayerStage(
  props: CoverRenderProps & {
    overlay?: boolean;
    extraLayers?: Layer[];
  },
) {
  const cover = useCoverOptional();
  const layers = (props.extraLayers ?? cover?.draft.layers ?? props.layers ?? []) as Layer[];
  const stack = cover?.draft.layers ?? layers;
  const skin = cover?.draft.canvasSkin ?? props.canvasSkin ?? "plain";
  const glassUrl = skinGlassUrl(props.textBgPreset, props.bgPreset);
  const draft = (cover?.draft ?? {
    title: props.title,
    subtitle: props.subtitle,
    signature: props.signature,
    mark: props.mark,
    episode: props.episode,
    operatorName: props.operatorName,
    layers,
    canvasSkin: skin,
  }) as Draft;
  const art = {
    operatorId: cover?.draft.operatorId || findOperatorByName(props.operatorName)?.id,
    imageUrl: props.imageUrl,
  };
  // On the plain canvas the light sits right under (or over) the art layer, so
  // text stacked above the art is never washed out.
  const light = skin === "plain" && !props.overlay && props.effects?.light.enabled ? props.effects.light : undefined;
  const anchor = light ? lightAnchor(layers) : undefined;
  const lightLayer = (zIndex: number) =>
    light ? (
      <div
        data-light-depth={anchor ? (light.depth ?? "behind") : "top"}
        className="pointer-events-none absolute inset-0"
        style={{ zIndex }}
      >
        <LightUnderlay effect={light} />
      </div>
    ) : null;

  return (
    <ElementEditProvider styles={props.elementStyles ?? {}} previewScale={props.previewScale} interactive={props.showPlaceholder !== false}>
      <div
        className={props.overlay ? "pointer-events-none absolute inset-0" : "relative h-full w-full overflow-hidden"}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("[data-cover-el]")) return;
          cover?.selectElement(null);
        }}
      >
        {props.overlay ? null : (
          <CanvasBackdrop
            skin={skin}
            bgPreset={props.bgPreset}
            textBgPreset={props.textBgPreset}
            bgDim={props.bgDim}
            bgDimAmount={props.bgDimAmount}
            ornamentId={props.ornamentId}
            paper={props.paper ?? cover?.draft.paper}
            bgGrade={props.effects?.bgGrade}
          />
        )}
        {[...layers]
          .filter((layer) => !layer.removed && typeof layer.id === "string")
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((layer) => {
            const zIndex = layerZIndex(stack, layer.id);
            const lit = light && anchor?.id === layer.id;
            // Equal z-index: DOM order decides whether the light paints under or over the art.
            return (
              <Fragment key={layer.id}>
                {lit && light.depth !== "front" ? lightLayer(zIndex) : null}
                <LayerFrame layer={layer} previewScale={props.previewScale} zIndex={zIndex}>
                  {layer.kind === "text" && draft ? renderTextContent(layer, draft, glassUrl) : null}
                  {layer.kind === "text" && !draft ? (
                    <span className={`${fontClass(layer.font)} font-black`} style={{ fontSize: layer.fontSize, color: layer.color }}>
                      {layer.text}
                    </span>
                  ) : null}
                  {layer.kind === "box" ? renderBoxChrome(layer, art) : null}
                  {layer.kind === "image" ? <ImageView layer={layer} props={props} /> : null}
                </LayerFrame>
                {lit && light.depth === "front" ? lightLayer(zIndex) : null}
              </Fragment>
            );
          })}
        {light && !anchor ? lightLayer(stack.length + 1) : null}
      </div>
    </ElementEditProvider>
  );
}
