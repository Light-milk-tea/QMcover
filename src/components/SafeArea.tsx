import { BILI_COVER, BILI_SAFE } from "../constants";

export function SafeArea() {
  const { width, height } = BILI_COVER;
  const { top, right, bottom, left } = BILI_SAFE;

  return (
    <div
      data-ignore-export="true"
      className="pointer-events-none absolute inset-0"
    >
      <div
        className="absolute border border-dashed border-[#e07a2f]/70"
        style={{
          top,
          right,
          bottom,
          left,
        }}
      />
      <div
        className="absolute bg-[#e07a2f]/15"
        style={{
          width: 168,
          height: 52,
          right: 36,
          bottom: 36,
        }}
      />
      <span
        className="absolute font-display text-[22px] tracking-wider text-[#e07a2f]"
        style={{ right: 48, bottom: 46 }}
      >
        角标
      </span>
      <span className="absolute left-[96px] top-[28px] font-display text-[22px] tracking-[0.2em] text-[#e07a2f]/80">
        BILI 16:9 SAFE {width}x{height}
      </span>
    </div>
  );
}
