import { useId } from "react";
import { useCdnSrc } from "../lib/cdn";
import type { CoverRenderProps } from "../types";

/** Neutral highlights, rose-lilac midtones, and cool ink shadows. */
export function VioletGrade({ id }: { id: string }) {
  return <svg width="0" height="0" className="absolute" aria-hidden>
    <defs>
      <filter id={id} colorInterpolationFilters="sRGB" x="-5%" y="-5%" width="110%" height="110%">
        <feColorMatrix type="matrix" values="1.02 .035 .025 0 -.025  .015 .90 .035 0 -.01  .035 .035 1.01 0 .005  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="gamma" amplitude="1.06" exponent="1.0" offset="0" />
          <feFuncG type="gamma" amplitude="1.105" exponent="1.13" offset="0" />
          <feFuncB type="gamma" amplitude="1.025" exponent="1.08" offset="0" />
        </feComponentTransfer>
      </filter>
    </defs>
  </svg>;
}

export function MineralSurface({ violet = false }: { violet?: boolean }) {
  const id = useId().replace(/:/g, "");
  return <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1920 1080" aria-hidden>
    <defs>
      <filter id={`${id}-stone`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency={violet ? ".028 .065" : ".075"} numOctaves="4" seed="23" />
        <feDiffuseLighting surfaceScale={violet ? "9" : "3"} diffuseConstant=".8" lightingColor="#9caeb7"><feDistantLight azimuth="225" elevation="35" /></feDiffuseLighting>
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".68" numOctaves="3" seed="7" /><feColorMatrix type="saturate" values="0" /></filter>
      <filter id={`${id}-pitting`} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".11 .047" numOctaves="4" seed="16" />
        <feColorMatrix type="matrix" values="0 0 0 0 .15  0 0 0 0 .25  0 0 0 0 .3  4 0 0 0 -1.95" />
      </filter>
      <filter id={`${id}-mottles`} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".008 .019" numOctaves="3" seed="14" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0 .004 .022 .07 .12" />
          <feFuncG type="table" tableValues="0 .018 .064 .14 .2" />
          <feFuncB type="table" tableValues=".008 .027 .081 .17 .24" />
        </feComponentTransfer>
      </filter>
      <filter id={`${id}-wear`} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".035 .012" numOctaves="4" seed="31" />
        <feColorMatrix type="matrix" values="0 0 0 0 .005  0 0 0 0 .025  0 0 0 0 .035  0 0 0 5 -2.1" />
      </filter>
      <filter id={`${id}-chips`} colorInterpolationFilters="sRGB" x="-5%" y="-10%" width="110%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency=".055 .024" numOctaves="2" seed="41" result="roughness" />
        <feDisplacementMap in="SourceGraphic" in2="roughness" scale="13" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
    {violet ? <rect width="1920" height="1080" filter={`url(#${id}-mottles)`} opacity=".85" /> : null}
    <rect width="1920" height="1080" filter={`url(#${id}-stone)`} opacity={violet ? ".035" : ".1"} />
    <rect width="1920" height="1080" filter={`url(#${id}-grain)`} opacity={violet ? ".035" : ".06"} />
    {violet ? <rect width="1920" height="1080" filter={`url(#${id}-pitting)`} opacity=".22" /> : null}
    {violet ? <rect width="1920" height="1080" filter={`url(#${id}-wear)`} opacity=".3" /> : null}
    {violet ? <g fill="#010a10" opacity=".64" filter={`url(#${id}-chips)`}>
      {Array.from({ length: 185 }, (_, i) => {
        const x = (i * 419 + i * i * 13) % 1920;
        const y = (i * 229 + i * i * 47) % 1080;
        const w = 2 + i * 7 % 10;
        const h = 12 + i * 37 % 145;
        return <path key={i} d={`M${x} ${y} l${w} -7 ${-w / 3} ${h * .4} 2 ${h * .25} ${-w - 3} ${h * .35} 2 ${-h * .48} Z`} />;
      })}
    </g> : null}
  </svg>;
}

export function PrismaticReflections(props: Pick<CoverRenderProps, "imageUrl" | "imageScale" | "imageX" | "imageY" | "elementStyles" | "layers">) {
  const art = useCdnSrc(props.imageUrl);
  const id = useId().replace(/:/g, "");
  const scale = props.imageScale / 100;
  const operator = props.layers?.find((layer) => layer.id === "operator");
  const rotation = props.elementStyles?.operator?.rotation ?? operator?.rotation ?? 0;
  if (!art.src || operator?.hidden || operator?.removed) return null;
  // Narrow spectra follow the horn, collar, chest and sleeve highlights.
  // Alpha clipping keeps the spectra on the image; multiply dyes its highlights.
  const glints = [
    [462, 120, 83, 28, -43, .85],
    [478, 216, 80, 30, -22, .35],
    [798, 438, 94, 33, -43, 1],
    [676, 540, 100, 29, -43, .88],
    [362, 813, 90, 34, -42, 1],
    [750, 1020, 105, 34, -24, .58],
  ];
  return <svg data-matrix-prism viewBox="0 0 1920 1080" className="h-full w-full" aria-hidden>
    <defs>
      <linearGradient id={`${id}-spectrum`} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
        <stop stopColor="#fbe0ef" /><stop offset=".18" stopColor="#cdd9ff" /><stop offset=".38" stopColor="#c8f5e5" /><stop offset=".58" stopColor="#f5f7cf" /><stop offset=".76" stopColor="#fbe0d8" /><stop offset="1" stopColor="#e4d2f2" />
      </linearGradient>
      <radialGradient id={`${id}-fade`}><stop offset=".15" stopColor="white" /><stop offset="1" stopColor="white" stopOpacity="0" /></radialGradient>
      <mask id={`${id}-art`} maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080" style={{ maskType: "alpha" }}>
        <g transform={`translate(${720 + props.imageX} ${540 + props.imageY}) rotate(${rotation}) scale(${-scale} ${scale}) translate(-1120 -540)`}>
          <image href={art.src} crossOrigin="anonymous" width="2240" height="1080" preserveAspectRatio="xMidYMid meet" onLoad={art.onLoad} onError={art.onError} />
        </g>
      </mask>
      <mask id={`${id}-mask`}><rect width="1920" height="1080" fill="black" />{glints.map(([x,y,rx,ry,angle], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} transform={`rotate(${angle} ${x} ${y})`} fill={`url(#${id}-fade)`} />)}</mask>
    </defs>
    <g mask={`url(#${id}-art)`} opacity=".7"><g mask={`url(#${id}-mask)`}>
      {glints.map(([x,y,rx,ry,angle,strength], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${angle})`} opacity={strength}>
        <ellipse rx={rx} ry={ry} fill={`url(#${id}-spectrum)`} />
      </g>)}
    </g></g>
  </svg>;
}

export function VioletBloom() {
  const id = useId().replace(/:/g, "");
  return <>
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 29% 57% at 0% 82%, rgb(43 10 63 / .48), rgb(43 10 63 / .15) 47%, transparent 86%)" }} />
    <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 42% 36% at 3% -8%, color-mix(in srgb, currentColor 35%, #ffe1ff) 0%, color-mix(in srgb, currentColor 80%, #ff76fa) 23%, color-mix(in srgb, currentColor 62%, #130936) 49%, transparent 78%), radial-gradient(ellipse 40% 38% at 99% 111%, color-mix(in srgb, currentColor 48%, #ffbafa) 0%, color-mix(in srgb, currentColor 66%, #fc43e5) 26%, color-mix(in srgb, currentColor 65%, #17072e) 53%, transparent 79%)", opacity: .94 }} />
    <svg viewBox="0 0 1920 1080" className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
      <defs><filter id={id} x="-30%" y="-200%" width="160%" height="500%"><feGaussianBlur stdDeviation="20" /></filter></defs>
      <g filter={`url(#${id})`} stroke="#b48bbd" opacity=".15">
        <path d="M1210 498 Q1490 234 1900 389 L2010 460" strokeWidth="46" />
        <path d="M905 641 Q1300 830 1900 903" strokeWidth="36" />
      </g>
    </svg>
  </>;
}

export function FilmGrain() {
  const id = useId().replace(/:/g, "");
  return <svg data-matrix-film viewBox="0 0 1920 1080" className="h-full w-full" aria-hidden>
    <defs><filter id={id} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".36" numOctaves="3" stitchTiles="stitch" seed="29" />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer><feFuncR type="linear" slope="4" intercept="-1.5" /><feFuncG type="linear" slope="4" intercept="-1.5" /><feFuncB type="linear" slope="4" intercept="-1.5" /></feComponentTransfer>
    </filter></defs>
    <rect width="1920" height="1080" filter={`url(#${id})`} />
  </svg>;
}

export function FloatingSparks() {
  const id = useId().replace(/:/g, "");
  const unit = (n: number) => ((Math.imul(n + 19, 1664525) + 1013904223) >>> 0) / 4294967296;
  const particles = Array.from({ length: 210 }, (_, i) => ({
    x: unit(i * 491) * 1920, y: unit(i * 787 + 209) * 1080,
    r: .5 + unit(i * 887) * 1.8, a: .12 + unit(i * 317) * .43,
  }));
  const sparks = Array.from({ length: 32 }, (_, i) => ({
    x: unit(i * 1949 + 328) * 1920, y: unit(i * 1229 + 821) * 1080,
    length: 4 + unit(i * 233 + 93) * 13,
  })).filter(({ x, y }) => !(x > 350 && x < 700 && y < 460));
  return <svg data-matrix-sparks viewBox="0 0 1920 1080" className="h-full w-full" aria-hidden>
    <defs><filter id={id} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.4" /></filter></defs>
    {particles.map(({x,y,r,a},i) => <path key={i} d={`M${x} ${y} l${r * 1.8} ${-r} ${r} ${r * 2} ${-r * 1.7} ${r} Z`} fill={i % 7 === 0 ? "#dd94d0" : "#a963d4"} opacity={a} />)}
    <g filter={`url(#${id})`} stroke="#f79064" strokeWidth="6" opacity=".5">
      {sparks.map(({x,y,length},i) => <path key={i} d={`M${x} ${y} l${length * .36} ${-length}`} />)}
    </g>
    <g strokeLinecap="round">
      {sparks.map(({x,y,length},i) => <path key={i} d={`M${x} ${y} q${length * .12} ${-length * .6} ${length * .4} ${-length}`} fill="none" stroke={i % 3 ? "#f2b896" : "#fff5dd"} strokeWidth={i % 5 === 0 ? "2.8" : "1.3"} opacity={i % 5 === 0 ? ".92" : ".6"} />)}
    </g>
  </svg>;
}
