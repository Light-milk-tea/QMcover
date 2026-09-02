import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { loadDraft, saveDraft, emptyDraft } from "../lib/storage";
import {
  createBoxLayer,
  createDecorationLayer,
  createImageLayer,
  createTextLayer,
  duplicateLayer,
  patchLayerIn,
  reorderLayer,
  replaceSubsetOrder,
} from "../lib/document";
import { isNativeElement } from "../data/elements";
import { getTemplate } from "../data/templates";
import { cloneCoverEffects } from "../lib/effects";
import type {
  CoverEffects,
  Draft,
  ElementOverride,
  ImageLayer,
  Layer,
  ResolvedElement,
  TemplateId,
  TitleKind,
} from "../types";

const HISTORY_LIMIT = 40;
const COALESCE_MS = 520;

function cloneDraft(draft: Draft): Draft {
  return {
    ...draft,
    effects: cloneCoverEffects(draft.effects),
    layers: draft.layers.map((layer) => ({ ...layer })),
    elementStyles: Object.fromEntries(
      Object.entries(draft.elementStyles ?? {}).map(([id, style]) => [id, { ...style }]),
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
  showMark: boolean;
  markLabel: string;
  defaultImageScale: number;
  showBackground: boolean;
  showTextBackground: boolean;
  showBgDim: boolean;
  showShaftLight: boolean;
  showOrnament: boolean;
  draft: Draft;
  selectedId: string | null;
  selectedLayer: Layer | undefined;
  canUndo: boolean;
  undo: () => void;
  patchDraft: (patch: Partial<Draft>) => void;
  patchEffect: <K extends keyof CoverEffects>(id: K, patch: Partial<CoverEffects[K]>) => void;
  setEffects: (effects: CoverEffects) => void;
  resetDraft: () => void;
  selectElement: (id: string | null) => void;
  patchElement: (id: string, patch: Partial<ElementOverride>) => void;
  patchLayer: (id: string, patch: Partial<Layer>) => void;
  addLayer: (kind: "text" | "box" | "image" | "upload", init?: Partial<ImageLayer>) => void;
  addDecoration: (presetId: string) => void;
  removeLayer: (id: string) => void;
  duplicateSelected: () => void;
  reorderSelected: (dir: 1 | -1) => void;
  reorderLayerById: (id: string, dir: 1 | -1) => void;
  setStackOrder: (ordered: Layer[]) => void;
  nudgeElement: (id: string, dx: number, dy: number) => void;
  moveElement: (id: string, dx: number, dy: number) => void;
  resetElement: (id: string) => void;
  resolvedElements: Record<string, ResolvedElement>;
  reportElementResolved: (id: string, resolved: ResolvedElement) => void;
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
  const [resolvedElements, setResolvedElements] = useState<Record<string, ResolvedElement>>({});
  const [canUndo, setCanUndo] = useState(false);
  const pastRef = useRef<Draft[]>([]);
  const coalesceRef = useRef<{ key: string; at: number } | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const meta = getTemplate(templateId);

  useEffect(() => {
    setResolvedElements({});
    setSelectedId(null);
  }, [templateId]);

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

  const patchDraft = useCallback(
    (patch: Partial<Draft>) => {
      const key = Object.keys(patch).sort().join(",");
      apply((prev) => ({ ...prev, ...patch }), key);
    },
    [apply],
  );

  const syncLegacyEffects = useCallback((prev: Draft, effects: CoverEffects): Draft => {
    return {
      ...prev,
      effects,
      bgDim: effects.vignette.enabled,
      bgDimAmount: effects.vignette.amount,
      shaftLight: effects.light.enabled,
      shaftLightAmount: effects.light.amount,
      shaftLightKind: effects.light.kind,
      shaftLightX: effects.light.x,
      shaftLightY: effects.light.y,
      shaftLightRotate: effects.light.rotate,
    };
  }, []);

  const patchEffect = useCallback(
    <K extends keyof CoverEffects>(id: K, patch: Partial<CoverEffects[K]>) => {
      apply((prev) => {
        const current = prev.effects[id] ?? cloneCoverEffects(prev.effects)[id];
        const effects = {
          ...cloneCoverEffects(prev.effects),
          [id]: { ...current, ...patch },
        } as CoverEffects;
        return syncLegacyEffects(prev, effects);
      }, `effect:${id}:${Object.keys(patch).sort().join(",")}`);
    },
    [apply, syncLegacyEffects],
  );

  const setEffects = useCallback(
    (effects: CoverEffects) => {
      apply((prev) => syncLegacyEffects(prev, cloneCoverEffects(effects)), "effects:set");
    },
    [apply, syncLegacyEffects],
  );

  const resetDraft = useCallback(() => {
    apply(() => emptyDraft(templateId));
    setSelectedId(null);
    setResolvedElements({});
  }, [apply, templateId]);

  const patchLayer = useCallback(
    (id: string, patch: Partial<Layer>) => {
      const key = `layer:${id}:${Object.keys(patch).sort().join(",")}`;
      apply((prev) => ({ ...prev, layers: patchLayerIn(prev.layers, id, patch) }), key);
    },
    [apply],
  );

  const patchElement = useCallback(
    (id: string, patch: Partial<ElementOverride>) => {
      const key = `el:${id}:${Object.keys(patch).sort().join(",")}`;
      apply((prev) => {
        if (isNativeElement(templateId, id, prev.canvasSkin)) {
          return {
            ...prev,
            elementStyles: {
              ...prev.elementStyles,
              [id]: { ...prev.elementStyles[id], ...patch },
            },
          };
        }
        const mapped: Partial<Layer> = {};
        if (patch.fontSize != null) (mapped as { fontSize?: number }).fontSize = patch.fontSize;
        if (patch.font) (mapped as { font?: Layer["kind"] }).font = patch.font as never;
        if (patch.color) mapped.color = patch.color;
        if (patch.opacity != null) mapped.opacity = patch.opacity;
        if (patch.x != null) mapped.x = patch.x;
        if (patch.y != null) mapped.y = patch.y;
        if (patch.rotation != null) mapped.rotation = patch.rotation;
        return { ...prev, layers: patchLayerIn(prev.layers, id, mapped) };
      }, key);
    },
    [apply, templateId],
  );

  const nudgeElement = useCallback(
    (id: string, dx: number, dy: number) => {
      apply((prev) => {
        if (isNativeElement(templateId, id, prev.canvasSkin)) {
          const cur = prev.elementStyles[id] ?? {};
          return {
            ...prev,
            elementStyles: {
              ...prev.elementStyles,
              [id]: { ...cur, x: (cur.x ?? 0) + dx, y: (cur.y ?? 0) + dy },
            },
          };
        }
        const cur = prev.layers.find((layer) => layer.id === id);
        if (!cur) return prev;
        return { ...prev, layers: patchLayerIn(prev.layers, id, { x: cur.x + dx, y: cur.y + dy }) };
      }, `nudge:${id}`);
    },
    [apply, templateId],
  );

  const moveElement = useCallback(
    (id: string, dx: number, dy: number) => {
      apply((prev) => {
        const layer = prev.layers.find((item) => item.id === id);
        if (isNativeElement(templateId, id, prev.canvasSkin)) {
          if (layer?.kind === "image") {
            if (id === "operator") {
              return {
                ...prev,
                imageX: prev.imageX + dx,
                imageY: prev.imageY + dy,
              };
            }
            return {
              ...prev,
              layers: patchLayerIn(prev.layers, id, {
                imageX: (layer.imageX ?? 0) + dx,
                imageY: (layer.imageY ?? 0) + dy,
              }),
            };
          }
          const cur = prev.elementStyles[id] ?? {};
          return {
            ...prev,
            elementStyles: {
              ...prev.elementStyles,
              [id]: { ...cur, x: (cur.x ?? 0) + dx, y: (cur.y ?? 0) + dy },
            },
          };
        }
        if (!layer) return prev;
        return {
          ...prev,
          layers: patchLayerIn(prev.layers, id, {
            x: layer.x + dx,
            y: layer.y + dy,
          }),
        };
      }, `move:${id}`);
    },
    [apply, templateId],
  );

  const addLayer = useCallback(
    (kind: "text" | "box" | "image" | "upload", init?: Partial<ImageLayer>) => {
      let createdId = "";
      apply((prev) => {
        const at = { x: 240, y: 240 };
        const layer =
          kind === "box"
            ? createBoxLayer(at)
            : kind === "text"
              ? createTextLayer(at)
              : createImageLayer(at, kind === "upload" ? "upload" : "operator", init);
        createdId = layer.id;
        return { ...prev, layers: [...prev.layers, layer] };
      });
      if (createdId) setSelectedId(createdId);
    },
    [apply],
  );

  const addDecoration = useCallback(
    (presetId: string) => {
      let createdId = "";
      apply((prev) => {
        const layer = createDecorationLayer(presetId, {
          operatorId: prev.operatorId,
          artId: prev.artId,
          imageUrl: prev.imageUrl,
          imageDataUrl: prev.imageDataUrl,
          frameBgPreset: prev.bgPreset,
        });
        if (!layer) return prev;
        createdId = layer.id;
        return { ...prev, layers: [...prev.layers, layer] };
      });
      if (createdId) setSelectedId(createdId);
    },
    [apply],
  );

  const removeLayer = useCallback(
    (id: string) => {
      apply((prev) => {
        if (isNativeElement(templateId, id, prev.canvasSkin)) {
          return { ...prev, layers: patchLayerIn(prev.layers, id, { hidden: true, removed: true }) };
        }
        return { ...prev, layers: prev.layers.filter((layer) => layer.id !== id) };
      });
      setSelectedId((cur) => (cur === id ? null : cur));
    },
    [apply, templateId],
  );

  const duplicateSelected = useCallback(() => {
    const id = selectedId;
    if (!id || isNativeElement(templateId, id, draftRef.current.canvasSkin)) return;
    apply((prev) => {
      const result = duplicateLayer(prev.layers, id);
      if (!result) return prev;
      setSelectedId(result.id);
      return { ...prev, layers: result.layers };
    });
  }, [apply, selectedId, templateId]);

  const reorderLayerById = useCallback(
    (id: string, dir: 1 | -1) => {
      if (!id) return;
      apply((prev) => {
        const subset = prev.layers.filter((layer) => !layer.removed);
        const next = reorderLayer(subset, id, dir);
        if (next === subset) return prev;
        return { ...prev, layers: replaceSubsetOrder(prev.layers, next) };
      }, `stack:${id}`);
    },
    [apply],
  );

  const setStackOrder = useCallback(
    (ordered: Layer[]) => {
      apply((prev) => ({ ...prev, layers: replaceSubsetOrder(prev.layers, ordered) }), "stack-order");
    },
    [apply],
  );

  const reorderSelected = useCallback(
    (dir: 1 | -1) => {
      if (selectedId) reorderLayerById(selectedId, dir);
    },
    [reorderLayerById, selectedId],
  );

  const resetElement = useCallback(
    (id: string) => {
      apply((prev) => {
        const { [id]: _removed, ...restStyles } = prev.elementStyles;
        if (isNativeElement(templateId, id, prev.canvasSkin)) {
          const fresh = emptyDraft(templateId).layers.find((layer) => layer.id === id);
          return {
            ...prev,
            elementStyles: restStyles,
            layers: fresh
              ? prev.layers.map((layer) => (layer.id === id ? { ...fresh, hidden: false } : layer))
              : prev.layers,
          };
        }
        const fresh = emptyDraft(templateId).layers.find((layer) => layer.id === id);
        if (!fresh) return prev;
        return { ...prev, layers: prev.layers.map((layer) => (layer.id === id ? { ...fresh } : layer)) };
      });
    },
    [apply, templateId],
  );

  const reportElementResolved = useCallback((id: string, resolved: ResolvedElement) => {
    setResolvedElements((prev) => {
      const cur = prev[id];
      if (
        cur?.fontSize === resolved.fontSize &&
        cur?.font === resolved.font &&
        cur?.color === resolved.color &&
        cur?.x === resolved.x &&
        cur?.y === resolved.y
      ) {
        return prev;
      }
      return { ...prev, [id]: resolved };
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if (typing) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
        return;
      }
      if ((e.key === "]" || e.key === "[") && selectedId) {
        e.preventDefault();
        reorderLayerById(selectedId, e.key === "]" ? 1 : -1);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const layer = draftRef.current.layers.find((item) => item.id === selectedId);
        if (layer && !layer.locked) {
          e.preventDefault();
          removeLayer(selectedId);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [duplicateSelected, removeLayer, reorderLayerById, selectedId, templateId, undo]);

  const selectedLayer = draft.layers.find((layer) => layer.id === selectedId);

  const value = useMemo<CoverContextValue>(
    () => ({
      templateId,
      templateName: meta?.name ?? "模板",
      showEpisode: meta?.showEpisode ?? true,
      titleKind: meta?.titleKind ?? "theme",
      titleLabel:
        meta?.titleLabel ??
        (meta?.titleKind === "stage" ? "地图" : meta?.titleKind === "operation" ? "行动" : meta?.titleKind === "theme" ? "主题" : "标题"),
      titlePlaceholder: meta?.titlePlaceholder ?? "",
      subtitleLabel: meta?.subtitleLabel ?? "副标题",
      episodeLabel: meta?.episodeLabel ?? "期数",
      signatureLabel: meta?.signatureLabel ?? "署名",
      showMark: Boolean(meta?.showMark),
      markLabel: meta?.markLabel ?? "角标",
      defaultImageScale: meta?.defaultImageScale ?? 100,
      showBackground: true,
      showTextBackground: meta?.showTextBackground ?? draft.canvasSkin === "rogue",
      showBgDim: true,
      showShaftLight: meta?.showShaftLight ?? draft.canvasSkin === "specialist",
      showOrnament: meta?.showOrnament ?? draft.canvasSkin === "lowspec",
      draft,
      selectedId,
      selectedLayer,
      canUndo,
      undo,
      patchDraft,
      patchEffect,
      setEffects,
      resetDraft,
      selectElement: setSelectedId,
      patchElement,
      patchLayer,
      addLayer,
      addDecoration,
      removeLayer,
      duplicateSelected,
      reorderSelected,
      reorderLayerById,
      setStackOrder,
      nudgeElement,
      moveElement,
      resetElement,
      resolvedElements,
      reportElementResolved,
    }),
    [
      addLayer,
      addDecoration,
      canUndo,
      draft,
      duplicateSelected,
      meta,
      moveElement,
      nudgeElement,
      patchDraft,
      patchEffect,
      patchElement,
      patchLayer,
      removeLayer,
      reorderLayerById,
      reorderSelected,
      reportElementResolved,
      resetDraft,
      resetElement,
      resolvedElements,
      selectedId,
      selectedLayer,
      setStackOrder,
      setEffects,
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
