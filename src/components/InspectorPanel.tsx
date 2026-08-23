import { useEffect } from "react";
import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { COVER_FONTS, TEMPLATE_ELEMENTS } from "../data/elements";
import { useCover } from "../store/CoverContext";
import type { CoverFontId } from "../types";
import { ColorField } from "./ColorField";
import { Field, fieldClass } from "./Field";

export function InspectorPanel() {
  const { templateId, draft, selectedId, selectElement, patchElement, resetElement, patchDraft, defaultImageScale, resolvedElements } =
    useCover();
  const items = TEMPLATE_ELEMENTS[templateId];
  const meta = items.find((el) => el.id === selectedId);
  const style = selectedId ? (draft.elementStyles[selectedId] ?? {}) : {};
  const resolved = selectedId ? (resolvedElements[selectedId] ?? {}) : {};
  const currentFontSize = style.fontSize ?? resolved.fontSize;
  const currentFont = style.font ?? resolved.font ?? meta?.defaultFont ?? "cn";
  const currentColor = style.color ?? resolved.color;
  const currentX = style.x ?? resolved.x ?? 0;
  const currentY = style.y ?? resolved.y ?? 0;

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
                <Field label={`水平 ${Math.round(currentX)}`}>
                  <input
                    type="range"
                    min={meta.hasOpacity ? -900 : -480}
                    max={meta.hasOpacity ? 900 : 480}
                    value={currentX}
                    onChange={(e) => patchElement(meta.id, { x: Number(e.target.value) })}
                    className="w-full"
                  />
                </Field>
                <div className="mt-3">
                  <Field label={`垂直 ${Math.round(currentY)}`}>
                    <input
                      type="range"
                      min={meta.hasOpacity ? -900 : -480}
                      max={meta.hasOpacity ? 900 : 480}
                      value={currentY}
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
                          max={280}
                          value={currentFontSize ?? ""}
                          onChange={(e) => {
                            patchElement(meta.id, { fontSize: Number(e.target.value) || currentFontSize || 16 });
                          }}
                        />
                      </Field>
                    </div>
                    <div className="mt-3">
                      <Field label="字体">
                        <select
                          className={fieldClass}
                          value={currentFont}
                          onChange={(e) => {
                            patchElement(meta.id, { font: e.target.value as CoverFontId });
                          }}
                        >
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
                      displayColor={currentColor}
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
