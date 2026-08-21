#!/usr/bin/env python3
"""Collect high-play Arknights Crisis Contract clear/guide covers from Bilibili.

Images stay local as composition references. Do not commit the image files.
"""

from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "references" / "crisis-contract"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
SEARCH = "https://api.bilibili.com/x/web-interface/search/type"

QUERIES = [
    "明日方舟 危机合约 攻略",
    "明日方舟 危机合约 作业",
    "明日方舟 危机合约 18",
    "明日方舟 危机合约 首杀",
    "明日方舟 危机合约 速通",
]

EXCLUDE_UP = {"明日方舟"}
EXCLUDE_RE = re.compile(
    r"宣传PV|官方PV|广告|终末地|动态漫|\bOST\b|\bMV\b|EP\.|音乐会|动画短片|尖灭测试"
)
KEEP_RE = re.compile(
    r"危机合约|作战|行动|作业|攻略|挂机|打关|首杀|镀层|日替|18\+|危机等级"
)

HIGH_UP = {"巅峰计划", "黑蓑影卫攻略组", "莱茵实验组"}
HIGH_TITLE_RE = re.compile(r"全网首杀|首杀|危机等级\s*(2[7-9]|[3-9]\d)|登顶")


def classify(author: str, title: str) -> str:
    if author in HIGH_UP or HIGH_TITLE_RE.search(title):
        return "high-clear"
    return "low-spec"


def get(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Referer": "https://search.bilibili.com/",
            "Origin": "https://www.bilibili.com",
            "Accept": "application/json, text/plain, */*",
            "Cookie": "buvid3=QMCOVER-CC-REF-0001; b_nut=1710000000",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.read()


def clean_title(title: str) -> str:
    return re.sub(r"<[^>]+>", "", title).replace("&quot;", '"').strip()


def search(keyword: str, page: int) -> list[dict]:
    qs = urllib.parse.urlencode(
        {
            "search_type": "video",
            "keyword": keyword,
            "order": "click",
            "page": page,
            "pagesize": 20,
        }
    )
    data = json.loads(get(f"{SEARCH}?{qs}"))
    if data.get("code") != 0:
        print("search fail", keyword, page, data.get("message"))
        return []
    return data.get("data", {}).get("result") or []


def keep(item: dict) -> bool:
    title = clean_title(item.get("title") or "")
    author = item.get("author") or ""
    if author in EXCLUDE_UP:
        return False
    if EXCLUDE_RE.search(title):
        return False
    if not KEEP_RE.search(title):
        return False
    return True


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    found: dict[str, dict] = {}
    for q in QUERIES:
        for page in (1, 2):
            rows = search(q, page)
            print(f"{q} p{page}: {len(rows)}")
            for item in rows:
                bvid = item.get("bvid")
                if not bvid or not keep(item):
                    continue
                play = int(item.get("play") or 0)
                prev = found.get(bvid)
                if prev and prev["play"] >= play:
                    continue
                found[bvid] = {
                    "bvid": bvid,
                    "title": clean_title(item.get("title") or ""),
                    "author": item.get("author") or "",
                    "play": play,
                    "duration": item.get("duration") or "",
                    "pic": item.get("pic") or "",
                }
            time.sleep(0.4)

    ranked = sorted(found.values(), key=lambda x: -x["play"])[:36]
    buckets = {"high-clear": [], "low-spec": []}
    for item in ranked:
        buckets[classify(item["author"], item["title"])].append(item)

    for name in buckets:
        (OUT / name).mkdir(parents=True, exist_ok=True)
        for old in (OUT / name).glob("*"):
            if old.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
                old.unlink()

    def save_bucket(key: str, items: list[dict]) -> list[tuple]:
        rows = []
        for i, item in enumerate(items, 1):
            pic = item["pic"]
            if pic.startswith("//"):
                pic = "https:" + pic
            ext = Path(urllib.parse.urlparse(pic).path).suffix or ".jpg"
            name = f"{i:02d}_{item['bvid']}{ext}"
            dest = OUT / key / name
            try:
                dest.write_bytes(get(pic))
                print("ok", key, name, item["play"])
                rel = f"{key}/{name}"
            except Exception as exc:
                print("fail", item["bvid"], exc)
                rel = "—"
            time.sleep(0.15)
            rows.append((i, f"{item['play']:,}", item["bvid"], item["author"], item["title"], rel))
        return rows

    high_rows = save_bucket("high-clear", buckets["high-clear"])
    low_rows = save_bucket("low-spec", buckets["low-spec"])

    def table(rows: list[tuple]) -> str:
        lines = [
            "| # | 播放 | BV | UP | 标题 | 文件 |",
            "| --- | ---: | --- | --- | --- | --- |",
        ]
        for i, play, bvid, author, title, path in rows:
            title = title.replace("|", "\\|")
            lines.append(
                f"| {i} | {play} | [{bvid}](https://www.bilibili.com/video/{bvid}) | {author} | {title} | `{path}` |"
            )
        return "\n".join(lines)

    lines = [
        "# 危机合约打关封面参考",
        "",
        "从 B 站高播「明日方舟 · 危机合约」打关视频收集的封面，只作构图参考。不要整图当模板底图。",
        "",
        "- `high-clear/` 大攻略组高分攻克：全网首杀、危机等级 27+、登顶。构图偏干员群像 + 等级数字。",
        "- `low-spec/` 平民 / 低配攻略：合集、挂机、简单好抄、18 镀层日替。构图偏大字标题条。",
        "",
        "图片不进 git。重新收集：`python3 scripts/collect-cc-covers.py`",
        "",
        f"## 高分攻克（{len(high_rows)}）",
        "",
        table(high_rows),
        "",
        f"## 平民低配（{len(low_rows)}）",
        "",
        table(low_rows),
        "",
    ]
    (OUT / "INDEX.md").write_text("\n".join(lines), encoding="utf-8")
    print("wrote", OUT / "INDEX.md")


if __name__ == "__main__":
    main()
