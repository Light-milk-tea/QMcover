import { BILI_COVER } from "../constants";
import { findOperatorByName } from "../data/arts";
import type { BoxLayer, Draft, LayerEffect, TextLayer } from "../types";
import { autoFontSize, displayBoundText } from "../lib/document";

const GOLD = "#f4d06f";
const IVORY = "#fff6ea";
const LEMON = "#fdfe3e";
const ACCENT = "#e3943a";

function splitDe(raw: string): { gold: string; white: string } {
  const t = raw.trim() || "行动";
  const i = t.indexOf("的");
  if (i > 0 && i < t.length - 1) return { gold: t.slice(0, i), white: t.slice(i) };
  return { gold: t, white: "" };
}

function splitStage(raw: string): { code: string; mode: string } {
  const t = raw.trim() || "关卡";
  const m = t.match(/^([A-Za-z0-9][A-Za-z0-9\-.]*)\s+(.+)$/);
  if (m) return { code: m[1], mode: m[2] };
  return { code: t, mode: "" };
}

function splitLimit(raw: string): { lead: string; tail: string } {
  const t = raw.trim() || "无核";
  const i = t.indexOf(" ");
  if (i > 0) return { lead: t.slice(0, i), tail: t.slice(i + 1).trim() };
  for (const suffix of ["首杀", "突袭"]) {
    if (t.endsWith(suffix) && t.length > suffix.length) return { lead: t.slice(0, -suffix.length), tail: suffix };
  }
  return { lead: t, tail: "" };
}

function GoldWord({ text }: { text: string }) {
  return (
    <span className="relative inline-block pr-[0.22em] whitespace-nowrap font-black leading-none" style={{ fontFamily: "var(--font-serif)" }}>
      <span aria-hidden className="pointer-events-none absolute top-[0.1em] left-[0.07em] text-black">
        {text}
      </span>
      <span className="relative" style={{ color: "#e8b54a", WebkitTextStroke: "0.068em #120806", paintOrder: "stroke fill" }}>
        {text}
      </span>
    </span>
  );
}

function StrokeTitle({ text }: { text: string }) {
  return (
    <span className="cover-type-slant relative inline-block whitespace-nowrap">
      <span aria-hidden className="cover-type-stroke pointer-events-none absolute top-[0.08em] left-[0.06em] text-transparent">
        {text}
      </span>
      <span className="cover-type-shadow relative whitespace-nowrap">{text}</span>
    </span>
  );
}

function HollowMark({ text }: { text: string }) {
  return (
    <span className="rg-hollow relative inline-block whitespace-nowrap font-black tracking-[0.12em]">
      <span aria-hidden className="pointer-events-none absolute top-[0.03em] left-[0.03em] text-transparent" style={{ WebkitTextStroke: "0.02em rgba(243,239,230,0.28)" }}>
        {text}
      </span>
      <span className="relative text-transparent" style={{ WebkitTextStroke: "0.018em rgba(243,239,230,0.78)" }}>
        {text}
      </span>
    </span>
  );
}

function GlassWord({ text, left, top, url, scratched }: { text: string; left: number; top: number; url: string | null; scratched?: boolean }) {
  if (!url) {
    return <span className={`inline-block whitespace-nowrap ${scratched ? "rg-theme" : ""}`}>{text}</span>;
  }
  return (
    <span className={`relative inline-block whitespace-nowrap ${scratched ? "rg-theme" : ""}`}>
      <span aria-hidden className="pointer-events-none absolute inset-0 text-transparent" style={{ WebkitTextStroke: "0.03em rgba(10,8,6,0.45)" }}>
        {text}
      </span>
      <span
        className="rg-glass relative"
        style={{
          backgroundImage: `url("${url}")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${BILI_COVER.width}px ${BILI_COVER.height}px`,
          backgroundPosition: `${-left}px ${-top}px`,
        }}
      >
        {text}
      </span>
    </span>
  );
}

function FaceWord({ text }: { text: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap leading-none">
      <span aria-hidden className="pointer-events-none absolute top-[0.055em] left-[0.04em] text-black">
        {text}
      </span>
      <span className="relative" style={{ WebkitTextStroke: "0.042em #0a1218", paintOrder: "stroke fill" }}>
        {text}
      </span>
    </span>
  );
}

function SignDots({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-5">
      <span className="nc-sign-mark" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      {text}
      <span className="nc-sign-mark" aria-hidden>
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}

export function renderTextContent(layer: TextLayer, draft: Draft, glassUrl: string | null) {
  const raw = displayBoundText(layer, draft);
  const effect: LayerEffect | undefined = layer.effect;
  const size = autoFontSize(layer.autoSize, raw.replace(/\s/g, "").length || raw.length, layer.fontSize);

  if (effect === "split-de") {
    const { gold, white } = splitDe(raw);
    return (
      <span className="inline-flex items-end" style={{ fontSize: size }}>
        <GoldWord text={gold} />
        {white ? (
          <span className="font-black tracking-[0.02em] whitespace-nowrap text-white" style={{ fontSize: 156, textShadow: "0 3px 0 #0a1820, 0 8px 16px rgba(0,0,0,0.4)" }}>
            {white}
          </span>
        ) : null}
      </span>
    );
  }

  if (effect === "split-stage") {
    const { code, mode } = splitStage(raw);
    return (
      <span className="inline-flex items-baseline gap-[0.28em] font-black" style={{ fontSize: size }}>
        <span className="relative inline-block whitespace-nowrap">
          <span aria-hidden className="pointer-events-none absolute top-[0.04em] left-[0.03em] text-black">{code}</span>
          <span className="relative" style={{ color: GOLD }}>{code}</span>
        </span>
        {mode ? <span className="nc-ivory whitespace-nowrap font-serif" style={{ color: IVORY }}>{mode}</span> : null}
      </span>
    );
  }

  if (effect === "split-limit") {
    const { lead, tail } = splitLimit(raw);
    return (
      <span className="inline-flex items-baseline gap-[0.32em] font-black" style={{ fontSize: size }}>
        <span className="nc-ivory whitespace-nowrap font-serif" style={{ color: IVORY }}>{lead}</span>
        {tail ? (
          <span className="relative inline-block whitespace-nowrap">
            <span aria-hidden className="pointer-events-none absolute top-[0.04em] left-[0.03em] text-black">{tail}</span>
            <span className="relative" style={{ color: GOLD }}>{tail}</span>
          </span>
        ) : null}
      </span>
    );
  }

  if (effect === "sign-stripe") {
    return (
      <span className="inline-flex items-baseline font-black italic leading-none" style={{ letterSpacing: "-0.06em", fontSize: size }}>
        {Array.from(raw).map((ch, i) => (
          <span
            key={`${ch}-${i}`}
            style={{
              color: i % 2 === 1 ? "#e8b400" : "#1d4ed8",
              WebkitTextStroke: "0.07em #111",
              paintOrder: "stroke fill",
              textShadow: "3px 4px 0 rgba(0,0,0,0.4)",
            }}
          >
            {ch}
          </span>
        ))}
      </span>
    );
  }

  if (effect === "gold-title") return <span style={{ fontSize: size }}><GoldWord text={raw} /></span>;
  if (effect === "stroke") return <span style={{ fontSize: size }}><StrokeTitle text={raw} /></span>;
  if (effect === "hollow") return <span style={{ fontSize: size }}><HollowMark text={raw} /></span>;
  if (effect === "scratch" || effect === "glass") {
    return (
      <span style={{ fontSize: size }}>
        <GlassWord text={raw} left={layer.x} top={layer.y} url={glassUrl} scratched={effect === "scratch"} />
      </span>
    );
  }
  if (effect === "face-word") return <span style={{ fontSize: size }}><FaceWord text={raw} /></span>;
  if (effect === "sign-dots") return <span style={{ fontSize: size }}><SignDots text={raw} /></span>;
  if (effect === "en-name") {
    const name = draft.title.trim() || draft.operatorName;
    const en = findOperatorByName(name)?.nameEn || findOperatorByName(draft.operatorName)?.nameEn || raw;
    return <span className="italic" style={{ fontSize: autoFontSize("enName", en.length, layer.fontSize) }}>{en}</span>;
  }
  if (effect === "guide") return <span className="ls-guide font-black tracking-[-0.04em] whitespace-nowrap" style={{ fontSize: size, lineHeight: 1.18 }}>{raw}</span>;
  if (effect === "slant") {
    return (
      <span className="cover-type-slant inline-block font-black" style={{ fontSize: size, transform: "skewX(-8deg)" }}>
        {raw}
      </span>
    );
  }

  const lines = raw.split("\n");
  return (
    <span className="cover-type-shadow inline-block whitespace-pre font-black" style={{ fontSize: size, letterSpacing: layer.letterSpacing }}>
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line || "\u00a0"}
        </span>
      ))}
    </span>
  );
}

function BracketBars({ side, thickness: t }: { side: "l" | "r"; thickness: number }) {
  return (
    <span className="relative block h-full w-full">
      <i className="absolute top-0 right-0 left-0" style={{ height: t, background: "currentColor" }} />
      <i className="absolute right-0 bottom-0 left-0" style={{ height: t, background: "currentColor" }} />
      <i className={`absolute top-0 bottom-0 ${side === "l" ? "left-0" : "right-0"}`} style={{ width: t, background: "currentColor" }} />
    </span>
  );
}

const TRI_POINTS = "0,0 1180,0 640,860";
const TRI_TOPO = [
  "M30 90 C300 40, 680 70, 980 220 C1100 300, 1150 420, 1170 540",
  "M10 180 C280 130, 640 170, 920 330 C1060 420, 1130 540, 1160 680",
  "M0 280 C250 230, 600 280, 860 450 C1020 550, 1100 680, 1140 800",
  "M0 390 C220 350, 560 400, 800 560 C960 660, 1060 760, 1100 840",
  "M40 500 C260 470, 520 530, 740 670 C880 750, 980 820, 1040 860",
  "M80 610 C280 590, 480 650, 660 760 C760 820, 840 850, 920 860",
];

export function renderBoxChrome(layer: BoxLayer) {
  const chrome = layer.chrome;
  if (chrome === "cc-triangle") {
    return (
      <svg width="68" height="68" viewBox="0 0 58 58" fill="none" aria-hidden>
        <polygon points="29,3 55,53 3,53" stroke="#f2f2f2" strokeWidth="2.4" fill="none" />
        <polygon points="29,16 44,48 14,48" fill="#f2f2f2" />
      </svg>
    );
  }
  if (chrome === "side-emblem") {
    return (
      <svg width="22" height="118" viewBox="0 0 22 118" fill="none" aria-hidden>
        <path d="M4 6 H18" stroke="#f3efe6" strokeWidth="2.2" />
        <path d="M11 6 V112" stroke="#f3efe6" strokeWidth="2.2" />
        <path d="M4 112 H18" stroke="#f3efe6" strokeWidth="2.2" />
      </svg>
    );
  }
  if (chrome === "vignette") {
    return (
      <div
        className="absolute inset-0"
        style={{
          opacity: (layer.opacity ?? 70) / 100,
          background: "radial-gradient(ellipse at 40% 46%, rgba(12,16,22,0.92) 0%, rgba(12,16,22,0.58) 34%, rgba(12,16,22,0.2) 58%, transparent 74%)",
        }}
      />
    );
  }
  if (chrome === "five-star") {
    return (
      <svg width="168" height="20" viewBox="0 0 168 20" fill="none" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <polygon
            key={i}
            points="10,1.2 12.2,7.6 19,7.6 13.6,11.6 15.7,18 10,14 4.3,18 6.4,11.6 1,7.6 7.8,7.6"
            transform={`translate(${i * 28} 0)`}
            fill={i === 2 ? ACCENT : "rgba(244,240,232,0.92)"}
          />
        ))}
        <path d="M146 10 H168" stroke="rgba(244,240,232,0.42)" strokeWidth="1.4" />
      </svg>
    );
  }
  if (chrome === "sign-dots") {
    return (
      <span className="flex h-full w-full items-center justify-between gap-[7px]">
        {[0, 1, 2].map((item) => (
          <i key={item} className="block h-full flex-1 rounded-full bg-current" />
        ))}
      </span>
    );
  }
  if (chrome === "yellow-dashes") {
    const marks = [
      { x: 92, y: 20, w: 92, h: 11, r: -16 },
      { x: 244, y: 52, w: 58, h: 9, r: 14 },
      { x: 384, y: 6, w: 76, h: 10, r: -7 },
      { x: 520, y: 78, w: 50, h: 8, r: -26 },
      { x: 0, y: 72, w: 44, h: 8, r: 20 },
      { x: 316, y: 132, w: 36, h: 7, r: 8 },
    ];
    return (
      <svg className="h-full w-full" viewBox="0 0 580 160" preserveAspectRatio="none" aria-hidden>
        {marks.map((mark) => (
          <g key={`${mark.x}-${mark.y}`} transform={`rotate(${mark.r} ${mark.x + mark.w / 2} ${mark.y + mark.h / 2})`}>
            <rect x={mark.x + 5} y={mark.y + 6} width={mark.w} height={mark.h} fill="rgba(22,18,12,0.3)" />
            <rect x={mark.x} y={mark.y} width={mark.w} height={mark.h} fill="currentColor" />
          </g>
        ))}
      </svg>
    );
  }
  if (chrome === "dot-grid") {
    return (
      <span
        className="block h-full w-full"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1.2px, transparent 1.5px)",
          backgroundSize: "17px 16px",
          opacity: 0.62,
        }}
      />
    );
  }
  if (chrome === "halftone-fade") {
    return (
      <span
        className="block h-full w-full"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1.05px, transparent 1.2px)",
          backgroundSize: "7px 7px",
          WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 42%, transparent 88%)",
          maskImage: "linear-gradient(180deg, #000 0%, #000 42%, transparent 88%)",
        }}
      />
    );
  }
  if (chrome === "halftone-side") {
    return (
      <span
        className="block h-full w-full"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1.15px, transparent 1.3px)",
          backgroundSize: "9px 9px",
          WebkitMaskImage: "linear-gradient(90deg, #000 0%, #000 28%, transparent 78%)",
          maskImage: "linear-gradient(90deg, #000 0%, #000 28%, transparent 78%)",
        }}
      />
    );
  }
  if (chrome === "soft-shards") {
    return (
      <svg className="h-full w-full" viewBox="1048 0 870 760" preserveAspectRatio="none" aria-hidden>
        <polygon points="1180,40 1410,210 1264,248" fill="rgb(246 246 248 / 0.34)" />
        <polygon points="1388,8 1688,168 1540,214" fill="rgb(236 238 242 / 0.24)" />
        <polygon points="1608,90 1918,40 1918,280" fill="rgb(250 250 252 / 0.2)" />
        <polygon points="1048,220 1176,318 1088,352" fill="rgb(255 255 255 / 0.16)" />
        <polygon points="1720,620 1918,520 1918,760" fill="rgb(230 232 236 / 0.14)" />
      </svg>
    );
  }
  if (chrome === "corner-shards") {
    return (
      <svg className="h-full w-full" viewBox="0 0 440 520" preserveAspectRatio="none" aria-hidden>
        <polygon points="180,520 440,520 440,0 354,42" fill="rgb(8 12 16 / 0.5)" />
        <polygon points="230,520 292,520 440,158 440,14" fill="rgb(246 248 248 / 0.72)" />
        <polygon points="312,520 370,520 440,354 440,210" fill="rgb(226 231 234 / 0.54)" />
        <polygon points="8,386 118,334 192,178 104,206" fill="rgb(225 10 20 / 0.9)" />
        <polygon points="78,444 180,392 256,238 168,266" fill="rgb(243 245 245 / 0.74)" />
        <polygon points="160,492 256,446 324,310 244,336" fill="rgb(225 10 20 / 0.76)" />
      </svg>
    );
  }
  if (chrome === "tactical-guides") {
    return (
      <svg className="h-full w-full" viewBox="0 0 960 540" preserveAspectRatio="none" aria-hidden>
        <path d="M0 66 H960 M0 233 H960 M93 0 V540" stroke="rgb(220 20 28 / 0.48)" strokeWidth="1.2" />
        <path d="M0 99 H515 M0 465 H940" stroke="rgb(236 242 246 / 0.22)" />
        <path d="M17 355 H175 M17 360 H127 M451 436 H584 M462 441 H544 M639 465 H727" stroke="rgb(238 242 244 / 0.38)" />
        <path d="M725 97 h18 M734 88 v18 M510 468 h20 M520 458 v20" stroke="rgb(238 242 244 / 0.48)" />
        <text x="20" y="350" fill="rgb(238 242 244 / 0.44)" fontSize="10" letterSpacing="3">SPECIALIST ARRAY</text>
        <text x="452" y="431" fill="rgb(238 242 244 / 0.4)" fontSize="9" letterSpacing="3">RESTRICTED OPERATION</text>
        <text x="685" y="486" fill="rgb(238 242 244 / 0.36)" fontSize="8" letterSpacing="3">TACTICAL COVER</text>
      </svg>
    );
  }
  if (chrome === "ornament-corner" || chrome === "ornament-lace") {
    const src = chrome === "ornament-corner" ? "/ornaments/corner.svg" : "/ornaments/lace.svg";
    return (
      <span
        className="block h-full w-full bg-current"
        style={{
          WebkitMaskImage: `url("${src}")`,
          maskImage: `url("${src}")`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    );
  }
  if (chrome === "bracket-l" || chrome === "bracket-r") {
    const side = chrome === "bracket-l" ? "l" : "r";
    return (
      <span className="relative block h-full w-full">
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ color: "rgba(22,18,12,0.34)", transform: "translate(7px, 8px)" }}>
          <BracketBars side={side} thickness={32} />
        </span>
        <span className="relative block h-full w-full">
          <BracketBars side={side} thickness={32} />
        </span>
      </span>
    );
  }
  if (chrome === "ef-triangle") {
    const clipId = `ef-tri-clip-${layer.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    return (
      <span className="relative block h-full w-full">
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1180 860" preserveAspectRatio="none" style={{ transform: "translate(12px, 14px)" }}>
          <polygon points={TRI_POINTS} fill="rgba(22,18,12,0.26)" />
        </svg>
        <svg className="relative h-full w-full" viewBox="0 0 1180 860" preserveAspectRatio="none" aria-hidden>
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <polygon points={TRI_POINTS} />
            </clipPath>
          </defs>
          <polygon points={TRI_POINTS} fill="currentColor" />
          <g clipPath={`url(#${clipId})`} fill="none" stroke="#b89620" strokeWidth="2.1" opacity="0.38">
            {TRI_TOPO.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        </svg>
      </span>
    );
  }
  if (chrome === "bar-accent") {
    return (
      <span className="flex h-full w-full flex-col">
        <i className="block flex-1" style={{ background: "#e85aa8" }} />
        <i className="block flex-1" style={{ background: "#8d8d8d" }} />
        <i className="block flex-1" style={{ background: "#3dcc6a" }} />
        <i className="block flex-1" style={{ background: LEMON }} />
      </span>
    );
  }
  if (chrome === "paper" || layer.effect === "polaroid") {
    return (
      <div
        className="h-full w-full"
        style={{
          background: layer.fill || "#f3eee4",
          boxShadow: "0 28px 64px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.65)",
          transform: layer.effect === "polaroid" ? "rotate(3.4deg)" : undefined,
        }}
      />
    );
  }
  return (
    <div
      className="h-full w-full"
      style={{ background: layer.fill || layer.color || "#141618", borderRadius: layer.radius }}
    />
  );
}
