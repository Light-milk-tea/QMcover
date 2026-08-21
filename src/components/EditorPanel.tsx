import { UploadSimple } from "@phosphor-icons/react";
import { artUrl } from "../data/arts";
import { BG_PRESETS } from "../data/backgrounds";
import { useCover } from "../store/CoverContext";
import { Field, fieldClass } from "./Field";
import { IllustLibrary } from "./IllustLibrary";

export function EditorPanel() {
  const { draft, patchDraft, showEpisode, titleKind, titleLabel, titlePlaceholder, subtitleLabel, episodeLabel, signatureLabel, defaultImageScale, showBackground } =
    useCover();

  const resolvedPlaceholder =
    titlePlaceholder ||
    (titleKind === "stage" ? "无序矿区" : titleKind === "operation" ? "净罪" : titleKind === "theme" ? "命运共享" : draft.operatorName || "点选干员后自动填入");
  const keepTitleOnPick = titleKind === "stage" || titleKind === "operation" || titleKind === "theme";

  return (
    <aside className="flex min-h-0 w-[300px] shrink-0 flex-col self-stretch overflow-x-hidden overflow-y-auto rounded-[8px] bg-panel">
      <div className="border-b border-line px-4 py-3">
        <Field label={titleLabel}>
          <input
            className={fieldClass}
            value={draft.title}
            onChange={(e) => patchDraft({ title: e.target.value })}
            placeholder={resolvedPlaceholder}
          />
        </Field>
        <div className="mt-3">
          <Field label={subtitleLabel}>
            <input
              className={fieldClass}
              value={draft.subtitle}
              onChange={(e) => patchDraft({ subtitle: e.target.value })}
            />
          </Field>
        </div>
        {showEpisode ? (
          <div className="mt-3">
            <Field label={episodeLabel}>
              <input
                className={fieldClass}
                type="number"
                min={1}
                value={draft.episode}
                onChange={(e) => patchDraft({ episode: Number(e.target.value) || 1 })}
              />
            </Field>
          </div>
        ) : null}
        <div className="mt-3">
          <Field label={signatureLabel}>
            <input
              className={fieldClass}
              value={draft.signature}
              onChange={(e) => patchDraft({ signature: e.target.value })}
              placeholder={
                signatureLabel === "行动名"
                  ? "铅封行动"
                  : signatureLabel === "红标"
                    ? "紧急"
                    : signatureLabel === "英文标"
                      ? "FIVE STAR MADNESS"
                      : "QM"
              }
            />
          </Field>
        </div>
      </div>

      {showBackground ? (
        <div className="border-b border-line px-4 py-3">
          <p className="mb-1.5 text-[13px] text-sub">背景</p>
          <div className="grid max-h-[280px] grid-cols-3 gap-2 overflow-y-auto pr-0.5">
            {BG_PRESETS.map((bg) => {
              const selected = (draft.bgPreset || "ink") === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => patchDraft({ bgPreset: bg.id })}
                  className={`overflow-hidden rounded-[6px] border text-left transition-colors ${
                    selected
                      ? "border-accent ring-1 ring-accent"
                      : "border-line hover:border-[#c9ccd0]"
                  }`}
                >
                  <span className="relative block aspect-video bg-[#141618]">
                    {bg.url ? (
                      <img
                        src={bg.url}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : null}
                  </span>
                  <span className={`block px-1.5 py-1 text-[12px] ${selected ? "text-accent" : "text-sub"}`}>
                    {bg.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <IllustLibrary
        operatorId={draft.operatorId}
        artId={draft.artId}
        onPick={(op, art) => {
          const keepTitle = draft.title.trim() && draft.title.trim() !== draft.operatorName;
          patchDraft({
            operatorId: op.id,
            operatorName: op.name,
            artId: art.id,
            imageUrl: artUrl(art.id),
            imageDataUrl: "",
            imageX: 0,
            imageY: 0,
            imageScale: defaultImageScale,
            title: keepTitleOnPick || keepTitle ? draft.title : op.name,
          });
        }}
      />

      <div className="border-t border-line px-4 py-3">
        <Field label={`立绘缩放 ${draft.imageScale}%`}>
          <input
            type="range"
            min={40}
            max={220}
            value={draft.imageScale}
            onChange={(e) => patchDraft({ imageScale: Number(e.target.value) })}
            className="w-full"
          />
        </Field>
        <div className="mt-3 flex items-center justify-between gap-3">
          <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[8px] px-2 text-[13px] text-sub transition-colors hover:bg-raised hover:text-accent">
            <UploadSimple size={16} />
            上传立绘
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  patchDraft({
                    imageDataUrl: String(reader.result ?? ""),
                    imageUrl: "",
                    artId: "",
                  });
                };
                reader.readAsDataURL(file);
                e.target.value = "";
              }}
            />
          </label>
          <label className="flex items-center gap-2 text-[13px] text-sub">
            <input
              type="checkbox"
              checked={draft.showSafeArea}
              onChange={(e) => patchDraft({ showSafeArea: e.target.checked })}
            />
            安全区
          </label>
        </div>
      </div>
    </aside>
  );
}
