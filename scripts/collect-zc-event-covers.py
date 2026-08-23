#!/usr/bin/env python3
"""Download 魔法Zc目录 side-story / event-stage covers. Skip Contingency Contract."""

from __future__ import annotations

import json
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "references" / "zc-event"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
VIEW = "https://api.bilibili.com/x/web-interface/view?bvid="

# One representative video per event. No CC / main story / annihilation.
ROWS = [
    ("BV1eh411q7NT", "多索雷斯假日", 7235652),
    ("BV1BA4y1D7HV", "愚人号", 5848410),
    ("BV1yz4y1X7fX", "沃伦姆德的薄暮", 5743768),
    ("BV1bh411C73Q", "画中人", 3621709),
    ("BV163411h7qD", "将进酒", 3603951),
    ("BV1yu411o7m4", "长夜临光", 3586229),
    ("BV1ng411r7th", "理想城", 2748329),
    ("BV1qa411n7Xh", "绿野幻梦", 2122110),
    ("BV1s3411R7pm", "登临意", 2070979),
    ("BV1Az4y187hj", "孤星", 2043556),
    ("BV13Z4y1X76g", "风雪过境", 2041921),
    ("BV1M44y1w7QB", "火山旅梦", 1995217),
    ("BV1G24y1D7Uq", "照我以火", 1943821),
    ("BV1LG4y1t7v3", "叙拉古人", 1803868),
    ("BV1LH4y1N7Gm", "巴别塔", 1037943),
]


def get(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Referer": "https://www.bilibili.com/",
            "Origin": "https://www.bilibili.com",
            "Accept": "*/*",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.read()


def cover_url(bvid: str) -> tuple[str, str]:
    data = json.loads(get(VIEW + bvid))
    if data.get("code") != 0:
        raise RuntimeError(data.get("message") or f"view fail {bvid}")
    info = data.get("data") or {}
    pic = info.get("pic") or ""
    title = info.get("title") or ""
    if pic.startswith("//"):
        pic = "https:" + pic
    if not pic:
        raise RuntimeError(f"no pic for {bvid}")
    return pic, title


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    table = [
        "| # | 播放 | BV | 活动 | 标题 | 文件 |",
        "| --- | ---: | --- | --- | --- | --- |",
    ]
    ok = fail = 0
    for i, (bvid, event, play) in enumerate(ROWS, 1):
        name = f"{i:02d}_{bvid}.jpg"
        dest = OUT / name
        try:
            pic, title = cover_url(bvid)
            dest.write_bytes(get(pic))
            ok += 1
            print("ok", name, dest.stat().st_size)
            title = title.replace("|", "\\|")
            table.append(
                f"| {i} | {play:,} | [{bvid}](https://www.bilibili.com/video/{bvid}) | {event} | {title} | `{name}` |"
            )
        except Exception as exc:
            fail += 1
            print("fail", bvid, exc)
            table.append(
                f"| {i} | {play:,} | [{bvid}](https://www.bilibili.com/video/{bvid}) | {event} | — | — |"
            )
        time.sleep(0.2)

    lines = [
        "# 魔法Zc目录 活动关封面参考",
        "",
        "从 B 站「魔法Zc目录」侧边活动 / 故事集打关视频收集的封面，只作构图参考。不要整图当模板底图。",
        "",
        "不含危机合约、主线、剿灭、故事向投稿。",
        "",
        "图片不进 git。重新收集：`python scripts/collect-zc-event-covers.py`",
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
