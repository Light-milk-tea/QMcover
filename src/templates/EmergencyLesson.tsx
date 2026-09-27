import { ArtVeil, GlitchHaze, VioletAtmosphere, VioletMist, VioletStreaks } from "../canvas/DecorArt";
import { ChromaticTitle, PinkCondition } from "../canvas/TextFaces";
import { CoverElement } from "../components/CoverElement";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { useCdnSrc } from "../lib/cdn";
import { bgGradeFilter } from "../lib/effects";
import type { CoverRenderProps } from "../types";
import { OperatorLayer } from "./OperatorLayer";

function titleSize(length: number) {
  if (length <= 5) return 270;
  if (length <= 7) return 248;
  return Math.floor(1500 / Math.max(length, 1));
}

function conditionSize(length: number) {
  if (length <= 2) return 210;
  return Math.floor(420 / Math.max(length, 1));
}

export function EmergencyLesson(props: CoverRenderProps) {
  const title = elementText(props.elementStyles, "title", props.title.trim() || "带船紧急授课");
  const condition = elementText(props.elementStyles, "condition", props.subtitle.trim() || "无藏");
  const count = elementText(props.elementStyles, "count", String(props.episode || 5));
  const unit = elementText(props.elementStyles, "unit", props.signature.trim() || "人");
  const seriesMark = elementText(props.elementStyles, "series-mark", "ROGUELIKE");
  const bg = getBgPreset(props.bgPreset);
  const remote = useCdnSrc(bg.url ?? "");

  return (
    <div data-emergency-lesson-canvas="" className="relative h-full w-full overflow-hidden bg-[#17070e]">
      {bg.url ? (
        <img
          data-cover-bg=""
          src={remote.src}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.12] object-cover"
          style={{
            objectPosition: "48% 42%",
            filter: `${bgGradeFilter(props.effects?.bgGrade) ?? ""} blur(2px)`,
          }}
          onLoad={remote.onLoad}
          onError={remote.onError}
        />
      ) : null}

      <CoverElement id="atmosphere" kind="box" className="pointer-events-none absolute inset-0 z-[1]">
        <VioletAtmosphere />
        <VioletMist />
      </CoverElement>

      <CoverElement id="shards" kind="box" className="pointer-events-none absolute inset-0 z-[4]">
        <VioletStreaks />
      </CoverElement>

      <CoverElement
        id="series-mark"
        defaultFont="display"
        defaultFontSize={25}
        className="absolute top-[152px] left-[322px] z-[4] leading-none text-[#efe8e9]"
      >
        <span className="flex items-end gap-3">
          <span className="mb-2 block h-[54px] w-[5px] bg-[#b52377] shadow-[9px_0_0_rgba(25,156,178,0.55)]" />
          <span>
            <small className="block text-[20px] tracking-[0.36em] text-[#dccfd4]/80">{seriesMark}</small>
            <strong className="mt-2 block font-serif text-[52px] tracking-[-0.05em] text-[#f1e9eb]">紧急授课</strong>
          </span>
        </span>
      </CoverElement>

      <div
        data-operator-slot=""
        className="pointer-events-none absolute top-[-110px] left-[150px] z-[3] h-[1190px] w-[1480px]"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 38% 66% at 51% 42%, #000 0%, #000 42%, rgba(0,0,0,0.92) 58%, rgba(0,0,0,0.3) 82%, transparent 100%), radial-gradient(ellipse 27% 17% at 27% 38%, #000 0%, #000 25%, transparent 80%), radial-gradient(ellipse 29% 20% at 72% 38%, #000 0%, #000 24%, transparent 82%)",
          maskImage:
            "radial-gradient(ellipse 38% 66% at 51% 42%, #000 0%, #000 42%, rgba(0,0,0,0.92) 58%, rgba(0,0,0,0.3) 82%, transparent 100%), radial-gradient(ellipse 27% 17% at 27% 38%, #000 0%, #000 25%, transparent 80%), radial-gradient(ellipse 29% 20% at 72% 38%, #000 0%, #000 24%, transparent 82%)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      >
        <OperatorLayer
          {...props}
          objectFit="contain"
          objectPosition="center top"
          transformOrigin="center 20%"
          className="h-full w-full"
          artGrade={{ enabled: true, contrast: 14, saturate: 8, brightness: 0, fringe: 0 }}
        />
      </div>

      <CoverElement id="art-veil" kind="box" className="pointer-events-none absolute inset-0 z-[3]">
        <ArtVeil />
      </CoverElement>

      <CoverElement
        id="count"
        defaultFont="serif"
        defaultFontSize={450}
        className="absolute top-[170px] left-[1190px] z-[4] font-normal leading-none"
      >
        <span
          className="text-[#fffdfb]"
          style={{
            WebkitTextStroke: "0.01em rgba(255,232,251,0.9)",
            paintOrder: "stroke fill",
            textShadow: "7px 10px 0 rgba(156,31,113,0.58), 0 16px 28px rgba(0,0,0,0.7)",
            fontFamily: '"Times New Roman", "Noto Serif SC", serif',
            fontWeight: 400,
            display: "inline-block",
            transform: "scaleX(1.08)",
            transformOrigin: "left center",
          }}
        >
          {count}
        </span>
      </CoverElement>

      <CoverElement
        id="condition"
        defaultFont="serif"
        defaultFontSize={conditionSize(condition.length)}
        className="absolute top-[470px] left-[780px] z-[5] font-bold leading-none tracking-[-0.08em]"
      >
        <PinkCondition text={condition} style={{ fontFamily: '"Songti SC", "STSong", "Noto Serif SC", serif', fontWeight: 400 }} />
      </CoverElement>

      <CoverElement
        id="unit"
        defaultFont="serif"
        defaultFontSize={220}
        className="absolute top-[464px] left-[1355px] z-[5] font-normal leading-none text-[#fffdfb]"
        style={{
          textShadow: "5px 8px 0 rgba(156,31,113,0.58), 0 14px 22px rgba(0,0,0,0.7)",
          fontFamily: '"Songti SC", "STSong", "Noto Serif SC", serif',
          fontWeight: 400,
        }}
      >
        {unit}
      </CoverElement>

      <CoverElement id="glitch-debris" kind="box" className="pointer-events-none absolute inset-0 z-[5]">
        <GlitchHaze />
      </CoverElement>

      <CoverElement
        id="title"
        defaultFont="serif"
        defaultFontSize={titleSize(title.length)}
        className="absolute top-[688px] left-[256px] z-[6] font-black leading-none tracking-[-0.015em]"
      >
        <ChromaticTitle text={title} style={{ fontFamily: '"Noto Serif SC", serif', fontWeight: 900 }} />
      </CoverElement>

      <CoverElement id="bottom-vignette" kind="box" className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[230px]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(35,5,17,0.16)_38%,rgba(11,2,7,0.30)_100%)]" />
      </CoverElement>
    </div>
  );
}
