const inflight = new Map<string, Promise<void>>();
const queue: string[] = [];
let running = 0;
const MAX_WARM = 1;

function load(url: string): Promise<void> {
  if (!url) return Promise.resolve();
  const hit = inflight.get(url);
  if (hit) return hit;

  const next = new Promise<void>((resolve, reject) => {
    const img = new Image();
    const timer = window.setTimeout(() => {
      img.src = "";
      reject(new Error("timeout"));
    }, 12000);
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.onload = () => {
      window.clearTimeout(timer);
      resolve();
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("image"));
    };
    img.src = url;
  }).finally(() => {
    window.setTimeout(() => inflight.delete(url), 30_000);
  });

  inflight.set(url, next);
  return next;
}

function pump(): void {
  if (running >= MAX_WARM) return;
  const url = queue.shift();
  if (!url) return;
  running += 1;
  void load(url)
    .catch(() => undefined)
    .finally(() => {
      running -= 1;
      pump();
    });
}

export function preloadImage(url: string): Promise<void> {
  return load(url);
}

export function warmupArt(url: string): void {
  if (!url || inflight.has(url) || queue.includes(url)) return;
  queue.push(url);
  pump();
}

export function warmupArtNow(url: string): void {
  if (!url) return;
  const i = queue.indexOf(url);
  if (i >= 0) queue.splice(i, 1);
  void load(url).catch(() => undefined);
}
