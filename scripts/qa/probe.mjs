// 量默认稿里元素的实际位置（换算到 1920×1080 画布坐标），以及字体的真实字墨尺寸。
// node scripts/qa/probe.mjs <模板id> [选择器...] [--font '"Anton"' --text PV-EX-8 --weight 900]
// 选择器例子：'[data-cover-el=title]'、'[data-title-line]'。旋转元素给的是外接矩形。
// --font 用 canvas measureText 量 100px 下的宽度、大写高（ascent）和下沉，按参考像素反推字号用。
import { BASE, launch, parseArgs, waitCanvasReady } from "./common.mjs";

const args = parseArgs();
const [id, ...selectors] = args._;
if (!id) {
  console.log("用法：node scripts/qa/probe.mjs <模板id> [选择器...] [--font 字体 --text 文字 --weight 900]");
  process.exit(1);
}
const { browser, page } = await launch();
await page.goto(`${BASE}/#/__thumb/${id}`);
await waitCanvasReady(page, "[data-thumb-capture]", Number(args["min-images"] ?? 0));

const result = await page.evaluate(
  async ({ selectors, font, text, weight }) => {
    const root = document.querySelector("[data-thumb-capture]");
    const rb = root.getBoundingClientRect();
    const k = 1920 / rb.width;
    const out = {};
    for (const sel of selectors) {
      out[sel] = [...root.querySelectorAll(sel)].map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          box: [r.left - rb.left, r.top - rb.top, r.right - rb.left, r.bottom - rb.top].map((v) => Math.round(v * k)),
          text: (el.textContent ?? "").slice(0, 24),
          fontSize: cs.fontSize,
          fontFamily: cs.fontFamily.slice(0, 40),
        };
      });
    }
    if (font) {
      await document.fonts.load(`${weight} 100px ${font}`, text);
      const ctx = document.createElement("canvas").getContext("2d");
      ctx.font = `${weight} 100px ${font}`;
      out.measure = [...new Set([text, ...text])].map((s) => {
        const m = ctx.measureText(s);
        return { text: s, width: +m.width.toFixed(1), ascent: +m.actualBoundingBoxAscent.toFixed(1), descent: +m.actualBoundingBoxDescent.toFixed(1) };
      });
    }
    return out;
  },
  { selectors, font: args.font, text: String(args.text ?? "H"), weight: String(args.weight ?? 900) },
);
console.log(JSON.stringify(result, null, 1));
await browser.close();
