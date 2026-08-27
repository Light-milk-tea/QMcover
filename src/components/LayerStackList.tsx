import { useState } from "react";
import { CaretDown, CaretUp, DotsSixVertical, EyeSlash, Lock } from "@phosphor-icons/react";
import { TEMPLATE_ELEMENTS, isNativeElement } from "../data/elements";
import { isBuiltinId } from "../lib/document";
import { useCover } from "../store/CoverContext";
import type { Layer } from "../types";

function layerLabel(templateId: string, layer: Layer, canvasSkin?: string): string {
  const skin = isBuiltinId(templateId) ? templateId : canvasSkin && isBuiltinId(canvasSkin) ? canvasSkin : undefined;
  if (skin) {
    const meta = TEMPLATE_ELEMENTS[skin].find((item) => item.id === layer.id);
    if (meta) return meta.label;
  }
  return layer.label;
}

export function LayerStackList() {
  const { templateId, draft, selectedId, selectElement, reorderLayerById, setStackOrder } = useCover();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const stack = draft.layers.filter((layer) => !layer.removed).reverse();
  const canMove = stack.length > 1;

  const move = (id: string, dir: 1 | -1) => {
    selectElement(id);
    reorderLayerById(id, dir);
  };

  const dropOn = (targetId: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const from = stack.findIndex((layer) => layer.id === dragId);
    const to = stack.findIndex((layer) => layer.id === targetId);
    if (from < 0 || to < 0) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const next = stack.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setStackOrder(next.reverse());
    selectElement(dragId);
    setDragId(null);
    setOverId(null);
  };

  return (
    <>
      {canMove ? <p className="mt-2 text-[11px] text-mute">上为前 · 拖动手柄或点箭头调层</p> : null}
      <ul className="mt-1.5 flex flex-col gap-0.5">
        {stack.map((el, index) => (
          <StackRow
            key={el.id}
            id={el.id}
            label={layerLabel(templateId, el, draft.canvasSkin)}
            locked={el.locked}
            hidden={el.hidden}
            native={isNativeElement(templateId, el.id, draft.canvasSkin)}
            movable={canMove}
            front={index === 0}
            back={index === stack.length - 1}
            active={selectedId === el.id}
            dragging={dragId === el.id}
            over={overId === el.id && dragId !== el.id}
            onSelect={() => selectElement(selectedId === el.id ? null : el.id)}
            onFront={() => move(el.id, 1)}
            onBack={() => move(el.id, -1)}
            onDragStart={() => setDragId(el.id)}
            onDragOver={() => {
              if (dragId && dragId !== el.id) setOverId(el.id);
            }}
            onDrop={() => dropOn(el.id)}
            onDragEnd={() => {
              setDragId(null);
              setOverId(null);
            }}
          />
        ))}
      </ul>
    </>
  );
}

function StackRow({
  id,
  label,
  locked,
  hidden,
  native,
  movable,
  front,
  back,
  active,
  dragging,
  over,
  onSelect,
  onFront,
  onBack,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: {
  id: string;
  label: string;
  locked?: boolean;
  hidden?: boolean;
  native: boolean;
  movable: boolean;
  front: boolean;
  back: boolean;
  active: boolean;
  dragging: boolean;
  over: boolean;
  onSelect: () => void;
  onFront: () => void;
  onBack: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
}) {
  return (
    <li
      onDragOver={(e) => {
        if (!movable) return;
        e.preventDefault();
        onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={over ? "rounded-[6px] ring-1 ring-accent" : undefined}
    >
      <div
        className={`flex h-8 w-full items-center gap-0.5 rounded-[6px] pl-0.5 pr-0.5 text-[13px] ${
          dragging ? "opacity-40" : active ? "bg-accent/10 text-accent" : "text-text hover:bg-raised"
        }`}
      >
        {movable ? (
          <span
            draggable
            title="拖动调整上下层"
            className="grid size-7 shrink-0 cursor-grab place-items-center text-mute hover:text-accent active:cursor-grabbing"
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", id);
              onDragStart();
            }}
            onDragEnd={onDragEnd}
          >
            <DotsSixVertical size={12} />
          </span>
        ) : null}
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-1.5 px-1 text-left"
        >
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {native ? <span className="shrink-0 text-[10px] text-mute">模板</span> : null}
          {locked ? <Lock size={11} className="shrink-0 opacity-60" /> : null}
          {hidden ? <EyeSlash size={11} className="shrink-0 opacity-60" /> : null}
        </button>
        {movable ? (
          <span className="flex shrink-0">
            <button
              type="button"
              title="上移一层（置前）"
              disabled={front}
              className="grid size-7 place-items-center rounded-[6px] text-sub hover:bg-raised hover:text-accent disabled:opacity-25"
              onClick={onFront}
            >
              <CaretUp size={12} />
            </button>
            <button
              type="button"
              title="下移一层（置后）"
              disabled={back}
              className="grid size-7 place-items-center rounded-[6px] text-sub hover:bg-raised hover:text-accent disabled:opacity-25"
              onClick={onBack}
            >
              <CaretDown size={12} />
            </button>
          </span>
        ) : null}
      </div>
    </li>
  );
}
