import { useRef } from "react";
import type { PointerEvent } from "react";
import { useElementEdit } from "../components/CoverElement";
import { useCdnSrc } from "../lib/cdn";

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
  fadeRight?: boolean;
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
  fadeRight = false,
}: Props) {
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const edit = useElementEdit();
  const selected = edit?.selectedId === "operator";
  const interactive = edit?.interactive ?? false;
  const remote = useCdnSrc(imageUrl);

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
      className={`relative z-[1] ${className}`}
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
      <div
        className="h-full w-full"
        style={
          fadeRight
            ? {
                WebkitMaskImage: "linear-gradient(90deg, #000 0%, #000 66%, transparent 100%)",
                maskImage: "linear-gradient(90deg, #000 0%, #000 66%, transparent 100%)",
              }
            : undefined
        }
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
          className="h-full w-full select-none"
          style={{
            objectFit,
            transform: `translate(${imageX}px, ${imageY}px) scale(${imageScale / 100})`,
            cursor: dragging.current ? "grabbing" : "grab",
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
      {selected && interactive ? (
        <span
          data-ignore-export="true"
          className="pointer-events-none absolute inset-0 border-2 border-accent"
        />
      ) : null}
    </div>
  );
}
