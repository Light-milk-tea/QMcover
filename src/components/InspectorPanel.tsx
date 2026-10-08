import { useEffect, useRef, useState } from "react";
import {
  ArrowCounterClockwise,
  Broom,
  CaretDown,
  CaretUp,
  Copy,
  Eye,
  EyeSlash,
  ImageSquare,
  Lock,
  LockOpen,
  Person,
  Plus,
  Square,
  TextT,
  Trash,
  UploadSimple,
} from "@phosphor-icons/react";
import {
  IMAGE_EDGE_FADE_DEFAULT,
  IMAGE_SCALE_MAX,
  IMAGE_SCALE_MIN,
  STAGE_BAR_WIDTH_DEFAULT,
  STAGE_BAR_WIDTH_MAX,
  STAGE_BAR_WIDTH_MIN,
} from "../constants";
import { BLANK_TEMPLATE_ID } from "../constants";
import { TEMPLATE_ELEMENTS, isNativeElement, nativeTemplateId, nativeTextValue } from "../data/elements";
import { TEXT_STYLES, getTextStyle } from "../data/textStyles";
import { RING_RADIUS, RING_THICKNESS } from "../lib/allOutLayout";
import { displayBoundText, imageLayerPan, isBuiltinId } from "../lib/document";
import { resolveArtGrade } from "../lib/effects";
import { IMAGE_FILE_ACCEPT, imageFileLabel, readImageAsDataUrl } from "../lib/readImage";
import { emptyDraft } from "../lib/storage";
import { useCover } from "../store/CoverContext";
import type { ArtGradeEffect, EdgeFadeMode, ImageLayer, LayerEffect, TextBind, TextLayer } from "../types";
import { BackgroundPicker } from "./BackgroundPicker";
import { ColorField } from "./ColorField";
import { DecorationPicker } from "./DecorationPicker";
import { EdgeFadeFields } from "./EdgeFadeFields";
import { Field, fieldClass } from "./Field";
import { FontPicker } from "./FontPicker";
import { LayerStackList } from "./LayerStackList";
import { TextStylePicker } from "./TextStylePicker";

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

const EFFECT_GROUPS: { label: string; items: { id: LayerEffect | ""; label: string }[] }[] = [
  {
    label: "基础",
    items: [
      { id: "", label: "默认阴影" },
      { id: "plain", label: "纯色无投影" },
      { id: "outline", label: "外描边" },
      { id: "raised", label: "轻投影（斜切关卡）" },
      { id: "slant", label: "斜切" },
      { id: "defocus", label: "虚焦（特种三人）" },
    ],
  },
  {
    label: "模板字效",
    items: [
      { id: "gold-title", label: "描边金字（低配攻略）" },
      { id: "chromatic", label: "色散（紧急授课）" },
      { id: "pink", label: "粉色条件字（紧急授课）" },
      { id: "magenta-shadow", label: "品红投影（紧急授课）" },
      { id: "metal", label: "金属（强度测评）" },
      { id: "gold-grain", label: "金纹（特种三人）" },
      { id: "matrix", label: "全息（作战矩阵，颜色即主题色）" },
      { id: "grain-stage", label: "颗粒关卡码（斜切关卡，颜色即主题色）" },
      { id: "layered", label: "叠影（干员前瞻分析）" },
      { id: "glow", label: "柔影（仅需一人）" },
      { id: "block", label: "硬投影（职业队）" },
      { id: "stroke", label: "斜体描边（危机合约）" },
      { id: "face-word", label: "粗描边（决战五星）" },
      { id: "hollow", label: "空心（肉鸽）" },
      { id: "glass", label: "玻璃字（肉鸽，透出字背景）" },
      { id: "scratch", label: "划痕玻璃字（肉鸽）" },
      { id: "guide", label: "攻略字（低配攻略）" },
      { id: "sign-stripe", label: "署名条纹（低配攻略）" },
      { id: "sign-dots", label: "署名加点（无核论文）" },
    ],
  },
  {
    label: "拆分与格式",
    items: [
      { id: "split-de", label: "拆「的」金白" },
      { id: "split-stage", label: "关卡码拆色" },
      { id: "split-limit", label: "限制拆色" },
      { id: "episode-zh", label: "第N期" },
      { id: "chapter", label: "某某篇" },
      { id: "node", label: "N节点" },
      { id: "series-wrap", label: "[栏目]" },
      { id: "tag-prefix", label: "▼ //" },
      { id: "en-name", label: "干员英文名" },
    ],
  },
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
    addText,
    addDecoration,
    clearLayers,
    restoreLayers,
    removeLayer,
    duplicateSelected,
    reorderSelected,
    resetElement,
    resolvedElements,
  } = useCover();
  const addRef = useRef<HTMLDetailsElement>(null);
  const [addPanel, setAddPanel] = useState<"menu" | "decor" | "text">("menu");
  const builtin = isBuiltinId(templateId);
  const skinId = nativeTemplateId(templateId, draft.canvasSkin);
  const natives = skinId ? TEMPLATE_ELEMENTS[skinId] : [];
  const extras = draft.layers.filter((layer) => !isNativeElement(templateId, layer.id, draft.canvasSkin));
  const liveExtras = extras.filter((layer) => !layer.removed);
  const canRestore = !builtin && liveExtras.length === 0 && emptyDraft(templateId).layers.length > 0;
  const closeAdd = () => {
    setAddPanel("menu");
    if (addRef.current) addRef.current.open = false;
  };
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
  const currentW = style.w ?? layer?.w ?? STAGE_BAR_WIDTH_DEFAULT;
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
        <div className="flex items-center justify-between gap-1">
          <p className="text-[13px] text-sub">图层</p>
          {!builtin && liveExtras.length > 0 ? (
            <button
              type="button"
              title="删除全部图层，只留背景"
              className="ml-auto flex h-7 items-center gap-1 rounded-[6px] px-2 text-[12px] text-sub hover:bg-raised hover:text-accent"
              onClick={() => {
                if (!window.confirm("删除全部图层，只保留背景？可以撤回。")) return;
                clearLayers();
              }}
            >
              <Broom size={12} />
              清空
            </button>
          ) : null}
          <details
            ref={addRef}
            className="relative"
            onToggle={(event) => {
              if (!event.currentTarget.open) setAddPanel("menu");
            }}
          >
            <summary className="flex h-7 cursor-pointer list-none items-center gap-1 rounded-[6px] px-2 text-[12px] text-sub hover:bg-raised hover:text-accent">
              <Plus size={12} />
              添加
            </summary>
            <div className={`absolute top-8 right-0 z-20 rounded-[8px] border border-line bg-panel shadow-lg ${addPanel === "menu" ? "w-36 py-1" : "w-[228px]"}`}>
              {addPanel === "decor" ? (
                <DecorationPicker
                  onBack={() => setAddPanel("menu")}
                  onSelect={(presetId) => {
                    addDecoration(presetId);
                    closeAdd();
                  }}
                />
              ) : addPanel === "text" ? (
                <TextStylePicker
                  onBack={() => setAddPanel("menu")}
                  onSelect={(presetId) => {
                    const preset = getTextStyle(presetId);
                    addText(preset ? { ...preset.layer, bind: "custom" } : undefined);
                    closeAdd();
                  }}
                />
              ) : (
                <>
                  <button
                    type="button"
                    className="flex h-8 w-full items-center gap-2 px-3 text-left text-[13px] text-text hover:bg-raised"
                    onClick={() => setAddPanel("text")}
                  >
                    <TextT size={14} />
                    文字
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-full items-center gap-2 px-3 text-left text-[13px] text-text hover:bg-raised"
                    onClick={() => setAddPanel("decor")}
                  >
                    <Square size={14} />
                    装饰
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-full items-center gap-2 px-3 text-left text-[13px] text-text hover:bg-raised"
                    onClick={() => {
                      addLayer("image");
                      if (addRef.current) addRef.current.open = false;
                    }}
                  >
                    <ImageSquare size={14} />
                    立绘
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-full items-center gap-2 px-3 text-left text-[13px] text-text hover:bg-raised"
                    onClick={() => {
                      addLayer("chibi");
                      if (addRef.current) addRef.current.open = false;
                    }}
                  >
                    <Person size={14} />
                    小人
                  </button>
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
                </>
              )}
            </div>
          </details>
        </div>
        <LayerStackList />
        {!skinId && liveExtras.length === 0 ? (
          <div className="mt-2 text-[12px] text-mute">
            <p>还没有图层，点添加开始排版。</p>
            {canRestore ? (
              <button type="button" className="mt-1.5 text-accent hover:underline" onClick={restoreLayers}>
                {templateId === BLANK_TEMPLATE_ID ? "恢复示范框架" : "恢复模板图层"}
              </button>
            ) : null}
          </div>
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
                  const fadeMode = primary ? draft.imageEdgeFadeMode ?? image?.edgeFadeMode : image?.edgeFadeMode;
                  const setPan = (patch: {
                    imageX?: number;
                    imageY?: number;
                    scale?: number;
                    edgeFade?: boolean;
                    edgeFadeAmount?: number;
                    edgeFadeMode?: EdgeFadeMode;
                  }) => {
                    if (primary) {
                      patchDraft({
                        ...(patch.imageX != null ? { imageX: patch.imageX } : {}),
                        ...(patch.imageY != null ? { imageY: patch.imageY } : {}),
                        ...(patch.scale != null ? { imageScale: patch.scale } : {}),
                        ...(patch.edgeFade != null ? { imageEdgeFade: patch.edgeFade } : {}),
                        ...(patch.edgeFadeAmount != null ? { imageEdgeFadeAmount: patch.edgeFadeAmount } : {}),
                        ...(patch.edgeFadeMode != null ? { imageEdgeFadeMode: patch.edgeFadeMode } : {}),
                      });
                      if (patch.scale != null || patch.imageX != null || patch.imageY != null || patch.edgeFade != null || patch.edgeFadeAmount != null || patch.edgeFadeMode != null) {
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
                <EdgeFadeFields
                  enabled={fadeOn}
                  amount={fadeAmt}
                  mode={fadeMode}
                  onEnabledChange={(edgeFade) => setPan({ edgeFade })}
                  onAmountChange={(edgeFadeAmount) => setPan({ edgeFadeAmount })}
                  onModeChange={(edgeFadeMode) => setPan({ edgeFadeMode })}
                />
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
                {nativeMeta.hasWidth ? (
                  <div className="mt-3">
                    <Field label={`宽度 ${Math.round(currentW)}`}>
                      <input
                        type="range"
                        min={STAGE_BAR_WIDTH_MIN}
                        max={STAGE_BAR_WIDTH_MAX}
                        value={currentW}
                        onChange={(e) => patchElement(nativeMeta.id, { w: Number(e.target.value) })}
                        className="w-full"
                      />
                    </Field>
                  </div>
                ) : null}
                <div className="mt-3">
                  <RotationField value={currentRotation} onChange={(rotation) => patchElement(nativeMeta.id, { rotation })} />
                </div>
                {nativeMeta.hasRing ? (
                  <>
                    <div className="mt-3">
                      <Field label={`圆环大小 ${style.radius ?? RING_RADIUS.default}`}>
                        <input
                          type="range"
                          min={RING_RADIUS.min}
                          max={RING_RADIUS.max}
                          step={10}
                          value={style.radius ?? RING_RADIUS.default}
                          onChange={(e) => patchElement(nativeMeta.id, { radius: Number(e.target.value) })}
                          className="w-full"
                        />
                      </Field>
                    </div>
                    <div className="mt-3">
                      <Field label={`圆环粗细 ${style.thickness ?? RING_THICKNESS.default}`}>
                        <input
                          type="range"
                          min={RING_THICKNESS.min}
                          max={RING_THICKNESS.max}
                          step={10}
                          value={style.thickness ?? RING_THICKNESS.default}
                          onChange={(e) => patchElement(nativeMeta.id, { thickness: Number(e.target.value) })}
                          className="w-full"
                        />
                      </Field>
                    </div>
                  </>
                ) : null}
                {nativeMeta.hasOpacity ? (
                  <div className="mt-3">
                    <Field label={`${nativeMeta.id === "wash" ? "透明度" : "暗度"} ${style.opacity ?? nativeMeta.defaultOpacity ?? 100}`}>
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
                      <FontPicker value={currentFont} text={nativeTextValue(templateId, nativeMeta, draft, style)}
                        onChange={(font) => patchElement(nativeMeta.id, { font })} />
                      <div className="mt-3">
                        <Field label="字距（px）">
                          <input type="number" min={-20} max={80} step={0.5} className={fieldClass}
                            value={style.letterSpacing ?? Math.round((resolved.letterSpacing ?? 0) * 10) / 10}
                            onChange={(e) => {
                              const value = e.target.valueAsNumber;
                              if (Number.isFinite(value)) patchElement(nativeMeta.id, { letterSpacing: Math.min(80, Math.max(-20, value)) });
                            }} />
                        </Field>
                      </div>
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
              <div className="col-span-2">
                <Field label={`不透明度 ${layer.opacity ?? 100}%`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={layer.opacity ?? 100}
                    onChange={(e) => patchLayer(layer.id, { opacity: Number(e.target.value) })}
                    className="w-full"
                  />
                </Field>
              </div>
            </div>

            {text ? (
              <>
                <div className="mt-3">
                  <Field label="套用字效预设">
                    <select
                      className={fieldClass}
                      value=""
                      onChange={(e) => {
                        const preset = getTextStyle(e.target.value);
                        if (!preset) return;
                        patchLayer(layer.id, {
                          font: preset.layer.font,
                          effect: preset.layer.effect,
                          color: preset.layer.color ?? text.color,
                          letterSpacing: preset.layer.letterSpacing,
                          opacity: preset.layer.opacity,
                        });
                      }}
                    >
                      <option value="">选一套，同时换字体、字效和颜色</option>
                      {TEXT_STYLES.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.source ? `${preset.name} · ${preset.source}` : preset.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label="字效">
                    <select
                      className={fieldClass}
                      value={text.effect ?? ""}
                      onChange={(e) => patchLayer(layer.id, { effect: (e.target.value || undefined) as LayerEffect | undefined })}
                    >
                      {EFFECT_GROUPS.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.items.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </Field>
                </div>
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
                  <label className="mt-2 flex cursor-pointer items-center gap-1.5 text-[12px] text-sub">
                    <input type="checkbox" checked={Boolean(text.fit)} onChange={(e) => patchLayer(layer.id, { fit: e.target.checked })} />
                    字多时自动缩小，不超出图层框
                  </label>
                </div>
                <div className="mt-3">
                  <FontPicker value={text.font} text={displayBoundText(text, draft)}
                    onChange={(font) => patchLayer(layer.id, { font })} />
                  <div className="mt-3">
                    <Field label="字距（px）">
                      <input type="number" min={-20} max={80} step={0.5} className={fieldClass}
                        value={text.letterSpacing ?? 0}
                        onChange={(e) => {
                          const value = e.target.valueAsNumber;
                          if (Number.isFinite(value)) patchLayer(layer.id, { letterSpacing: Math.min(80, Math.max(-20, value)) });
                        }} />
                    </Field>
                  </div>
                </div>
              </>
            ) : null}

            {image ? (
              <>
                {image.frame === "polaroid" ? (
                  <div className="mb-3 rounded-[7px] border border-line bg-raised/45 p-3">
                    <p className="mb-3 text-[12px] font-medium text-text">拍立得内容</p>
                    <BackgroundPicker
                      compact
                      label="画框背景"
                      value={image.frameBgPreset ?? "ink"}
                      onChange={(frameBgPreset) => patchLayer(image.id, { frameBgPreset })}
                    />
                    <div className="mt-3">
                      <Field label={`背景缩放 ${image.frameBgScale ?? 100}%`}>
                        <input
                          type="range"
                          min={80}
                          max={220}
                          value={image.frameBgScale ?? 100}
                          onChange={(e) => patchLayer(image.id, { frameBgScale: Number(e.target.value) })}
                          className="w-full"
                        />
                      </Field>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Field label={`背景 X ${Math.round(image.frameBgX ?? 0)}`}>
                        <input
                          type="range"
                          min={-400}
                          max={400}
                          value={image.frameBgX ?? 0}
                          onChange={(e) => patchLayer(image.id, { frameBgX: Number(e.target.value) })}
                          className="w-full"
                        />
                      </Field>
                      <Field label={`背景 Y ${Math.round(image.frameBgY ?? 0)}`}>
                        <input
                          type="range"
                          min={-400}
                          max={400}
                          value={image.frameBgY ?? 0}
                          onChange={(e) => patchLayer(image.id, { frameBgY: Number(e.target.value) })}
                          className="w-full"
                        />
                      </Field>
                      <Field label={`立绘 X ${Math.round(image.imageX ?? 0)}`}>
                        <input
                          type="range"
                          min={-600}
                          max={600}
                          value={image.imageX ?? 0}
                          onChange={(e) => patchLayer(image.id, { imageX: Number(e.target.value) })}
                          className="w-full"
                        />
                      </Field>
                      <Field label={`立绘 Y ${Math.round(image.imageY ?? 0)}`}>
                        <input
                          type="range"
                          min={-600}
                          max={600}
                          value={image.imageY ?? 0}
                          onChange={(e) => patchLayer(image.id, { imageY: Number(e.target.value) })}
                          className="w-full"
                        />
                      </Field>
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-mute">立绘在右侧立绘库选择，也可以上传本地图片。</p>
                  </div>
                ) : null}
                {image.source === "upload" || image.source === "chibi" ? (
                  <label className="relative mt-3 inline-flex h-8 cursor-pointer items-center gap-1.5 overflow-hidden rounded-[6px] px-2 text-[13px] text-sub hover:bg-raised hover:text-accent">
                    <UploadSimple size={14} />
                    {image.source === "chibi"
                      ? image.imageDataUrl || image.imageUrl
                        ? "更换小人"
                        : "上传小人"
                      : image.imageDataUrl
                        ? "更换图片"
                        : "选择图片"}
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
                            source: image.source === "chibi" ? "chibi" : "upload",
                            imageDataUrl,
                            imageUrl: "",
                            artId: image.source === "chibi" ? image.artId : "",
                            operatorId: image.source === "chibi" ? image.operatorId : "",
                            label:
                              image.source === "chibi"
                                ? layer.label
                                : layer.label === "上传图"
                                  ? imageFileLabel(file.name)
                                  : layer.label,
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
                <EdgeFadeFields
                  enabled={image.edgeFade ?? draft.imageEdgeFade ?? false}
                  amount={image.edgeFadeAmount ?? draft.imageEdgeFadeAmount ?? IMAGE_EDGE_FADE_DEFAULT}
                  mode={image.edgeFadeMode ?? draft.imageEdgeFadeMode}
                  onEnabledChange={(edgeFade) => {
                    patchLayer(layer.id, { edgeFade });
                    if (layer.id === "operator") patchDraft({ imageEdgeFade: edgeFade });
                  }}
                  onAmountChange={(imageEdgeFadeAmount) => {
                    patchLayer(layer.id, { edgeFadeAmount: imageEdgeFadeAmount });
                    if (layer.id === "operator") patchDraft({ imageEdgeFadeAmount });
                  }}
                  onModeChange={(imageEdgeFadeMode) => {
                    patchLayer(layer.id, { edgeFadeMode: imageEdgeFadeMode });
                    if (layer.id === "operator") patchDraft({ imageEdgeFadeMode });
                  }}
                />
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
