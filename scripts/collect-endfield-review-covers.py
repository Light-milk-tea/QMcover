#!/usr/bin/env python3
"""Download 血狼破军「终末地测评」covers for layout reference."""

from __future__ import annotations

import json
import re
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "references" / "endfield-review"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
VIEW = "https://api.bilibili.com/x/web-interface/view?bvid="
SEED = "BV1yNTs6hE32"
EP_RE = re.compile(r"终末地测评#(\d+)")


def get(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Referer": "https://www.bilibili.com/",
            "Origin": "https://www.bilibili.com",
            "Accept": "*/*",
            "Cookie": "buvid3=QMCOVER-ENDFIELD-0001; b_nut=1710000000",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.read()


def view(bvid: str) -> dict:
    data = json.loads(get(VIEW + bvid))
    if data.get("code") != 0:
        raise RuntimeError(data.get("message") or f"view fail {bvid}")
    return data.get("data") or {}


def cover_url(info: dict) -> str:
    pic = info.get("pic") or ""
    if pic.startswith("//"):
        pic = "https:" + pic
    if pic.startswith("http://"):
        pic = "https://" + pic[len("http://") :]
    if not pic:
        raise RuntimeError("no pic")
    return pic


def episode_no(title: str, fallback: int) -> int:
    m = EP_RE.search(title)
    return int(m.group(1)) if m else fallback


def topic(title: str) -> str:
    t = title
    t = EP_RE.sub("", t)
    t = re.sub(r"[【】]", " ", t)
    t = re.sub(r"数据与实战测评|深度总结", "", t)
    t = re.sub(r"[！!]+", " ", t)
    return re.sub(r"\s+", " ", t).strip() or title


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    seed = view(SEED)
    ugc = seed.get("ugc_season") or {}
    if not ugc:
        raise RuntimeError(f"no ugc_season on {SEED}")

    bvids: list[str] = []
    for sec in ugc.get("sections") or []:
        for ep in sec.get("episodes") or []:
            bvid = ep.get("bvid")
            if bvid:
                bvids.append(bvid)
    if SEED not in bvids:
        bvids.append(SEED)

    rows: list[tuple[int, str, int, str, str]] = []
    for i, bvid in enumerate(bvids, 1):
        info = view(bvid)
        title = info.get("title") or ""
        play = int((info.get("stat") or {}).get("view") or 0)
        rows.append((episode_no(title, i), bvid, play, title, cover_url(info)))
        time.sleep(0.2)
    rows.sort(key=lambda r: r[0])

    table = [
        "| # | 播放 | BV | 主题 | 标题 | 文件 |",
        "| --- | ---: | --- | --- | --- | --- |",
    ]
    ok = fail = 0
    for ep, bvid, play, title, pic in rows:
        name = f"{ep:02d}_{bvid}.jpg"
        dest = OUT / name
        try:
            dest.write_bytes(get(pic))
            ok += 1
            print("ok", name, dest.stat().st_size)
            safe = title.replace("|", "\\|")
            table.append(
                f"| {ep} | {play:,} | [{bvid}](https://www.bilibili.com/video/{bvid}) | {topic(title)} | {safe} | `{name}` |"
            )
        except Exception as exc:
            fail += 1
            print("fail", bvid, exc)
            table.append(
                f"| {ep} | {play:,} | [{bvid}](https://www.bilibili.com/video/{bvid}) | — | — | — |"
            )
        time.sleep(0.2)

    lines = [
        "# 终末地测评封面参考",
        "",
        "从 B 站「血狼破军」合集「终末地测评」收集的封面，只作构图参考。不要整图当模板底图。",
        "",
        f"合集入口：[BV1yNTs6hE32](https://www.bilibili.com/video/BV1yNTs6hE32)（#10 卡缪）。",
        "",
        "图片不进 git。重新收集：`python scripts/collect-endfield-review-covers.py`",
        "",
        f"## 参考（{ok}）",
        "",
        "\n".join(table),
        "",
    ]
    (OUT / "INDEX.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"done {ok} ok, {fail} fail")


if __name__ == "__main__":
    main()
