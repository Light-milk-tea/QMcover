import { createServer } from "node:http";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PREFIX = "https://torappu.prts.wiki/assets/char_spine";
const LEGACY_PREFIX = "https://static.prts.wiki/spine";
const args = process.argv.slice(2);
const outDir = resolve(argValue("--out") ?? join(ROOT, ".chibi-out"));
const ids = (argValue("--ids") ?? "char_002_amiya,char_4182_oblvns").split(",").map((id) => id.trim()).filter(Boolean);
const all = args.includes("--all");
const writeCatalog = args.includes("--write-catalog");
const catalogOnly = args.includes("--catalog-only");

function argValue(name) {
  const hit = args.find((item) => item.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1) : undefined;
}

function fileKey(id) {
  return id.replaceAll("#", "-");
}

function spineKey(id) {
  return id.replaceAll("#", "_");
}

function charDir(id) {
  const match = id.match(/^(char_\d+_[a-z0-9]+)/i);
  return match ? match[1] : id;
}

function spineBases(dir, artId, kind) {
  const skin = kind === "skin" ? spineKey(artId) : "";
  const current = skin
    ? `${PREFIX}/${dir}/${skin}/build/build_${skin}`
    : `${PREFIX}/${dir}/defaultskin/build/build_${dir}`;
  const legacy = skin
    ? `${LEGACY_PREFIX}/${dir}/${skin}/build/build_${skin}`
    : `${LEGACY_PREFIX}/${dir}/defaultskin/build/build_${dir}`;
  return [current, legacy];
}

async function probe(url) {
  const res = await fetch(url, { method: "HEAD", headers: { "user-agent": "QMcover-chibi" } });
  return res.ok;
}

async function firstLiveBase(bases) {
  for (const base of bases) {
    if (await probe(`${base}.skel`)) return base;
  }
  return "";
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "user-agent": "QMcover-chibi" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

function resizeToAtlas(pngPath, atlasPath) {
  const script = `
from pathlib import Path
from PIL import Image
atlas = Path(${JSON.stringify(atlasPath)})
png = Path(${JSON.stringify(pngPath)})
w = h = None
for line in atlas.read_text().splitlines():
    if line.startswith("size:"):
        w, h = [int(x) for x in line.split(":", 1)[1].split(",")]
        break
img = Image.open(png)
if w and (img.size != (w, h)):
    img.resize((w, h), Image.Resampling.BILINEAR).save(png)
`;
  const result = spawnSync("python3", ["-c", script], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "resize failed");
}

const catalog = JSON.parse(readFileSync(join(ROOT, "src/data/operators.json"), "utf8"));
const jobs = [];
for (const op of catalog.operators) {
  if (!all && !ids.includes(op.id)) continue;
  const seen = new Set();
  for (const art of [{ id: op.id, kind: "elite0" }, ...op.arts]) {
    const key = art.kind === "skin" ? fileKey(art.id) : charDir(art.id);
    if (seen.has(key)) continue;
    seen.add(key);
    const dir = charDir(art.id);
    jobs.push({
      key,
      charId: dir,
      artId: art.kind === "skin" ? art.id : dir,
      bases: spineBases(dir, art.id, art.kind),
    });
  }
}

function writeManifest(files) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    source: `${PREFIX}/`,
    repo: "Light-milk-tea/ArknightsChibi@main",
    files,
  };
  mkdirSync(join(outDir, "chibi"), { recursive: true });
  mkdirSync(join(ROOT, "public/chibi"), { recursive: true });
  writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  if (writeCatalog || catalogOnly) writeFileSync(join(ROOT, "src/data/chibis.json"), JSON.stringify(manifest, null, 2));
  for (const key of Object.keys(files)) {
    const src = join(outDir, "chibi", `${key}.png`);
    const dest = join(ROOT, "public/chibi", `${key}.png`);
    if (existsSync(src) && src !== dest) copyFileSync(src, dest);
  }
  console.log(`wrote ${Object.keys(files).length} chibis -> ${outDir}`);
  console.log("publish: copy .chibi-out/chibi and manifest.json to Light-milk-tea/ArknightsChibi");
}

if (catalogOnly) {
  const files = {};
  for (const job of jobs) {
    if (!existsSync(join(outDir, "chibi", `${job.key}.png`))) continue;
    files[job.key] = { charId: job.charId, artId: job.artId, file: `chibi/${job.key}.png` };
  }
  writeManifest(files);
  process.exit(0);
}

const work = join(outDir, "_spine");
mkdirSync(join(outDir, "chibi"), { recursive: true });
mkdirSync(work, { recursive: true });
const files = {};
const ready = [];
for (const job of jobs) {
  const dest = join(outDir, "chibi", `${job.key}.png`);
  const folder = join(work, job.key);
  const local = join(folder, `build_${spineKey(job.artId === job.charId ? job.charId : job.artId)}`);
  if (existsSync(dest)) {
    files[job.key] = { charId: job.charId, artId: job.artId, file: `chibi/${job.key}.png` };
    console.log("have", job.key);
    continue;
  }
  if (existsSync(`${local}.skel`) && existsSync(`${local}.atlas`) && existsSync(`${local}.png`)) {
    ready.push({ ...job, local: local.slice(work.length) });
    console.log("cached", job.key);
    continue;
  }
  const base = await firstLiveBase(job.bases);
  if (!base) {
    console.log("skip", job.key);
    continue;
  }
  mkdirSync(folder, { recursive: true });
  await download(`${base}.skel`, `${local}.skel`);
  await download(`${base}.atlas`, `${local}.atlas`);
  await download(`${base}.png`, `${local}.png`);
  resizeToAtlas(`${local}.png`, `${local}.atlas`);
  ready.push({ ...job, local: local.slice(work.length) });
  console.log("down", job.key);
}

const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".png": "image/png",
  ".skel": "application/octet-stream",
  ".atlas": "text/plain",
};
const server = createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  const file = url.pathname === "/render.html"
    ? join(ROOT, "scripts/chibi-render.html")
    : join(work, decodeURIComponent(url.pathname));
  if (!existsSync(file)) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200, { "content-type": mime[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const renderUrl = `http://127.0.0.1:${server.address().port}/render.html`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(renderUrl, { waitUntil: "networkidle" });
for (const job of ready) {
  try {
    const result = await page.evaluate(async (base) => window.renderChibi(base), job.local);
    const dest = join(outDir, "chibi", `${job.key}.png`);
    writeFileSync(dest, Buffer.from(result.png.split(",")[1], "base64"));
    mkdirSync(join(ROOT, "public/chibi"), { recursive: true });
    copyFileSync(dest, join(ROOT, "public/chibi", `${job.key}.png`));
    files[job.key] = { charId: job.charId, artId: job.artId, file: `chibi/${job.key}.png` };
    console.log("png", job.key, result.animation);
  } catch (err) {
    const message = err instanceof Error ? err.message.split("\n")[0] : String(err);
    console.log("fail", job.key, message);
    await page.goto(renderUrl, { waitUntil: "networkidle" }).catch(() => undefined);
  }
}
await browser.close();
server.close();

writeManifest(files);
