import type { PublicRef } from "../../../../../../../../api/src/services/ref.service";

export type ProRef = PublicRef;
export type RefCategory = PublicRef["category"];

export const CATEGORY_LABELS: Record<RefCategory, string> = {
  software: "Software",
  ai: "AI",
  ui: "UI",
  open_source: "Open Source",
  content: "Content",
  problem_solving: "Problem Solving",
  life: "Life",
  misc: "Misc",
};

export const CATEGORY_ORDER: RefCategory[] = [
  "software",
  "ai",
  "ui",
  "open_source",
  "content",
  "problem_solving",
  "life",
  "misc",
];
