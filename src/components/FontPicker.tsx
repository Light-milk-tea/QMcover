import { useState } from "react";
import { COVER_FONTS, fontClass } from "../data/elements";
import type { CoverFontId } from "../types";
import { Field, fieldClass } from "./Field";

type Props = { value: CoverFontId; text: string; onChange: (font: CoverFontId) => void };

export function FontPicker({ value, text, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const sample = text.trim().split("\n")[0] || "明日方舟 Aa 0123";
  return (
    <div>
      <Field label="字体">
        <select className={fieldClass} value={value} onChange={(event) => onChange(event.target.value as CoverFontId)}>
          {COVER_FONTS.map((font) => <option key={font.id} value={font.id}>{font.label}</option>)}
        </select>
      </Field>
      <div className="mt-2 rounded-md border border-line bg-raised px-3 py-2">
        <p data-font-preview className={`truncate text-[25px] leading-relaxed ${fontClass(value)}`} title={sample}>{sample}</p>
      </div>
      <button type="button" className="mt-2 text-[12px] text-accent" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
        {expanded ? "收起字体预览" : "展开字体预览"}
      </button>
      {expanded && (
        <div role="group" aria-label="字体字样" className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-md border border-line p-1">
          {COVER_FONTS.map((font) => (
            <button key={font.id} type="button" aria-label={`使用${font.label}`} aria-pressed={value === font.id}
              className={`block w-full rounded px-2 py-2 text-left hover:bg-raised ${value === font.id ? "bg-accent/10 ring-1 ring-inset ring-accent/40" : ""}`}
              onClick={() => onChange(font.id)}>
              <span className="block text-[11px] text-mute">{font.label}</span>
              <span className={`block truncate text-[24px] leading-relaxed ${font.className}`}>{sample}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
