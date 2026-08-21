import { useEffect, useState } from "react";
import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { COVER_FONTS, TEMPLATE_ELEMENTS, TEXT_COLORS, normalizeHex } from "../data/elements";
import { useCover } from "../store/CoverContext";
import type { CoverFontId } from "../types";
import { Field, fieldClass } from "./Field";

export function InspectorPanel() {
  const { templateId, draft, selectedId, selectElement, patchElement, resetElement, patchDraft, defaultImageScale } =
    useCover();
  const items = TEMPLATE_ELEMENTS[templateId];
  const meta = items.find((el) => el.id === selectedId);
  const style = selectedId ? (draft.elementStyles[selectedId] ?? {}) : {};

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") selectElement(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectElement]);

  return (
    <aside className="flex min-h-0 w-[240px] shrink-0 flex-col self-stretch overflow-x-hidden overflow-y-auto rounded-[8px] bg-panel">
      <div className="border-b border-line px-4 py-3">
        <p className="text-[13px] text-sub">图层</p>
        <ul className="mt-2 flex flex-col gap-1">
          {items.map((el) => {
            const active = selectedId === el.id;
            return (
              <li key={el.id}>
                <button
                  type="button"
                  onClick={() => selectElement(active ? null : el.id)}
                  className={`flex h-8 w-full items-center rounded-[6px] px-2 text-left text-[13px] ${
                    active ? "bg-accent/10 text-accent" : "text-text hover:bg-raised"
                  }`}
                >
                  {el.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="px-4 py-3">
        {meta ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-medium text-text">{meta.label}</p>
              <button
                type="button"
                className="inline-flex h-7 items-center gap-1 rounded-[6px] px-2 text-[12px] text-sub hover:bg-raised hover:text-accent"
                onClick={() => {
                  if (meta.id === "operator") {
                    patchDraft({ imageX: 0, imageY: 0, imageScale: defaultImageScale });
                    return;
                  }
                  resetElement(meta.id);
                }}
              >
                <ArrowCounterClockwise size={12} />
                重置
              </button>
            </div>

            {meta.kind === "image" ? (
              <>
                <Field label={`水平 ${Math.round(draft.imageX)}`}>
                  <input
                    type="range"
                    min={-600}
                    max={600}
                    value={draft.imageX}
                    onChange={(e) => patchDraft({ imageX: Number(e.target.value) })}
                    className="w-full"
                  />
                </Field>
                <div className="mt-3">
                  <Field label={`垂直 ${Math.round(draft.imageY)}`}>
                    <input
                      type="range"
                      min={-600}
                      max={600}
                      value={draft.imageY}
                      onChange={(e) => patchDraft({ imageY: Number(e.target.value) })}
                      className="w-full"
                    />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label={`缩放 ${draft.imageScale}%`}>
                    <input
                      type="range"
                      min={40}
                      max={220}
                      value={draft.imageScale}
                      onChange={(e) => patchDraft({ imageScale: Number(e.target.value) })}
                      className="w-full"
                    />
                  </Field>
                </div>
              </>
            ) : (
              <>
                <Field label={`水平 ${Math.round(style.x ?? 0)}`}>
                  <input
                    type="range"
                    min={meta.hasOpacity ? -900 : -480}
                    max={meta.hasOpacity ? 900 : 480}
                    value={style.x ?? 0}
                    onChange={(e) => patchElement(meta.id, { x: Number(e.target.value) })}
                    className="w-full"
                  />
                </Field>
                <div className="mt-3">
                  <Field label={`垂直 ${Math.round(style.y ?? 0)}`}>
                    <input
                      type="range"
                      min={meta.hasOpacity ? -900 : -480}
                      max={meta.hasOpacity ? 900 : 480}
                      value={style.y ?? 0}
                      onChange={(e) => patchElement(meta.id, { y: Number(e.target.value) })}
                      className="w-full"
                    />
                  </Field>
                </div>
                {meta.hasOpacity ? (
                  <div className="mt-3">
                    <Field label={`暗度 ${style.opacity ?? meta.defaultOpacity ?? 100}`}>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={style.opacity ?? meta.defaultOpacity ?? 100}
                        onChange={(e) => patchElement(meta.id, { opacity: Number(e.target.value) })}
                        className="w-full"
                      />
                    </Field>
                  </div>
                ) : null}
                {meta.kind === "text" ? (
                  <>
                    <div className="mt-3">
                      <Field label="字号">
                        <input
                          className={fieldClass}
                          type="number"
                          min={16}
                          max={240}
                          placeholder="默认"
                          value={style.fontSize ?? ""}
                          onChange={(e) => {
                            if (!e.target.value) {
                              patchElement(meta.id, { fontSize: undefined });
                              return;
                            }
                            patchElement(meta.id, { fontSize: Number(e.target.value) || 16 });
                          }}
                        />
                      </Field>
                    </div>
                    <div className="mt-3">
                      <Field label="字体">
                        <select
                          className={fieldClass}
                          value={style.font ?? ""}
                          onChange={(e) => {
                            const v = e.target.value as CoverFontId | "";
                            patchElement(meta.id, { font: v ? v : undefined });
                          }}
                        >
                          <option value="">默认</option>
                          {COVER_FONTS.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <ColorField
                      elementId={meta.id}
                      color={style.color}
                      onChange={(color) => patchElement(meta.id, { color })}
                    />
                  </>
                ) : null}
              </>
            )}
          </>
        ) : (
          <p className="text-[13px] leading-relaxed text-mute">
            点选画布上的文字或暗角，或从上面的图层列表选取，然后改位置、字体、字号和颜色。
          </p>
        )}
      </div>
    </aside>
  );
}

function ColorField({
  elementId,
  color,
  onChange,
}: {
  elementId: string;
  color?: string;
  onChange: (color: string | undefined) => void;
}) {
  const [hex, setHex] = useState(color ?? "");

  useEffect(() => {
    setHex(color ?? "");
  }, [elementId, color]);

  const picker = normalizeHex(hex) ?? "#ffffff";
  const active = normalizeHex(color ?? "");

  return (
    <div className="mt-3">
      <span className="mb-1.5 block text-[13px] text-sub">颜色</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={picker}
          aria-label="取色"
          className="size-8 shrink-0 cursor-pointer rounded-[6px] border border-line bg-panel p-0.5"
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          className={fieldClass}
          value={hex}
          placeholder="默认"
          spellCheck={false}
          onChange={(e) => {
            const next = e.target.value;
            setHex(next);
            if (!next.trim()) {
              onChange(undefined);
              return;
            }
            const parsed = normalizeHex(next);
            if (parsed) onChange(parsed);
          }}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {TEXT_COLORS.map((swatch) => {
          const selected = active === swatch.value;
          return (
            <button
              key={swatch.id}
              type="button"
              title={swatch.label}
              aria-label={swatch.label}
              onClick={() => onChange(swatch.value)}
              className={`size-6 rounded-full border ${
                selected ? "border-accent ring-1 ring-accent" : "border-line"
              }`}
              style={{ background: swatch.value }}
            />
          );
        })}
        <button
          type="button"
          className="h-6 rounded-[6px] px-2 text-[12px] text-sub hover:bg-raised hover:text-accent"
          onClick={() => onChange(undefined)}
        >
          默认
        </button>
      </div>
    </div>
  );
}
