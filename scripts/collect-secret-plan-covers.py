#!/usr/bin/env python3
"""Download 莱茵实验组「机密预案」covers for layout reference."""

from __future__ import annotations

import json
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "references" / "secret-plan"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
VIEW = "https://api.bilibili.com/x/web-interface/view?bvid="

# (bvid, dest name) — INDEX.md is the source of truth for notes; this only fetches bytes.
ROWS = [
    ("BV1TjbDz1Ejx", "01_BV1TjbDz1Ejx.jpg"),
]


def get(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Referer": "https://www.bilibili.com/",
            "Origin": "https://www.bilibili.com",
            "Accept": "*/*",
            "Cookie": "buvid3=QMCOVER-SECRET-0001; b_nut=1710000000",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.read()


def cover_url(bvid: str) -> str:
    data = json.loads(get(VIEW + bvid))
    if data.get("code") != 0:
        raise RuntimeError(data.get("message") or f"view fail {bvid}")
    pic = (data.get("data") or {}).get("pic") or ""
    if pic.startswith("//"):
        pic = "https:" + pic
    if pic.startswith("http://"):
        pic = "https://" + pic[len("http://") :]
    if not pic:
        raise RuntimeError(f"no pic for {bvid}")
    return pic


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    ok = fail = 0
    for bvid, name in ROWS:
        dest = OUT / name
        try:
            dest.write_bytes(get(cover_url(bvid)))
            ok += 1
            print("ok", name, dest.stat().st_size)
        except Exception as exc:
            fail += 1
            print("fail", bvid, exc)
        time.sleep(0.2)
    print(f"done {ok} ok, {fail} fail")


if __name__ == "__main__":
    main()
