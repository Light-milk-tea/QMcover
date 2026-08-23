import { useMemo, useState } from "react";
import { BG_CATEGORIES, BG_PRESETS, getBgPreset, type BgCategory } from "../data/backgrounds";
import { rewriteGhUrl, useCdnHost } from "../lib/cdn";
import { fieldClass } from "./Field";

type Props = {
  label?: string;
  value: string;
  onChange: (id: string) => void;
  dim?: boolean;
  dimAmount?: number;
  onDimChange?: (dim: boolean) => void;
  onDimAmountChange?: (amount: number) => void;
};

export function BackgroundPicker({
  label = "背景",
  value,
  onChange,
  dim,
  dimAmount = 48,
  onDimChange,
  onDimAmountChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BgCategory | "all">("all");
  useCdnHost();

  const current = getBgPreset(value);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BG_PRESETS.filter((bg) => {
      if (category !== "all" && bg.category !== category) return false;
      if (!q) return true;
      return bg.name.toLowerCase().includes(q) || bg.id.toLowerCase().includes(q);
    });
  }, [category, query]);

  return (
    <div className="border-b border-line px-4 py-3">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <p className="text-[13px] text-sub">{label}</p>
          {onDimChange ? (
            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-sub">
              <input
                type="checkbox"
                checked={Boolean(dim)}
                onChange={(e) => onDimChange(e.target.checked)}
              />
              蒙黑
            </label>
          ) : null}
        </div>
        <p className="min-w-0 truncate text-[12px] text-accent" title={current.name}>
          {current.name}
        </p>
      </div>
      {onDimChange && dim ? (
        <label className="mb-2 block">
          <span className="mb-1 block text-[12px] text-sub">蒙版黑度 {dimAmount}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={dimAmount}
            onChange={(e) => onDimAmountChange?.(Number(e.target.value))}
            className="w-full"
          />
        </label>
      ) : null}
      <input
        className={fieldClass}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜名字 / 文件名"
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {BG_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={`h-7 rounded-[6px] px-2.5 text-[13px] transition-colors ${
              category === item.id ? "bg-accent text-white" : "bg-raised text-sub hover:text-accent"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="mt-2.5 grid max-h-[320px] grid-cols-3 gap-2 overflow-y-auto pr-0.5">
        {list.map((bg) => {
          const selected = (value || "ink") === bg.id;
          return (
            <button
              key={bg.id}
              type="button"
              onClick={() => onChange(bg.id)}
              className={`overflow-hidden rounded-[6px] border text-left transition-colors ${
                selected ? "border-accent ring-1 ring-accent" : "border-line hover:border-[#c9ccd0]"
              }`}
            >
              <span className="relative block aspect-video bg-[#141618]">
                {bg.url ? (
                  <img
                    src={rewriteGhUrl(bg.url)}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : null}
              </span>
              <span className={`block truncate px-1.5 py-1 text-[12px] ${selected ? "text-accent" : "text-sub"}`}>
                {bg.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
