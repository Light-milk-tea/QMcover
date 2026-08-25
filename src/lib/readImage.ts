export const IMAGE_FILE_ACCEPT = "image/png,image/jpeg,image/webp";

export function imageFileLabel(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").trim();
  return base || "上传图";
}

export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
}
