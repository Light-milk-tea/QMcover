import { createContext, useContext, type CSSProperties, type PointerEvent, type ReactNode, useRef } from "react";
import { fontClass } from "../data/elements";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverFontId, ElementKind, ElementOverride } from "../types";

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
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export function CoverElement({
  id,
  defaultFontSize,
  defaultFont = "cn",
  className = "",
  style,
  children,
}: Props) {
  const edit = useElementEdit();
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const override = edit?.styles[id] ?? {};
  const font = override.font ?? defaultFont;
  const fontSize = override.fontSize ?? defaultFontSize;
  const x = override.x ?? 0;
  const y = override.y ?? 0;
  const selected = edit?.selectedId === id;
  const interactive = edit?.interactive ?? false;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive || !edit) return;
    e.stopPropagation();
    edit.select(id);
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !edit) return;
    const scale = edit.previewScale || 1;
    edit.nudgeElement(id, (e.clientX - last.current.x) / scale, (e.clientY - last.current.y) / scale);
    last.current = { x: e.clientX, y: e.clientY };
  };

  const positioned = /\b(absolute|fixed|sticky)\b/.test(className);

  return (
    <div
      data-cover-el={id}
      className={`${positioned ? "" : "relative"} block ${fontClass(font)} ${className}`}
      style={{
        ...style,
        fontSize: fontSize,
        ...(override.color ? { color: override.color } : {}),
        transform: `translate(${x}px, ${y}px)${style?.transform ? ` ${style.transform}` : ""}`,
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
        <span
          data-ignore-export="true"
          className="pointer-events-none absolute inset-[-8px] border-2 border-accent"
        />
      ) : null}
    </div>
  );
}
