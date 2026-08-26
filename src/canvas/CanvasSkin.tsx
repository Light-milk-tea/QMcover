import { getBgPreset } from "../data/backgrounds";
import { getOrnament } from "../data/ornaments";
import { useCdnSrc } from "../lib/cdn";
import type { CanvasSkin } from "../types";
import { BgDimLayer } from "../templates/BgDimLayer";

const LEMON = "#fdfe3e";
const PAPER = "#f3f3f1";

function BandScene({ url, objectPosition, veil }: { url: string | null; objectPosition: string; veil: string }) {
  return (
    <>
      {url ? (
        <img
          src={url}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.12] object-cover"
          style={{ objectPosition }}
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[#0c2430]" />
      )}
      <div className="pointer-events-none absolute inset-0" style={{ background: veil }} />
      <div className="ls-grain pointer-events-none absolute inset-0 opacity-[0.42]" />
    </>
  );
}

function BannerOrnament({ id }: { id?: string }) {
  const item = getOrnament(id);
  if (!item.src || item.kind === "none") return null;
  const cls =
    item.kind === "side"
      ? "top-4 right-6 h-[22%] w-[108px] object-right opacity-[0.78]"
      : "top-4 right-6 h-[78px] w-[78px] object-right-top opacity-[0.76]";
  return (
    <>
      <img src={item.src} alt="" className={`pointer-events-none absolute object-contain ${cls}`} />
      <img
        src={item.src}
        alt=""
        className={`pointer-events-none absolute object-contain ${cls} right-6 bottom-4 origin-center -scale-y-100`}
      />
    </>
  );
}

function YellowDashes() {
  const marks = [
    { x: 1216, y: 156, w: 92, h: 11, r: -16 },
    { x: 1368, y: 188, w: 58, h: 9, r: 14 },
    { x: 1508, y: 142, w: 76, h: 10, r: -7 },
    { x: 1644, y: 214, w: 50, h: 8, r: -26 },
    { x: 1124, y: 208, w: 44, h: 8, r: 20 },
    { x: 1440, y: 268, w: 36, h: 7, r: 8 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-[4]">
      {marks.map((m) => (
        <span
          key={`${m.x}-${m.y}`}
          className="absolute"
          style={{ left: m.x, top: m.y, width: m.w, height: m.h, transform: `rotate(${m.r}deg)` }}
        >
          <i className="absolute inset-0" style={{ background: "rgba(22,18,12,0.3)", transform: "translate(5px, 6px)" }} />
          <i className="absolute inset-0" style={{ background: LEMON }} />
        </span>
      ))}
    </div>
  );
}

type Props = {
  skin: CanvasSkin;
  bgPreset?: string;
  textBgPreset?: string;
  bgDim?: boolean;
  bgDimAmount?: number;
  ornamentId?: string;
  paper?: string;
};

export function CanvasBackdrop({ skin, bgPreset, textBgPreset, bgDim, bgDimAmount, ornamentId, paper }: Props) {
  const bg = getBgPreset(bgPreset);
  const fill = getBgPreset(textBgPreset || bgPreset);
  const canvasRemote = useCdnSrc(bg.url ?? "");
  const fillRemote = useCdnSrc(fill.url ?? "");
  const canvasUrl = canvasRemote.src || null;

  if (skin === "endfield") {
    return (
      <>
        <div className="absolute inset-0" style={{ background: paper || PAPER }} />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-0 w-[44%]"
          style={{ background: "linear-gradient(90deg, #d5dbe3 0%, #e4e7ec 52%, transparent 100%)" }}
        />
        {bg.url ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-0 w-[46%] overflow-hidden">
            <img
              src={bg.url}
              alt=""
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              decoding="async"
              className="h-full w-full object-cover"
              style={{
                objectPosition: "38% 42%",
                WebkitMaskImage: "linear-gradient(90deg, #000 0%, #000 58%, transparent 100%)",
                maskImage: "linear-gradient(90deg, #000 0%, #000 58%, transparent 100%)",
              }}
            />
          </div>
        ) : null}
        <div className="ef-halftone pointer-events-none absolute top-0 right-0 z-[1] h-[46%] w-[58%] opacity-[0.5]" />
        <YellowDashes />
        {bgDim ? <BgDimLayer on amount={bgDimAmount ?? 28} at="22% 48%" className="z-[2]" /> : null}
      </>
    );
  }

  if (skin === "lowspec") {
    const scene = bg.url;
    return (
      <>
        <div className="absolute inset-0 bg-[#080a0e]" />
        <BgDimLayer on={bgDim} amount={bgDimAmount ?? 38} at="28% 48%" className="z-[1]" />
        <div
          className="absolute inset-0 z-[2] flex flex-col"
          style={{ clipPath: "polygon(34% 0, 100% 0, 100% 100%, 22% 100%)" }}
        >
          <div className="relative min-h-0 flex-1">
            <BandScene
              url={scene}
              objectPosition="78% 18%"
              veil="linear-gradient(180deg, rgba(8,28,36,0.12) 0%, rgba(6,22,30,0.38) 100%), linear-gradient(90deg, rgba(4,12,18,0.28), transparent 42%)"
            />
          </div>
          <div className="relative z-[3] min-h-0 flex-1 overflow-hidden">
            <div className="ls-paper absolute inset-0 shadow-[0_14px_36px_rgba(0,0,0,0.4)]" />
            <div className="ls-halftone pointer-events-none absolute inset-y-0 left-0 w-[30%] opacity-50" />
            <BannerOrnament id={ornamentId} />
          </div>
          <div className="relative min-h-0 flex-1">
            <BandScene
              url={scene}
              objectPosition="78% 86%"
              veil="linear-gradient(180deg, rgba(4,10,16,0.48) 0%, rgba(2,6,12,0.72) 100%), linear-gradient(90deg, rgba(2,8,12,0.3), transparent 40%)"
            />
          </div>
        </div>
      </>
    );
  }

  if (skin === "rogue") {
    return (
      <>
        {canvasUrl ? (
          <img
            src={canvasUrl}
            alt=""
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "42% 40%" }}
            onLoad={canvasRemote.onLoad}
            onError={canvasRemote.onError}
          />
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_28%_30%,#6a6258_0%,#2a221c_42%,#0e0b09_100%)]" />
        )}
        {fill.url ? (
          <img
            src={fillRemote.src}
            alt=""
            className="pointer-events-none absolute h-0 w-0 opacity-0"
            onLoad={fillRemote.onLoad}
            onError={fillRemote.onError}
          />
        ) : null}
        <BgDimLayer on={bgDim} amount={bgDimAmount ?? 100} at="72% 48%" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 22% 18%, rgba(255,255,255,0.14) 0%, transparent 38%)" }}
        />
        <div className="rg-grain pointer-events-none absolute inset-0 opacity-[0.55]" />
        <div className="rg-dots pointer-events-none absolute right-[86px] bottom-[78px] h-[64px] w-[118px] opacity-80" />
      </>
    );
  }

  const base = paper || "#141618";
  return (
    <>
      <div className="absolute inset-0" style={{ background: base }} />
      {bg.url ? (
        <img
          src={bg.url}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={
            skin === "nocore"
              ? { objectPosition: "62% 42%" }
              : skin === "specialist"
                ? {
                    objectPosition: "56% 36%",
                    filter: "saturate(0.42) contrast(1.14) brightness(1.46) grayscale(0.18)",
                  }
                : undefined
          }
        />
      ) : skin === "madness" ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_40%,#3a424c_0%,#14181e_46%,#0c1016_100%)]" />
      ) : null}
      {skin === "firstkill" ? (
        <div className="absolute inset-y-0 left-0 w-[36%] bg-gradient-to-r from-[#141618]/78 via-[#141618]/32 to-transparent" />
      ) : null}
      {skin === "specialist" ? (
        <>
          <div className="absolute inset-y-0 left-0 w-[38%] bg-gradient-to-r from-[#8ea0b4]/28 via-[#c5ced6]/10 to-transparent" />
          <div className="sp-scan pointer-events-none absolute inset-0 opacity-[0.55]" />
          <div className="sp-grain pointer-events-none absolute inset-0 opacity-[0.38]" />
        </>
      ) : null}
      {skin === "nocore" ? <div className="nc-night pointer-events-none absolute inset-0" /> : null}
      <BgDimLayer
        on={bgDim}
        amount={bgDimAmount ?? 42}
        at={skin === "firstkill" ? "22% 42%" : skin === "nocore" ? "28% 48%" : skin === "specialist" ? "22% 58%" : "40% 46%"}
      />
    </>
  );
}

export function skinGlassUrl(textBgPreset?: string, bgPreset?: string): string | null {
  const fill = getBgPreset(textBgPreset || bgPreset);
  return fill.url;
}
