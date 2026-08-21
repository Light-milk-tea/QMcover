import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { BILI_COVER } from "../constants";

type Props = {
  children: ReactNode | ((scale: number) => ReactNode);
  className?: string;
};

export function ScaledFrame({ children, className = "" }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  useLayoutEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const measure = () => {
      const next = Math.min(el.clientWidth / BILI_COVER.width, el.clientHeight / BILI_COVER.height);
      setScale((prev) => (Math.abs(prev - next) < 0.0005 ? prev : next));
    };

    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={shellRef} className={`grid h-full min-h-0 w-full place-items-center overflow-hidden ${className}`}>
      <div
        className="relative shrink-0 overflow-hidden"
        style={{
          width: BILI_COVER.width * scale,
          height: BILI_COVER.height * scale,
          boxShadow: "0 0 0 1px rgba(24,25,28,0.08), 0 10px 28px rgba(24,25,28,0.08)",
        }}
      >
        <div
          className="relative origin-top-left"
          style={{
            width: BILI_COVER.width,
            height: BILI_COVER.height,
            transform: `scale(${scale})`,
          }}
        >
          {typeof children === "function" ? children(scale) : children}
        </div>
      </div>
    </div>
  );
}
