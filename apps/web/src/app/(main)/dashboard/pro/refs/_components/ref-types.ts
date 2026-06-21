export type RefCategory =
  | "software"
  | "ai"
  | "ui"
  | "open_source"
  | "content"
  | "problem_solving"
  | "life"
  | "misc";

export interface ProRef {
  id: string;
  category: RefCategory;
  text: string;
  url: string;
  order: number;
  createdAt: Date;
}

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
