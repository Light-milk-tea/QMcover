#!/usr/bin/env python3
"""Download Bilibili covers listed in references/*/INDEX.md.

Reads documented BV + filename pairs. Does not rewrite the indexes.
"""

from __future__ import annotations

import json
import re
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
VIEW = "https://api.bilibili.com/x/web-interface/view?bvid="
ROW_RE = re.compile(
    r"\[(BV[0-9A-Za-z]+)\]\([^)]+\)[^\n]*`([^`]+\.(?:jpg|jpeg|png|webp))`"
)
INDEXES = [
    ROOT / "references" / "crisis-contract" / "INDEX.md",
    ROOT / "references" / "rogue" / "INDEX.md",
    ROOT / "references" / "zc-event" / "INDEX.md",
    ROOT / "references" / "kirby" / "INDEX.md",
    ROOT / "references" / "endfield-review" / "INDEX.md",
    ROOT / "references" / "secret-plan" / "INDEX.md",
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


def cover_url(bvid: str) -> str:
    data = json.loads(get(VIEW + bvid))
    if data.get("code") != 0:
        raise RuntimeError(data.get("message") or f"view fail {bvid}")
    pic = (data.get("data") or {}).get("pic") or ""
    if not pic:
        raise RuntimeError(f"no pic for {bvid}")
    if pic.startswith("//"):
        pic = "https:" + pic
    return pic


def main() -> None:
    jobs: list[tuple[Path, str]] = []
    for index in INDEXES:
        if not index.exists():
            print("skip missing", index)
            continue
        text = index.read_text(encoding="utf-8")
        for bvid, rel in ROW_RE.findall(text):
            jobs.append((index.parent / rel.replace("\\", "/"), bvid))

    ok = fail = 0
    for dest, bvid in jobs:
        dest.parent.mkdir(parents=True, exist_ok=True)
        try:
            pic = cover_url(bvid)
            dest.write_bytes(get(pic))
            ok += 1
            print("ok", dest.relative_to(ROOT), dest.stat().st_size)
        except Exception as exc:
            fail += 1
            print("fail", bvid, dest.name, exc)
        time.sleep(0.2)

    print(f"done {ok} ok, {fail} fail, {len(jobs)} listed")


if __name__ == "__main__":
    main()
