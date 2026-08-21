import { useRef } from "react";
import type { PointerEvent } from "react";
import { useElementEdit } from "../components/CoverElement";

type Props = {
  imageUrl: string;
  imageScale: number;
  imageX: number;
  imageY: number;
  previewScale: number;
  onImageDrag: (dx: number, dy: number) => void;
  className?: string;
  objectFit?: "contain" | "cover";
  showPlaceholder?: boolean;
};

export function OperatorLayer({
  imageUrl,
  imageScale,
  imageX,
  imageY,
  previewScale,
  onImageDrag,
  className = "",
  objectFit = "contain",
  showPlaceholder = true,
}: Props) {
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const edit = useElementEdit();
  const selected = edit?.selectedId === "operator";
  const interactive = edit?.interactive ?? false;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (interactive) edit?.select("operator");
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  if (!imageUrl) {
    if (!showPlaceholder) return <div className={className} />;
    return (
      <div className={`grid place-items-center text-[#efe8de]/35 ${className}`}>
        <p className="font-cn text-[42px] tracking-wide">从立绘库点选</p>
      </div>
    );
  }

  return (
    <div
      data-cover-el="operator"
      className={`relative ${className}`}
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
    >
      <img
        src={imageUrl}
        alt=""
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        decoding="async"
        draggable={false}
        className="h-full w-full select-none"
        style={{
          objectFit,
          transform: `translate(${imageX}px, ${imageY}px) scale(${imageScale / 100})`,
          cursor: dragging.current ? "grabbing" : "grab",
        }}
      />
      {selected && interactive ? (
        <span
          data-ignore-export="true"
          className="pointer-events-none absolute inset-0 border-2 border-accent"
        />
      ) : null}
    </div>
  );
}
