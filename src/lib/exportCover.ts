import { getFontEmbedCSS, toPng } from "html-to-image";
import { BILI_COVER } from "../constants";

export const COVER_EXPORT_TIMEOUT_MS = 30_000;
const ASSET_WAIT_MS = 5_000;
const FETCH_ABORT_MS = 20_000;

let fontEmbedCSS: Promise<string> | null = null;

export function warmupCoverExport(node: HTMLElement | null): void {
  if (!node || fontEmbedCSS) return;
  fontEmbedCSS = document.fonts.ready
    // html-to-image 1.11.x keeps a global regex cursor when filtering formats;
    // adjacent subset rules can lose their src and fall back to another weight.
    .then(() => getFontEmbedCSS(node))
    .catch(() => {
      fontEmbedCSS = null;
      return "";
    });
}

export function shouldIncludeExportNode(el: Node): boolean {
  if (el instanceof HTMLElement && el.dataset.ignoreExport === "true") return false;
  if (el instanceof HTMLImageElement && !(el.complete && el.naturalWidth > 0)) return false;
  return true;
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function settleExportAssets(node: HTMLElement): Promise<void> {
  const images = [...node.querySelectorAll("img")].filter((img) => img.src && !img.src.startsWith("data:"));
  await Promise.race([
    Promise.all([
      document.fonts.ready.catch(() => undefined),
      ...images.map((img) => img.decode().catch(() => undefined)),
    ]),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, ASSET_WAIT_MS);
    }),
  ]);
}

export async function rasterizeCoverPng(node: HTMLElement): Promise<string> {
  await settleExportAssets(node);
  warmupCoverExport(node);
  const css = (await fontEmbedCSS) || undefined;
  return withTimeout(
    toPng(node, {
      width: BILI_COVER.width,
      height: BILI_COVER.height,
      pixelRatio: 1,
      cacheBust: false,
      imagePlaceholder: "",
      fontEmbedCSS: css,
      fetchRequestInit: { signal: AbortSignal.timeout(FETCH_ABORT_MS) },
      style: {
        transform: "none",
        transformOrigin: "top left",
      },
      filter: shouldIncludeExportNode,
      onImageErrorHandler: () => undefined,
    }),
    COVER_EXPORT_TIMEOUT_MS,
    "export-timeout",
  );
}

export async function exportCoverPng(node: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await rasterizeCoverPng(node);
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export function coverFilename(date: string, seriesName: string, operator: string): string {
  const safe = (s: string) => s.replace(/[\\/:*?"<>|]/g, "").trim() || "cover";
  const parts = [date, safe(seriesName)];
  if (operator.trim()) parts.push(safe(operator));
  return `${parts.join("_")}.png`;
}
