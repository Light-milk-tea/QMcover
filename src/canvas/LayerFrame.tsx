import { type PointerEvent, useRef, type ReactNode } from "react";
import { RotateHandle } from "../components/RotateHandle";
import { imageLayerPan } from "../lib/document";
import { toLocalDelta } from "../lib/rotate";
import { useCoverOptional } from "../store/CoverContext";
import type { Layer } from "../types";

type Handle = "nw" | "ne" | "sw" | "se";

const HANDLES: Handle[] = ["nw", "ne", "sw", "se"];

function cursor(handle: Handle): string {
  if (handle === "nw" || handle === "se") return "nwse-resize";
  return "nesw-resize";
}

type Props = {
  layer: Layer;
  previewScale: number;
  zIndex?: number;
  children: ReactNode;
};

export function LayerFrame({ layer, previewScale, zIndex, children }: Props) {
  const cover = useCoverOptional();
  const dragging = useRef(false);
  const resizing = useRef<Handle | null>(null);
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
    if ((e.target as HTMLElement).closest("[data-resize-handle],[data-rotate-handle]")) return;
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
    if (resizing.current) {
      const handle = resizing.current;
      const { dx, dy } = toLocalDelta(screenDx, screenDy, layer.rotation ?? 0);
      let { x, y, w, h } = cur;
      if (handle.includes("w")) {
        x += dx;
        w -= dx;
      }
      if (handle.includes("e")) w += dx;
      if (handle.includes("n")) {
        y += dy;
        h -= dy;
      }
      if (handle.includes("s")) h += dy;
      applyBox({ x, y, w: Math.max(24, w), h: Math.max(24, h) });
      return;
    }
    if (dragging.current) applyBox({ ...cur, x: cur.x + screenDx, y: cur.y + screenDy });
  };

  const onResizeDown = (handle: Handle) => (e: PointerEvent<HTMLSpanElement>) => {
    if (!interactive || !cover) return;
    e.stopPropagation();
    cover.selectElement(layer.id);
    resizing.current = handle;
    last.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
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
        resizing.current = null;
      }}
    >
      <div
        className="h-full w-full overflow-visible"
        style={{ pointerEvents: hidden ? "none" : layer.kind === "image" ? "none" : "auto" }}
      >
        {children}
      </div>
      {selected && interactive ? (
        <>
          <span data-ignore-export="true" className="pointer-events-none absolute inset-[-2px] border-2 border-accent" />
          <RotateHandle
            rotation={layer.rotation ?? 0}
            onChange={(deg) => cover?.patchLayer(layer.id, { rotation: deg })}
          />
          {HANDLES.map((handle) => (
            <span
              key={handle}
              data-ignore-export="true"
              data-resize-handle={handle}
              className="absolute z-10 size-3 bg-accent"
              style={{
                pointerEvents: "auto",
                cursor: cursor(handle),
                left: handle.includes("w") ? -6 : undefined,
                right: handle.includes("e") ? -6 : undefined,
                top: handle.includes("n") ? -6 : undefined,
                bottom: handle.includes("s") ? -6 : undefined,
              }}
              onPointerDown={onResizeDown(handle)}
              onPointerMove={onMove}
              onPointerUp={() => {
                resizing.current = null;
              }}
            />
          ))}
        </>
      ) : null}
    </div>
  );
}
