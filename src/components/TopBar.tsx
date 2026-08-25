import { ArrowUUpLeft, BracketsCurly, CaretLeft, DownloadSimple, FloppyDisk, Plus } from "@phosphor-icons/react";
import { useState, type RefObject } from "react";
import { downloadCoverDocument, saveDraftAsTemplate } from "../lib/exportConfig";
import { useCover } from "../store/CoverContext";
import { BrandMark } from "./BrandMark";

type Props = {
  onExport: () => Promise<void>;
  onBack: () => void;
  stageRef: RefObject<HTMLDivElement | null>;
  onSavedTemplate: (id: string) => void;
};

export function TopBar({ onExport, onBack, stageRef, onSavedTemplate }: Props) {
  const { templateId, templateName, draft, resetDraft, canUndo, undo } = useCover();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState(templateName);

  return (
    <header className="z-10 flex h-16 shrink-0 items-center gap-4 border-b border-line bg-panel px-6">
      <button type="button" onClick={onBack} className="flex shrink-0 items-center gap-2 text-text">
        <BrandMark />
        <span className="text-[16px] font-medium">封面工坊</span>
      </button>

      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-9 items-center gap-1 rounded-[6px] px-2 text-[13px] text-sub hover:bg-raised hover:text-accent"
      >
        <CaretLeft size={14} />
        模板
      </button>
      <span className="text-[14px] text-text">{templateName}</span>

      <div className="ml-auto flex items-center gap-2">
        {msg ? <span className="text-[13px] text-mute">{msg}</span> : null}
        <button
          type="button"
          disabled={!canUndo}
          title="撤回 ⌘Z"
          className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] px-3 text-[14px] text-sub hover:bg-raised hover:text-accent disabled:pointer-events-none disabled:opacity-40"
          onClick={() => {
            undo();
            setMsg("已撤回");
          }}
        >
          <ArrowUUpLeft size={16} weight="bold" />
          撤回
        </button>
        <button
          type="button"
          className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] px-3 text-[14px] text-sub hover:bg-raised hover:text-accent"
          onClick={() => {
            if (!window.confirm("清空当前内容，新建一张封面？")) return;
            resetDraft();
            setMsg("已新建");
          }}
        >
          <Plus size={16} weight="bold" />
          新建
        </button>
        <button
          type="button"
          className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] px-3 text-[14px] text-sub hover:bg-raised hover:text-accent"
          onClick={() => {
            setSaveName(templateName === "空白画布" ? "新栏目" : `${templateName} 改`);
            setSaving(true);
          }}
        >
          <FloppyDisk size={16} weight="bold" />
          另存为模板
        </button>
        <button
          type="button"
          className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] px-3 text-[14px] text-sub hover:bg-raised hover:text-accent"
          onClick={() => {
            downloadCoverDocument(draft, templateName, templateId);
            setMsg("已导出 JSON");
          }}
        >
          <BracketsCurly size={16} weight="bold" />
          导出 JSON
        </button>
        <button
          type="button"
          disabled={busy}
          className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] bg-accent px-4 text-[14px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          onClick={async () => {
            if (!window.confirm("确定下载这张封面？")) return;
            setBusy(true);
            setMsg("");
            try {
              await onExport();
              setMsg("已下载");
            } catch {
              setMsg("导出失败");
            } finally {
              setBusy(false);
            }
          }}
        >
          <DownloadSimple size={16} weight="bold" />
          {busy ? "导出中" : "导出封面"}
        </button>
      </div>

      {saving ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" onClick={() => setSaving(false)}>
          <form
            className="w-[360px] rounded-[10px] bg-panel p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                const item = await saveDraftAsTemplate(draft, templateId, saveName, "", stageRef.current);
                setSaving(false);
                setMsg("已另存");
                onSavedTemplate(item.id);
              } catch {
                setMsg("另存失败");
              } finally {
                setBusy(false);
              }
            }}
          >
            <p className="text-[15px] font-medium text-text">另存为模板</p>
            <p className="mt-1 text-[13px] text-mute">会出现在首页「我的模板」，下次只换文案和立绘。</p>
            <input
              className="mt-4 h-10 w-full rounded-[8px] border border-line bg-raised px-3 text-[14px] text-text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="h-9 rounded-[8px] px-3 text-[13px] text-sub hover:bg-raised" onClick={() => setSaving(false)}>
                取消
              </button>
              <button type="submit" disabled={busy} className="h-9 rounded-[8px] bg-accent px-4 text-[13px] font-medium text-white disabled:opacity-60">
                {busy ? "保存中" : "保存"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </header>
  );
}
