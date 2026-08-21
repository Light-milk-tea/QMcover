import { toPng } from "html-to-image";
import { BILI_COVER } from "../constants";

export async function exportCoverPng(node: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(node, {
    width: BILI_COVER.width,
    height: BILI_COVER.height,
    pixelRatio: 1,
    cacheBust: true,
    filter: (el) => {
      if (el instanceof HTMLElement && el.dataset.ignoreExport === "true") return false;
      return true;
    },
  });

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
