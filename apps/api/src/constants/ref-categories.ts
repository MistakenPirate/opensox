export const REF_CATEGORIES = [
  "software",
  "ai",
  "ui",
  "open_source",
  "content",
  "problem_solving",
  "life",
  "misc",
] as const;

export type RefCategory = (typeof REF_CATEGORIES)[number];
