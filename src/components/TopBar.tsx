import { ArrowUUpLeft, BracketsCurly, CaretLeft, DownloadSimple, Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { useCover } from "../store/CoverContext";

type Props = {
  onExport: () => Promise<void>;
  onExportConfig: () => void;
  onBack: () => void;
};

export function TopBar({ onExport, onExportConfig, onBack }: Props) {
  const { templateName, resetDraft, canUndo, undo } = useCover();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  return (
    <header className="z-10 flex h-16 shrink-0 items-center gap-4 border-b border-line bg-panel px-6">
      <button
        type="button"
        onClick={onBack}
        className="flex shrink-0 items-center gap-2 text-text"
      >
        <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-[8px] bg-accent text-[11px] font-bold text-white">
          QM
        </span>
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
            onExportConfig();
            setMsg("已导出配置");
          }}
        >
          <BracketsCurly size={16} weight="bold" />
          导出配置
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
    </header>
  );
}
