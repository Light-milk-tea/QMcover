import { CaretLeft, CaretRight, UploadSimple } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import {
  artUrl,
  avatarUrl,
  OPERATORS,
  preferredArt,
  PROFESSIONS,
  type Operator,
  type OperatorArt,
} from "../data/arts";
import { chibiIdFor, chibiUrl, firstChibiArt, hasChibi } from "../data/chibis";
import { warmupArt, warmupArtNow } from "../lib/preloadImage";
import { IMAGE_FILE_ACCEPT, imageFileLabel, readImageAsDataUrl } from "../lib/readImage";
import { IMAGE_EDGE_FADE_DEFAULT } from "../constants";
import type { EdgeFadeMode } from "../types";
import { EdgeFadeFields } from "./EdgeFadeFields";
import { fieldClass } from "./Field";

const RECENT_KEY = "qmcover-recent-ops";
const PAGE_SIZE = 15;

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function pushRecent(id: string): void {
  const next = [id, ...readRecent().filter((x) => x !== id)].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

type LibraryKind = "art" | "chibi";

type Props = {
  kind?: LibraryKind;
  operatorId: string;
  artId: string;
  uploaded?: boolean;
  edgeFade?: boolean;
  edgeFadeAmount?: number;
  edgeFadeMode?: EdgeFadeMode;
  onEdgeFadeChange?: (on: boolean) => void;
  onEdgeFadeAmountChange?: (amount: number) => void;
  onEdgeFadeModeChange?: (mode: EdgeFadeMode) => void;
  onPick: (operator: Operator, art: OperatorArt) => void;
  onUpload?: (imageDataUrl: string, fileName: string) => void;
};

export function IllustLibrary({
  kind = "art",
  operatorId,
  artId,
  uploaded,
  edgeFade = false,
  edgeFadeAmount = IMAGE_EDGE_FADE_DEFAULT,
  edgeFadeMode,
  onEdgeFadeChange,
  onEdgeFadeAmountChange,
  onEdgeFadeModeChange,
  onPick,
  onUpload,
}: Props) {
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState(0);
  const [profession, setProfession] = useState("");
  const [page, setPage] = useState(1);
  const [recent, setRecent] = useState(readRecent);
  const [browseId, setBrowseId] = useState(operatorId);

  useEffect(() => {
    setBrowseId(operatorId);
  }, [operatorId]);

  const selected = OPERATORS.find((op) => op.id === (browseId || operatorId));
  const selectedArt = selected?.arts.find((art) => art.id === artId);
  const currentLabel = uploaded
    ? kind === "chibi"
      ? "上传小人"
      : "上传立绘"
    : selected
      ? `${selected.name}${selectedArt ? ` · ${selectedArt.label}` : ""}`
      : "未选";
  const previewUrl = (op: Operator, art?: OperatorArt) => {
    if (kind !== "chibi") return art ? artUrl(art.id) : "";
    if (!art || !hasChibi(op.id, art)) return "";
    return chibiUrl(chibiIdFor(op.id, art));
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return OPERATORS.filter((op) => {
      if (rarity === 6 && op.rarity !== 6) return false;
      if (rarity === 5 && op.rarity !== 5) return false;
      if (rarity === 4 && op.rarity > 4) return false;
      if (profession && op.professionCn !== profession) return false;
      if (!q) return true;
      return (
        op.name.toLowerCase().includes(q) ||
        op.nameEn.toLowerCase().includes(q) ||
        op.id.toLowerCase().includes(q)
      );
    });
  }, [profession, query, rarity]);

  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [profession, query, rarity]);

  const pick = (op: Operator, art = kind === "chibi" ? firstChibiArt(op) : preferredArt(op)) => {
    if (!art) {
      setBrowseId(op.id);
      return;
    }
    if (kind === "chibi" && !hasChibi(op.id, art)) {
      setBrowseId(op.id);
      return;
    }
    const url = previewUrl(op, art);
    if (url) warmupArtNow(url);
    pushRecent(op.id);
    setRecent(readRecent());
    setBrowseId(op.id);
    onPick(op, art);
  };

  const recentOps = recent
    .map((id) => OPERATORS.find((op) => op.id === id))
    .filter((op): op is Operator => Boolean(op));

  return (
    <div className="shrink-0 border-b border-line">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <h2 className="text-[15px] font-medium text-text">{kind === "chibi" ? "小人库" : "立绘库"}</h2>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            {kind === "chibi" && onUpload ? (
              <label className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-[6px] px-1.5 text-[12px] text-sub hover:bg-raised hover:text-accent">
                <UploadSimple size={12} />
                上传小人
                <input
                  type="file"
                  accept={IMAGE_FILE_ACCEPT}
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    void readImageAsDataUrl(file)
                      .then((imageDataUrl) => onUpload(imageDataUrl, imageFileLabel(file.name)))
                      .catch(() => {
                        window.alert("这张图片读不出来，换一张 png / jpg / webp 再试。");
                      });
                  }}
                />
              </label>
            ) : null}
            <p className="min-w-0 truncate text-[12px] text-accent" title={currentLabel}>
              {currentLabel}
            </p>
          </div>
        </div>
        {onEdgeFadeChange ? (
          <EdgeFadeFields
            compact
            enabled={edgeFade}
            amount={edgeFadeAmount}
            mode={edgeFadeMode}
            onEnabledChange={onEdgeFadeChange}
            onAmountChange={onEdgeFadeAmountChange}
            onModeChange={onEdgeFadeModeChange ?? (() => undefined)}
          />
        ) : null}
        <input
          className={`${fieldClass} mt-3`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜中文名 / 英文 / ID"
        />
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {[
            { n: 0, label: "全部" },
            { n: 6, label: "6星" },
            { n: 5, label: "5星" },
            { n: 4, label: "4星-" },
          ].map((item) => (
            <Chip key={item.n} active={rarity === item.n} onClick={() => setRarity(item.n)}>
              {item.label}
            </Chip>
          ))}
        </div>
        <div className="relative mt-1.5">
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto pr-6">
            <Chip active={profession === ""} onClick={() => setProfession("")}>
              全职
            </Chip>
            {PROFESSIONS.map((p) => (
              <Chip key={p} active={profession === p} onClick={() => setProfession(p)}>
                {p}
              </Chip>
            ))}
          </div>
          <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-panel to-transparent" />
        </div>
      </div>

      {selected ? (
        <div className="px-4 pb-2">
          <p className="mb-1.5 text-[12px] text-sub">
            {selected.name}
            <span className="ml-2 text-mute">
              {selected.rarity}星 {selected.professionCn}
            </span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selected.arts.map((art) => {
              const available = kind === "art" || hasChibi(selected.id, art);
              return (
                <Chip
                  key={art.id}
                  active={artId === art.id}
                  disabled={!available}
                  title={available ? undefined : "暂无基建小人，可上传"}
                  onClick={() => pick(selected, art)}
                >
                  {art.label}
                </Chip>
              );
            })}
          </div>
        </div>
      ) : null}

      {!query && recentOps.length ? (
        <div className="px-4 pb-2">
          <p className="mb-1.5 text-[12px] text-mute">最近</p>
          <div className="flex gap-2">
            {recentOps.map((op) => (
              <button
                key={op.id}
                type="button"
                title={op.name}
                onClick={() => pick(op)}
                className={`size-9 shrink-0 overflow-hidden rounded-full ${
                  op.id === operatorId ? "ring-2 ring-accent ring-offset-1" : ""
                }`}
              >
                <img
                  src={avatarUrl(op.id)}
                  alt={op.name}
                  className="size-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="px-4 pb-3">
        {pageItems.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-mute">没有匹配的干员</p>
        ) : (
          <div className="grid min-h-[276px] grid-cols-5 grid-rows-3 content-start gap-2">
            {pageItems.map((op) => (
              <OperatorCell
                key={op.id}
                op={op}
                active={op.id === operatorId}
                muted={kind === "chibi" && !firstChibiArt(op)}
                onClick={() => {
                  if (kind === "chibi" && !firstChibiArt(op)) {
                    setBrowseId(op.id);
                    return;
                  }
                  pick(op);
                }}
                onWarm={() => {
                  const art = kind === "chibi" ? firstChibiArt(op) : preferredArt(op);
                  const url = art ? previewUrl(op, art) : "";
                  if (url) warmupArt(url);
                }}
              />
            ))}
          </div>
        )}
        <Pager page={currentPage} pageCount={pageCount} onChange={setPage} />
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  disabled,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`h-7 shrink-0 rounded-[6px] px-2.5 text-[13px] transition-colors ${
        disabled
          ? "cursor-not-allowed bg-raised text-mute opacity-50"
          : active
            ? "bg-accent text-white"
            : "bg-raised text-sub hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}

function Pager({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (n: number) => void;
}) {
  const nums = pagerNums(page, pageCount);

  return (
    <div className="mt-3 flex items-center justify-center gap-1">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="grid size-7 place-items-center rounded-[4px] text-sub hover:text-accent disabled:opacity-30"
        aria-label="上一页"
      >
        <CaretLeft size={14} />
      </button>
      {nums.map((n, i) =>
        n === "…" ? (
          <span key={`e${i}`} className="w-4 text-center text-[12px] text-mute">
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`min-w-7 rounded-[4px] px-1.5 py-1 text-[12px] ${
              n === page ? "bg-accent text-white" : "text-sub hover:text-accent"
            }`}
          >
            {n}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
        className="grid size-7 place-items-center rounded-[4px] text-sub hover:text-accent disabled:opacity-30"
        aria-label="下一页"
      >
        <CaretRight size={14} />
      </button>
    </div>
  );
}

function pagerNums(page: number, pageCount: number): Array<number | "…"> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const set = new Set([1, pageCount, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  for (const n of nums) {
    if (out.length && n - (out[out.length - 1] as number) > 1) out.push("…");
    out.push(n);
  }
  return out;
}

function OperatorCell({
  op,
  active,
  muted,
  onClick,
  onWarm,
}: {
  op: Operator;
  active: boolean;
  muted?: boolean;
  onClick: () => void;
  onWarm: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={onWarm}
      onPointerDown={onWarm}
      onFocus={onWarm}
      title={muted ? `${op.name} 暂无基建小人，可上传` : `${op.name} ${op.nameEn}`}
      className={`group text-center ${muted ? "opacity-45" : ""}`}
    >
      <span
        className={`block overflow-hidden rounded-[6px] bg-raised ${
          active ? "ring-2 ring-accent ring-offset-1" : ""
        }`}
      >
        <img
          src={avatarUrl(op.id)}
          alt=""
          width={56}
          height={56}
          className="aspect-square w-full bg-raised object-cover transition-transform group-hover:scale-[1.04]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </span>
      <span
        className={`mt-1 block truncate text-[11px] ${
          active ? "text-accent" : "text-text group-hover:text-accent"
        }`}
      >
        {op.name}
      </span>
    </button>
  );
}

export function pickArtUrl(art: OperatorArt): string {
  return artUrl(art.id);
}
