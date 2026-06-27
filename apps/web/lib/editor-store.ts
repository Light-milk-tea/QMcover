"use client";

import type { CanvasDocument, CanvasLayer } from "@qmcover/shared";
import { create } from "zustand";

interface EditorState {
  document: CanvasDocument | null;
  selectedLayerId?: string;
  past: CanvasDocument[];
  future: CanvasDocument[];
  isDirty: boolean;
  setDocument: (document: CanvasDocument) => void;
  selectLayer: (layerId?: string) => void;
  updateLayer: (layerId: string, patch: Partial<CanvasLayer>) => void;
  undo: () => void;
  redo: () => void;
  markSaved: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  document: null,
  selectedLayerId: undefined,
  past: [],
  future: [],
  isDirty: false,
  setDocument: (document) =>
    set({
      document,
      selectedLayerId: undefined,
      past: [],
      future: [],
      isDirty: false
    }),
  selectLayer: (layerId) => set({ selectedLayerId: layerId }),
  updateLayer: (layerId, patch) => {
    const current = get().document;
    if (!current) {
      return;
    }

    const next: CanvasDocument = {
      ...current,
      layers: current.layers.map((layer) => (layer.id === layerId ? ({ ...layer, ...patch } as CanvasLayer) : layer)),
      updatedAt: new Date().toISOString()
    };

    set((state) => ({
      document: next,
      past: [...state.past, current],
      future: [],
      isDirty: true
    }));
  },
  undo: () => {
    const state = get();
    const previous = state.past.at(-1);
    if (!previous || !state.document) {
      return;
    }

    set({
      document: previous,
      past: state.past.slice(0, -1),
      future: [state.document, ...state.future],
      isDirty: true
    });
  },
  redo: () => {
    const state = get();
    const next = state.future[0];
    if (!next || !state.document) {
      return;
    }

    set({
      document: next,
      past: [...state.past, state.document],
      future: state.future.slice(1),
      isDirty: true
    });
  },
  markSaved: () => set({ isDirty: false })
}));
