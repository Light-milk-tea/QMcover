#!/usr/bin/env python3
"""Download 小鬼卡比 无核论文 covers for layout reference."""

from __future__ import annotations

import json
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "references" / "kirby"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
VIEW = "https://api.bilibili.com/x/web-interface/view?bvid="

ROWS = [
    ("BV1SB4heaEb8", "泰拉饭", 79718),
    ("BV1Bt421P7Gc", "巴别塔", 71283),
    ("BV1NV41137Gj", "火山旅梦", 152353),
    ("BV1FP41197oC", "孤星", 209425),
    ("BV1ea4y137wm", "孤星", 389721),
    ("BV19t4y1s7EY", "愚人号", 267507),
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
        "# 小鬼卡比 无核论文封面参考",
        "",
        "从 B 站「小鬼卡比」无核论文合集收集的封面，只作构图参考。不要整图当模板底图，也不要搬官方活动 logo。",
        "",
        "这 6 张活动主题差很多（羊皮纸、白底科技、黄紫夏日、档案卡、浅灰技术条、暗金周年），**系列不变量是信息骨架，不是同一套配色**。",
        "",
        "主参考：`06_BV19t4y1s7EY.jpg`（SN-EX-8）。构图最干净：暗底、左两行大字、一条紫线、右立绘。",
        "",
        "图片不进 git。重新收集：`python scripts/collect-kirby-covers.py`",
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
