import { useEffect, useMemo, useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { BG_CATEGORIES, BG_PRESETS, getBgPreset, type BgCategory } from "../data/backgrounds";
import { rewriteGhUrl, useCdnHost } from "../lib/cdn";
import { fieldClass } from "./Field";

type Props = {
  label?: string;
  value: string;
  onChange: (id: string) => void;
};

export function BackgroundPicker({
  label = "背景",
  value,
  onChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BgCategory | "all">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  useCdnHost();

  const current = getBgPreset(value);
  const categoryName = BG_CATEGORIES.find((item) => item.id === category)?.name ?? "全部";

  useEffect(() => {
    if (query.trim()) setLibraryOpen(true);
  }, [query]);

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
        <p className="text-[13px] text-sub">{label}</p>
        <p className="min-w-0 truncate text-[12px] text-accent" title={current.name}>
          {current.name}
        </p>
      </div>
      <input
        className={fieldClass}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜名字 / 文件名"
      />
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className="flex h-7 w-full items-center justify-between rounded-[6px] px-2 text-[12px] text-sub hover:bg-raised hover:text-accent"
        >
          <span>地区 · {categoryName}</span>
          <CaretDown size={12} className={filtersOpen ? "rotate-180" : undefined} />
        </button>
        {filtersOpen ? (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
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
        ) : null}
      </div>
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setLibraryOpen((open) => !open)}
          className="flex h-7 w-full items-center justify-between rounded-[6px] px-2 text-[12px] text-sub hover:bg-raised hover:text-accent"
        >
          <span>图库 · {current.name}</span>
          <CaretDown size={12} className={libraryOpen ? "rotate-180" : undefined} />
        </button>
        {libraryOpen ? (
          <div className="mt-1.5 grid max-h-[320px] grid-cols-3 gap-2 overflow-y-auto pr-0.5">
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
        ) : null}
      </div>
    </div>
  );
}
