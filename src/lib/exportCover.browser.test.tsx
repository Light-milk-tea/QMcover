import { expect, test, vi } from "vitest";
import "../index.css";
import { coverFilename, rasterizeCoverPng, shouldIncludeExportNode } from "./exportCover";

const stubArt =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='%23c33'/%3E%3C/svg%3E";

test("封面文件名去掉非法字符", () => {
  expect(coverFilename("2026-09-11", "仅需一人", "酒神")).toBe("2026-09-11_仅需一人_酒神.png");
  expect(coverFilename("2026-09-11", "a/b", "")).toBe("2026-09-11_ab.png");
});

test("未解码或失败的图不进导出", async () => {
  const skip = document.createElement("div");
  skip.dataset.ignoreExport = "true";
  expect(shouldIncludeExportNode(skip)).toBe(false);

  const pending = document.createElement("img");
  pending.src = "http://127.0.0.1:9/never.png";
  expect(shouldIncludeExportNode(pending)).toBe(false);

  const ready = document.createElement("img");
  ready.src = stubArt;
  await ready.decode();
  expect(shouldIncludeExportNode(ready)).toBe(true);
});

test("坏图不会卡住 PNG 导出", { timeout: 45_000 }, async () => {
  const node = document.createElement("div");
  node.style.width = "320px";
  node.style.height = "180px";
  node.style.background = "#221018";
  const img = document.createElement("img");
  img.src = "http://127.0.0.1:9/never.png";
  node.appendChild(img);
  document.body.appendChild(node);
  try {
    const url = await rasterizeCoverPng(node);
    expect(url.startsWith("data:image/png")).toBe(true);
  } finally {
    node.remove();
  }
});

test("PNG 中的中文分片字体保留粗字重，不逐字回退到细体", { timeout: 45_000 }, async () => {
  vi.resetModules();
  const { rasterizeCoverPng: exportPng } = await import("./exportCover");
  const text = "四人";
  await document.fonts.load('900 174px "Noto Sans SC"', text);
  const node = document.createElement("div");
  node.style.cssText = 'width:1920px;height:1080px;background:black;color:white;font:900 174px/1 "Noto Sans SC"';
  node.textContent = text;
  document.body.appendChild(node);
  try {
    const image = new Image(); image.src = await exportPng(node); await image.decode();
    const canvas = document.createElement("canvas"); canvas.width = 1920; canvas.height = 1080;
    const ctx = canvas.getContext("2d")!;
    const ink = () => {
      const pixels = ctx.getImageData(0, 0, 1920, 1080).data;
      let coverage = 0;
      for (let i = 0; i < pixels.length; i += 4) coverage += pixels[i] / 255;
      return coverage;
    };
    ctx.drawImage(image, 0, 0);
    const exportedInk = ink();
    ctx.fillStyle = "black"; ctx.fillRect(0, 0, 1920, 1080);
    ctx.fillStyle = "white"; ctx.font = '900 174px "Noto Sans SC"';
    ctx.fillText(text, 0, 200);
    expect(exportedInk / ink()).toBeGreaterThan(.95);
    expect(exportedInk / ink()).toBeLessThan(1.05);
  } finally {
    node.remove();
  }
});
