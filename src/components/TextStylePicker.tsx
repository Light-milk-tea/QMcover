import { ArrowLeft } from "@phosphor-icons/react";
import { renderTextContent } from "../canvas/LayerChrome";
import { fontClass } from "../data/elements";
import { TEXT_STYLES, type TextStylePreset } from "../data/textStyles";
import { fitFontSize, textLayer } from "../lib/document";
import type { Draft } from "../types";

const PREVIEW_DRAFT = { title: "", subtitle: "", signature: "", mark: "", episode: 1, operatorName: "" } as Draft;
// Stand-in text background so the see-through glass style reads in a swatch.
const PREVIEW_GLASS = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><linearGradient id="g" x1="0" y1="0" x2="200" y2="60" gradientUnits="userSpaceOnUse" spreadMethod="reflect"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#f3b4ff"/></linearGradient><rect width="1920" height="1080" fill="url(#g)"/></svg>',
)}`;

function StylePreview({ preset }: { preset: TextStylePreset }) {
  const first = Math.min(34, fitFontSize(preset.layer.text, 180));
  const spacing = (preset.layer.letterSpacing ?? 0) * (first / preset.layer.fontSize);
  const size = spacing ? Math.min(first, fitFontSize(preset.layer.text, 180, spacing)) : first;
  const ratio = size / preset.layer.fontSize;
  const layer = textLayer({
    id: `preview-${preset.id}`,
    x: 0,
    y: 0,
    ...preset.layer,
    fontSize: size,
    letterSpacing: preset.layer.letterSpacing != null ? preset.layer.letterSpacing * ratio : undefined,
    rotation: undefined,
  });
  return (
    <span
      aria-hidden
      className={`flex h-12 items-center overflow-hidden rounded-[5px] px-2.5 ${preset.light ? "bg-[#f3efe6]" : "bg-[#202226]"}`}
    >
      <span
        className={`block leading-none whitespace-nowrap ${fontClass(layer.font)}`}
        style={{ color: layer.color, opacity: layer.opacity != null ? layer.opacity / 100 : undefined }}
      >
        {renderTextContent(layer, PREVIEW_DRAFT, PREVIEW_GLASS)}
      </span>
    </span>
  );
}

export function TextStylePicker({
  onSelect,
  onBack,
}: {
  onSelect: (presetId: string) => void;
  onBack: () => void;
}) {
  return (
    <div data-testid="text-style-picker" className="w-[228px] p-2">
      <div className="mb-2 flex items-center gap-2 px-1">
        <button
          type="button"
          aria-label="返回添加菜单"
          className="grid size-7 place-items-center rounded-[6px] text-sub hover:bg-raised hover:text-accent"
          onClick={onBack}
        >
          <ArrowLeft size={14} />
        </button>
        <div>
          <p className="text-[13px] font-medium text-text">添加文字</p>
          <p className="text-[11px] text-mute">各模板的标题字效，加上后可改字和颜色</p>
        </div>
      </div>
      <div className="flex max-h-[460px] flex-col gap-1.5 overflow-y-auto pr-1">
        {TEXT_STYLES.map((preset) => (
          <button
            key={preset.id}
            type="button"
            aria-label={preset.name}
            className="rounded-[7px] border border-line p-1.5 text-left hover:border-accent hover:bg-accent/5"
            onClick={() => onSelect(preset.id)}
          >
            <StylePreview preset={preset} />
            <span className="mt-1.5 flex items-baseline justify-between gap-2">
              <span className="truncate text-[11px] text-text">{preset.name}</span>
              {preset.source ? <span className="shrink-0 text-[10px] text-mute">{preset.source}</span> : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
