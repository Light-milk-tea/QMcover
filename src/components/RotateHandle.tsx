import { type PointerEvent, useRef } from "react";
import { normalizeDeg, pointerDegrees, snapDeg } from "../lib/rotate";

type Props = {
  rotation: number;
  onChange: (deg: number) => void;
};

export function RotateHandle({ rotation, onChange }: Props) {
  const rotating = useRef(false);
  const origin = useRef({ x: 0, y: 0, start: 0, base: 0 });

  const onDown = (e: PointerEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const host = e.currentTarget.closest("[data-cover-el]") as HTMLElement | null;
    const rect = (host ?? e.currentTarget).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    origin.current = {
      x,
      y,
      start: pointerDegrees(e.clientX, e.clientY, x, y),
      base: rotation,
    };
    rotating.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (!rotating.current) return;
    const cur = pointerDegrees(e.clientX, e.clientY, origin.current.x, origin.current.y);
    let next = origin.current.base + (cur - origin.current.start);
    if (e.shiftKey) next = snapDeg(next);
    onChange(normalizeDeg(next));
  };

  return (
    <span
      data-ignore-export="true"
      data-rotate-handle=""
      title="拖转旋转，按住 Shift 吸附 15°，双击归零"
      className="absolute left-1/2 z-20 size-3 -translate-x-1/2 rounded-full border-2 border-white bg-accent shadow-[0_0_0_1px_rgba(20,22,24,0.2)]"
      style={{ top: -26, pointerEvents: "auto", cursor: rotating.current ? "grabbing" : "grab" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={() => {
        rotating.current = false;
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onChange(0);
      }}
    >
      <span className="pointer-events-none absolute top-full left-1/2 h-3.5 w-px -translate-x-1/2 bg-accent" />
    </span>
  );
}
