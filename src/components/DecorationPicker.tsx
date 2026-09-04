import { ArrowLeft } from "@phosphor-icons/react";
import { renderBoxChrome } from "../canvas/LayerChrome";
import { DECORATIONS, type DecorationPreset } from "../data/decorations";
import type { BoxLayer } from "../types";

function previewLayer(preset: DecorationPreset): BoxLayer {
  return {
    id: `preview-${preset.id}`,
    kind: "box",
    ...preset.layer,
    x: 0,
    y: 0,
  };
}

function DecorationPreview({ preset }: { preset: DecorationPreset }) {
  const layer = previewLayer(preset);
  const scale = Math.min(88 / layer.w, 48 / layer.h, 1.5);

  return (
    <span className="relative block h-14 overflow-hidden rounded-[5px] bg-[#202226]">
      <span
        className="absolute top-1/2 left-1/2 block"
        style={{
          width: layer.w,
          height: layer.h,
          color: layer.color,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {preset.kind === "polaroid" ? (
          <span className="block h-full w-full bg-[#f3eee4] p-[4%] pb-[12%] shadow-xl">
            <span className="relative block h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_48%_26%,#6f8294_0%,#26333f_48%,#111820_100%)]">
              <i className="absolute right-[18%] bottom-0 h-[72%] w-[38%] rounded-t-[45%] bg-[#dbe5ea]/55" />
            </span>
          </span>
        ) : (
          renderBoxChrome(layer)
        )}
      </span>
    </span>
  );
}

function PresetButton({
  preset,
  onSelect,
}: {
  preset: DecorationPreset;
  onSelect: (presetId: string) => void;
}) {
  return (
    <button
      type="button"
      title={preset.description}
      className="rounded-[7px] border border-line p-1.5 text-left hover:border-accent hover:bg-accent/5"
      onClick={() => onSelect(preset.id)}
    >
      <DecorationPreview preset={preset} />
      <span className="mt-1.5 block truncate text-[11px] text-text">{preset.name}</span>
    </button>
  );
}

export function DecorationPicker({
  onSelect,
  onBack,
}: {
  onSelect: (presetId: string) => void;
  onBack: () => void;
}) {
  return (
    <div data-testid="decoration-picker" className="w-[228px] p-2">
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
          <p className="text-[13px] font-medium text-text">添加装饰</p>
          <p className="text-[11px] text-mute">方舟几何饰件和模板构件</p>
        </div>
      </div>
      <div className="grid max-h-[460px] grid-cols-2 gap-1.5 overflow-y-auto pr-1">
        <p className="col-span-2 px-0.5 pt-0.5 text-[11px] text-mute">方舟饰件</p>
        {DECORATIONS.filter((preset) => preset.group === "ark").map((preset) => (
          <PresetButton key={preset.id} preset={preset} onSelect={onSelect} />
        ))}
        <p className="col-span-2 px-0.5 pt-1.5 text-[11px] text-mute">模板构件</p>
        {DECORATIONS.filter((preset) => preset.group !== "ark").map((preset) => (
          <PresetButton key={preset.id} preset={preset} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
