import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { hydratePersistedImages, parsePersisted, SAVE_STATUS_EVENT, writePersisted } from "./persist";
import { readImageAsDataUrl } from "./readImage";

const KEY = "qmcover-persist-test";

function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open("qmcover-images", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("images");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const req = run(open.result.transaction("images", mode).objectStore("images"));
      req.onsuccess = () => {
        open.result.close();
        resolve(req.result);
      };
      req.onerror = () => reject(req.error);
    };
  });
}

async function storedImage(token: string): Promise<string | undefined> {
  for (let i = 0; i < 20; i++) {
    const value = await withStore<string | undefined>("readonly", (store) => store.get(token));
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return undefined;
}

async function pngFile(width: number, height: number): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#c33");
  gradient.addColorStop(1, "#33c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
  return new File([blob], "art.png", { type: "image/png" });
}

beforeEach(() => localStorage.removeItem(KEY));
afterEach(() => vi.restoreAllMocks());

test("大图存进 IndexedDB，localStorage 只留短标记", async () => {
  await hydratePersistedImages([KEY]);
  const big = `data:image/png;base64,${"A".repeat(6_000_000)}`;

  expect(writePersisted(KEY, { layers: [{ imageDataUrl: big }] })).toBe(true);

  const raw = localStorage.getItem(KEY)!;
  expect(raw.length).toBeLessThan(200);
  const token = /"(qmimg:[^"]+)"/.exec(raw)?.[1];
  expect(token).toBeTruthy();
  expect(await storedImage(token!)).toBe(big);
  expect(parsePersisted<{ layers: { imageDataUrl: string }[] }>(raw).layers[0].imageDataUrl).toBe(big);
});

test("重新打开页面时从 IndexedDB 读回图片，并清掉没人引用的旧图", async () => {
  const kept = `data:image/webp;base64,${"B".repeat(8000)}`;
  await withStore("readwrite", (store) => store.put(kept, "qmimg:kept"));
  await withStore("readwrite", (store) => store.put("data:image/png;base64,old", "qmimg:orphan"));
  localStorage.setItem(KEY, JSON.stringify({ imageDataUrl: "qmimg:kept" }));

  await hydratePersistedImages([KEY]);

  expect(parsePersisted<{ imageDataUrl: string }>(localStorage.getItem(KEY)!).imageDataUrl).toBe(kept);
  expect(await withStore("readonly", (store) => store.get("qmimg:orphan"))).toBeUndefined();
});

test("找不到的图片保留标记，不会被下一次保存写成空图", () => {
  expect(parsePersisted<{ imageDataUrl: string }>('{"imageDataUrl":"qmimg:missing"}').imageDataUrl).toBe("qmimg:missing");
});

test("localStorage 写不进去时报告失败，恢复后报告成功", () => {
  const statuses: boolean[] = [];
  const onStatus = (event: Event) => statuses.push((event as CustomEvent<boolean>).detail);
  window.addEventListener(SAVE_STATUS_EVENT, onStatus);
  try {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    expect(writePersisted(KEY, { title: "a" })).toBe(false);
    setItem.mockRestore();
    expect(writePersisted(KEY, { title: "b" })).toBe(true);
    expect(statuses).toEqual([false, true]);
  } finally {
    window.removeEventListener(SAVE_STATUS_EVENT, onStatus);
  }
});

test("上传超大图会缩到长边 2560 并转成 WebP", async () => {
  const url = await readImageAsDataUrl(await pngFile(4000, 1000));
  expect(url.startsWith("data:image/webp")).toBe(true);
  const image = new Image();
  image.src = url;
  await image.decode();
  expect(image.naturalWidth).toBe(2560);
  expect(image.naturalHeight).toBe(640);
});

test("尺寸和体积都不大的图原样保留", async () => {
  const url = await readImageAsDataUrl(await pngFile(400, 300));
  expect(url.startsWith("data:image/png")).toBe(true);
});
