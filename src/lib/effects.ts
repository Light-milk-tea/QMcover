import {
  SHAFT_LIGHT_DEFAULT,
  SHAFT_LIGHT_ROTATE_DEFAULT,
  SHAFT_LIGHT_X_DEFAULT,
  SHAFT_LIGHT_Y_DEFAULT,
} from "../constants";
import type {
  ArtGradeEffect,
  BgGradeEffect,
  CanvasSkin,
  CoverEffects,
  CoverEffectsInput,
  Layer,
} from "../types";

type LegacyEffects = {
  bgDim?: boolean;
  bgDimAmount?: number;
  shaftLight?: boolean;
  shaftLightAmount?: number;
  shaftLightKind?: "bloom" | "beam";
  shaftLightX?: number;
  shaftLightY?: number;
  shaftLightRotate?: number;
};

export type ArtFringeRole = "front" | "back";

function amount(enabled = false, value = 0) {
  return { enabled, amount: value };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const ART_GRADE: ArtGradeEffect = {
  enabled: false,
  contrast: 14,
  saturate: 18,
  brightness: 2,
  fringe: 100,
};

export function defaultArtGrade(enabled = false): ArtGradeEffect {
  return { ...ART_GRADE, enabled };
}

export function resolveArtGrade(effect?: Partial<ArtGradeEffect>, enabled = false): ArtGradeEffect {
  return { ...ART_GRADE, enabled, ...effect };
}

const BG_GRADE: BgGradeEffect = {
  enabled: false,
  blur: 12,
  grayscale: 68,
  contrast: 30,
  brightness: 72,
};

export function defaultCoverEffects(skin: CanvasSkin, legacy: LegacyEffects = {}): CoverEffects {
  const specialist = skin === "specialist";
  return {
    light: {
      enabled: legacy.shaftLight ?? specialist,
      amount: legacy.shaftLightAmount ?? (specialist ? 40 : SHAFT_LIGHT_DEFAULT),
      kind: legacy.shaftLightKind ?? (specialist ? "beam" : "bloom"),
      x: legacy.shaftLightX ?? (specialist ? 30 : SHAFT_LIGHT_X_DEFAULT),
      y: legacy.shaftLightY ?? (specialist ? 0 : SHAFT_LIGHT_Y_DEFAULT),
      rotate: legacy.shaftLightRotate ?? (specialist ? -12 : SHAFT_LIGHT_ROTATE_DEFAULT),
    },
    artGrade: { ...ART_GRADE },
    bgGrade: { ...BG_GRADE, enabled: specialist },
    scanlines: amount(specialist, specialist ? 24 : 24),
    grain: amount(specialist, specialist ? 28 : 24),
    chromatic: amount(specialist, specialist ? 4 : 12),
    glitch: amount(specialist, specialist ? 16 : 24),
    slashes: amount(false, specialist ? 8 : 20),
    vignette: amount(legacy.bgDim ?? specialist, legacy.bgDimAmount ?? (specialist ? 30 : 48)),
  };
}

export function normalizeCoverEffects(
  skin: CanvasSkin,
  input?: CoverEffectsInput,
  legacy: LegacyEffects = {},
): CoverEffects {
  const base = defaultCoverEffects(skin, legacy);
  return {
    light: { ...base.light, ...input?.light },
    artGrade: { ...base.artGrade, ...input?.artGrade },
    bgGrade: { ...base.bgGrade, ...input?.bgGrade },
    scanlines: { ...base.scanlines, ...input?.scanlines },
    grain: { ...base.grain, ...input?.grain },
    chromatic: { ...base.chromatic, ...input?.chromatic },
    glitch: { ...base.glitch, ...input?.glitch },
    slashes: { ...base.slashes, ...input?.slashes },
    vignette: { ...base.vignette, ...input?.vignette },
  };
}

export function cloneCoverEffects(effects: CoverEffects): CoverEffects {
  return {
    light: { ...effects.light },
    artGrade: { ...ART_GRADE, ...effects.artGrade },
    bgGrade: { ...BG_GRADE, ...effects.bgGrade },
    scanlines: { ...effects.scanlines },
    grain: { ...effects.grain },
    chromatic: { ...effects.chromatic },
    glitch: { ...effects.glitch },
    slashes: { ...effects.slashes },
    vignette: { ...effects.vignette },
  };
}

export function referenceCoverEffects(): CoverEffects {
  return normalizeCoverEffects("specialist");
}

export function disableCoverEffects(effects: CoverEffects): CoverEffects {
  const next = cloneCoverEffects(effects);
  return {
    light: { ...next.light, enabled: false },
    artGrade: { ...next.artGrade, enabled: false },
    bgGrade: { ...next.bgGrade, enabled: false },
    scanlines: { ...next.scanlines, enabled: false },
    grain: { ...next.grain, enabled: false },
    chromatic: { ...next.chromatic, enabled: false },
    glitch: { ...next.glitch, enabled: false },
    slashes: { ...next.slashes, enabled: false },
    vignette: { ...next.vignette, enabled: false },
  };
}

export function hydrateImageArtGrade(layers: Layer[], inherited?: ArtGradeEffect, specialist = false): Layer[] {
  return layers.map((layer) => {
    if (layer.kind !== "image" || layer.artGrade) return layer;
    const specialistOp = specialist && (layer.id === "operator" || layer.id === "operator-b");
    if (inherited?.enabled || specialistOp) {
      return { ...layer, artGrade: resolveArtGrade(inherited, true) };
    }
    return layer;
  });
}

export function artGradeFilter(effect?: ArtGradeEffect, role: ArtFringeRole = "front"): string | undefined {
  if (!effect?.enabled) return undefined;
  const saturate = 1 + clamp(effect.saturate, 0, 40) / 100;
  const contrast = 1 + clamp(effect.contrast, 0, 40) / 100;
  const brightness = 1 + clamp(effect.brightness, 0, 20) / 100;
  const fringe = clamp(effect.fringe, 0, 100) / 100;
  const parts = [`saturate(${saturate})`, `contrast(${contrast})`, `brightness(${brightness})`];
  if (fringe > 0) {
    if (role === "back") {
      parts.push(`drop-shadow(${4 * fringe}px 0 0 rgb(225 6 0 / ${0.14 * fringe}))`);
    } else {
      parts.push(`drop-shadow(${-7 * fringe}px 0 0 rgb(72 154 228 / ${0.22 * fringe}))`);
      parts.push(`drop-shadow(0 ${-3 * fringe}px ${7 * fringe}px rgb(186 224 255 / ${0.16 * fringe}))`);
    }
  }
  return parts.join(" ");
}

export function bgGradeFilter(effect?: BgGradeEffect): string | undefined {
  if (!effect?.enabled) return undefined;
  const blur = clamp(effect.blur, 0, 40) / 10;
  const gray = clamp(effect.grayscale, 0, 100) / 100;
  const saturate = Math.max(0, 1 - gray * 0.91);
  const contrast = 1 + clamp(effect.contrast, 0, 80) / 100;
  const brightness = clamp(effect.brightness, 20, 100) / 100;
  return `blur(${blur}px) grayscale(${gray}) saturate(${saturate}) contrast(${contrast}) brightness(${brightness})`;
}
