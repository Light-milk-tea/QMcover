import { useEffect, useMemo, useState } from "react";

/** 国内优先。官方 cdn.jsdelivr.net 经常握手成功但大图一直挂着。 */
export const CDN_HOSTS = [
  "https://gcore.jsdelivr.net/gh",
  "https://cdn.jsdmirror.com/gh",
  "https://cdn.jsdmirror.cn/gh",
  "https://testingcf.jsdelivr.net/gh",
  "https://cdn.jsdelivr.net/gh",
] as const;

export const ART_REPO = "yuanyan3060/ArknightsGameResource@main";
export const AVG_REPO = "Aceship/Arknight-Images@main";

const STORAGE_KEY = "qmcover-cdn-host";
const PROBE_PATH = `${ART_REPO}/avatar/char_002_amiya.png`;
const EVENT = "qmcover-cdn";
const PROBE_MS = 4000;

function readStoredHost(): string | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value && (CDN_HOSTS as readonly string[]).includes(value) ? value : null;
  } catch {
    return null;
  }
}

let currentHost = readStoredHost() ?? CDN_HOSTS[0];

export function getGhHost(): string {
  return currentHost;
}

export function artBase(): string {
  return `${currentHost}/${ART_REPO}`;
}

export function avgBackgroundBase(): string {
  return `${currentHost}/${AVG_REPO}/avg/backgrounds`;
}

export function rewriteGhUrl(url: string, host = currentHost): string {
  if (!url || url.startsWith("data:")) return url;
  if (!url.includes("/gh/")) return url;
  return url.replace(/^https:\/\/[^/]+\/gh/, host);
}

export function ghMirrors(url: string): string[] {
  if (!url || url.startsWith("data:") || !url.includes("/gh/")) return url ? [url] : [];
  const start = CDN_HOSTS.indexOf(currentHost as (typeof CDN_HOSTS)[number]);
  const ordered =
    start > 0 ? [...CDN_HOSTS.slice(start), ...CDN_HOSTS.slice(0, start)] : [...CDN_HOSTS];
  return ordered.map((host) => rewriteGhUrl(url, host));
}

function setHost(host: string, persist: boolean) {
  if (host === currentHost) return;
  currentHost = host;
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, host);
    } catch {
      /* ignore */
    }
  }
  window.dispatchEvent(new Event(EVENT));
}

export function rememberHostFromUrl(url: string): void {
  const host = CDN_HOSTS.find((item) => url.startsWith(`${item}/`));
  if (host) setHost(host, true);
}

function probeHost(host: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = window.setTimeout(() => {
      img.src = "";
      reject(new Error("timeout"));
    }, timeoutMs);
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(host);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("image"));
    };
    img.src = `${host}/${PROBE_PATH}`;
  });
}

export function initCdn(): void {
  const race = CDN_HOSTS.filter((host) => host !== "https://cdn.jsdelivr.net/gh");
  void Promise.any(race.map((host) => probeHost(host, PROBE_MS)))
    .then((host) => setHost(host, true))
    .catch(() => undefined);
}

export function useCdnHost(): string {
  const [host, set] = useState(getGhHost);
  useEffect(() => {
    const sync = () => set(getGhHost());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return host;
}

const loadedSrcs = new Set<string>();

function alreadyLoaded(url: string, mirrors: string[]): boolean {
  if (loadedSrcs.has(url)) return true;
  return mirrors.some((item) => loadedSrcs.has(item));
}

export function useCdnSrc(url: string) {
  const mirrors = useMemo(() => ghMirrors(url), [url]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(() => Boolean(url) && !alreadyLoaded(url, ghMirrors(url)));
  const [failed, setFailed] = useState(false);
  const src = mirrors[Math.min(index, Math.max(mirrors.length - 1, 0))] || url;

  useEffect(() => {
    setIndex(0);
    setLoading(Boolean(url) && !alreadyLoaded(url, mirrors));
    setFailed(false);
  }, [url, mirrors]);

  useEffect(() => {
    if (index < mirrors.length) return;
    setFailed(true);
    setLoading(false);
  }, [index, mirrors.length]);

  useEffect(() => {
    if (!loading || !src || src.startsWith("data:")) return;
    const timer = window.setTimeout(() => {
      setIndex((cur) => cur + 1);
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [src, loading]);

  return {
    src,
    loading,
    failed,
    onLoad: () => {
      loadedSrcs.add(src);
      if (url) loadedSrcs.add(url);
      setLoading(false);
      setFailed(false);
      rememberHostFromUrl(src);
    },
    onError: () => {
      if (index + 1 < mirrors.length) {
        setIndex(index + 1);
        return;
      }
      setFailed(true);
      setLoading(false);
    },
  };
}
