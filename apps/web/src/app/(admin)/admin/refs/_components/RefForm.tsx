"use client";

import { useState } from "react";

import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type RefCategory,
} from "@/app/(main)/dashboard/pro/refs/_components/ref-types";

export type RefFormValues = {
  category: RefCategory;
  text: string;
  url: string;
  order: number;
};

type RefFormProps = {
  initialValues?: RefFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmitAction: (values: RefFormValues) => void;
  onCancelAction: () => void;
};

const EMPTY: RefFormValues = {
  category: "software",
  text: "",
  url: "",
  order: 0,
};

const inputClass =
  "w-full bg-dash-base border border-dash-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-brand-purple/50 focus-visible:outline-none";

export function RefForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmitAction,
  onCancelAction,
}: RefFormProps): JSX.Element {
  const [values, setValues] = useState<RefFormValues>(initialValues ?? EMPTY);

  const update = <K extends keyof RefFormValues>(
    key: K,
    value: RefFormValues[K]
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitAction({
      ...values,
      text: values.text.trim(),
      url: values.url.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="ref-category"
          className="block text-sm text-text-secondary mb-1.5"
        >
          Category
        </label>
        <select
          id="ref-category"
          className={inputClass}
          value={values.category}
          onChange={(e) => update("category", e.target.value as RefCategory)}
        >
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="ref-text"
          className="block text-sm text-text-secondary mb-1.5"
        >
          Text
        </label>
        <input
          id="ref-text"
          className={inputClass}
          value={values.text}
          onChange={(e) => update("text", e.target.value)}
          placeholder="Short description or title"
          required
        />
      </div>

      <div>
        <label
          htmlFor="ref-url"
          className="block text-sm text-text-secondary mb-1.5"
        >
          Link
        </label>
        <input
          id="ref-url"
          type="url"
          className={inputClass}
          value={values.url}
          onChange={(e) => update("url", e.target.value)}
          placeholder="https://..."
          required
        />
      </div>

      <div className="max-w-[8rem]">
        <label
          htmlFor="ref-order"
          className="block text-sm text-text-secondary mb-1.5"
        >
          Sort order
        </label>
        <input
          id="ref-order"
          type="number"
          className={inputClass}
          value={values.order}
          onChange={(e) => update("order", Number(e.target.value) || 0)}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple/90 text-text-primary text-sm font-medium transition-colors disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancelAction}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-dash-surface border border-dash-border text-text-secondary hover:bg-dash-hover text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
