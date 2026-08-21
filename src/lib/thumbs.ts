import type { TemplateId } from "../types";

export function templateThumbSrc(id: TemplateId): string {
  return `/thumbs/${id}.webp`;
}
