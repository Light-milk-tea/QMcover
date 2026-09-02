import { useLayoutEffect, useRef, type PointerEvent, type RefObject } from "react";
import { isNativeElement } from "../data/elements";
import { imageLayerPan } from "../lib/document";
import { toLocalDelta } from "../lib/rotate";
import { useCover } from "../store/CoverContext";
import { RotateHandle } from "./RotateHandle";

type Handle = "nw" | "ne" | "sw" | "se";

const HANDLES: Handle[] = ["nw", "ne", "sw", "se"];

function resizeCursor(handle: Handle): string {
  return handle === "nw" || handle === "se" ? "nwse-resize" : "nesw-resize";
}

type Geometry = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export function SelectionOverlay({
  stageRef,
  previewScale,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  previewScale: number;
}) {
  const {
    templateId,
    draft,
    selectedId,
    selectedLayer,
    moveElement,
    patchElement,
    patchLayer,
    patchDraft,
  } = useCover();
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const resizing = useRef<Handle | null>(null);
  const last = useRef({ x: 0, y: 0 });
  const box = useRef<Geometry | null>(null);

  const hidden = Boolean(selectedLayer?.hidden || selectedLayer?.removed);
  const locked = Boolean(selectedLayer?.locked);
  const native = selectedId ? isNativeElement(templateId, selectedId, draft.canvasSkin) : false;

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const overlay = overlayRef.current;
    if (!stage || !overlay || !selectedId || hidden) {
      box.current = null;
      return;
    }

    const place = (next: Geometry) => {
      box.current = next;
      overlay.style.visibility = "visible";
      overlay.style.left = `${next.x}px`;
      overlay.style.top = `${next.y}px`;
      overlay.style.width = `${next.w}px`;
      overlay.style.height = `${next.h}px`;
    };

    if (!native && selectedLayer) {
      const pan = selectedLayer.kind === "image" ? imageLayerPan(selectedLayer, draft) : { x: 0, y: 0 };
      place({
        x: selectedLayer.x + pan.x,
        y: selectedLayer.y + pan.y,
        w: selectedLayer.w,
        h: selectedLayer.h,
      });
      return;
    }

    const target = [...stage.querySelectorAll<HTMLElement>("[data-cover-el]")].find(
      (element) => element.dataset.coverEl === selectedId,
    );
    if (!target) {
      box.current = null;
      overlay.style.visibility = "hidden";
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const scaleX = stageRect.width / stage.offsetWidth || previewScale || 1;
    const scaleY = stageRect.height / stage.offsetHeight || previewScale || 1;
    place({
      x: (targetRect.left - stageRect.left) / scaleX,
      y: (targetRect.top - stageRect.top) / scaleY,
      w: targetRect.width / scaleX,
      h: targetRect.height / scaleY,
    });
  }, [draft, hidden, native, previewScale, selectedId, selectedLayer, stageRef]);

  if (!selectedId || !selectedLayer || hidden) return null;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (locked || (event.target as HTMLElement).closest("[data-resize-handle],[data-rotate-handle]")) return;
    dragging.current = true;
    last.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (locked) return;
    const scale = previewScale || 1;
    const screenDx = (event.clientX - last.current.x) / scale;
    const screenDy = (event.clientY - last.current.y) / scale;
    if (screenDx === 0 && screenDy === 0) return;
    last.current = { x: event.clientX, y: event.clientY };

    if (resizing.current && !native) {
      const current = box.current;
      if (!current) return;
      const handle = resizing.current;
      const { dx, dy } = toLocalDelta(screenDx, screenDy, selectedLayer.rotation ?? 0);
      let { x, y, w, h } = current;
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
      const next = { x, y, w: Math.max(24, w), h: Math.max(24, h) };
      box.current = next;

      const pan = selectedLayer.kind === "image" ? imageLayerPan(selectedLayer, draft) : { x: 0, y: 0 };
      if (selectedLayer.kind === "image" && (pan.x || pan.y)) {
        patchLayer(selectedId, { ...next, imageX: 0, imageY: 0 });
        if (selectedId === "operator") patchDraft({ imageX: 0, imageY: 0 });
      } else {
        patchLayer(selectedId, next);
      }
      return;
    }

    if (dragging.current) moveElement(selectedId, screenDx, screenDy);
  };

  const onResizeDown = (handle: Handle) => (event: PointerEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (locked || native) return;
    resizing.current = handle;
    last.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const rotation = draft.elementStyles[selectedId]?.rotation ?? selectedLayer.rotation ?? 0;

  return (
    <div
      ref={overlayRef}
      data-ignore-export="true"
      data-selection-overlay={selectedId}
      data-testid="selection-overlay"
      aria-label={`移动${selectedLayer.label}`}
      className="absolute z-[200] touch-none"
      style={{
        visibility: "hidden",
        transform: !native && selectedLayer.rotation ? `rotate(${selectedLayer.rotation}deg)` : undefined,
        transformOrigin: "center center",
        cursor: locked ? "not-allowed" : "grab",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => {
        dragging.current = false;
        resizing.current = null;
      }}
    >
      <span className="pointer-events-none absolute inset-[-3px] border-2 border-accent bg-accent/[0.03]" />
      {!locked ? (
        <RotateHandle
          rotation={rotation}
          onChange={(next) => {
            if (native) patchElement(selectedId, { rotation: next });
            else patchLayer(selectedId, { rotation: next });
          }}
        />
      ) : null}
      {!locked && !native
        ? HANDLES.map((handle) => (
            <span
              key={handle}
              data-resize-handle={handle}
              className="absolute z-10 size-3 bg-accent"
              style={{
                cursor: resizeCursor(handle),
                left: handle.includes("w") ? -6 : undefined,
                right: handle.includes("e") ? -6 : undefined,
                top: handle.includes("n") ? -6 : undefined,
                bottom: handle.includes("s") ? -6 : undefined,
              }}
              onPointerDown={onResizeDown(handle)}
              onPointerMove={onPointerMove}
              onPointerUp={() => {
                resizing.current = null;
              }}
            />
          ))
        : null}
    </div>
  );
}
