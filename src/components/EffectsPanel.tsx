import { CaretDown, X } from "@phosphor-icons/react";
import { useState } from "react";
import { disableCoverEffects } from "../lib/effects";
import { useCover } from "../store/CoverContext";
import type { AmountEffect, BgGradeEffect } from "../types";

type OverlayEffectId = "scanlines" | "grain" | "chromatic" | "glitch" | "slashes" | "vignette";

const EFFECT_ROWS: { id: OverlayEffectId; label: string; hint: string }[] = [
  { id: "scanlines", label: "扫描线", hint: "横向屏幕纹理" },
  { id: "grain", label: "颗粒", hint: "统一画面材质" },
  { id: "chromatic", label: "色散", hint: "红青边缘错位" },
  { id: "glitch", label: "故障条", hint: "横向信号断层" },
  { id: "slashes", label: "斜光条", hint: "前景速度光痕" },
  { id: "vignette", label: "暗角", hint: "压暗视觉边缘" },
];

function Range({
  label,
  value,
  min = 0,
  max = 100,
  suffix = "",
  disabled = false,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  suffix?: string;
  disabled?: boolean;
  format?: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <label className={`block min-w-0 ${disabled ? "opacity-35" : ""}`}>
      <span className="mb-1 flex items-center justify-between gap-2 text-[11px] text-sub">
        <span>{label}</span>
        <span className="tabular-nums text-mute">
          {format ? format(value) : `${Math.round(value)}${suffix}`}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
      />
    </label>
  );
}

function EffectColumn({
  id,
  label,
  hint,
  effect,
  onPatch,
}: {
  id: OverlayEffectId;
  label: string;
  hint: string;
  effect: AmountEffect;
  onPatch: (id: OverlayEffectId, patch: Partial<AmountEffect>) => void;
}) {
  return (
    <fieldset className="w-[164px] shrink-0 border-l border-line px-4">
      <label className="flex cursor-pointer items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-[13px] text-text">{label}</span>
          <span className="mt-0.5 block truncate text-[11px] text-mute">{hint}</span>
        </span>
        <input
          type="checkbox"
          checked={effect.enabled}
          onChange={(event) => onPatch(id, { enabled: event.target.checked })}
          className="mt-0.5"
        />
      </label>
      <div className="mt-3">
        <Range
          label="强度"
          value={effect.amount}
          disabled={!effect.enabled}
          onChange={(amount) => onPatch(id, { amount })}
        />
      </div>
    </fieldset>
  );
}

export function EffectsPanel() {
  const { draft, patchEffect, setEffects, templateId } = useCover();
  const [open, setOpen] = useState(false);
  const light = draft.effects.light;
  const bg = draft.effects.bgGrade ?? { enabled: false, blur: 12, grayscale: 68, contrast: 30, brightness: 72 };
  const activeCount = Object.entries(draft.effects).filter(([id, effect]) => id !== "artGrade" && effect?.enabled).length;

  return (
    <section className="shrink-0 border-b border-line bg-panel">
      <div className="flex h-11 items-center gap-3 px-4">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-8 min-w-0 items-center gap-2 rounded-[7px] px-2 text-left hover:bg-raised focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span className="text-[14px] font-medium text-text">特效</span>
          <span className="text-[11px] text-mute">已启用 {activeCount}</span>
          <CaretDown size={13} className={`shrink-0 text-mute transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <span className="hidden min-w-0 truncate text-[11px] text-mute md:block">全局叠层，会同步到缩略图和导出图片</span>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEffects(disableCoverEffects(draft.effects))}
            className="inline-flex h-7 items-center gap-1.5 rounded-[6px] px-2.5 text-[12px] text-sub hover:bg-raised hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            <X size={13} />
            全部关闭
          </button>
        </div>
      </div>

      {open ? (
        <div className="flex overflow-x-auto border-t border-line px-4 py-3">
          <fieldset className="w-[520px] shrink-0 pr-4">
            <div>
              <div className="flex items-center gap-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={light.enabled}
                    onChange={(event) => patchEffect("light", { enabled: event.target.checked })}
                  />
                  <span className="text-[13px] text-text">光效</span>
                </label>
                <div className="flex gap-1" role="group" aria-label="光效样式">
                  {(
                    [
                      { id: "bloom", label: "柔光" },
                      { id: "beam", label: "竖光" },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={light.kind === item.id}
                      disabled={!light.enabled}
                      onClick={() => patchEffect("light", { kind: item.id })}
                      className={`h-7 rounded-[6px] px-2.5 text-[12px] transition-colors disabled:opacity-35 ${
                        light.kind === item.id ? "bg-accent text-white" : "bg-raised text-sub hover:text-accent"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {templateId === "solo" || draft.canvasSkin === "solo" ? (
                  <div className="flex gap-1" role="group" aria-label="打光位置">
                    {(
                      [
                        { id: "behind", label: "立绘下" },
                        { id: "front", label: "立绘上" },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={(light.depth ?? "behind") === item.id}
                        disabled={!light.enabled}
                        onClick={() => patchEffect("light", { depth: item.id })}
                        className={`h-7 rounded-[6px] px-2.5 text-[12px] transition-colors disabled:opacity-35 ${
                          (light.depth ?? "behind") === item.id ? "bg-accent text-white" : "bg-raised text-sub hover:text-accent"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <p className="mt-0.5 pl-6 text-[11px] text-mute">柔光或竖光；仅需一人可选择打在立绘上方或下方</p>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-3">
              <Range label="强度" value={light.amount} disabled={!light.enabled} onChange={(amount) => patchEffect("light", { amount })} />
              <Range label="左右" value={light.x} disabled={!light.enabled} onChange={(x) => patchEffect("light", { x })} />
              <Range label="上下" value={light.y} disabled={!light.enabled} onChange={(y) => patchEffect("light", { y })} />
              <Range
                label="旋转"
                value={light.rotate}
                min={-90}
                max={90}
                suffix="°"
                disabled={!light.enabled}
                onChange={(rotate) => patchEffect("light", { rotate })}
              />
              <div className="min-w-0">
                <span className="mb-1 block text-[11px] text-sub">样式</span>
                <span className="block truncate text-[12px] text-accent">{light.kind === "beam" ? "竖光" : "柔光"}</span>
              </div>
            </div>
          </fieldset>

          <fieldset className="w-[420px] shrink-0 border-l border-line px-4">
            <label className="flex cursor-pointer items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-[13px] text-text">背景调色</span>
                <span className="mt-0.5 block truncate text-[11px] text-mute">去色、压暗、对比和模糊</span>
              </span>
              <input
                type="checkbox"
                checked={bg.enabled}
                onChange={(event) => patchEffect("bgGrade", { enabled: event.target.checked })}
                className="mt-0.5"
              />
            </label>
            <div className="mt-3 grid grid-cols-4 gap-3">
              <Range
                label="去色"
                value={bg.grayscale}
                disabled={!bg.enabled}
                onChange={(grayscale) => patchEffect("bgGrade", { grayscale } satisfies Partial<BgGradeEffect>)}
              />
              <Range
                label="对比"
                value={bg.contrast}
                max={80}
                suffix="%"
                disabled={!bg.enabled}
                onChange={(contrast) => patchEffect("bgGrade", { contrast })}
              />
              <Range
                label="亮度"
                value={bg.brightness}
                min={20}
                disabled={!bg.enabled}
                onChange={(brightness) => patchEffect("bgGrade", { brightness })}
              />
              <Range
                label="模糊"
                value={bg.blur}
                max={40}
                disabled={!bg.enabled}
                format={(value) => `${(value / 10).toFixed(1)}px`}
                onChange={(blur) => patchEffect("bgGrade", { blur })}
              />
            </div>
          </fieldset>

          {EFFECT_ROWS.map((item) => (
            <EffectColumn
              key={item.id}
              {...item}
              effect={draft.effects[item.id]}
              onPatch={(id, patch) => patchEffect(id, patch)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
