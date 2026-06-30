"use client";

import { useState } from "react";

export type SessionTopicInput = {
  timestamp: string;
  topic: string;
};

export type SessionFormValues = {
  title: string;
  description: string;
  youtubeUrl: string;
  sessionDate: string;
  topicsText: string;
};

const TOPIC_LINE_PATTERN =
  /^(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]?\s*(.+)$/;

export function formatTopicLine(timestamp: string, topic: string): string {
  const trimmedTopic = topic.trim();
  const trimmedTimestamp = timestamp.trim();
  if (!trimmedTopic) return "";
  if (!trimmedTimestamp) return trimmedTopic;
  return `${trimmedTimestamp} ${trimmedTopic}`;
}

export function parseTopicLine(line: string): SessionTopicInput | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const match = trimmed.match(TOPIC_LINE_PATTERN);
  if (match) {
    return { timestamp: match[1], topic: match[2].trim() };
  }

  return { timestamp: "0:00", topic: trimmed };
}

export function formatTopicsText(
  topics: { timestamp: string; topic: string }[]
): string {
  return topics
    .map((t) => formatTopicLine(t.timestamp, t.topic))
    .filter(Boolean)
    .join("\n");
}

export function parseTopicsText(text: string): SessionTopicInput[] {
  return text
    .split("\n")
    .map(parseTopicLine)
    .filter((t): t is SessionTopicInput => t !== null);
}

export type SessionFormSubmitValues = Omit<SessionFormValues, "topicsText"> & {
  topics: SessionTopicInput[];
};

type SessionFormProps = {
  initialValues?: SessionFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmitAction: (values: SessionFormSubmitValues) => void;
  onCancelAction: () => void;
};

const EMPTY: SessionFormValues = {
  title: "",
  description: "",
  youtubeUrl: "",
  sessionDate: "",
  topicsText: "",
};

const inputClass =
  "w-full bg-dash-base border border-dash-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-brand-purple/50 focus-visible:outline-none";

export function SessionForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmitAction,
  onCancelAction,
}: SessionFormProps): JSX.Element {
  const [values, setValues] = useState<SessionFormValues>(
    initialValues ?? EMPTY
  );

  const update = <K extends keyof SessionFormValues>(
    key: K,
    value: SessionFormValues[K]
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitAction({
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      youtubeUrl: values.youtubeUrl.trim(),
      topics: parseTopicsText(values.topicsText),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="session-title"
          className="block text-sm text-text-secondary mb-1.5"
        >
          Title
        </label>
        <input
          id="session-title"
          className={inputClass}
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
      </div>

      <div>
        <label
          htmlFor="session-description"
          className="block text-sm text-text-secondary mb-1.5"
        >
          Description
        </label>
        <textarea
          id="session-description"
          className={`${inputClass} min-h-[80px] resize-y`}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="session-youtube-url"
            className="block text-sm text-text-secondary mb-1.5"
          >
            YouTube URL
          </label>
          <input
            id="session-youtube-url"
            type="url"
            className={inputClass}
            value={values.youtubeUrl}
            onChange={(e) => update("youtubeUrl", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
        </div>

        <div>
          <label
            htmlFor="session-date"
            className="block text-sm text-text-secondary mb-1.5"
          >
            Session date
          </label>
          <input
            id="session-date"
            type="datetime-local"
            className={inputClass}
            value={values.sessionDate}
            onChange={(e) => update("sessionDate", e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="session-topics"
          className="block text-sm text-text-secondary mb-1.5"
        >
          Topics
        </label>
        <textarea
          id="session-topics"
          className={`${inputClass} min-h-[160px] resize-y font-mono`}
          value={values.topicsText}
          onChange={(e) => update("topicsText", e.target.value)}
          placeholder={
            "0:00 Introduction to open source\n3:15 How to choose the right project\n8:00 Live debugging session"
          }
        />
        <p className="mt-1.5 text-text-muted text-xs">
          One topic per line. Optional timestamp at the start (e.g.{" "}
          <span className="font-mono">0:00</span> or{" "}
          <span className="font-mono">12:30</span>).
        </p>
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

export function toDatetimeLocalValue(date: Date): string {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}
