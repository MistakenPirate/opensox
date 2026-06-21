"use client";

import { ExternalLink } from "lucide-react";

import type { ProRef } from "./ref-types";

type RefItemProps = {
  item: ProRef;
};

export function RefItem({ item }: RefItemProps): JSX.Element {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-4 bg-dash-surface border border-dash-border rounded-xl px-4 py-3.5 hover:border-brand-purple/40 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand-purple/50 focus-visible:outline-none"
    >
      <span className="text-text-primary text-sm md:text-base min-w-0 truncate">
        {item.text}
      </span>
      <ExternalLink
        aria-hidden="true"
        className="w-4 h-4 shrink-0 text-text-muted group-hover:text-brand-purple-light transition-colors"
      />
    </a>
  );
}
