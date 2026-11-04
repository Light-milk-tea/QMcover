export const IMAGE_FILE_ACCEPT = "image/png,image/jpeg,image/webp";

/** 封面只有 1920×1080，留出放大裁切的余量即可。 */
const UPLOAD_MAX_SIDE = 2560;
const UPLOAD_KEEP_BYTES = 1.5 * 1024 * 1024;
const UPLOAD_WEBP_QUALITY = 0.92;

export function imageFileLabel(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").trim();
  return base || "上传图";
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
}

export async function readImageAsDataUrl(file: File): Promise<string> {
  const original = await readFileAsDataUrl(file);
  const image = new Image();
  image.src = original;
  try {
    await image.decode();
  } catch {
    return original;
  }
  const scale = Math.min(1, UPLOAD_MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  if (scale === 1 && file.size <= UPLOAD_KEEP_BYTES) return original;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return original;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const webp = canvas.toDataURL("image/webp", UPLOAD_WEBP_QUALITY);
  const compressed = webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
  return scale < 1 || compressed.length < original.length ? compressed : original;
}
