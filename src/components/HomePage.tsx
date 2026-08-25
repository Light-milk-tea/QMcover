import { useRef, useState } from "react";
import { BLANK_TEMPLATE, TEMPLATES } from "../data/templates";
import { templateThumbSrc } from "../lib/thumbs";
import { newCustomId, parseDocumentFile } from "../lib/document";
import { emptyDraft, saveDraft } from "../lib/storage";
import { loadSavedTemplates, removeSavedTemplate, upsertSavedTemplate } from "../lib/templateStore";
import type { SavedTemplate } from "../types";
import { BrandMark } from "./BrandMark";

type Props = {
  onOpen: (id: string) => void;
};

function Card({
  title,
  blurb,
  thumb,
  onClick,
  onRemove,
}: {
  title: string;
  blurb: string;
  thumb?: string;
  onClick: () => void;
  onRemove?: () => void;
}) {
  return (
    <li className="relative">
      <button type="button" onClick={onClick} className="group w-full overflow-hidden rounded-[8px] bg-panel text-left">
        {thumb ? (
          <img src={thumb} alt="" width={960} height={540} decoding="async" className="aspect-video w-full bg-[#0c0d0e] object-cover" />
        ) : (
          <div className="aspect-video w-full bg-[#0c0d0e]" />
        )}
        <div className="px-4 py-3">
          <p className="text-[15px] font-medium text-text group-hover:text-accent">{title}</p>
          <p className="mt-0.5 text-[13px] text-mute">{blurb}</p>
        </div>
      </button>
      {onRemove ? (
        <button
          type="button"
          className="absolute top-2 right-2 rounded-[6px] bg-black/55 px-2 py-1 text-[12px] text-white hover:bg-black/75"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          删除
        </button>
      ) : null}
    </li>
  );
}

export function HomePage({ onOpen }: Props) {
  const [mine, setMine] = useState<SavedTemplate[]>(() => loadSavedTemplates());
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-[100dvh] bg-ink">
      <header className="flex h-16 items-center justify-between border-b border-line bg-panel px-6">
        <div className="flex items-center gap-2">
          <BrandMark />
          <span className="text-[16px] font-medium text-text">封面工坊</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="h-8 rounded-[6px] px-3 text-[13px] text-sub hover:bg-raised hover:text-accent"
            onClick={() => fileRef.current?.click()}
          >
            导入 JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              void file.text().then((text) => {
                try {
                  const parsed = parseDocumentFile(JSON.parse(text));
                  if (!parsed) {
                    window.alert("不是 qmcover-document v2，无法导入。");
                    return;
                  }
                  const id = newCustomId();
                  const item: SavedTemplate = {
                    id,
                    name: parsed.name || file.name.replace(/\.json$/i, "") || "导入模板",
                    blurb: parsed.blurb || "从 JSON 导入",
                    createdAt: new Date().toISOString(),
                    basedOn: parsed.basedOn,
                    seed: parsed.document,
                  };
                  upsertSavedTemplate(item);
                  saveDraft(id, {
                    ...emptyDraft(id),
                    ...parsed.document,
                    layers: parsed.document.layers,
                    canvasSkin: parsed.document.canvasSkin ?? "plain",
                    imageDataUrl: "",
                    showSafeArea: true,
                    elementStyles: {},
                    date: emptyDraft(id).date,
                  });
                  setMine(loadSavedTemplates());
                  onOpen(id);
                } catch {
                  window.alert("JSON 读失败。");
                }
              });
            }}
          />
          <p className="text-[13px] text-mute">B 站 1920 × 1080</p>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-6 py-8">
        <h1 className="text-[22px] font-medium text-text">选择模板</h1>
        <p className="mt-1 text-[14px] text-mute">点一张开始做封面，或从空白画布自己排</p>

        <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card title={BLANK_TEMPLATE.name} blurb={BLANK_TEMPLATE.blurb} onClick={() => onOpen(BLANK_TEMPLATE.id)} />
          {TEMPLATES.map((item) => (
            <Card
              key={item.id}
              title={item.name}
              blurb={item.blurb}
              thumb={templateThumbSrc(item.id)}
              onClick={() => onOpen(item.id)}
            />
          ))}
        </ul>

        {mine.length > 0 ? (
          <>
            <h2 className="mt-10 text-[18px] font-medium text-text">我的模板</h2>
            <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {mine.map((item) => (
                <Card
                  key={item.id}
                  title={item.name}
                  blurb={item.blurb}
                  thumb={item.thumbDataUrl}
                  onClick={() => onOpen(item.id)}
                  onRemove={() => {
                    if (!window.confirm(`删除模板「${item.name}」？`)) return;
                    removeSavedTemplate(item.id);
                    setMine(loadSavedTemplates());
                  }}
                />
              ))}
            </ul>
          </>
        ) : null}
      </main>
    </div>
  );
}
