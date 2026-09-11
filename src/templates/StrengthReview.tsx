import { useId } from "react";
import { CoverElement } from "../components/CoverElement";
import { IMAGE_EDGE_FADE_DEFAULT, IMAGE_EDGE_FADE_MODE_DEFAULT } from "../constants";
import {
  artUrl,
  findOperator,
  findOperatorByName,
  operatorSkills,
  skillUrl,
  type OperatorSkill,
} from "../data/arts";
import { resolveChibiUrl } from "../data/chibis";
import { getBgPreset } from "../data/backgrounds";
import { elementText } from "../data/elements";
import { useCdnSrc } from "../lib/cdn";
import { layerZIndex } from "../lib/document";
import { bgGradeFilter } from "../lib/effects";
import { useCoverOptional } from "../store/CoverContext";
import type { CoverRenderProps, ImageLayer } from "../types";
import { BgDimLayer } from "./BgDimLayer";
import { OperatorLayer } from "./OperatorLayer";
import "./StrengthReview.css";

const GOLD_INK = "#322313";
const MAIN_ART = "char_4182_oblvns_avemujica#1";
const DEFAULT_OP = "char_4182_oblvns";
const SKILL_SIZE = 236;
const SKILL_BOXES = [
  { left: 1010, top: 381 },
  { left: 1288, top: 380 },
  { left: 1554, top: 378 },
] as const;
const STROKE = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
] as const;

function fitSize(text: string, base: number, maxWidth: number) {
  const units = [...text].reduce((sum, c) => sum + (c.codePointAt(0)! > 255 ? 1.08 : 0.68), 0);
  return Math.min(base, maxWidth / Math.max(1, units));
}

function layerImage(layer: ImageLayer | undefined, fallbackArt: string) {
  if (layer?.imageDataUrl) return layer.imageDataUrl;
  if (layer?.imageUrl) return layer.imageUrl;
  if (layer?.artId) return artUrl(layer.artId);
  return artUrl(fallbackArt);
}

function GoldType({ text }: { text: string }) {
  return (
    <span className="sr-gold-type relative inline-block whitespace-nowrap" data-type-face>
      <span aria-hidden className="sr-gold-depth pointer-events-none absolute" style={{ color: GOLD_INK }}>{text}</span>
      {STROKE.map(([x, y]) => (
        <span
          key={`${x},${y}`}
          aria-hidden
          className="sr-gold-rim pointer-events-none absolute"
          style={{ left: `${x * 0.008}em`, top: `${y * 0.008}em` }}
        >
          {text}
        </span>
      ))}
      <span className="sr-gold-fill relative">{text}</span>
    </span>
  );
}

function SkillFrame({ skill, index }: { skill: OperatorSkill; index: number }) {
  const frameId = useId();
  const remote = useCdnSrc(skillUrl(skill.iconId));
  return (
    <span className="relative block h-full w-full" data-skill-slot={skill.id}>
      <svg viewBox="0 0 188 188" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect x="3" y="3" width="182" height="182" fill="#0b1826" fillOpacity="0.68" />
      </svg>
      <img
        data-skill-icon
        data-skill-id={skill.iconId}
        alt=""
        src={remote.src}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        decoding="async"
        onLoad={remote.onLoad}
        onError={remote.onError}
        className="sr-skill-icon pointer-events-none absolute inset-[4%] h-[92%] w-[92%] object-contain"
      />
      <svg viewBox="0 0 188 188" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`${frameId}-gold`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff0c1" />
            <stop offset="0.3" stopColor="#cc9a48" />
            <stop offset="0.56" stopColor="#785429" />
            <stop offset="0.76" stopColor="#f2d393" />
            <stop offset="1" stopColor="#b38441" />
          </linearGradient>
          <radialGradient id={`${frameId}-glow`}>
            <stop stopColor="#e9f6ff" stopOpacity="0.8" />
            <stop offset="1" stopColor="#cadfff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="5" y="5" width="180" height="180" fill="none" stroke="#08101b" strokeWidth="4" />
        <rect x="3" y="3" width="180" height="180" fill="none" stroke={`url(#${frameId}-gold)`} strokeWidth="2.4" />
        <path d="M3 40 V3 H40 M146 183 H183 V146" fill="none" stroke="#f4dfab" strokeWidth="1" />
        {index !== 1 && (
          <g transform={index === 0 ? "translate(4 4)" : "translate(183 183)"}>
            <circle r="26" fill={`url(#${frameId}-glow)`} />
            <path d="M0 -21 L1.5 -2 L17 0 L1.5 2 L0 21 L-1.5 2 L-17 0 L-1.5 -2 Z" fill="#eff9ff" opacity="0.88" />
          </g>
        )}
      </svg>
    </span>
  );
}

function resolveOperator(props: CoverRenderProps, layers: CoverRenderProps["layers"]) {
  const primary = layers?.find((layer): layer is ImageLayer => layer.kind === "image" && layer.id === "operator");
  return (
    (primary?.operatorId ? findOperator(primary.operatorId) : undefined) ??
    findOperatorByName(props.operatorName) ??
    findOperator(DEFAULT_OP)
  );
}

export function StrengthReview(props: CoverRenderProps) {
  const cover = useCoverOptional();
  const layers = cover?.draft.layers ?? props.layers ?? [];
  const layerA = layers.find((layer): layer is ImageLayer => layer.kind === "image" && layer.id === "operator");
  const layerChibi = layers.find((layer): layer is ImageLayer => layer.kind === "image" && layer.id === "chibi");
  const op = resolveOperator(props, layers);
  const skills = operatorSkills(op);
  const name = elementText(props.elementStyles, "name", props.title.trim() || op?.name || "干员");
  const series = elementText(props.elementStyles, "series", props.subtitle.trim() || "强度测评");
  const namePx = fitSize(name, 216, 1010);
  const seriesPx = fitSize(series, 208, 1010);
  const bg = getBgPreset(props.bgPreset);
  const bgRemote = useCdnSrc(bg.url ?? "");
  const layerAtmosphere = layers.find((layer) => layer.id === "atmosphere");
  const atmosphereHidden = Boolean(layerAtmosphere?.hidden || layerAtmosphere?.removed);
  const chibiHidden = Boolean(layerChibi?.hidden || layerChibi?.removed);
  const chibiSrc = chibiHidden ? "" : resolveChibiUrl(layerChibi ?? {});
  const zOperator = cover ? layerZIndex(layers, "operator") : 1;
  const zChibi = cover ? layerZIndex(layers, "chibi") : 3;
  const chibiBox = {
    left: layerChibi?.x ?? 812,
    top: layerChibi?.y ?? 268,
    width: layerChibi?.w ?? 248,
    height: layerChibi?.h ?? 400,
  };

  const mainUrl = layerImage(layerA, MAIN_ART);
  const wash = useCdnSrc(bgRemote.src ? "" : mainUrl);

  return (
    <div data-strength-review-canvas className="relative h-full w-full overflow-hidden bg-[#05060a]">
      {bgRemote.src ? (
        <img
          data-sr-bg=""
          src={bgRemote.src}
          alt=""
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          onLoad={bgRemote.onLoad}
          onError={bgRemote.onError}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "52% 30%", filter: bgGradeFilter(props.effects?.bgGrade) }}
        />
      ) : null}
      {atmosphereHidden ? null : (
        <CoverElement id="atmosphere" kind="box" className="pointer-events-none absolute inset-0">
          {!bgRemote.src && wash.src ? (
            <img
              data-sr-atmosphere=""
              src={wash.src}
              alt=""
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              decoding="async"
              onLoad={wash.onLoad}
              onError={wash.onError}
              className="pointer-events-none absolute inset-0 h-full w-full scale-[1.08] object-cover"
              style={{
                objectPosition: "38% 32%",
                filter: "blur(1px) saturate(0.62) brightness(0.38) contrast(1.16)",
              }}
            />
          ) : null}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 40% 46% at 22% 20%, rgb(168 184 208 / 0.16) 0%, transparent 68%), radial-gradient(ellipse 46% 50% at 78% 6%, rgb(232 238 248 / 0.2) 0%, rgb(140 154 176 / 0.07) 38%, transparent 70%), radial-gradient(ellipse 38% 36% at 96% 2%, rgb(5 6 10 / 0.45) 0%, transparent 70%), linear-gradient(180deg, rgb(5 6 10 / 0.12) 0%, transparent 36%, rgb(5 6 10 / 0.2) 80%, rgb(5 6 10 / 0.42) 100%)",
            }}
          />
        </CoverElement>
      )}
      <BgDimLayer on={props.bgDim} amount={props.bgDimAmount} at="50% 82%" className="z-[1]" />

      <div
        data-operator-slot
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          zIndex: zOperator,
          WebkitMaskImage: "linear-gradient(90deg, #000 0%, #000 86%, transparent 100%)",
          maskImage: "linear-gradient(90deg, #000 0%, #000 86%, transparent 100%)",
        }}
      >
        <OperatorLayer
          {...props}
          layerId="operator"
          fringeRole="back"
          artGrade={layerA?.artGrade}
          imageUrl={mainUrl}
          imageScale={props.imageScale}
          imageX={props.imageX}
          imageY={props.imageY}
          imageEdgeFade={layerA?.edgeFade ?? props.imageEdgeFade}
          imageEdgeFadeAmount={layerA?.edgeFadeAmount ?? props.imageEdgeFadeAmount ?? IMAGE_EDGE_FADE_DEFAULT}
          imageEdgeFadeMode={layerA?.edgeFadeMode ?? props.imageEdgeFadeMode ?? IMAGE_EDGE_FADE_MODE_DEFAULT}
          transformOrigin="center 10%"
          objectFit="contain"
          objectPosition="40% 8%"
          className="h-full w-[1306px] object-contain"
        />
        <div
          data-sr-title-shade
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: zOperator + 1, background: "radial-gradient(ellipse 57% 44% at 81% 92%, rgb(4 10 20 / 0.64), rgb(4 10 20 / 0.2) 60%, transparent 100%)" }}
        />
      </div>

      <CoverElement
        id="chibi"
        kind="box"
        className="absolute overflow-visible"
        style={{ ...chibiBox, zIndex: zChibi }}
      >
        <div data-chibi-slot className="h-full w-full">
          {chibiSrc ? (
            <OperatorLayer
              layerId="chibi"
              imageUrl={chibiSrc}
              imageScale={layerChibi?.scale ?? 119}
              imageX={layerChibi?.imageX ?? -33}
              imageY={layerChibi?.imageY ?? 29}
              imageEdgeFade={layerChibi?.edgeFade ?? false}
              imageEdgeFadeAmount={layerChibi?.edgeFadeAmount ?? IMAGE_EDGE_FADE_DEFAULT}
              imageEdgeFadeMode={layerChibi?.edgeFadeMode ?? IMAGE_EDGE_FADE_MODE_DEFAULT}
              previewScale={props.previewScale}
              showPlaceholder={false}
              transformOrigin="center bottom"
              objectFit="contain"
              objectPosition="center bottom"
              artGrade={layerChibi?.artGrade}
              emptyHint="基建小人"
              className="h-full w-full object-contain"
              onImageDrag={(dx, dy) => {
                if (!cover || !layerChibi) return;
                cover.patchLayer("chibi", {
                  imageX: (layerChibi.imageX ?? 0) + dx,
                  imageY: (layerChibi.imageY ?? 0) + dy,
                });
              }}
            />
          ) : null}
        </div>
      </CoverElement>

      {skills.map((skill, index) => {
        const box = layers.find((layer) => layer.id === `skill-${index + 1}`);
        const fallback = SKILL_BOXES[index];
        return (
          <CoverElement
            key={skill.id}
            id={`skill-${index + 1}`}
            kind="box"
            className="absolute z-[7]"
            style={{
              top: box?.y ?? fallback.top,
              left: box?.x ?? fallback.left,
              width: box?.w ?? SKILL_SIZE,
              height: box?.h ?? SKILL_SIZE,
            }}
          >
            <SkillFrame skill={skill} index={index} />
          </CoverElement>
        );
      })}

      <CoverElement
        id="name"
        defaultFont="serif-medium"
        defaultFontSize={namePx}
        className="absolute top-[630px] left-[820px] z-[8] font-bold whitespace-nowrap"
        style={{ lineHeight: 1, letterSpacing: "0.04em", color: "#d5dce4" }}
      >
        <GoldType text={name} />
      </CoverElement>

      <CoverElement
        id="series"
        defaultFont="serif-medium"
        defaultFontSize={seriesPx}
        className="absolute top-[856px] left-[880px] z-[8] font-black whitespace-nowrap"
        style={{ lineHeight: 0.9, letterSpacing: "0.035em", color: "#d5dce4" }}
      >
        <GoldType text={series} />
      </CoverElement>
    </div>
  );
}
