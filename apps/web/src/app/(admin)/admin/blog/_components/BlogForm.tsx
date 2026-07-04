"use client";

import { useState } from "react";

import type { BlogTag } from "@/lib/blog";

export type BlogFormValues = {
  slug: string;
  title: string;
  description: string;
  author: string;
  tag: BlogTag;
  date: string; // yyyy-mm-dd
  draft: boolean;
  tweetUrl: string;
  content: string;
};

const TAGS: BlogTag[] = ["engineering", "startup", "distribution", "misc"];

type BlogFormProps = {
  initialValues?: BlogFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmitAction: (values: BlogFormValues) => void;
  onCancelAction: () => void;
};

const EMPTY: BlogFormValues = {
  slug: "",
  title: "",
  description: "",
  author: "",
  tag: "engineering",
  date: "",
  draft: false,
  tweetUrl: "",
  content: "",
};

const inputClass =
  "w-full bg-dash-base border border-dash-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-brand-purple/50 focus-visible:outline-none";

// Loose slugify so authors can type a title and get a usable slug to tweak.
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BlogForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmitAction,
  onCancelAction,
}: BlogFormProps): JSX.Element {
  const [values, setValues] = useState<BlogFormValues>(initialValues ?? EMPTY);
  // Only auto-fill the slug from the title while creating and untouched.
  const [slugTouched, setSlugTouched] = useState<boolean>(
    Boolean(initialValues?.slug)
  );

  const update = <K extends keyof BlogFormValues>(
    key: K,
    value: BlogFormValues[K]
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleTitleChange = (title: string) => {
    setValues((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : slugify(title),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitAction({
      ...values,
      slug: values.slug.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      author: values.author.trim(),
      tweetUrl: values.tweetUrl.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="blog-title"
          className="block text-sm text-text-secondary mb-1.5"
        >
          Title
        </label>
        <input
          id="blog-title"
          className={inputClass}
          value={values.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
        />
      </div>

      <div>
        <label
          htmlFor="blog-slug"
          className="block text-sm text-text-secondary mb-1.5"
        >
          Slug
        </label>
        <input
          id="blog-slug"
          className={inputClass}
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true);
            update("slug", e.target.value);
          }}
          placeholder="my-post-title"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          title="Lowercase letters, numbers, and single hyphens"
          required
        />
        <p className="text-text-muted text-xs mt-1">
          The post URL will be /blog/{values.slug || "your-slug"}
        </p>
      </div>

      <div>
        <label
          htmlFor="blog-description"
          className="block text-sm text-text-secondary mb-1.5"
        >
          Description
        </label>
        <textarea
          id="blog-description"
          className={`${inputClass} min-h-[64px] resize-y`}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="blog-author"
            className="block text-sm text-text-secondary mb-1.5"
          >
            Author
          </label>
          <input
            id="blog-author"
            className={inputClass}
            value={values.author}
            onChange={(e) => update("author", e.target.value)}
            required
          />
        </div>

        <div>
          <label
            htmlFor="blog-tag"
            className="block text-sm text-text-secondary mb-1.5"
          >
            Tag
          </label>
          <select
            id="blog-tag"
            className={`${inputClass} capitalize`}
            value={values.tag}
            onChange={(e) => update("tag", e.target.value as BlogTag)}
          >
            {TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="blog-date"
            className="block text-sm text-text-secondary mb-1.5"
          >
            Publish date
          </label>
          <input
            id="blog-date"
            type="date"
            className={inputClass}
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="blog-tweet-url"
          className="block text-sm text-text-secondary mb-1.5"
        >
          Tweet URL <span className="text-text-muted">(optional)</span>
        </label>
        <input
          id="blog-tweet-url"
          className={inputClass}
          value={values.tweetUrl}
          onChange={(e) => update("tweetUrl", e.target.value)}
          placeholder="https://x.com/..."
        />
      </div>

      <div>
        <label
          htmlFor="blog-content"
          className="block text-sm text-text-secondary mb-1.5"
        >
          Content <span className="text-text-muted">(Markdown)</span>
        </label>
        <textarea
          id="blog-content"
          className={`${inputClass} min-h-[320px] resize-y font-mono`}
          value={values.content}
          onChange={(e) => update("content", e.target.value)}
          placeholder={"## Heading\n\nWrite your post in Markdown..."}
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={values.draft}
          onChange={(e) => update("draft", e.target.checked)}
          className="w-4 h-4 rounded border-dash-border bg-dash-base accent-brand-purple"
        />
        Save as draft (hidden from the public blog)
      </label>

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
