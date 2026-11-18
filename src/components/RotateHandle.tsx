import { type PointerEvent, useRef } from "react";
import { normalizeDeg, pointerDegrees, snapDeg } from "../lib/rotate";

type Props = {
  rotation: number;
  onChange: (deg: number) => void;
  /** Preview scale of the stage the handle sits in; keeps the knob a constant size on screen. */
  scale?: number;
};

export function RotateHandle({ rotation, onChange, scale = 1 }: Props) {
  const px = 1 / (scale || 1);
  const knob = 12 * px;
  const gap = 14 * px;
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
      className="absolute left-1/2 z-20 -translate-x-1/2 rounded-full border-solid border-white bg-accent"
      style={{
        top: -(knob + gap),
        width: knob,
        height: knob,
        borderWidth: 2 * px,
        boxShadow: `0 0 0 ${1 * px}px rgba(20,22,24,0.2)`,
        pointerEvents: "auto",
        cursor: rotating.current ? "grabbing" : "grab",
      }}
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
      <span
        className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 bg-accent"
        style={{ height: gap, width: 1.5 * px }}
      />
    </span>
  );
}
