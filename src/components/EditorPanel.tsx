import { UploadSimple } from "@phosphor-icons/react";
import { IMAGE_SCALE_MAX, IMAGE_SCALE_MIN } from "../constants";
import { artUrl } from "../data/arts";
import { chibiIdFor, chibiUrl, followingChibiPatch, hasChibi } from "../data/chibis";
import { isNativeElement, nativeTemplateId } from "../data/elements";
import { ORNAMENTS } from "../data/ornaments";
import { getBuiltinLayers } from "../data/seeds";
import { BLANK_ART_LAYER, FIELD_TEXT_LAYERS, type FieldBind } from "../data/seeds/blank";
import { getTemplate } from "../data/templates";
import { isBuiltinId, isChibiLayer } from "../lib/document";
import { IMAGE_FILE_ACCEPT, imageFileLabel, readImageAsDataUrl } from "../lib/readImage";
import { useCover } from "../store/CoverContext";
import type { CanvasSkin, ImageLayer } from "../types";
import { ALL_OUT_ACCENT, allOutAccent } from "../lib/allOutPalette";
import { BLUE_CUT_ACCENT, blueCutAccent } from "../lib/blueCutPalette";
import { resolveMatrixAccent, storeMatrixColorway } from "../lib/matrixPalette";
import { BackgroundPicker } from "./BackgroundPicker";
import { ColorField } from "./ColorField";
import { Field, fieldClass } from "./Field";
import { IllustLibrary } from "./IllustLibrary";

const SKINS: { id: CanvasSkin; label: string }[] = [
  { id: "tactical-matrix", label: "作战矩阵底" },
  { id: "plain", label: "素底" },
  { id: "firstkill", label: "合约底" },
  { id: "lowspec", label: "低配三栏" },
  { id: "rogue", label: "肉鸽底" },
  { id: "madness", label: "杂谈底" },
  { id: "nocore", label: "无核底" },
  { id: "endfield", label: "明日方舟底" },
  { id: "specialist", label: "职业队底" },
  { id: "operator-preview", label: "前瞻分析底" },
  { id: "fourstar-nocore", label: "四星无核底" },
  { id: "solo", label: "仅需一人底" },
  { id: "highspec-nocore", label: "V我50底" },
  { id: "blue-cut", label: "斜切关卡底" },
  { id: "all-out", label: "总攻击底" },
  { id: "strength-review", label: "强度测评底" },
];

/** 模板声明为多行的字段用 textarea，回车即换行；手动换行优先于模板的自动折行。 */
function TextBox({
  multiline,
  value,
  onChange,
  placeholder,
}: {
  multiline: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  if (!multiline) {
    return <input className={fieldClass} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
  }
  return (
    <textarea
      className={`${fieldClass} resize-y leading-snug`}
      rows={Math.min(6, Math.max(2, value.split("\n").length))}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function MultilineHint({ show }: { show: boolean }) {
  return show ? <span className="pointer-events-none absolute top-0 right-0 text-[12px] text-mute">回车换行</span> : null;
}

/** Offers to place a right-panel field on the canvas when no layer shows it yet. */
function PlaceOnCanvas({ bind, label }: { bind: FieldBind; label: string }) {
  const { templateId, draft, addText } = useCover();
  if (nativeTemplateId(templateId, draft.canvasSkin)) return null;
  const placed = draft.layers.some((layer) => layer.kind === "text" && !layer.removed && layer.bind === bind);
  if (placed) return null;
  return (
    <button
      type="button"
      aria-label={`把${label}放到画布`}
      title="这一栏还没有图层显示，点一下放到画布上"
      className="absolute top-0 right-0 text-[12px] text-accent hover:underline"
      onClick={() => addText({ ...FIELD_TEXT_LAYERS[bind], bind })}
    >
      放到画布
    </button>
  );
}

export function EditorPanel() {
  const {
    templateId,
    draft,
    patchDraft,
    patchLayer,
    patchElement,
    switchCanvasSkin,
    addLayer,
    selectedLayer,
    titleKind,
    titleLabel,
    titlePlaceholder,
    multilineFields,
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
  const chibiLayer = selectedImage && isChibiLayer(selectedImage) ? selectedImage : undefined;
  const soloWash = templateId === "solo" || draft.canvasSkin === "solo";
  const washLayer = draft.layers.find((layer) => layer.id === "wash");
  const washOn = !washLayer || (!washLayer.hidden && !washLayer.removed);
  const washOpacity = draft.elementStyles.wash?.opacity ?? washLayer?.opacity ?? 100;
  const imageLayer =
    uploadLayer || chibiLayer
      ? undefined
      : selectedImage ??
        draft.layers.find((layer): layer is ImageLayer => layer.id === "operator" && layer.kind === "image" && !layer.removed) ??
        draft.layers.find((layer): layer is ImageLayer => layer.kind === "image" && layer.source !== "upload" && !isChibiLayer(layer) && !layer.removed);
  const resolvedPlaceholder =
    titlePlaceholder ||
    (titleKind === "stage" ? "无序矿区" : titleKind === "operation" ? "沃伦姆德的薄暮" : titleKind === "theme" ? "命运共享" : draft.operatorName || "点选干员后自动填入");
  const keepTitleOnPick = titleKind === "stage" || titleKind === "operation" || titleKind === "theme";

  return (
    <aside className="flex min-h-0 w-[300px] shrink-0 flex-col self-stretch overflow-x-hidden overflow-y-auto rounded-[8px] bg-panel">
      <div className="border-b border-line px-4 py-3">
        <div className="relative">
          <Field label={titleLabel}>
            <TextBox
              multiline={multilineFields.includes("title")}
              value={draft.title}
              onChange={(title) => patchDraft({ title })}
              placeholder={resolvedPlaceholder}
            />
          </Field>
          <MultilineHint show={multilineFields.includes("title")} />
          <PlaceOnCanvas bind="title" label={titleLabel} />
        </div>
        <div className="relative mt-3">
          <Field label={subtitleLabel}>
            <input className={fieldClass} value={draft.subtitle} onChange={(e) => patchDraft({ subtitle: e.target.value })} />
          </Field>
          <PlaceOnCanvas bind="subtitle" label={subtitleLabel} />
        </div>
        {showEpisode ? (
          <div className="relative mt-3">
            <Field label={episodeLabel}>
              <input className={fieldClass} type="number" min={1} value={draft.episode} onChange={(e) => patchDraft({ episode: Number(e.target.value) || 1 })} />
            </Field>
            <PlaceOnCanvas bind="episode" label={episodeLabel} />
          </div>
        ) : null}
        <div className="relative mt-3">
          <Field label={signatureLabel}>
            <TextBox
              multiline={multilineFields.includes("signature")}
              value={draft.signature}
              onChange={(signature) => patchDraft({ signature })}
            />
          </Field>
          <MultilineHint show={multilineFields.includes("signature")} />
          <PlaceOnCanvas bind="signature" label={signatureLabel} />
        </div>
        {showMark ? (
          <div className="relative mt-3">
            <Field label={markLabel}>
              <TextBox
                multiline={multilineFields.includes("mark")}
                value={draft.mark ?? ""}
                onChange={(mark) => patchDraft({ mark })}
              />
            </Field>
            <MultilineHint show={multilineFields.includes("mark")} />
            <PlaceOnCanvas bind="mark" label={markLabel} />
          </div>
        ) : null}
      </div>

      {templateId === "blue-cut" || draft.canvasSkin === "blue-cut" ? (
        <div className="border-b border-line px-4 py-3">
          <ColorField
            elementId="blue-cut-colorway"
            label="主题色"
            color={blueCutAccent(draft.colorway)}
            onChange={(color) => patchDraft({ colorway: color ?? BLUE_CUT_ACCENT })}
          />
        </div>
      ) : null}

      {templateId === "all-out" || draft.canvasSkin === "all-out" ? (
        <div className="border-b border-line px-4 py-3">
          <ColorField
            elementId="all-out-colorway"
            label="主题色"
            color={allOutAccent(draft.colorway)}
            onChange={(color) => patchDraft({ colorway: color ?? ALL_OUT_ACCENT })}
          />
        </div>
      ) : null}

      {draft.canvasSkin === "tactical-matrix" ? (
        <div className="border-b border-line px-4 py-3">
          <ColorField
            elementId="matrix-colorway"
            label="模板配色"
            color={resolveMatrixAccent(draft.colorway)}
            onChange={(color) =>
              patchDraft({
                colorway: color
                  ? storeMatrixColorway(color)
                  : (getTemplate(templateId)?.defaultColorway ?? "violet"),
              })
            }
          />
        </div>
      ) : null}

      {isBuiltinId(templateId) ? null : (
        <div className="border-b border-line px-4 py-3">
          <Field label="套用模板构图">
            <select className={fieldClass} value={draft.canvasSkin} onChange={(e) => switchCanvasSkin(e.target.value as CanvasSkin)}>
              <option value="plain">不套用（自由排版）</option>
              <optgroup label="套用某个模板的整套构图">
                {SKINS.filter((item) => item.id !== "plain").map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </Field>
          <p className="mt-1.5 text-[12px] leading-relaxed text-mute">
            {draft.canvasSkin === "plain"
              ? "只画背景和你自己加的图层。"
              : "画布换成该模板的整套构图，文案和立绘照用右侧的。你自己排的图层已暂时隐藏，可在左侧单独显示；切回「不套用」会恢复。"}
          </p>
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
      {soloWash ? (
        <div className="border-b border-line px-4 py-2">
          <label className="flex h-8 cursor-pointer items-center justify-between text-[13px] text-sub">
            红雾
            <input
              type="checkbox"
              checked={washOn}
              onChange={(event) => {
                const on = event.target.checked;
                if (washLayer) {
                  patchLayer("wash", on ? { hidden: false, removed: false } : { hidden: true, removed: false });
                  return;
                }
                const seed = getBuiltinLayers("solo").find((layer) => layer.id === "wash");
                if (!seed) return;
                patchDraft({ layers: [...draft.layers, { ...seed, hidden: !on, removed: false }] });
              }}
            />
          </label>
          {washOn ? (
            <div className="mt-1">
              <Field label={`透明度 ${washOpacity}`}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={washOpacity}
                  onChange={(event) => patchElement("wash", { opacity: Number(event.target.value) })}
                  className="w-full"
                />
              </Field>
            </div>
          ) : null}
        </div>
      ) : null}

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

      {chibiLayer ? (
        <IllustLibrary
          kind="chibi"
          operatorId={chibiLayer.operatorId || ""}
          artId={chibiLayer.artId || ""}
          uploaded={Boolean(chibiLayer.imageDataUrl)}
          edgeFade={chibiLayer.edgeFade ?? false}
          edgeFadeAmount={chibiLayer.edgeFadeAmount}
          edgeFadeMode={chibiLayer.edgeFadeMode}
          onEdgeFadeChange={(edgeFade) => patchLayer(chibiLayer.id, { edgeFade })}
          onEdgeFadeAmountChange={(edgeFadeAmount) => patchLayer(chibiLayer.id, { edgeFadeAmount })}
          onEdgeFadeModeChange={(edgeFadeMode) => patchLayer(chibiLayer.id, { edgeFadeMode })}
          onUpload={(imageDataUrl) => {
            patchLayer(chibiLayer.id, {
              source: "chibi",
              imageDataUrl,
              imageUrl: "",
            });
          }}
          onPick={(op, art) => {
            const key = chibiIdFor(op.id, art);
            patchLayer(chibiLayer.id, {
              source: "chibi",
              operatorId: op.id,
              artId: art.id,
              imageUrl: hasChibi(op.id, art) ? chibiUrl(key) : "",
              imageDataUrl: "",
            });
          }}
        />
      ) : null}

      {!imageLayer && !uploadLayer && !chibiLayer && !nativeTemplateId(templateId, draft.canvasSkin) ? (
        <div className="border-b border-line px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-sub">立绘</p>
            <button
              type="button"
              aria-label="把立绘放到画布"
              className="text-[12px] text-accent hover:underline"
              onClick={() => {
                const { id: _slotId, ...slot } = BLANK_ART_LAYER;
                addLayer("image", {
                  ...slot,
                  ...(draft.layers.some((layer) => layer.id === "operator") ? {} : { id: "operator" }),
                  operatorId: draft.operatorId,
                  artId: draft.artId,
                  imageUrl: draft.imageUrl,
                  imageDataUrl: draft.imageDataUrl,
                });
              }}
            >
              放到画布
            </button>
          </div>
          <p className="mt-1 text-[12px] text-mute">画布上还没有立绘，放上去后可在这里换干员。</p>
        </div>
      ) : null}

      {imageLayer ? (
        <IllustLibrary
          operatorId={imageLayer.operatorId || draft.operatorId}
          artId={imageLayer.artId || draft.artId}
          uploaded={Boolean(imageLayer.imageDataUrl || (imageLayer.id === "operator" && draft.imageDataUrl))}
          edgeFade={imageLayer.edgeFade ?? draft.imageEdgeFade ?? false}
          edgeFadeAmount={imageLayer.edgeFadeAmount ?? draft.imageEdgeFadeAmount}
          edgeFadeMode={imageLayer.edgeFadeMode ?? draft.imageEdgeFadeMode}
          onEdgeFadeChange={(imageEdgeFade) => {
            patchLayer(imageLayer.id, { edgeFade: imageEdgeFade });
            if (imageLayer.id === "operator") patchDraft({ imageEdgeFade });
          }}
          onEdgeFadeAmountChange={(imageEdgeFadeAmount) => {
            patchLayer(imageLayer.id, { edgeFadeAmount: imageEdgeFadeAmount });
            if (imageLayer.id === "operator") patchDraft({ imageEdgeFadeAmount });
          }}
          onEdgeFadeModeChange={(imageEdgeFadeMode) => {
            patchLayer(imageLayer.id, { edgeFadeMode: imageEdgeFadeMode });
            if (imageLayer.id === "operator") patchDraft({ imageEdgeFadeMode });
          }}
          onPick={(op, art) => {
            const keepTitle = draft.title.trim() && draft.title.trim() !== draft.operatorName;
            const primary = imageLayer.id === "operator";
            const previousOperatorId = imageLayer.operatorId || draft.operatorId;
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
            const chibi = draft.layers.find((layer): layer is ImageLayer => layer.id === "chibi" && layer.kind === "image");
            const follow = isNativeElement(templateId, "chibi", draft.canvasSkin)
              ? followingChibiPatch(chibi, previousOperatorId, op, art)
              : null;
            if (follow) patchLayer("chibi", follow);
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
        ) : chibiLayer ? (
          <Field label={`小人缩放 ${chibiLayer.scale ?? 100}%`}>
            <input
              type="range"
              min={IMAGE_SCALE_MIN}
              max={IMAGE_SCALE_MAX}
              value={chibiLayer.scale ?? 100}
              onChange={(e) => patchLayer(chibiLayer.id, { scale: Number(e.target.value) })}
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
        <div className={`flex items-center justify-between gap-3 ${uploadLayer || imageLayer || chibiLayer ? "mt-3" : ""}`}>
          {chibiLayer ? (
            <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[8px] px-2 text-[13px] text-sub hover:bg-raised hover:text-accent">
              <UploadSimple size={16} />
              上传小人
              <input
                type="file"
                accept={IMAGE_FILE_ACCEPT}
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  void readImageAsDataUrl(file).then((imageDataUrl) => {
                    patchLayer(chibiLayer.id, { source: "chibi", imageDataUrl, imageUrl: "" });
                  });
                }}
              />
            </label>
          ) : imageLayer ? (
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
