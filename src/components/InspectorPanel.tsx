import { useEffect, useRef } from "react";
import {
  ArrowCounterClockwise,
  CaretDown,
  CaretUp,
  Copy,
  Eye,
  EyeSlash,
  ImageSquare,
  Lock,
  LockOpen,
  Plus,
  Square,
  TextT,
  Trash,
  UploadSimple,
} from "@phosphor-icons/react";
import { IMAGE_EDGE_FADE_DEFAULT, IMAGE_EDGE_FADE_MAX, IMAGE_EDGE_FADE_MIN, IMAGE_SCALE_MAX, IMAGE_SCALE_MIN } from "../constants";
import { COVER_FONTS, TEMPLATE_ELEMENTS, isNativeElement, nativeTemplateId, nativeTextValue } from "../data/elements";
import { imageLayerPan, isBuiltinId } from "../lib/document";
import { resolveArtGrade } from "../lib/effects";
import { IMAGE_FILE_ACCEPT, imageFileLabel, readImageAsDataUrl } from "../lib/readImage";
import { emptyDraft } from "../lib/storage";
import { useCover } from "../store/CoverContext";
import type { ArtGradeEffect, CoverFontId, ImageLayer, LayerEffect, TextBind, TextLayer } from "../types";
import { ColorField } from "./ColorField";
import { Field, fieldClass } from "./Field";
import { LayerStackList } from "./LayerStackList";

const BINDS: { id: TextBind; label: string }[] = [
  { id: "custom", label: "自定义" },
  { id: "title", label: "标题" },
  { id: "subtitle", label: "副标题" },
  { id: "episode", label: "数字" },
  { id: "signature", label: "署名" },
  { id: "mark", label: "角标" },
  { id: "operatorName", label: "干员名" },
];

function ArtGradeFields({ value, onChange }: { value?: ArtGradeEffect; onChange: (next: ArtGradeEffect) => void }) {
  const grade = resolveArtGrade(value);
  return (
    <>
      <label className="mt-3 flex cursor-pointer items-center gap-1.5 text-[13px] text-sub">
        <input
          type="checkbox"
          checked={grade.enabled}
          onChange={(e) => onChange({ ...grade, enabled: e.target.checked })}
        />
        立绘调色
      </label>
      {grade.enabled ? (
        <div className="mt-2 space-y-3">
          <Field label={`对比 ${grade.contrast}%`}>
            <input
              type="range"
              min={0}
              max={40}
              value={grade.contrast}
              onChange={(e) => onChange({ ...grade, contrast: Number(e.target.value) })}
              className="w-full"
            />
          </Field>
          <Field label={`饱和 ${grade.saturate}%`}>
            <input
              type="range"
              min={0}
              max={40}
              value={grade.saturate}
              onChange={(e) => onChange({ ...grade, saturate: Number(e.target.value) })}
              className="w-full"
            />
          </Field>
          <Field label={`亮度 ${grade.brightness}%`}>
            <input
              type="range"
              min={0}
              max={20}
              value={grade.brightness}
              onChange={(e) => onChange({ ...grade, brightness: Number(e.target.value) })}
              className="w-full"
            />
          </Field>
          <Field label={`描边 ${grade.fringe}`}>
            <input
              type="range"
              min={0}
              max={100}
              value={grade.fringe}
              onChange={(e) => onChange({ ...grade, fringe: Number(e.target.value) })}
              className="w-full"
            />
          </Field>
        </div>
      ) : null}
    </>
  );
}

function RotationField({ value, onChange }: { value: number; onChange: (deg: number) => void }) {
  const deg = Math.round(value);
  return (
    <Field label={`旋转 ${deg}°`}>
      <input
        type="range"
        min={-180}
        max={180}
        value={deg}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </Field>
  );
}

const EFFECTS: { id: LayerEffect | ""; label: string }[] = [
  { id: "", label: "无" },
  { id: "slant", label: "斜切" },
  { id: "stroke", label: "描边" },
  { id: "hollow", label: "空心" },
  { id: "scratch", label: "划痕" },
  { id: "glass", label: "玻璃字" },
  { id: "split-de", label: "拆「的」" },
  { id: "split-stage", label: "关卡拆色" },
  { id: "split-limit", label: "限制拆色" },
  { id: "sign-stripe", label: "署名条纹" },
  { id: "sign-dots", label: "署名加点" },
  { id: "guide", label: "攻略字" },
  { id: "face-word", label: "描边标题" },
  { id: "chapter", label: "某某篇" },
  { id: "episode-zh", label: "第N期" },
  { id: "node", label: "N节点" },
  { id: "series-wrap", label: "[栏目]" },
  { id: "tag-prefix", label: "▼ //" },
  { id: "en-name", label: "英文名" },
  { id: "polaroid", label: "拍立得" },
];

export function InspectorPanel() {
  const {
    templateId,
    draft,
    selectedId,
    selectedLayer,
    selectElement,
    patchElement,
    patchLayer,
    patchDraft,
    addLayer,
    removeLayer,
    duplicateSelected,
    reorderSelected,
    resetElement,
    resolvedElements,
  } = useCover();
  const addRef = useRef<HTMLDetailsElement>(null);
  const builtin = isBuiltinId(templateId);
  const skinId = nativeTemplateId(templateId, draft.canvasSkin);
  const natives = skinId ? TEMPLATE_ELEMENTS[skinId] : [];
  const extras = draft.layers.filter((layer) => !isNativeElement(templateId, layer.id, draft.canvasSkin));
  const nativeMeta = selectedId ? natives.find((el) => el.id === selectedId) : undefined;
  const native = Boolean(nativeMeta);
  const layer = selectedLayer;
  const text = layer?.kind === "text" ? (layer as TextLayer) : null;
  const image = layer?.kind === "image" ? (layer as ImageLayer) : null;
  const style = selectedId ? (draft.elementStyles[selectedId] ?? {}) : {};
  const resolved = selectedId ? (resolvedElements[selectedId] ?? {}) : {};
  const currentFontSize = style.fontSize ?? resolved.fontSize;
  const currentFont = style.font ?? resolved.font ?? nativeMeta?.defaultFont ?? "cn";
  const currentColor = style.color ?? resolved.color;
  const currentX = style.x ?? resolved.x ?? 0;
  const currentY = style.y ?? resolved.y ?? 0;
  const currentRotation = style.rotation ?? layer?.rotation ?? 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") selectElement(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectElement]);

  return (
    <aside className="flex min-h-0 w-[260px] shrink-0 flex-col self-stretch overflow-x-hidden overflow-y-auto rounded-[8px] bg-panel">
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-sub">图层</p>
          <details ref={addRef} className="relative">
            <summary className="flex h-7 cursor-pointer list-none items-center gap-1 rounded-[6px] px-2 text-[12px] text-sub hover:bg-raised hover:text-accent">
              <Plus size={12} />
              添加
            </summary>
            <div className="absolute top-8 right-0 z-20 w-36 rounded-[8px] border border-line bg-panel py-1 shadow-lg">
              {(
                [
                  ["text", "文字", TextT],
                  ["box", "色块", Square],
                  ["image", "立绘", ImageSquare],
                ] as const
              ).map(([kind, label, Icon]) => (
                <button
                  key={kind}
                  type="button"
                  className="flex h-8 w-full items-center gap-2 px-3 text-left text-[13px] text-text hover:bg-raised"
                  onClick={() => {
                    addLayer(kind);
                    if (addRef.current) addRef.current.open = false;
                  }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
              <label className="relative flex h-8 w-full cursor-pointer items-center gap-2 px-3 text-left text-[13px] text-text hover:bg-raised">
                <UploadSimple size={14} />
                上传图
                <input
                  type="file"
                  accept={IMAGE_FILE_ACCEPT}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (addRef.current) addRef.current.open = false;
                    if (!file) return;
                    void readImageAsDataUrl(file)
                      .then((imageDataUrl) => {
                        addLayer("upload", {
                          imageDataUrl,
                          imageUrl: "",
                          artId: "",
                          operatorId: "",
                          label: imageFileLabel(file.name),
                        });
                      })
                      .catch(() => {
                        window.alert("这张图片读不出来，换一张 png / jpg / webp 再试。");
                      });
                  }}
                />
              </label>
            </div>
          </details>
        </div>
        <LayerStackList />
        {!skinId && extras.filter((layer) => !layer.removed).length === 0 ? (
          <p className="mt-2 text-[12px] text-mute">还没有图层，点添加开始排版。</p>
        ) : null}
      </div>

      <div className="px-4 py-3">
        {native && nativeMeta ? (
          <>
            <div className="mb-3 flex items-center justify-between gap-1">
              <p className="truncate text-[13px] font-medium text-text">{nativeMeta.label}</p>
              <div className="flex shrink-0 items-center">
                <button
                  type="button"
                  title={layer?.hidden ? "显示" : "隐藏"}
                  className="grid size-7 place-items-center rounded-[6px] text-sub hover:bg-raised hover:text-accent"
                  onClick={() => patchLayer(nativeMeta.id, { hidden: !layer?.hidden })}
                >
                  {layer?.hidden ? <EyeSlash size={12} /> : <Eye size={12} />}
                </button>
                <button
                  type="button"
                  title="重置"
                  className="grid size-7 place-items-center rounded-[6px] text-sub hover:bg-raised hover:text-accent"
                  onClick={() => {
                    if (nativeMeta.id === "operator") {
                      const fresh = emptyDraft(templateId);
                      const freshOp = fresh.layers.find((item) => item.id === "operator");
                      patchDraft({
                        imageX: fresh.imageX,
                        imageY: fresh.imageY,
                        imageScale: fresh.imageScale,
                      });
                      patchElement(nativeMeta.id, { rotation: 0, x: 0, y: 0 });
                      patchLayer(nativeMeta.id, {
                        artGrade:
                          freshOp?.kind === "image" ? freshOp.artGrade : undefined,
                      });
                      return;
                    }
                    resetElement(nativeMeta.id);
                  }}
                >
                  <ArrowCounterClockwise size={12} />
                </button>
                <button
                  type="button"
                  title="删除"
                  className="grid size-7 place-items-center rounded-[6px] text-sub hover:bg-raised hover:text-accent"
                  onClick={() => removeLayer(nativeMeta.id)}
                >
                  <Trash size={12} />
                </button>
              </div>
            </div>

            {nativeMeta.kind === "image" ? (
              <>
                {(() => {
                  const primary = nativeMeta.id === "operator";
                  const panX = primary ? draft.imageX : (image?.imageX ?? 0);
                  const panY = primary ? draft.imageY : (image?.imageY ?? 0);
                  const zoom = primary ? draft.imageScale : (image?.scale ?? draft.imageScale);
                  const fadeOn = primary ? Boolean(draft.imageEdgeFade) : Boolean(image?.edgeFade);
                  const fadeAmt = primary
                    ? (draft.imageEdgeFadeAmount ?? IMAGE_EDGE_FADE_DEFAULT)
                    : (image?.edgeFadeAmount ?? IMAGE_EDGE_FADE_DEFAULT);
                  const setPan = (patch: { imageX?: number; imageY?: number; scale?: number; edgeFade?: boolean; edgeFadeAmount?: number }) => {
                    if (primary) {
                      patchDraft({
                        ...(patch.imageX != null ? { imageX: patch.imageX } : {}),
                        ...(patch.imageY != null ? { imageY: patch.imageY } : {}),
                        ...(patch.scale != null ? { imageScale: patch.scale } : {}),
                        ...(patch.edgeFade != null ? { imageEdgeFade: patch.edgeFade } : {}),
                        ...(patch.edgeFadeAmount != null ? { imageEdgeFadeAmount: patch.edgeFadeAmount } : {}),
                      });
                      if (patch.scale != null || patch.imageX != null || patch.imageY != null || patch.edgeFade != null || patch.edgeFadeAmount != null) {
                        patchLayer(nativeMeta.id, patch);
                      }
                      return;
                    }
                    patchLayer(nativeMeta.id, patch);
                  };
                  return (
                    <>
                <Field label={`水平 ${Math.round(panX)}`}>
                  <input
                    type="range"
                    min={-600}
                    max={600}
                    value={panX}
                    onChange={(e) => setPan({ imageX: Number(e.target.value) })}
                    className="w-full"
                  />
                </Field>
                <div className="mt-3">
                  <Field label={`垂直 ${Math.round(panY)}`}>
                    <input
                      type="range"
                      min={-600}
                      max={600}
                      value={panY}
                      onChange={(e) => setPan({ imageY: Number(e.target.value) })}
                      className="w-full"
                    />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label={`缩放 ${zoom}%`}>
                    <input
                      type="range"
                      min={IMAGE_SCALE_MIN}
                      max={IMAGE_SCALE_MAX}
                      value={zoom}
                      onChange={(e) => setPan({ scale: Number(e.target.value) })}
                      className="w-full"
                    />
                  </Field>
                </div>
                <div className="mt-3">
                  <RotationField value={currentRotation} onChange={(rotation) => patchElement(nativeMeta.id, { rotation })} />
                </div>
                <label className="mt-3 flex cursor-pointer items-center gap-1.5 text-[13px] text-sub">
                  <input
                    type="checkbox"
                    checked={fadeOn}
                    onChange={(e) => setPan({ edgeFade: e.target.checked })}
                  />
                  边缘虚化
                </label>
                {fadeOn ? (
                  <div className="mt-2">
                    <Field label={`虚化宽度 ${fadeAmt}%`}>
                      <input
                        type="range"
                        min={IMAGE_EDGE_FADE_MIN}
                        max={IMAGE_EDGE_FADE_MAX}
                        value={fadeAmt}
                        onChange={(e) => setPan({ edgeFadeAmount: Number(e.target.value) })}
                        className="w-full"
                      />
                    </Field>
                  </div>
                ) : null}
                <ArtGradeFields
                  value={image?.artGrade}
                  onChange={(artGrade) => patchLayer(nativeMeta.id, { artGrade })}
                />
                    </>
                  );
                })()}
              </>
            ) : (
              <>
                {nativeMeta.kind === "text" ? (
                  <div className="mb-3">
                    <Field label="文案">
                      <textarea
                        className={`${fieldClass} min-h-16`}
                        value={nativeTextValue(templateId, nativeMeta, draft, style)}
                        onChange={(e) => {
                          const value = e.target.value;
                          const bind = nativeMeta.textBind;
                          if (bind === "title") patchDraft({ title: value });
                          else if (bind === "subtitle") patchDraft({ subtitle: value });
                          else if (bind === "signature") patchDraft({ signature: value });
                          else if (bind === "mark") patchDraft({ mark: value });
                          else if (bind === "operatorName") patchDraft({ operatorName: value });
                          else if (bind === "episode") patchDraft({ episode: Number(value.replace(/\D/g, "")) || 1 });
                          else patchElement(nativeMeta.id, { text: value });
                        }}
                      />
                    </Field>
                  </div>
                ) : null}
                <Field label={`水平 ${Math.round(currentX)}`}>
                  <input
                    type="range"
                    min={nativeMeta.hasOpacity ? -900 : -480}
                    max={nativeMeta.hasOpacity ? 900 : 480}
                    value={currentX}
                    onChange={(e) => patchElement(nativeMeta.id, { x: Number(e.target.value) })}
                    className="w-full"
                  />
                </Field>
                <div className="mt-3">
                  <Field label={`垂直 ${Math.round(currentY)}`}>
                    <input
                      type="range"
                      min={nativeMeta.hasOpacity ? -900 : -480}
                      max={nativeMeta.hasOpacity ? 900 : 480}
                      value={currentY}
                      onChange={(e) => patchElement(nativeMeta.id, { y: Number(e.target.value) })}
                      className="w-full"
                    />
                  </Field>
                </div>
                <div className="mt-3">
                  <RotationField value={currentRotation} onChange={(rotation) => patchElement(nativeMeta.id, { rotation })} />
                </div>
                {nativeMeta.hasOpacity ? (
                  <div className="mt-3">
                    <Field label={`暗度 ${style.opacity ?? nativeMeta.defaultOpacity ?? 100}`}>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={style.opacity ?? nativeMeta.defaultOpacity ?? 100}
                        onChange={(e) => patchElement(nativeMeta.id, { opacity: Number(e.target.value) })}
                        className="w-full"
                      />
                    </Field>
                  </div>
                ) : null}
                {nativeMeta.kind === "text" ? (
                  <>
                    <div className="mt-3">
                      <Field label="字号">
                        <input
                          className={fieldClass}
                          type="number"
                          min={16}
                          max={280}
                          value={currentFontSize ?? ""}
                          onChange={(e) => {
                            patchElement(nativeMeta.id, { fontSize: Number(e.target.value) || currentFontSize || 16 });
                          }}
                        />
                      </Field>
                    </div>
                    <div className="mt-3">
                      <Field label="字体">
                        <select
                          className={fieldClass}
                          value={currentFont}
                          onChange={(e) => {
                            patchElement(nativeMeta.id, { font: e.target.value as CoverFontId });
                          }}
                        >
                          {COVER_FONTS.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </>
                ) : null}
                {nativeMeta.kind === "text" || nativeMeta.hasColor ? (
                  <ColorField
                    elementId={nativeMeta.id}
                    color={style.color}
                    displayColor={currentColor}
                    onChange={(color) => patchElement(nativeMeta.id, { color })}
                  />
                ) : null}
              </>
            )}
          </>
        ) : layer ? (
          <>
            <div className="mb-3 flex items-center justify-between gap-1">
              <p className="truncate text-[13px] font-medium text-text">{layer.label}</p>
              <div className="flex shrink-0 items-center">
                <button type="button" title="上移" className="grid size-7 place-items-center rounded-[6px] text-sub hover:bg-raised hover:text-accent" onClick={() => reorderSelected(1)}>
                  <CaretUp size={12} />
                </button>
                <button type="button" title="下移" className="grid size-7 place-items-center rounded-[6px] text-sub hover:bg-raised hover:text-accent" onClick={() => reorderSelected(-1)}>
                  <CaretDown size={12} />
                </button>
                <button type="button" title="复制" className="grid size-7 place-items-center rounded-[6px] text-sub hover:bg-raised hover:text-accent" onClick={() => duplicateSelected()}>
                  <Copy size={12} />
                </button>
                <button
                  type="button"
                  title={layer.hidden ? "显示" : "隐藏"}
                  className="grid size-7 place-items-center rounded-[6px] text-sub hover:bg-raised hover:text-accent"
                  onClick={() => patchLayer(layer.id, { hidden: !layer.hidden })}
                >
                  {layer.hidden ? <EyeSlash size={12} /> : <Eye size={12} />}
                </button>
                <button
                  type="button"
                  title={layer.locked ? "解锁" : "锁定"}
                  className="grid size-7 place-items-center rounded-[6px] text-sub hover:bg-raised hover:text-accent"
                  onClick={() => patchLayer(layer.id, { locked: !layer.locked })}
                >
                  {layer.locked ? <Lock size={12} /> : <LockOpen size={12} />}
                </button>
                <button type="button" title="重置" className="grid size-7 place-items-center rounded-[6px] text-sub hover:bg-raised hover:text-accent" onClick={() => resetElement(layer.id)}>
                  <ArrowCounterClockwise size={12} />
                </button>
                <button type="button" title="删除" className="grid size-7 place-items-center rounded-[6px] text-sub hover:bg-raised hover:text-accent" onClick={() => removeLayer(layer.id)}>
                  <Trash size={12} />
                </button>
              </div>
            </div>

            <Field label="名称">
              <input className={fieldClass} value={layer.label} onChange={(e) => patchLayer(layer.id, { label: e.target.value })} />
            </Field>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Field label={`X ${Math.round(layer.x + (image ? imageLayerPan(image, draft).x : 0))}`}>
                <input
                  type="range"
                  min={-400}
                  max={1920}
                  value={layer.x + (image ? imageLayerPan(image, draft).x : 0)}
                  onChange={(e) => {
                    const visualX = Number(e.target.value);
                    const pan = image ? imageLayerPan(image, draft) : { x: 0, y: 0 };
                    patchLayer(layer.id, { x: visualX, y: layer.y + pan.y, ...(image ? { imageX: 0, imageY: 0 } : {}) });
                    if (layer.id === "operator") patchDraft({ imageX: 0, imageY: 0 });
                  }}
                  className="w-full"
                />
              </Field>
              <Field label={`Y ${Math.round(layer.y + (image ? imageLayerPan(image, draft).y : 0))}`}>
                <input
                  type="range"
                  min={-400}
                  max={1080}
                  value={layer.y + (image ? imageLayerPan(image, draft).y : 0)}
                  onChange={(e) => {
                    const visualY = Number(e.target.value);
                    const pan = image ? imageLayerPan(image, draft) : { x: 0, y: 0 };
                    patchLayer(layer.id, { x: layer.x + pan.x, y: visualY, ...(image ? { imageX: 0, imageY: 0 } : {}) });
                    if (layer.id === "operator") patchDraft({ imageX: 0, imageY: 0 });
                  }}
                  className="w-full"
                />
              </Field>
              <Field label={`宽 ${Math.round(layer.w)}`}>
                <input type="range" min={24} max={1920} value={layer.w} onChange={(e) => patchLayer(layer.id, { w: Number(e.target.value) })} className="w-full" />
              </Field>
              <Field label={`高 ${Math.round(layer.h)}`}>
                <input type="range" min={24} max={1400} value={layer.h} onChange={(e) => patchLayer(layer.id, { h: Number(e.target.value) })} className="w-full" />
              </Field>
              <div className="col-span-2">
                <RotationField value={currentRotation} onChange={(rotation) => patchLayer(layer.id, { rotation })} />
              </div>
            </div>

            {text ? (
              <>
                <div className="mt-3">
                  <Field label="绑定">
                    <select className={fieldClass} value={text.bind} onChange={(e) => patchLayer(layer.id, { bind: e.target.value as TextBind })}>
                      {BINDS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                {text.bind === "custom" ? (
                  <div className="mt-3">
                    <Field label="文案">
                      <textarea className={`${fieldClass} min-h-16`} value={text.text} onChange={(e) => patchLayer(layer.id, { text: e.target.value })} />
                    </Field>
                  </div>
                ) : null}
                <div className="mt-3">
                  <Field label="字号">
                    <input
                      className={fieldClass}
                      type="number"
                      min={12}
                      max={360}
                      value={text.fontSize}
                      onChange={(e) => patchLayer(layer.id, { fontSize: Number(e.target.value) || text.fontSize })}
                    />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label="字体">
                    <select className={fieldClass} value={text.font} onChange={(e) => patchLayer(layer.id, { font: e.target.value as CoverFontId })}>
                      {COVER_FONTS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-[12px] text-mute">高级效果</summary>
                  <div className="mt-2">
                    <select
                      className={fieldClass}
                      value={text.effect ?? ""}
                      onChange={(e) => patchLayer(layer.id, { effect: (e.target.value || undefined) as LayerEffect | undefined })}
                    >
                      {EFFECTS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </details>
              </>
            ) : null}

            {image ? (
              <>
                {image.source === "upload" ? (
                  <label className="relative mt-3 inline-flex h-8 cursor-pointer items-center gap-1.5 overflow-hidden rounded-[6px] px-2 text-[13px] text-sub hover:bg-raised hover:text-accent">
                    <UploadSimple size={14} />
                    {image.imageDataUrl ? "更换图片" : "选择图片"}
                    <input
                      type="file"
                      accept={IMAGE_FILE_ACCEPT}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        void readImageAsDataUrl(file).then((imageDataUrl) => {
                          patchLayer(layer.id, {
                            source: "upload",
                            imageDataUrl,
                            imageUrl: "",
                            artId: "",
                            operatorId: "",
                            label: layer.label === "上传图" ? imageFileLabel(file.name) : layer.label,
                          });
                        });
                      }}
                    />
                  </label>
                ) : null}
                <div className="mt-3">
                  <Field label={`缩放 ${image.scale ?? draft.imageScale}%`}>
                    <input
                      type="range"
                      min={IMAGE_SCALE_MIN}
                      max={IMAGE_SCALE_MAX}
                      value={image.scale ?? draft.imageScale}
                      onChange={(e) => {
                        const imageScale = Number(e.target.value);
                        patchLayer(layer.id, { scale: imageScale });
                        if (layer.id === "operator") patchDraft({ imageScale });
                      }}
                      className="w-full"
                    />
                  </Field>
                </div>
                <label className="mt-3 flex cursor-pointer items-center gap-1.5 text-[13px] text-sub">
                  <input
                    type="checkbox"
                    checked={image.edgeFade ?? draft.imageEdgeFade ?? false}
                    onChange={(e) => {
                      patchLayer(layer.id, { edgeFade: e.target.checked });
                      if (layer.id === "operator") patchDraft({ imageEdgeFade: e.target.checked });
                    }}
                  />
                  边缘虚化
                </label>
                {(image.edgeFade ?? draft.imageEdgeFade) ? (
                  <div className="mt-2">
                    <Field label={`虚化 ${image.edgeFadeAmount ?? draft.imageEdgeFadeAmount ?? IMAGE_EDGE_FADE_DEFAULT}%`}>
                      <input
                        type="range"
                        min={IMAGE_EDGE_FADE_MIN}
                        max={IMAGE_EDGE_FADE_MAX}
                        value={image.edgeFadeAmount ?? draft.imageEdgeFadeAmount ?? IMAGE_EDGE_FADE_DEFAULT}
                        onChange={(e) => {
                          const imageEdgeFadeAmount = Number(e.target.value);
                          patchLayer(layer.id, { edgeFadeAmount: imageEdgeFadeAmount });
                          if (layer.id === "operator") patchDraft({ imageEdgeFadeAmount });
                        }}
                        className="w-full"
                      />
                    </Field>
                  </div>
                ) : null}
                <ArtGradeFields
                  value={image.artGrade}
                  onChange={(artGrade) => patchLayer(layer.id, { artGrade })}
                />
              </>
            ) : null}

            {layer.kind === "box" || layer.kind === "text" ? (
              <ColorField
                elementId={layer.id}
                color={layer.color}
                displayColor={layer.color}
                onChange={(color) => {
                  patchLayer(layer.id, { color, ...(layer.kind === "box" ? { fill: color } : {}) });
                }}
              />
            ) : null}
          </>
        ) : (
          <p className="text-[13px] leading-relaxed text-mute">
            {builtin ? "点选画布上的文字或立绘，改位置、字体、字号。也可再添加自由图层。" : "点选图层或画布上的元素，可改位置、尺寸、字体。Delete 删除，⌘D 复制。"}
          </p>
        )}
      </div>
    </aside>
  );
}
