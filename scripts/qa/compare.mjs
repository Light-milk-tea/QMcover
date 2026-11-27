// 参考图对比用的拼图工具，在 Chromium canvas 里合成，不额外装图像库。
//
// fit   <原图> <输出> [--box x0,y0,x1,y1] [--size 1920x1080]   裁一块再缩放，例如把 16:10 视频帧裁成 16:9
// pair  <参考> <当前> <输出> [--box x0,y0,x1,y1] [--width 960]  参考在上、当前在下，都先缩到 1920×1080，box 用画布坐标
// blend <参考> <当前> <输出> [--alpha 0.5] [--box ...]           50% 叠图，偏多少一眼可见
// grid  <图>   <输出> [--box x0,y0,x1,y1] [--step 50] [--zoom 1] 按图片自身像素画网格和坐标，box/step 都是原图像素
//
// 输出扩展名决定格式（.png / .jpg / .webp）。每轮用新文件名，读图工具会缓存同名文件。
import { composeInBrowser, fileToDataUrl, launch, mimeFor, parseArgs, writeDataUrl } from "./common.mjs";

const args = parseArgs();
const [mode, ...files] = args._;
const box = args.box ? args.box.split(",").map(Number) : null;

function fitDraw([img], { box, w, h }) {
  const [x0, y0, x1, y1] = box ?? [0, 0, img.naturalWidth, img.naturalHeight];
  const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
  c.getContext("2d").drawImage(img, x0, y0, x1 - x0, y1 - y0, 0, 0, w, h);
  return c;
}

function pairDraw([ref, cur], { box, width, alpha, blend }) {
  const [x0, y0, x1, y1] = box ?? [0, 0, 1920, 1080];
  const norm = (img) => {
    const c = Object.assign(document.createElement("canvas"), { width: 1920, height: 1080 });
    c.getContext("2d").drawImage(img, 0, 0, 1920, 1080);
    return c;
  };
  const a = norm(ref);
  const b = norm(cur);
  const w = Math.min(width, x1 - x0);
  const h = Math.round(((y1 - y0) * w) / (x1 - x0));
  const gap = blend ? 0 : 10;
  const c = Object.assign(document.createElement("canvas"), { width: w, height: blend ? h : h * 2 + gap });
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(a, x0, y0, x1 - x0, y1 - y0, 0, 0, w, h);
  if (blend) ctx.globalAlpha = alpha;
  ctx.drawImage(b, x0, y0, x1 - x0, y1 - y0, 0, blend ? 0 : h + gap, w, h);
  return c;
}

function gridDraw([img], { box, step, zoom }) {
  const [x0, y0, x1, y1] = box ?? [0, 0, img.naturalWidth, img.naturalHeight];
  const w = Math.round((x1 - x0) * zoom);
  const h = Math.round((y1 - y0) * zoom);
  const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
  const ctx = c.getContext("2d");
  ctx.drawImage(img, x0, y0, x1 - x0, y1 - y0, 0, 0, w, h);
  ctx.font = "bold 13px sans-serif";
  const line = (v, horizontal) => {
    const major = v % (step * 4) === 0;
    ctx.strokeStyle = major ? "rgba(255,0,255,0.9)" : "rgba(0,255,255,0.55)";
    ctx.lineWidth = major ? 2 : 1;
    const p = ((v - (horizontal ? y0 : x0)) * zoom) | 0;
    ctx.beginPath();
    if (horizontal) {
      ctx.moveTo(0, p + 0.5);
      ctx.lineTo(w, p + 0.5);
    } else {
      ctx.moveTo(p + 0.5, 0);
      ctx.lineTo(p + 0.5, h);
    }
    ctx.stroke();
    if (v % (step * 2) === 0) {
      ctx.fillStyle = "#000";
      ctx.fillText(String(v), horizontal ? 3 : p + 3, horizontal ? p - 3 : 14);
      ctx.fillStyle = "#ff0";
      ctx.fillText(String(v), horizontal ? 2 : p + 2, horizontal ? p - 4 : 13);
    }
  };
  for (let v = Math.ceil(x0 / step) * step; v <= x1; v += step) line(v, false);
  for (let v = Math.ceil(y0 / step) * step; v <= y1; v += step) line(v, true);
  return c;
}

const usage = "用法见 scripts/qa/compare.mjs 文件头";
const jobs = {
  fit: () => {
    const [src, out] = files;
    const [w, h] = String(args.size ?? "1920x1080").split("x").map(Number);
    return { sources: [src], out, draw: fitDraw, opts: { box, w, h } };
  },
  pair: () => {
    const [ref, cur, out] = files;
    return { sources: [ref, cur], out, draw: pairDraw, opts: { box, width: Number(args.width ?? 960), blend: false } };
  },
  blend: () => {
    const [ref, cur, out] = files;
    return { sources: [ref, cur], out, draw: pairDraw, opts: { box, width: Number(args.width ?? 960), alpha: Number(args.alpha ?? 0.5), blend: true } };
  },
  grid: () => {
    const [src, out] = files;
    return { sources: [src], out, draw: gridDraw, opts: { box, step: Number(args.step ?? 50), zoom: Number(args.zoom ?? 1) } };
  },
};

if (!jobs[mode]) {
  console.log(usage);
  process.exit(1);
}
const job = jobs[mode]();
if (!job.out || job.sources.some((s) => !s)) {
  console.log(usage);
  process.exit(1);
}
const { browser, page } = await launch();
const url = await composeInBrowser(page, job.sources.map(fileToDataUrl), job.draw, job.opts, mimeFor(job.out));
writeDataUrl(job.out, url);
console.log(job.out);
await browser.close();
