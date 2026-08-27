import { artUrl } from "../data/arts";
import { fontClass } from "../data/elements";
import { IMAGE_EDGE_FADE_DEFAULT } from "../constants";
import { layerZIndex } from "../lib/document";
import type { CoverRenderProps, Draft, ImageLayer, Layer } from "../types";
import { OperatorLayer } from "../templates/OperatorLayer";
import { CanvasBackdrop, skinGlassUrl } from "./CanvasSkin";
import { renderBoxChrome, renderTextContent } from "./LayerChrome";
import { LayerFrame } from "./LayerFrame";
import { ElementEditProvider } from "../components/CoverElement";
import { useCoverOptional } from "../store/CoverContext";

function imageSrc(layer: ImageLayer, props: CoverRenderProps): string {
  if (layer.imageDataUrl) return layer.imageDataUrl;
  if (layer.imageUrl) return layer.imageUrl;
  if (layer.artId) return artUrl(layer.artId);
  if (layer.source === "upload") return "";
  if (layer.id === "operator") return props.imageUrl;
  return "";
}

function ImageView({ layer, props }: { layer: ImageLayer; props: CoverRenderProps }) {
  const src = imageSrc(layer, props);
  const scale = layer.scale ?? props.imageScale;

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
      showPlaceholder={props.showPlaceholder}
      emptyHint={layer.source === "upload" ? "上传本地图片" : "从立绘库点选"}
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
          .map((layer) => (
            <LayerFrame
              key={layer.id}
              layer={layer}
              previewScale={props.previewScale}
              zIndex={layerZIndex(cover?.draft.layers ?? layers, layer.id)}
            >
              {layer.kind === "text" && draft ? renderTextContent(layer, draft, glassUrl) : null}
              {layer.kind === "text" && !draft ? (
                <span className={`${fontClass(layer.font)} font-black`} style={{ fontSize: layer.fontSize, color: layer.color }}>
                  {layer.text}
                </span>
              ) : null}
              {layer.kind === "box" ? renderBoxChrome(layer) : null}
              {layer.kind === "image" ? <ImageView layer={layer} props={props} /> : null}
            </LayerFrame>
          ))}
      </div>
    </ElementEditProvider>
  );
}
