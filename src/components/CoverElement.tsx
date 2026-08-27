import { createContext, useContext, useEffect, type CSSProperties, type PointerEvent, type ReactNode, useRef } from "react";
import { fontClass, isNativeElement } from "../data/elements";
import { layerZIndex } from "../lib/document";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverFontId, ElementKind, ElementOverride } from "../types";
import { RotateHandle } from "./RotateHandle";

function impliedColor(className: string, style?: CSSProperties, override?: string): string | undefined {
  if (override) return override;
  if (typeof style?.color === "string" && style.color) return style.color;
  const hex = className.match(/text-\[(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}))\]/);
  if (hex) return hex[1];
  if (/\btext-white(?:\/\d+)?\b/.test(className)) return "#ffffff";
  if (/\btext-black\b/.test(className)) return "#141618";
  return undefined;
}

type EditValue = {
  styles: Record<string, ElementOverride>;
  selectedId: string | null;
  interactive: boolean;
  previewScale: number;
  select: (id: string | null) => void;
  patchElement: (id: string, patch: Partial<ElementOverride>) => void;
  nudgeElement: (id: string, dx: number, dy: number) => void;
};

const ElementEditContext = createContext<EditValue | null>(null);

export function ElementEditProvider({
  styles,
  previewScale,
  interactive,
  children,
}: {
  styles: Record<string, ElementOverride>;
  previewScale: number;
  interactive: boolean;
  children: ReactNode;
}) {
  const cover = useCoverOptional();
  const value: EditValue = {
    styles,
    selectedId: cover?.selectedId ?? null,
    interactive: interactive && Boolean(cover),
    previewScale,
    select: cover?.selectElement ?? (() => undefined),
    patchElement: cover?.patchElement ?? (() => undefined),
    nudgeElement: cover?.nudgeElement ?? (() => undefined),
  };
  return <ElementEditContext.Provider value={value}>{children}</ElementEditContext.Provider>;
}

export function useElementEdit() {
  return useContext(ElementEditContext);
}

type Props = {
  id: string;
  kind?: ElementKind;
  defaultFontSize?: number;
  defaultFont?: CoverFontId;
  defaultX?: number;
  defaultY?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export function CoverElement({
  id,
  defaultFontSize,
  defaultFont = "cn",
  defaultX = 0,
  defaultY = 0,
  className = "",
  style,
  children,
}: Props) {
  const edit = useElementEdit();
  const cover = useCoverOptional();
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const override = edit?.styles[id] ?? {};
  const nativeLayer = cover?.draft.layers.find((layer) => layer.id === id);
  const font = override.font ?? defaultFont;
  const fontSize = override.fontSize ?? defaultFontSize;
  const color = impliedColor(className, style, override.color);
  const x = override.x ?? defaultX;
  const y = override.y ?? defaultY;
  const rotation = override.rotation ?? nativeLayer?.rotation ?? 0;
  const pos = useRef({ x, y });
  pos.current = { x, y };
  useEffect(() => {
    cover?.reportElementResolved(id, { fontSize, font, color, x, y });
  }, [cover, id, fontSize, font, color, x, y]);
  const selected = edit?.selectedId === id;
  const interactive = edit?.interactive ?? false;
  const hidden =
    isNativeElement(cover?.templateId ?? "", id, cover?.draft.canvasSkin) &&
    Boolean(nativeLayer?.hidden || nativeLayer?.removed);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive || !edit) return;
    if ((e.target as HTMLElement).closest("[data-rotate-handle]")) return;
    e.stopPropagation();
    edit.select(id);
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    pos.current = { x, y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !edit) return;
    const scale = edit.previewScale || 1;
    const next = {
      x: pos.current.x + (e.clientX - last.current.x) / scale,
      y: pos.current.y + (e.clientY - last.current.y) / scale,
    };
    pos.current = next;
    last.current = { x: e.clientX, y: e.clientY };
    edit.patchElement(id, next);
  };

  const positioned = /\b(absolute|fixed|sticky)\b/.test(className);
  if (hidden) return null;

  return (
    <div
      data-cover-el={id}
      className={`${positioned ? "" : "relative"} block ${fontClass(font)} ${className}`}
      style={{
        ...style,
        fontSize: fontSize,
        ...(override.color ? { color: override.color } : {}),
        transform: `translate(${x}px, ${y}px)${rotation ? ` rotate(${rotation}deg)` : ""}${style?.transform ? ` ${style.transform}` : ""}`,
        zIndex: cover ? layerZIndex(cover.draft.layers, id) : undefined,
        cursor: interactive ? (dragging.current ? "grabbing" : "grab") : undefined,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => {
        dragging.current = false;
      }}
    >
      {children}
      {selected && interactive ? (
        <>
          <span
            data-ignore-export="true"
            className="pointer-events-none absolute inset-[-8px] border-2 border-accent"
          />
          <RotateHandle rotation={rotation} onChange={(deg) => edit.patchElement(id, { rotation: deg })} />
        </>
      ) : null}
    </div>
  );
}
