import {
  EDGE_FADE_MODE_OPTIONS,
  IMAGE_EDGE_FADE_DEFAULT,
  IMAGE_EDGE_FADE_MAX,
  IMAGE_EDGE_FADE_MIN,
  normalizeEdgeFadeMode,
} from "../constants";
import type { EdgeFadeMode } from "../types";
import { Field } from "./Field";

type Props = {
  enabled: boolean;
  amount?: number;
  mode?: EdgeFadeMode;
  compact?: boolean;
  onEnabledChange: (on: boolean) => void;
  onAmountChange?: (amount: number) => void;
  onModeChange: (mode: EdgeFadeMode) => void;
};

export function EdgeFadeFields({
  enabled,
  amount = IMAGE_EDGE_FADE_DEFAULT,
  mode,
  compact = false,
  onEnabledChange,
  onAmountChange,
  onModeChange,
}: Props) {
  const resolved = normalizeEdgeFadeMode(mode);
  return (
    <div className={compact ? "mt-2" : "mt-3"}>
      <label className={`flex cursor-pointer items-center gap-1.5 ${compact ? "text-[12px]" : "text-[13px]"} text-sub`}>
        <input type="checkbox" checked={enabled} onChange={(e) => onEnabledChange(e.target.checked)} />
        边缘虚化
      </label>
      {enabled ? (
        <>
          <div className="mt-2 flex gap-1" role="group" aria-label="虚化模式">
            {EDGE_FADE_MODE_OPTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={resolved === item.id}
                onClick={() => onModeChange(item.id)}
                className={`h-7 rounded-[6px] px-2.5 text-[12px] transition-colors ${
                  resolved === item.id ? "bg-accent text-white" : "bg-raised text-sub hover:text-accent"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-2">
            <Field label={`虚化宽度 ${amount}%`}>
              <input
                type="range"
                min={IMAGE_EDGE_FADE_MIN}
                max={IMAGE_EDGE_FADE_MAX}
                value={amount}
                onChange={(e) => onAmountChange?.(Number(e.target.value))}
                className="w-full"
              />
            </Field>
          </div>
        </>
      ) : null}
    </div>
  );
}
