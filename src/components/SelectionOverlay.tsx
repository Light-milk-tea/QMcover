import { useEffect, useLayoutEffect, useRef, type PointerEvent, type RefObject } from "react";
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
    selectElement,
    patchElement,
    patchLayer,
    patchDraft,
  } = useCover();
  const overlayRef = useRef<HTMLDivElement>(null);
  const resizing = useRef<Handle | null>(null);
  const last = useRef({ x: 0, y: 0 });
  const box = useRef<Geometry | null>(null);
  const moveRef = useRef(moveElement);
  const selectRef = useRef(selectElement);
  const scaleRef = useRef(previewScale);
  moveRef.current = moveElement;
  selectRef.current = selectElement;
  scaleRef.current = previewScale;

  const hidden = Boolean(selectedLayer?.hidden || selectedLayer?.removed);
  const locked = Boolean(selectedLayer?.locked);
  const native = selectedId ? isNativeElement(templateId, selectedId, draft.canvasSkin) : false;
  const dragAnywhere = Boolean(selectedId && selectedLayer && !hidden && !locked);

  /** While a layer is selected, pressing any other layer drags the selected one; pressing blank canvas deselects. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !dragAnywhere || !selectedId) return;
    let release: (() => void) | null = null;

    const onDown = (event: globalThis.PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement;
      if (target.closest("[data-resize-handle],[data-rotate-handle]")) return;
      event.stopPropagation();
      event.preventDefault();
      if (!target.closest("[data-cover-el],[data-selection-overlay]")) {
        selectRef.current(null);
        return;
      }
      let lastX = event.clientX;
      let lastY = event.clientY;
      const onMove = (move: globalThis.PointerEvent) => {
        const scale = scaleRef.current || 1;
        const dx = (move.clientX - lastX) / scale;
        const dy = (move.clientY - lastY) / scale;
        if (dx === 0 && dy === 0) return;
        lastX = move.clientX;
        lastY = move.clientY;
        moveRef.current(selectedId, dx, dy);
      };
      const onUp = () => release?.();
      release = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        release = null;
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };

    stage.addEventListener("pointerdown", onDown, true);
    stage.dataset.dragSelected = "";
    return () => {
      stage.removeEventListener("pointerdown", onDown, true);
      delete stage.dataset.dragSelected;
      release?.();
    };
  }, [dragAnywhere, selectedId, stageRef]);

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

  const onResizeMove = (event: PointerEvent<HTMLElement>) => {
    if (locked || native || !resizing.current) return;
    const scale = previewScale || 1;
    const screenDx = (event.clientX - last.current.x) / scale;
    const screenDy = (event.clientY - last.current.y) / scale;
    if (screenDx === 0 && screenDy === 0) return;
    last.current = { x: event.clientX, y: event.clientY };

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
  };

  const onResizeDown = (handle: Handle) => (event: PointerEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (locked || native) return;
    resizing.current = handle;
    last.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const rotation = draft.elementStyles[selectedId]?.rotation ?? selectedLayer.rotation ?? 0;
  /** The overlay lives in stage pixels, so screen-sized strokes and handles are divided by the preview scale. */
  const px = 1 / (previewScale || 1);
  const handleSize = 10 * px;

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
        cursor: locked ? "not-allowed" : "move",
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={() => {
        resizing.current = null;
      }}
    >
      <span
        data-selection-outline=""
        className="pointer-events-none absolute border-solid border-accent bg-accent/[0.08]"
        style={{
          inset: -2 * px,
          borderWidth: 2 * px,
          boxShadow: `0 0 0 ${1.5 * px}px rgba(255,255,255,0.9), inset 0 0 0 ${1 * px}px rgba(255,255,255,0.55)`,
        }}
      />
      {!locked ? (
        <RotateHandle
          rotation={rotation}
          scale={previewScale}
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
              className="absolute z-10 border-solid border-white bg-accent"
              style={{
                width: handleSize,
                height: handleSize,
                borderWidth: 1.5 * px,
                boxShadow: `0 0 0 ${1 * px}px rgba(20,22,24,0.25)`,
                cursor: resizeCursor(handle),
                left: handle.includes("w") ? -handleSize / 2 : undefined,
                right: handle.includes("e") ? -handleSize / 2 : undefined,
                top: handle.includes("n") ? -handleSize / 2 : undefined,
                bottom: handle.includes("s") ? -handleSize / 2 : undefined,
              }}
              onPointerDown={onResizeDown(handle)}
              onPointerMove={onResizeMove}
              onPointerUp={() => {
                resizing.current = null;
              }}
            />
          ))
        : null}
    </div>
  );
}
