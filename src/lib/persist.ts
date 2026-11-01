const DB_NAME = "qmcover-images";
const STORE = "images";
const TOKEN_PREFIX = "qmimg:";
/** 小图（内置 SVG、缩略图）留在 localStorage 里，大图才挪进 IndexedDB。 */
const MIN_EXTERNAL_LENGTH = 4096;
const HYDRATE_TIMEOUT_MS = 3000;

export const SAVE_STATUS_EVENT = "qmcover-save-status";

const dataByToken = new Map<string, string>();
const tokenByData = new Map<string, string>();
let db: IDBDatabase | null = null;
let lastSaveOk = true;

function remember(token: string, data: string) {
  dataByToken.set(token, data);
  tokenByData.set(data, token);
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadImages(handle: IDBDatabase, referencedIn: string[]): Promise<void> {
  const referenced = referencedIn.map((key) => localStorage.getItem(key) ?? "").join("\n");
  const store = handle.transaction(STORE, "readwrite").objectStore(STORE);
  await new Promise<void>((resolve, reject) => {
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) return resolve();
      const token = String(cursor.key);
      if (referenced.includes(`"${token}"`)) remember(token, String(cursor.value));
      else cursor.delete();
      cursor.continue();
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Must finish before any draft is read: drafts only hold tokens for uploaded images.
 * Images no longer referenced by the given localStorage keys are deleted.
 */
export async function hydratePersistedImages(referencedIn: string[]): Promise<void> {
  try {
    const handle = await Promise.race([
      openDb(),
      new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("idb-timeout")), HYDRATE_TIMEOUT_MS)),
    ]);
    await loadImages(handle, referencedIn);
    db = handle;
  } catch {
    db = null;
  }
}

function tokenFor(data: string): string {
  const known = tokenByData.get(data);
  if (known) return known;
  if (!db) return data;
  const token = `${TOKEN_PREFIX}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  remember(token, data);
  try {
    db.transaction(STORE, "readwrite").objectStore(STORE).put(data, token);
  } catch {
    /* the token still resolves from memory for this session */
  }
  return token;
}

export function isSaveFailing(): boolean {
  return !lastSaveOk;
}

function reportSave(ok: boolean) {
  if (ok === lastSaveOk) return;
  lastSaveOk = ok;
  window.dispatchEvent(new CustomEvent<boolean>(SAVE_STATUS_EVENT, { detail: ok }));
}

export function writePersisted(key: string, value: unknown): boolean {
  try {
    const json = JSON.stringify(value, (_key, item: unknown) =>
      typeof item === "string" && item.length >= MIN_EXTERNAL_LENGTH && item.startsWith("data:image/") ? tokenFor(item) : item,
    );
    localStorage.setItem(key, json);
    reportSave(true);
    return true;
  } catch {
    reportSave(false);
    return false;
  }
}

/** Unknown tokens stay as-is so a later save cannot overwrite them with an empty image. */
export function parsePersisted<T>(raw: string): T {
  return JSON.parse(raw, (_key, item: unknown) =>
    typeof item === "string" && item.startsWith(TOKEN_PREFIX) ? (dataByToken.get(item) ?? item) : item,
  ) as T;
}
