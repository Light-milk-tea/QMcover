const inflight = new Map<string, Promise<void>>();

export function preloadImage(url: string): Promise<void> {
  if (!url) return Promise.resolve();
  const hit = inflight.get(url);
  if (hit) return hit;

  const next = new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("image"));
    img.src = url;
  }).finally(() => {
    window.setTimeout(() => inflight.delete(url), 60_000);
  });

  inflight.set(url, next);
  return next;
}

export function warmupArt(url: string): void {
  void preloadImage(url).catch(() => undefined);
}
