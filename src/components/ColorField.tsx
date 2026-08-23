import { Eyedropper } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { TEXT_COLORS, normalizeHex } from "../data/elements";
import { GRAY_STRIP, HONEYCOMB } from "../lib/hexPalette";
import { fieldClass } from "./Field";

const RECENT_KEY = "qmcover-recent-colors";
const RECENT_MAX = 8;
const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return list.map((item) => normalizeHex(item)).filter((item): item is string => Boolean(item));
  } catch {
    return [];
  }
}

function pushRecent(hex: string): string[] {
  const next = [hex, ...readRecent().filter((item) => item !== hex)].slice(0, RECENT_MAX);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

function canEyeDrop(): boolean {
  return typeof window !== "undefined" && "EyeDropper" in window;
}

type Props = {
  elementId: string;
  color?: string;
  displayColor?: string;
  onChange: (color: string | undefined) => void;
};

export function ColorField({ elementId, color, displayColor, onChange }: Props) {
  const shown = color ?? displayColor ?? "";
  const [hex, setHex] = useState(shown);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState(readRecent);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHex(shown);
  }, [elementId, shown]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  const picker = normalizeHex(hex) ?? "#ffffff";
  const active = normalizeHex(color ?? displayColor ?? "");

  const apply = (next: string, remember = true) => {
    const parsed = normalizeHex(next);
    if (!parsed) return;
    setHex(parsed);
    onChange(parsed);
    if (remember) setRecent(pushRecent(parsed));
  };

  return (
    <div className="mt-3" ref={box}>
      <span className="mb-1.5 block text-[13px] text-sub">颜色</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="打开调色盘"
          aria-expanded={open}
          onClick={() => setOpen((cur) => !cur)}
          className={`size-8 shrink-0 rounded-[6px] border ${
            open ? "border-accent ring-1 ring-accent" : "border-line"
          }`}
          style={{ background: picker }}
        />
        <input
          className={fieldClass}
          value={hex}
          spellCheck={false}
          onChange={(e) => {
            const next = e.target.value;
            setHex(next);
            if (!next.trim()) {
              onChange(undefined);
              return;
            }
            const parsed = normalizeHex(next);
            if (parsed) {
              onChange(parsed);
              setRecent(pushRecent(parsed));
            }
          }}
        />
        {canEyeDrop() ? (
          <button
            type="button"
            title="从画面取色"
            className="grid size-8 shrink-0 place-items-center rounded-[6px] text-sub hover:bg-raised hover:text-accent"
            onClick={async () => {
              try {
                const dropper = new window.EyeDropper();
                const result = await dropper.open();
                apply(result.sRGBHex);
              } catch {
                /* 用户取消 */
              }
            }}
          >
            <Eyedropper size={16} />
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="mt-2 rounded-[8px] border border-line bg-raised p-2">
          <div className="relative mx-auto" style={{ width: HONEYCOMB.width, height: HONEYCOMB.height }}>
            {HONEYCOMB.cells.map((cell) => {
              const selected = active === cell.hex;
              return (
                <button
                  key={`${cell.q},${cell.r}`}
                  type="button"
                  title={cell.hex}
                  aria-label={cell.hex}
                  onClick={() => apply(cell.hex)}
                  className={`absolute ${selected ? "z-[1] ring-2 ring-accent ring-offset-1" : ""}`}
                  style={{
                    left: cell.x,
                    top: cell.y,
                    width: HONEYCOMB.cellW + 1,
                    height: HONEYCOMB.cellH + 1,
                    background: cell.hex,
                    clipPath: HEX_CLIP,
                  }}
                />
              );
            })}
          </div>

          <div className="mt-2 flex justify-center gap-1">
            {GRAY_STRIP.map((value) => (
              <button
                key={value}
                type="button"
                title={value}
                onClick={() => apply(value)}
                className={`size-5 ${active === value ? "ring-2 ring-accent ring-offset-1" : ""}`}
                style={{ background: value, clipPath: HEX_CLIP }}
              />
            ))}
          </div>

          <p className="mt-2 mb-1 text-[12px] text-mute">封面常用</p>
          <div className="flex flex-wrap gap-1.5">
            {TEXT_COLORS.map((swatch) => (
              <Swatch
                key={swatch.id}
                label={swatch.label}
                value={swatch.value}
                selected={active === swatch.value}
                onPick={() => apply(swatch.value)}
              />
            ))}
          </div>

          <div
            className="mt-2"
            onPointerUp={() => setRecent(pushRecent(normalizeHex(hex) ?? picker))}
          >
            <HexColorPicker
              className="qm-hex-picker"
              color={picker}
              onChange={(next) => {
                setHex(next);
                onChange(next);
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-2">
        <button
          type="button"
          className="h-6 rounded-[6px] px-2 text-[12px] text-sub hover:bg-raised hover:text-accent"
          onClick={() => {
            setOpen(false);
            onChange(undefined);
          }}
        >
          还原
        </button>
      </div>

      {recent.length ? (
        <div className="mt-2">
          <p className="mb-1 text-[12px] text-mute">最近</p>
          <div className="flex flex-wrap gap-1.5">
            {recent.map((value) => (
              <Swatch
                key={value}
                label={value}
                value={value}
                selected={active === value}
                onPick={() => apply(value)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Swatch({
  label,
  value,
  selected,
  onPick,
}: {
  label: string;
  value: string;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onPick}
      className={`size-6 rounded-full border ${
        selected ? "border-accent ring-1 ring-accent" : "border-line"
      }`}
      style={{ background: value }}
    />
  );
}

declare global {
  interface Window {
    EyeDropper: {
      new (): { open: () => Promise<{ sRGBHex: string }> };
    };
  }
}
