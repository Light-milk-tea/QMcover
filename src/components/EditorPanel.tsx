import { UploadSimple } from "@phosphor-icons/react";
import { IMAGE_SCALE_MAX, IMAGE_SCALE_MIN } from "../constants";
import { artUrl } from "../data/arts";
import { ORNAMENTS } from "../data/ornaments";
import { useCover } from "../store/CoverContext";
import { BackgroundPicker } from "./BackgroundPicker";
import { Field, fieldClass } from "./Field";
import { IllustLibrary } from "./IllustLibrary";

export function EditorPanel() {
  const {
    draft,
    patchDraft,
    showEpisode,
    titleKind,
    titleLabel,
    titlePlaceholder,
    subtitleLabel,
    episodeLabel,
    signatureLabel,
    showMark,
    markLabel,
    defaultImageScale,
    showBackground,
    showTextBackground,
    showBgDim,
    showOrnament,
  } = useCover();

  const resolvedPlaceholder =
    titlePlaceholder ||
    (titleKind === "stage" ? "无序矿区" : titleKind === "operation" ? "沃伦姆德的薄暮" : titleKind === "theme" ? "命运共享" : draft.operatorName || "点选干员后自动填入");
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
                      : signatureLabel === "游戏标"
                        ? "ARKNIGHTS: ENDFIELD"
                        : "QM"
              }
            />
          </Field>
        </div>
        {showMark ? (
          <div className="mt-3">
            <Field label={markLabel}>
              <input
                className={fieldClass}
                value={draft.mark ?? ""}
                onChange={(e) => patchDraft({ mark: e.target.value })}
                placeholder="明日方舟测评"
              />
            </Field>
          </div>
        ) : null}
      </div>

      {showOrnament ? (
        <div className="border-b border-line px-4 py-3">
          <p className="mb-1.5 text-[13px] text-sub">中栏花边（现成古典花饰）</p>
          <div className="grid grid-cols-3 gap-2">
            {ORNAMENTS.map((item) => {
              const selected = (draft.ornamentId || "none") === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => patchDraft({ ornamentId: item.id })}
                  className={`overflow-hidden rounded-[6px] border text-left transition-colors ${
                    selected ? "border-accent ring-1 ring-accent" : "border-line hover:border-[#c9ccd0]"
                  }`}
                >
                  <span className="relative block aspect-[4/3] bg-[#efe8de]">
                    {item.src ? (
                      <img src={item.src} alt="" className="absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)] object-contain" />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center text-[12px] text-mute">无</span>
                    )}
                  </span>
                  <span className={`block px-1.5 py-1 text-[12px] ${selected ? "text-accent" : "text-sub"}`}>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {showBackground ? (
        <BackgroundPicker
          label={showTextBackground ? "画布背景" : "背景"}
          value={draft.bgPreset}
          onChange={(bgPreset) => patchDraft({ bgPreset })}
          dim={draft.bgDim}
          dimAmount={draft.bgDimAmount}
          onDimChange={showBgDim ? (bgDim) => patchDraft({ bgDim }) : undefined}
          onDimAmountChange={showBgDim ? (bgDimAmount) => patchDraft({ bgDimAmount }) : undefined}
        />
      ) : null}

      {showTextBackground ? (
        <BackgroundPicker
          label="字背景"
          value={draft.textBgPreset || draft.bgPreset}
          onChange={(textBgPreset) => patchDraft({ textBgPreset })}
        />
      ) : null}

      <IllustLibrary
        operatorId={draft.operatorId}
        artId={draft.artId}
        uploaded={Boolean(draft.imageDataUrl)}
        edgeFade={draft.imageEdgeFade ?? false}
        edgeFadeAmount={draft.imageEdgeFadeAmount}
        onEdgeFadeChange={(imageEdgeFade) => patchDraft({ imageEdgeFade })}
        onEdgeFadeAmountChange={(imageEdgeFadeAmount) => patchDraft({ imageEdgeFadeAmount })}
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
            min={IMAGE_SCALE_MIN}
            max={IMAGE_SCALE_MAX}
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
