import { getBgPreset } from "../data/backgrounds";
import type { ImageLayer } from "../types";
import { OperatorLayer } from "../templates/OperatorLayer";

export function PolaroidFrame({
  layer,
  imageUrl,
  previewScale,
  showPlaceholder,
}: {
  layer: ImageLayer;
  imageUrl: string;
  previewScale: number;
  showPlaceholder?: boolean;
}) {
  const background = getBgPreset(layer.frameBgPreset);

  return (
    <div
      data-polaroid-frame=""
      className="h-full w-full bg-[#f3eee4] p-[3%] pb-[11%]"
      style={{
        boxShadow:
          "0 28px 64px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 0 0 1px rgba(80,60,40,0.08)",
      }}
    >
      <div className="relative h-full w-full overflow-hidden bg-[#161a20]">
        <div data-polaroid-background="" className="pointer-events-none absolute inset-0 overflow-hidden">
          {background.url ? (
            <img
              src={background.url}
              alt=""
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              decoding="async"
              className="h-full w-full object-cover"
              style={{
                transform: `translate(${layer.frameBgX ?? 0}px, ${layer.frameBgY ?? 0}px) scale(${(layer.frameBgScale ?? 100) / 100})`,
                transformOrigin: "center center",
              }}
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(ellipse_at_50%_30%,#3a444e_0%,#161a20_70%)]" />
          )}
        </div>
        <div
          data-polaroid-art=""
          className="pointer-events-none absolute inset-0"
          style={{ transform: `translate(${layer.imageX ?? 0}px, ${layer.imageY ?? 0}px)` }}
        >
          <OperatorLayer
            layerId={layer.id}
            imageUrl={imageUrl}
            imageScale={layer.scale ?? 118}
            imageX={0}
            imageY={0}
            previewScale={previewScale}
            objectFit={layer.objectFit ?? "contain"}
            objectPosition={layer.objectPosition ?? "center bottom"}
            transformOrigin={layer.transformOrigin}
            showPlaceholder={showPlaceholder}
            emptyHint="从立绘库点选"
            className="h-full w-full"
            framed
            artGrade={layer.artGrade}
            onImageDrag={() => undefined}
          />
        </div>
      </div>
    </div>
  );
}
