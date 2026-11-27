// 整页编辑器验收：截一张编辑器全页，再点「导出封面」拿到真实 PNG，并和默认稿截图比较。
// node scripts/qa/editor-export.mjs <模板id...> [--out tmp-compare/<id>] [--min-images 1]
// 导出前会弹 window.confirm，这里自动确认；不接住对话框就永远等不到下载。
import { BASE, ensureDir, fileToDataUrl, imageDiff, launch, parseArgs, waitCanvasReady } from "./common.mjs";

const args = parseArgs();
const ids = args._;
if (!ids.length) {
  console.log("用法：node scripts/qa/editor-export.mjs <模板id...> [--out 目录] [--min-images 1]");
  process.exit(1);
}
const minImages = Number(args["min-images"] ?? 1);
const { browser, page } = await launch({ acceptDownloads: true });
page.on("dialog", (dialog) => dialog.accept());

let failed = false;
for (const id of ids) {
  const out = args.out ?? `tmp-compare/${id}`;
  await page.goto(`${BASE}/#/t/${id}`);
  const stage = await waitCanvasReady(page, "[data-cover-stage]", minImages);
  ensureDir(`${out}/editor.png`);
  await page.screenshot({ path: `${out}/editor.png` });
  const shot = await stage.screenshot();

  const button = page.getByRole("button", { name: "导出封面" });
  const [download] = await Promise.all([page.waitForEvent("download", { timeout: 120000 }), button.click()]);
  const pngPath = `${out}/download.png`;
  await download.saveAs(pngPath);
  const diff = await imageDiff(page, `data:image/png;base64,${shot.toString("base64")}`, fileToDataUrl(pngPath));
  console.log(`${id}：${download.suggestedFilename()} → ${pngPath}；编辑器画布与导出 PNG 平均差 ${diff.mean}，差值>32 ${diff.over32}%`);
  if (diff.mean > 8) failed = true;
}
await browser.close();
if (failed) {
  console.log("有模板的导出和画布差得多，打开 PNG 查是哪一层丢了（遮罩、滤镜、裁切）。");
  process.exitCode = 1;
}
