import { type PointerEvent, useRef, type ReactNode } from "react";
import { imageLayerPan } from "../lib/document";
import { useCoverOptional } from "../store/CoverContext";
import type { Layer } from "../types";

type Props = {
  layer: Layer;
  previewScale: number;
  zIndex?: number;
  children: ReactNode;
};

export function LayerFrame({ layer, previewScale, zIndex, children }: Props) {
  const cover = useCoverOptional();
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const pan = layer.kind === "image" ? imageLayerPan(layer, cover?.draft) : { x: 0, y: 0 };
  const visual = { x: layer.x + pan.x, y: layer.y + pan.y, w: layer.w, h: layer.h };
  const box = useRef(visual);
  box.current = visual;

  const selected = cover?.selectedId === layer.id;
  const interactive = Boolean(cover) && !layer.locked;
  const hidden = Boolean(layer.hidden);

  const applyBox = (next: { x: number; y: number; w: number; h: number }) => {
    box.current = next;
    if (layer.kind === "image" && (pan.x || pan.y)) {
      cover?.patchLayer(layer.id, { ...next, imageX: 0, imageY: 0 });
      if (layer.id === "operator") cover?.patchDraft({ imageX: 0, imageY: 0 });
      return;
    }
    cover?.patchLayer(layer.id, next);
  };

  const onDragDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive || !cover) return;
    e.stopPropagation();
    cover.selectElement(layer.id);
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!cover) return;
    const scale = previewScale || 1;
    const screenDx = (e.clientX - last.current.x) / scale;
    const screenDy = (e.clientY - last.current.y) / scale;
    if (screenDx === 0 && screenDy === 0) return;
    last.current = { x: e.clientX, y: e.clientY };
    const cur = box.current;
    if (dragging.current) applyBox({ ...cur, x: cur.x + screenDx, y: cur.y + screenDy });
  };

  return (
    <div
      data-cover-el={layer.id}
      data-ignore-export={hidden ? "true" : undefined}
      className="absolute"
      style={{
        left: visual.x,
        top: visual.y,
        width: visual.w,
        height: visual.h,
        color: layer.color,
        opacity: hidden ? 0.28 : (layer.opacity != null && layer.kind !== "box" ? layer.opacity / 100 : 1),
        transform: [layer.id === "watermark-flip" ? "scaleY(-1)" : "", layer.rotation ? `rotate(${layer.rotation}deg)` : ""]
          .filter(Boolean)
          .join(" ") || undefined,
        transformOrigin: "center center",
        zIndex,
        cursor: interactive ? "grab" : undefined,
        pointerEvents: "none",
        display: hidden && !selected ? "none" : undefined,
      }}
      onPointerDown={onDragDown}
      onPointerMove={onMove}
      onPointerUp={() => {
        dragging.current = false;
      }}
    >
      <div
        className="h-full w-full overflow-visible"
        style={{ pointerEvents: hidden ? "none" : "auto" }}
      >
        {children}
      </div>
    </div>
  );
}
