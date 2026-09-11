import { expect, test } from "vitest";
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
