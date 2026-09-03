import { UploadSimple } from "@phosphor-icons/react";
import { IMAGE_SCALE_MAX, IMAGE_SCALE_MIN } from "../constants";
import { artUrl } from "../data/arts";
import { ORNAMENTS } from "../data/ornaments";
import { isBuiltinId } from "../lib/document";
import { IMAGE_FILE_ACCEPT, imageFileLabel, readImageAsDataUrl } from "../lib/readImage";
import { useCover } from "../store/CoverContext";
import type { CanvasSkin, ImageLayer } from "../types";
import { BackgroundPicker } from "./BackgroundPicker";
import { Field, fieldClass } from "./Field";
import { IllustLibrary } from "./IllustLibrary";

const SKINS: { id: CanvasSkin; label: string }[] = [
  { id: "plain", label: "素底" },
  { id: "firstkill", label: "合约底" },
  { id: "lowspec", label: "低配三栏" },
  { id: "rogue", label: "肉鸽底" },
  { id: "madness", label: "杂谈底" },
  { id: "nocore", label: "无核底" },
  { id: "endfield", label: "终末地底" },
  { id: "specialist", label: "职业队底" },
  { id: "operator-preview", label: "前瞻分析底" },
];

export function EditorPanel() {
  const {
    templateId,
    draft,
    patchDraft,
    patchLayer,
    selectedLayer,
    titleKind,
    titleLabel,
    titlePlaceholder,
    subtitleLabel,
    episodeLabel,
    signatureLabel,
    showMark,
    markLabel,
    defaultImageScale,
    showEpisode,
    showTextBackground,
    showOrnament,
  } = useCover();

  const selectedImage = selectedLayer?.kind === "image" ? (selectedLayer as ImageLayer) : undefined;
  const uploadLayer = selectedImage?.source === "upload" ? selectedImage : undefined;
  const imageLayer =
    uploadLayer
      ? undefined
      : selectedImage ??
        draft.layers.find((layer): layer is ImageLayer => layer.id === "operator" && layer.kind === "image" && !layer.removed) ??
        draft.layers.find((layer): layer is ImageLayer => layer.kind === "image" && layer.source !== "upload" && !layer.removed);
  const resolvedPlaceholder =
    titlePlaceholder ||
    (titleKind === "stage" ? "无序矿区" : titleKind === "operation" ? "沃伦姆德的薄暮" : titleKind === "theme" ? "命运共享" : draft.operatorName || "点选干员后自动填入");
  const keepTitleOnPick = titleKind === "stage" || titleKind === "operation" || titleKind === "theme";

  return (
    <aside className="flex min-h-0 w-[300px] shrink-0 flex-col self-stretch overflow-x-hidden overflow-y-auto rounded-[8px] bg-panel">
      <div className="border-b border-line px-4 py-3">
        <Field label={titleLabel}>
          <input className={fieldClass} value={draft.title} onChange={(e) => patchDraft({ title: e.target.value })} placeholder={resolvedPlaceholder} />
        </Field>
        <div className="mt-3">
          <Field label={subtitleLabel}>
            <input className={fieldClass} value={draft.subtitle} onChange={(e) => patchDraft({ subtitle: e.target.value })} />
          </Field>
        </div>
        {showEpisode ? (
          <div className="mt-3">
            <Field label={episodeLabel}>
              <input className={fieldClass} type="number" min={1} value={draft.episode} onChange={(e) => patchDraft({ episode: Number(e.target.value) || 1 })} />
            </Field>
          </div>
        ) : null}
        <div className="mt-3">
          <Field label={signatureLabel}>
            <input className={fieldClass} value={draft.signature} onChange={(e) => patchDraft({ signature: e.target.value })} />
          </Field>
        </div>
        {showMark ? (
          <div className="mt-3">
            <Field label={markLabel}>
              <input className={fieldClass} value={draft.mark ?? ""} onChange={(e) => patchDraft({ mark: e.target.value })} />
            </Field>
          </div>
        ) : null}
      </div>

      {isBuiltinId(templateId) ? null : (
        <div className="border-b border-line px-4 py-3">
          <Field label="画布底">
            <select className={fieldClass} value={draft.canvasSkin} onChange={(e) => patchDraft({ canvasSkin: e.target.value as CanvasSkin })}>
              {SKINS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {showOrnament ? (
        <div className="border-b border-line px-4 py-3">
          <p className="mb-1.5 text-[13px] text-sub">中栏花边</p>
          <div className="grid grid-cols-3 gap-2">
            {ORNAMENTS.map((item) => {
              const selected = (draft.ornamentId || "none") === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => patchDraft({ ornamentId: item.id })}
                  className={`overflow-hidden rounded-[6px] border text-left ${selected ? "border-accent ring-1 ring-accent" : "border-line hover:border-[#c9ccd0]"}`}
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

      <BackgroundPicker
        label={showTextBackground ? "画布背景" : "背景"}
        value={draft.bgPreset}
        onChange={(bgPreset) => patchDraft({ bgPreset })}
      />

      {showTextBackground ? (
        <BackgroundPicker label="字背景" value={draft.textBgPreset || draft.bgPreset} onChange={(textBgPreset) => patchDraft({ textBgPreset })} />
      ) : null}

      {uploadLayer ? (
        <UploadImagePanel
          layer={uploadLayer}
          onReplace={(file) => {
            void readImageAsDataUrl(file).then((imageDataUrl) => {
              patchLayer(uploadLayer.id, {
                source: "upload",
                imageDataUrl,
                imageUrl: "",
                artId: "",
                operatorId: "",
                label: uploadLayer.label === "上传图" ? imageFileLabel(file.name) : uploadLayer.label,
              });
            });
          }}
        />
      ) : null}

      {imageLayer ? (
        <IllustLibrary
          operatorId={imageLayer.operatorId || draft.operatorId}
          artId={imageLayer.artId || draft.artId}
          uploaded={Boolean(imageLayer.imageDataUrl || (imageLayer.id === "operator" && draft.imageDataUrl))}
          edgeFade={imageLayer.edgeFade ?? draft.imageEdgeFade ?? false}
          edgeFadeAmount={imageLayer.edgeFadeAmount ?? draft.imageEdgeFadeAmount}
          onEdgeFadeChange={(imageEdgeFade) => {
            patchLayer(imageLayer.id, { edgeFade: imageEdgeFade });
            if (imageLayer.id === "operator") patchDraft({ imageEdgeFade });
          }}
          onEdgeFadeAmountChange={(imageEdgeFadeAmount) => {
            patchLayer(imageLayer.id, { edgeFadeAmount: imageEdgeFadeAmount });
            if (imageLayer.id === "operator") patchDraft({ imageEdgeFadeAmount });
          }}
          onPick={(op, art) => {
            const keepTitle = draft.title.trim() && draft.title.trim() !== draft.operatorName;
            const primary = imageLayer.id === "operator";
            patchLayer(imageLayer.id, {
              source: "operator",
              operatorId: op.id,
              artId: art.id,
              imageUrl: artUrl(art.id),
              imageDataUrl: "",
              ...(primary
                ? { imageX: 0, imageY: 0, scale: defaultImageScale }
                : {}),
            });
            if (!primary) return;
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
      ) : null}

      <div className="border-t border-line px-4 py-3">
        {uploadLayer ? (
          <Field label={`图片缩放 ${uploadLayer.scale ?? draft.imageScale}%`}>
            <input
              type="range"
              min={IMAGE_SCALE_MIN}
              max={IMAGE_SCALE_MAX}
              value={uploadLayer.scale ?? draft.imageScale}
              onChange={(e) => patchLayer(uploadLayer.id, { scale: Number(e.target.value) })}
              className="w-full"
            />
          </Field>
        ) : imageLayer ? (
          <Field label={`立绘缩放 ${imageLayer.scale ?? draft.imageScale}%`}>
            <input
              type="range"
              min={IMAGE_SCALE_MIN}
              max={IMAGE_SCALE_MAX}
              value={imageLayer.scale ?? draft.imageScale}
              onChange={(e) => {
                const imageScale = Number(e.target.value);
                patchLayer(imageLayer.id, { scale: imageScale });
                if (imageLayer.id === "operator") patchDraft({ imageScale });
              }}
              className="w-full"
            />
          </Field>
        ) : null}
        <div className={`flex items-center justify-between gap-3 ${uploadLayer || imageLayer ? "mt-3" : ""}`}>
          {imageLayer ? (
            <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[8px] px-2 text-[13px] text-sub hover:bg-raised hover:text-accent">
              <UploadSimple size={16} />
              上传立绘
              <input
                type="file"
                accept={IMAGE_FILE_ACCEPT}
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  void readImageAsDataUrl(file).then((imageDataUrl) => {
                    patchLayer(imageLayer.id, { imageDataUrl, imageUrl: "", artId: "" });
                    if (imageLayer.id === "operator") patchDraft({ imageDataUrl, imageUrl: "", artId: "" });
                  });
                }}
              />
            </label>
          ) : (
            <span />
          )}
          <label className="flex items-center gap-2 text-[13px] text-sub">
            <input type="checkbox" checked={draft.showSafeArea} onChange={(e) => patchDraft({ showSafeArea: e.target.checked })} />
            安全区
          </label>
        </div>
      </div>
    </aside>
  );
}

function UploadImagePanel({
  layer,
  onReplace,
}: {
  layer: ImageLayer;
  onReplace: (file: File) => void;
}) {
  return (
    <div className="border-b border-line px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-medium text-text">上传图</h2>
        <p className="min-w-0 truncate text-[12px] text-accent" title={layer.label}>
          {layer.imageDataUrl ? layer.label : "未选"}
        </p>
      </div>
      {layer.imageDataUrl ? (
        <div className="mt-3 overflow-hidden rounded-[6px] border border-line bg-raised">
          <img src={layer.imageDataUrl} alt="" className="mx-auto max-h-40 object-contain" />
        </div>
      ) : (
        <p className="mt-2 text-[13px] text-mute">从本机选择一张图片，不走立绘库。</p>
      )}
      <label className="relative mt-3 inline-flex h-8 cursor-pointer items-center gap-1.5 overflow-hidden rounded-[8px] px-2 text-[13px] text-sub hover:bg-raised hover:text-accent">
        <UploadSimple size={16} />
        {layer.imageDataUrl ? "更换图片" : "选择图片"}
        <input
          type="file"
          accept={IMAGE_FILE_ACCEPT}
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onReplace(file);
          }}
        />
      </label>
    </div>
  );
}
