import { useRef } from "react";
import type { PointerEvent } from "react";
import { useElementEdit } from "../components/CoverElement";
import { isNativeElement } from "../data/elements";
import { layerZIndex } from "../lib/document";
import { useCoverOptional } from "../store/CoverContext";
import { IMAGE_EDGE_FADE_DEFAULT, IMAGE_EDGE_FADE_MAX, IMAGE_EDGE_FADE_MIN } from "../constants";
import { useCdnSrc } from "../lib/cdn";
import { artGradeFilter, type ArtFringeRole } from "../lib/effects";
import type { ArtGradeEffect } from "../types";

type Props = {
  layerId?: string;
  imageUrl: string;
  artGrade?: ArtGradeEffect;
  fringeRole?: ArtFringeRole;
  imageScale: number;
  imageX: number;
  imageY: number;
  previewScale: number;
  onImageDrag: (dx: number, dy: number) => void;
  className?: string;
  objectFit?: "contain" | "cover";
  showPlaceholder?: boolean;
  fadeRight?: boolean;
  fadeLeft?: boolean;
  fadeBottom?: boolean;
  fadeRightSolid?: number;
  fadeLeftSolid?: number;
  fadeBottomSolid?: number;
  transformOrigin?: string;
  objectPosition?: string;
  imageEdgeFade?: boolean;
  imageEdgeFadeAmount?: number;
  framed?: boolean;
  emptyHint?: string;
};

export function OperatorLayer({
  layerId = "operator",
  imageUrl,
  imageScale,
  imageX,
  imageY,
  previewScale,
  onImageDrag,
  className = "",
  objectFit = "contain",
  showPlaceholder = true,
  fadeRight = false,
  fadeLeft = false,
  fadeBottom = false,
  fadeRightSolid = 66,
  fadeLeftSolid = 22,
  fadeBottomSolid = 86,
  transformOrigin = "center center",
  objectPosition,
  imageEdgeFade = false,
  imageEdgeFadeAmount = IMAGE_EDGE_FADE_DEFAULT,
  framed = false,
  emptyHint = "从立绘库点选",
  artGrade,
  fringeRole,
}: Props) {
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const edit = useElementEdit();
  const cover = useCoverOptional();
  const remote = useCdnSrc(imageUrl);
  const selfLayer = cover?.draft.layers.find((layer) => layer.id === layerId);
  const interactive = (edit?.interactive ?? false) && !selfLayer?.locked;
  const hidden = Boolean(selfLayer?.hidden || selfLayer?.removed);
  const zIndex = cover ? layerZIndex(cover.draft.layers, layerId) : undefined;

  const rotation = edit?.styles[layerId]?.rotation ?? selfLayer?.rotation ?? 0;
  const ownChrome = cover ? isNativeElement(cover.templateId, layerId, cover.draft.canvasSkin) : !framed;
  const insideFrame = framed || !ownChrome;
  const expandArt = !insideFrame && !fadeBottom && objectFit !== "cover";
  const panX = insideFrame ? 0 : imageX;
  const panY = insideFrame ? 0 : imageY;

  const onPointerDown = (e: PointerEvent<HTMLImageElement>) => {
    if (insideFrame) return;
    e.stopPropagation();
    if (interactive) edit?.select(layerId);
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  if (hidden && !imageUrl) return null;

  if (!imageUrl) {
    if (!showPlaceholder) return <div className={className} />;
    return (
      <div className={`grid place-items-center text-[#efe8de]/35 ${className}`}>
        <p className="font-cn text-[42px] tracking-wide">{emptyHint}</p>
      </div>
    );
  }

  const wrapTransform = [
    !insideFrame && (panX || panY) ? `translate(${panX}px, ${panY}px)` : "",
    rotation ? `rotate(${rotation}deg)` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const layerGrade = selfLayer?.kind === "image" ? selfLayer.artGrade : undefined;
  const grade = layerGrade ?? artGrade;
  const role = fringeRole ?? (layerId === "operator-b" ? "back" : "front");
  const gradeFilter = artGradeFilter(grade, role);

  return (
    <div
      data-cover-el={layerId}
      className={`relative ${className}`}
      style={{
        zIndex,
        visibility: hidden ? "hidden" : undefined,
        pointerEvents: "none",
        transform: wrapTransform || undefined,
        transformOrigin: rotation ? "center center" : transformOrigin,
        filter: gradeFilter,
      }}
    >
      <div
        className={
          expandArt
            ? "pointer-events-none absolute left-0 top-[-200%] h-[500%] w-full overflow-visible"
            : "pointer-events-none h-full w-full overflow-visible"
        }
        style={(() => {
          const masks: string[] = [];
          if (fadeRight) {
            const solid = Math.min(90, Math.max(20, fadeRightSolid));
            const gone = Math.min(100, solid + 28);
            masks.push(`linear-gradient(90deg, #000 0%, #000 ${solid}%, transparent ${gone}%)`);
          }
          if (fadeLeft) {
            const solid = Math.min(90, Math.max(8, fadeLeftSolid));
            masks.push(`linear-gradient(90deg, transparent 0%, #000 ${solid}%, #000 100%)`);
          }
          if (fadeBottom) {
            const solid = Math.min(90, Math.max(30, fadeBottomSolid));
            masks.push(`linear-gradient(180deg, #000 0%, #000 ${solid}%, transparent 100%)`);
          }
          if (masks.length === 0) return undefined;
          const image = masks.join(", ");
          return {
            WebkitMaskImage: image,
            maskImage: image,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            ...(masks.length > 1
              ? { WebkitMaskComposite: "source-in" as const, maskComposite: "intersect" as const }
              : {}),
          };
        })()}
      >
        <img
          src={remote.src}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          fetchPriority="high"
          draggable={false}
          onLoad={remote.onLoad}
          onError={remote.onError}
          onPointerDown={onPointerDown}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            const scale = previewScale || 1;
            onImageDrag((e.clientX - last.current.x) / scale, (e.clientY - last.current.y) / scale);
            last.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          className={
            expandArt
              ? "absolute left-0 top-[40%] h-[20%] w-full select-none"
              : "h-full w-full select-none"
          }
          style={{
            objectFit,
            objectPosition,
            transformOrigin,
            transform: `scale(${imageScale / 100})`,
            pointerEvents: hidden || insideFrame ? "none" : "auto",
            cursor: dragging.current ? "grabbing" : "grab",
            ...(imageEdgeFade
              ? (() => {
                  const edge = Math.min(IMAGE_EDGE_FADE_MAX, Math.max(IMAGE_EDGE_FADE_MIN, imageEdgeFadeAmount));
                  const inner = 100 - edge;
                  const masks = [
                    `linear-gradient(to right, transparent, #000 ${edge}%, #000 ${inner}%, transparent)`,
                    `linear-gradient(to bottom, transparent, #000 ${edge}%, #000 ${inner}%, transparent)`,
                  ].join(", ");
                  return {
                    WebkitMaskImage: masks,
                    maskImage: masks,
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskComposite: "source-in" as const,
                    maskComposite: "intersect" as const,
                  };
                })()
              : {}),
          }}
        />
      </div>
      {remote.loading || remote.failed ? (
        <span
          data-ignore-export="true"
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <span
            className={`inline-flex items-center gap-4 rounded-[14px] px-10 py-5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] ring-1 ${
              remote.failed
                ? "bg-[#2a1214]/86 ring-[#fb7299]/35"
                : "bg-[#0c1016]/82 ring-white/18"
            }`}
          >
            <span
              className={`size-3.5 shrink-0 rounded-full ${remote.failed ? "bg-[#fb7299]" : "bg-[#f4d06f]"}`}
            />
            <span
              className={`font-cn text-[72px] font-black tracking-[0.16em] ${
                remote.failed ? "text-[#ffe4ea]" : "text-[#fff6ea]"
              }`}
            >
              {remote.failed ? "立绘加载失败" : "立绘载入中"}
            </span>
          </span>
        </span>
      ) : null}
    </div>
  );
}
