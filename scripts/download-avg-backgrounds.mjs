import { mkdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

const DEST = resolve("tmp-backgrounds");
const LIST = "https://api.github.com/repos/Aceship/Arknight-Images/contents/avg/backgrounds";
const CDN = "https://cdn.jsdelivr.net/gh/Aceship/Arknight-Images@main/avg/backgrounds";
const CONCURRENCY = 8;

mkdirSync(DEST, { recursive: true });

const res = await fetch(LIST, {
  headers: { "User-Agent": "QMcover-bg-pick/1.0", Accept: "application/vnd.github+json" },
});
if (!res.ok) throw new Error(`list ${res.status}`);
const items = await res.json();
if (!Array.isArray(items)) throw new Error("unexpected list payload");

const files = items.filter((x) => x.type === "file" && /\.(png|jpg|jpeg|webp)$/i.test(x.name));
writeFileSync(resolve(DEST, "_index.json"), JSON.stringify(files.map((f) => f.name), null, 2));
console.log(`listed ${files.length} backgrounds`);

async function download(name) {
  const out = resolve(DEST, name);
  if (existsSync(out) && statSync(out).size > 1000) return "skip";
  const url = `${CDN}/${encodeURIComponent(name)}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const img = await fetch(url, { headers: { "User-Agent": "QMcover-bg-pick/1.0" } });
      if (!img.ok) throw new Error(String(img.status));
      const buf = Buffer.from(await img.arrayBuffer());
      if (buf.length < 1000) throw new Error(`too small ${buf.length}`);
      writeFileSync(out, buf);
      return "ok";
    } catch (err) {
      if (attempt === 3) throw new Error(`${name}: ${err instanceof Error ? err.message : err}`);
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
}

let done = 0;
let failed = 0;
const queue = [...files];
const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    const item = queue.shift();
    if (!item) return;
    try {
      const status = await download(item.name);
      done += 1;
      if (done % 25 === 0 || status === "ok") {
        console.log(`${done}/${files.length} ${status} ${item.name}`);
      }
    } catch (err) {
      failed += 1;
      console.error(String(err));
    }
  }
});

await Promise.all(workers);
console.log(`done ${done}/${files.length} failed ${failed} -> ${DEST}`);
