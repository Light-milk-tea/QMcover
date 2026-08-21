import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { loadDraft, saveDraft, emptyDraft } from "../lib/storage";
import type { Draft, ElementOverride, TemplateId, TitleKind } from "../types";
import { getTemplate } from "../data/templates";

const HISTORY_LIMIT = 40;
const COALESCE_MS = 520;

function cloneDraft(draft: Draft): Draft {
  return {
    ...draft,
    elementStyles: Object.fromEntries(
      Object.entries(draft.elementStyles).map(([id, style]) => [id, { ...style }]),
    ),
  };
}

type CoverContextValue = {
  templateId: TemplateId;
  templateName: string;
  showEpisode: boolean;
  titleKind: TitleKind;
  titleLabel: string;
  titlePlaceholder: string;
  subtitleLabel: string;
  episodeLabel: string;
  signatureLabel: string;
  defaultImageScale: number;
  showBackground: boolean;
  draft: Draft;
  selectedId: string | null;
  canUndo: boolean;
  undo: () => void;
  patchDraft: (patch: Partial<Draft>) => void;
  resetDraft: () => void;
  selectElement: (id: string | null) => void;
  patchElement: (id: string, patch: Partial<ElementOverride>) => void;
  nudgeElement: (id: string, dx: number, dy: number) => void;
  resetElement: (id: string) => void;
};

const CoverContext = createContext<CoverContextValue | null>(null);

export function CoverProvider({
  templateId,
  children,
}: {
  templateId: TemplateId;
  children: ReactNode;
}) {
  const [draft, setDraft] = useState(() => loadDraft(templateId));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const pastRef = useRef<Draft[]>([]);
  const coalesceRef = useRef<{ key: string; at: number } | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const meta = getTemplate(templateId);

  const remember = useCallback((prev: Draft, coalesceKey?: string) => {
    const now = Date.now();
    const stamp = coalesceRef.current;
    const coalesce = coalesceKey != null && stamp != null && stamp.key === coalesceKey && now - stamp.at < COALESCE_MS;
    coalesceRef.current = coalesceKey ? { key: coalesceKey, at: now } : null;
    if (coalesce) return;
    pastRef.current = [...pastRef.current.slice(-(HISTORY_LIMIT - 1)), cloneDraft(prev)];
  }, []);

  const apply = useCallback(
    (updater: (prev: Draft) => Draft, coalesceKey?: string) => {
      const prev = draftRef.current;
      const next = updater(prev);
      remember(prev, coalesceKey);
      draftRef.current = next;
      setDraft(next);
      saveDraft(templateId, next);
      setCanUndo(pastRef.current.length > 0);
    },
    [remember, templateId],
  );

  const undo = useCallback(() => {
    const past = pastRef.current;
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    pastRef.current = past.slice(0, -1);
    coalesceRef.current = null;
    draftRef.current = prev;
    setCanUndo(pastRef.current.length > 0);
    setDraft(prev);
    saveDraft(templateId, prev);
  }, [templateId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo]);

  const patchDraft = useCallback(
    (patch: Partial<Draft>) => {
      const key = Object.keys(patch).sort().join(",");
      apply((prev) => ({ ...prev, ...patch }), key);
    },
    [apply],
  );

  const resetDraft = useCallback(() => {
    apply(() => emptyDraft(templateId));
    setSelectedId(null);
  }, [apply, templateId]);

  const patchElement = useCallback(
    (id: string, patch: Partial<ElementOverride>) => {
      const key = `el:${id}:${Object.keys(patch).sort().join(",")}`;
      apply((prev) => {
        const next: Draft = {
          ...prev,
          elementStyles: {
            ...prev.elementStyles,
            [id]: { ...prev.elementStyles[id], ...patch },
          },
        };
        return next;
      }, key);
    },
    [apply],
  );

  const nudgeElement = useCallback(
    (id: string, dx: number, dy: number) => {
      apply((prev) => {
        const cur = prev.elementStyles[id] ?? {};
        const next: Draft = {
          ...prev,
          elementStyles: {
            ...prev.elementStyles,
            [id]: { ...cur, x: (cur.x ?? 0) + dx, y: (cur.y ?? 0) + dy },
          },
        };
        return next;
      }, `nudge:${id}`);
    },
    [apply],
  );

  const resetElement = useCallback(
    (id: string) => {
      apply((prev) => {
        const { [id]: _removed, ...rest } = prev.elementStyles;
        return { ...prev, elementStyles: rest };
      });
    },
    [apply],
  );

  const value = useMemo<CoverContextValue>(
    () => ({
      templateId,
      templateName: meta?.name ?? "模板",
      showEpisode: meta?.showEpisode ?? false,
      titleKind: meta?.titleKind ?? "operator",
      titleLabel:
        meta?.titleLabel ??
        (meta?.titleKind === "stage" ? "地图" : meta?.titleKind === "operation" ? "行动" : meta?.titleKind === "theme" ? "主题" : "标题"),
      titlePlaceholder: meta?.titlePlaceholder ?? "",
      subtitleLabel: meta?.subtitleLabel ?? "副标题",
      episodeLabel: meta?.episodeLabel ?? "期数",
      signatureLabel: meta?.signatureLabel ?? "署名",
      defaultImageScale: meta?.defaultImageScale ?? 100,
      showBackground: meta?.showBackground ?? false,
      draft,
      selectedId,
      canUndo,
      undo,
      patchDraft,
      resetDraft,
      selectElement: setSelectedId,
      patchElement,
      nudgeElement,
      resetElement,
    }),
    [
      canUndo,
      draft,
      meta?.episodeLabel,
      meta?.name,
      meta?.showEpisode,
      meta?.signatureLabel,
      meta?.titleKind,
      meta?.titleLabel,
      meta?.titlePlaceholder,
      meta?.subtitleLabel,
      meta?.defaultImageScale,
      meta?.showBackground,
      nudgeElement,
      patchDraft,
      patchElement,
      resetDraft,
      resetElement,
      selectedId,
      templateId,
      undo,
    ],
  );

  return <CoverContext.Provider value={value}>{children}</CoverContext.Provider>;
}

export function useCover() {
  const ctx = useContext(CoverContext);
  if (!ctx) throw new Error("useCover must be used inside CoverProvider");
  return ctx;
}

export function useCoverOptional() {
  return useContext(CoverContext);
}
