import type { ReactNode } from "react";
import type { CanvasSkin, CoverEffects, LightEffect as LightEffectConfig } from "../types";

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function opacity(amount: number) {
  return clamp(amount) / 100;
}

function easedOpacity(amount: number) {
  return Math.sqrt(opacity(amount));
}

function BloomLight({ effect }: { effect: LightEffectConfig }) {
  const t = opacity(effect.amount);
  const x = clamp(effect.x);
  const y = clamp(effect.y);
  return (
    <div className="absolute inset-0" style={{ transform: `rotate(${effect.rotate}deg)`, transformOrigin: `${x}% ${y}%` }}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 28% 96% at ${x}% ${y}%, rgb(255 255 255 / ${0.52 * t}) 0%, rgb(255 255 255 / ${0.24 * t}) 32%, rgb(255 255 255 / ${0.07 * t}) 56%, transparent 74%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 90% 64% at ${x}% ${Math.max(0, y - 10)}%, rgb(255 255 255 / ${0.72 * t}) 0%, rgb(246 246 248 / ${0.3 * t}) 36%, transparent 70%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 46% 40% at ${x + 2}% ${y + 14}%, rgb(255 255 255 / ${0.34 * t}) 0%, transparent 72%)`,
        }}
      />
    </div>
  );
}

function LightCone({
  effect,
  width,
  strength,
  blur,
  height,
  spread,
}: {
  effect: LightEffectConfig;
  width: number;
  strength: number;
  blur: number;
  height: number;
  spread: number;
}) {
  const t = opacity(effect.amount);
  const x = clamp(effect.x);
  const y = clamp(effect.y);
  const top = 50 - Math.max(12, spread * 0.34);
  const bottomLeft = 50 - spread / 2;
  const bottomRight = 50 + spread / 2;
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y - 28}%`,
        width: `${width}%`,
        height: `${height}%`,
        opacity: strength * t,
        transform: `translateX(-50%) rotate(${effect.rotate}deg)`,
        transformOrigin: "50% 8%",
        filter: `blur(${blur}px)`,
        mixBlendMode: "screen",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgb(218 235 246 / 0.2) 24%, rgb(255 255 255 / 0.88) 50%, rgb(226 239 247 / 0.22) 76%, transparent 100%)",
          clipPath: `polygon(${top}% 0%, ${100 - top}% 0%, ${bottomRight}% 100%, ${bottomLeft}% 100%)`,
          WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 58%, rgb(0 0 0 / 0.86) 82%, rgb(0 0 0 / 0.4) 94%, transparent 100%)",
          maskImage: "linear-gradient(180deg, #000 0%, #000 58%, rgb(0 0 0 / 0.86) 82%, rgb(0 0 0 / 0.4) 94%, transparent 100%)",
        }}
      />
    </div>
  );
}

function SourceGlow({ effect, surface = false }: { effect: LightEffectConfig; surface?: boolean }) {
  const t = opacity(effect.amount);
  const x = clamp(effect.x);
  const y = clamp(effect.y);
  const topGlow = Math.min(1, (surface ? 0.22 : 1.55) * t);
  const topHaze = Math.min(1, (surface ? 0.09 : 0.72) * t);
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(ellipse ${surface ? "48% 42%" : "92% 70%"} at ${x - 8}% ${y - 22}%, rgb(255 255 255 / ${topGlow}) 0%, rgb(226 240 249 / ${topHaze}) 36%, transparent 80%)`,
      }}
    />
  );
}

function DiagonalFog({ effect, surface = false }: { effect: LightEffectConfig; surface?: boolean }) {
  const t = opacity(effect.amount);
  const x = clamp(effect.x);
  const y = clamp(effect.y);
  return (
    <div
      className="absolute inset-0"
      style={{
        transform: `rotate(${effect.rotate}deg)`,
        transformOrigin: `${x}% ${y}%`,
        background: `radial-gradient(ellipse ${surface ? "28% 110%" : "48% 170%"} at ${x}% ${y}%, rgb(255 255 255 / ${
          (surface ? 0.14 : 0.42) * t
        }) 0%, rgb(214 233 244 / ${(surface ? 0.05 : 0.16) * t}) 50%, transparent 86%)`,
        mixBlendMode: "screen",
      }}
    />
  );
}

function FullBeamLight({ effect }: { effect: LightEffectConfig }) {
  return (
    <>
      <SourceGlow effect={effect} />
      <DiagonalFog effect={effect} />
      <LightCone effect={effect} width={72} height={198} spread={120} blur={18} strength={0.4} />
      <LightCone effect={effect} width={46} height={182} spread={96} blur={10} strength={0.5} />
      <LightCone effect={effect} width={20} height={168} spread={62} blur={5} strength={0.4} />
    </>
  );
}

function BeamSurfaceLight({ effect }: { effect: LightEffectConfig }) {
  return (
    <>
      <SourceGlow effect={effect} surface />
      <DiagonalFog effect={effect} surface />
      <LightCone effect={effect} width={40} height={172} spread={98} blur={10} strength={0.28} />
      <LightCone effect={effect} width={14} height={158} spread={50} blur={4} strength={0.2} />
    </>
  );
}

export function SpecialistLightUnderlay({ effect }: { effect?: LightEffectConfig }) {
  if (!effect?.enabled || effect.amount <= 0 || effect.kind !== "beam") return null;
  return (
    <div data-effect="light-underlay" className="pointer-events-none absolute inset-0 overflow-hidden">
      <FullBeamLight effect={effect} />
    </div>
  );
}

function LightOverlay({ effect, surfaceOnly = false }: { effect: LightEffectConfig; surfaceOnly?: boolean }) {
  if (!effect.enabled || effect.amount <= 0) return null;
  return (
    <div data-effect="light" className="absolute inset-0">
      {effect.kind === "beam" ? surfaceOnly ? <BeamSurfaceLight effect={effect} /> : <FullBeamLight effect={effect} /> : <BloomLight effect={effect} />}
    </div>
  );
}

const GLITCH_BARS = [
  [5, 14, 28, 2],
  [36, 19, 18, 1],
  [63, 11, 31, 2],
  [12, 29, 16, 1],
  [49, 34, 38, 2],
  [3, 43, 23, 1],
  [31, 48, 26, 2],
  [69, 54, 24, 1],
  [8, 65, 35, 2],
  [54, 72, 27, 1],
  [19, 79, 17, 2],
  [72, 87, 22, 1],
] as const;

function GlitchOverlay({ amount }: { amount: number }) {
  const t = easedOpacity(amount);
  return (
    <div data-effect="glitch" className="absolute inset-0" style={{ opacity: 0.72 * t }}>
      {GLITCH_BARS.map(([x, y, width, height], index) => (
        <span
          key={`${x}-${y}`}
          className="absolute block"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${width}%`,
            height: `${height + t * 2}px`,
            transform: `translateX(${(index % 2 ? -1 : 1) * t * 14}px)`,
            background:
              index % 3 === 0
                ? "linear-gradient(90deg, transparent, rgb(231 35 50 / 0.72), transparent)"
                : index % 3 === 1
                  ? "linear-gradient(90deg, transparent, rgb(58 176 218 / 0.68), transparent)"
                  : "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.72), transparent)",
          }}
        />
      ))}
    </div>
  );
}

function SlashesOverlay({ amount }: { amount: number }) {
  const t = easedOpacity(amount);
  return (
    <svg
      data-effect="slashes"
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1920 1080"
      fill="none"
      aria-hidden
      style={{ opacity: 0.82 * t }}
    >
      <path d="M1120 -80 L1288 -80 L830 1160 L692 1160 Z" fill={`rgb(255 255 255 / ${0.2 + 0.22 * t})`} />
      <path d="M1512 -120 L1555 -120 L1195 1160 L1162 1160 Z" fill={`rgb(255 255 255 / ${0.22 + 0.32 * t})`} />
      <path d="M1878 36 L1920 56 L1460 822 L1418 802 Z" fill={`rgb(255 255 255 / ${0.24 + 0.28 * t})`} />
      <path d="M104 1060 L62 1038 L504 170 L546 190 Z" fill={`rgb(184 222 238 / ${0.1 + 0.16 * t})`} />
      <path d="M1600 1110 L1548 1084 L1886 448 L1920 482 Z" fill={`rgb(230 237 242 / ${0.16 + 0.22 * t})`} />
    </svg>
  );
}

const VIGNETTE_AT: Record<CanvasSkin, string> = {
  plain: "40% 46%",
  firstkill: "22% 42%",
  lowspec: "28% 48%",
  rogue: "72% 48%",
  madness: "26% 46%",
  nocore: "28% 48%",
  endfield: "22% 48%",
  specialist: "78% 62%",
};

function VignetteOverlay({ skin, amount }: { skin: CanvasSkin; amount: number }) {
  const t = opacity(amount);
  if (skin === "specialist") {
    return (
      <div
        data-effect="vignette"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 38%, rgb(3 7 11 / ${0.14 * t}) 64%, rgb(3 7 11 / ${0.72 * t}) 100%), radial-gradient(ellipse 88% 82% at 52% 42%, transparent 34%, rgb(4 8 12 / ${0.18 * t}) 68%, rgb(4 8 12 / ${0.58 * t}) 100%)`,
        }}
      />
    );
  }
  return (
    <div
      data-effect="vignette"
      className="absolute inset-0"
      style={{
        background: `radial-gradient(ellipse 78% 72% at ${VIGNETTE_AT[skin]}, rgb(12 16 22 / ${0.9 * t}) 0%, rgb(12 16 22 / ${0.55 * t}) 34%, rgb(12 16 22 / ${0.18 * t}) 58%, transparent 76%)`,
      }}
    />
  );
}

function ScanlinesOverlay({ amount }: { amount: number }) {
  return (
    <div
      data-effect="scanlines"
      className="absolute inset-0"
      style={{
        opacity: opacity(amount),
        background:
          "repeating-linear-gradient(180deg, rgb(255 255 255 / 0.085) 0 1px, rgb(0 0 0 / 0.06) 1px 2px, transparent 2px 5px)",
      }}
    />
  );
}

function GrainOverlay({ amount }: { amount: number }) {
  return (
    <div
      data-effect="grain"
      className="absolute inset-0"
      style={{
        opacity: opacity(amount),
        backgroundImage:
          "radial-gradient(circle at 18% 22%, rgb(255 255 255 / 0.1) 0 1px, transparent 1.4px), radial-gradient(circle at 72% 68%, rgb(0 0 0 / 0.24) 0 1px, transparent 1.3px), radial-gradient(circle at 46% 84%, rgb(255 255 255 / 0.06) 0 0.8px, transparent 1.2px)",
        backgroundSize: "5px 5px, 3px 3px, 7px 7px",
      }}
    />
  );
}

function ChromaticFilter({ amount }: { amount: number }) {
  const shift = easedOpacity(amount) * 10;
  return (
    <svg data-effect="chromatic" className="pointer-events-none absolute h-0 w-0" aria-hidden>
      <defs>
        <filter id="qm-cover-chromatic" x="-3%" y="-3%" width="106%" height="106%" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="red"
          />
          <feOffset in="red" dx={-shift} result="redShift" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="green"
          />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="blue"
          />
          <feOffset in="blue" dx={shift} result="blueShift" />
          <feBlend in="redShift" in2="green" mode="screen" result="redGreen" />
          <feBlend in="redGreen" in2="blueShift" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}

export function CoverEffectsStage({
  effects,
  skin,
  layeredLight = false,
  children,
}: {
  effects: CoverEffects;
  skin: CanvasSkin;
  layeredLight?: boolean;
  children: ReactNode;
}) {
  const chromaticOn = effects.chromatic.enabled && effects.chromatic.amount > 0;
  return (
    <div className="relative h-full w-full overflow-hidden">
      {chromaticOn ? <ChromaticFilter amount={effects.chromatic.amount} /> : null}
      <div
        className="absolute inset-0"
        data-effect-content=""
        style={{ filter: chromaticOn ? "url(#qm-cover-chromatic)" : undefined }}
      >
        {children}
      </div>
      <div data-effects-overlay="" className="pointer-events-none absolute inset-0 z-[100] overflow-hidden">
        {effects.vignette.enabled ? <VignetteOverlay skin={skin} amount={effects.vignette.amount} /> : null}
        <LightOverlay effect={effects.light} surfaceOnly={layeredLight} />
        {effects.slashes.enabled ? <SlashesOverlay amount={effects.slashes.amount} /> : null}
        {effects.glitch.enabled ? <GlitchOverlay amount={effects.glitch.amount} /> : null}
        {effects.scanlines.enabled ? <ScanlinesOverlay amount={effects.scanlines.amount} /> : null}
        {effects.grain.enabled ? <GrainOverlay amount={effects.grain.amount} /> : null}
      </div>
    </div>
  );
}
