import type { Draft, TitleKind } from "../types";

export function displayTitle(draft: Draft, titleKind: TitleKind = "operator"): string {
  if (titleKind === "stage" || titleKind === "operation" || titleKind === "theme") return draft.title.trim();
  return draft.title.trim() || draft.operatorName.trim();
}

export function displaySubtitle(draft: Draft): string {
  return draft.subtitle.trim();
}
