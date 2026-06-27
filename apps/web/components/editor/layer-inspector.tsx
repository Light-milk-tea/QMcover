"use client";

import type { RefObject } from "react";
import type Konva from "konva";
import type { CanvasLayer, TextLayer } from "@qmcover/shared";
import { saveProject } from "../../lib/api";
import { useEditorStore } from "../../lib/editor-store";

function isTextLayer(layer?: CanvasLayer): layer is TextLayer {
  return layer?.type === "text";
}

export function LayerInspector({
  projectId,
  stageRef
}: {
  projectId?: string;
  stageRef: RefObject<Konva.Stage>;
}) {
  const document = useEditorStore((state) => state.document);
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const isDirty = useEditorStore((state) => state.isDirty);
  const markSaved = useEditorStore((state) => state.markSaved);
  const selectedLayer = document?.layers.find((layer) => layer.id === selectedLayerId);

  async function handleSave() {
    if (!document || !projectId) {
      return;
    }

    const thumbnailUrl = stageRef.current?.toDataURL({ pixelRatio: 0.25 });
    await saveProject(projectId, document, thumbnailUrl);
    markSaved();
  }

  function handleExport(format: "png" | "jpeg") {
    const url = stageRef.current?.toDataURL({
      pixelRatio: 2,
      mimeType: format === "png" ? "image/png" : "image/jpeg",
      quality: 0.92
    });
    if (!url) {
      return;
    }

    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${document?.name ?? "cover"}.${format === "png" ? "png" : "jpg"}`;
    link.click();
  }

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">编辑器</p>
          <h2 className="text-lg font-semibold">{document?.name ?? "未选择项目"}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs ${isDirty ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
          {isDirty ? "未保存" : "已保存"}
        </span>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2">
        <button className="rounded-xl border px-3 py-2 text-sm" onClick={undo}>
          撤销
        </button>
        <button className="rounded-xl border px-3 py-2 text-sm" onClick={redo}>
          重做
        </button>
      </div>

      {!selectedLayer && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">选择画布上的图层后，可编辑文字、样式和图层状态。</p>}

      {selectedLayer && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600">图层名称</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={selectedLayer.name}
              onChange={(event) => updateLayer(selectedLayer.id, { name: event.target.value })}
            />
          </div>

          {isTextLayer(selectedLayer) && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-600">文字内容</label>
                <textarea
                  className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2"
                  value={selectedLayer.content}
                  onChange={(event) => updateLayer(selectedLayer.id, { content: event.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-medium text-slate-600">
                  字号
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    type="number"
                    value={selectedLayer.style.fontSize}
                    onChange={(event) =>
                      updateLayer(selectedLayer.id, {
                        style: { ...selectedLayer.style, fontSize: Number(event.target.value) }
                      })
                    }
                  />
                </label>
                <label className="text-sm font-medium text-slate-600">
                  颜色
                  <input
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200"
                    type="color"
                    value={selectedLayer.style.fill}
                    onChange={(event) =>
                      updateLayer(selectedLayer.id, {
                        style: { ...selectedLayer.style, fill: event.target.value }
                      })
                    }
                  />
                </label>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              className="rounded-xl border px-3 py-2 text-sm"
              onClick={() =>
                updateLayer(selectedLayer.id, {
                  transform: { ...selectedLayer.transform, locked: !selectedLayer.transform.locked }
                })
              }
            >
              {selectedLayer.transform.locked ? "解锁" : "锁定"}
            </button>
            <button
              className="rounded-xl border px-3 py-2 text-sm"
              onClick={() =>
                updateLayer(selectedLayer.id, {
                  transform: { ...selectedLayer.transform, visible: !selectedLayer.transform.visible }
                })
              }
            >
              {selectedLayer.transform.visible ? "隐藏" : "显示"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-2">
        <button className="rounded-xl bg-brand-700 px-4 py-2 font-medium text-white disabled:opacity-50" disabled={!projectId || !document} onClick={handleSave}>
          保存项目
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-xl border px-4 py-2 text-sm" onClick={() => handleExport("png")}>
            导出 PNG
          </button>
          <button className="rounded-xl border px-4 py-2 text-sm" onClick={() => handleExport("jpeg")}>
            导出 JPG
          </button>
        </div>
      </div>
    </aside>
  );
}
