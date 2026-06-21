"use client";

import { useState } from "react";

import { Plus, Trash2 } from "lucide-react";

export type SessionTopicInput = {
  timestamp: string;
  topic: string;
};

export type SessionFormValues = {
  title: string;
  description: string;
  youtubeUrl: string;
  sessionDate: string;
  topics: string[];
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

export type SessionFormSubmitValues = Omit<SessionFormValues, "topics"> & {
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
  topics: [],
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

  const updateTopic = (index: number, value: string) =>
    setValues((prev) => ({
      ...prev,
      topics: prev.topics.map((topic, i) => (i === index ? value : topic)),
    }));

  const addTopic = () =>
    setValues((prev) => ({
      ...prev,
      topics: [...prev.topics, ""],
    }));

  const removeTopic = (index: number) =>
    setValues((prev) => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index),
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitAction({
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      youtubeUrl: values.youtubeUrl.trim(),
      topics: values.topics
        .map(parseTopicLine)
        .filter((t): t is SessionTopicInput => t !== null),
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
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm text-text-secondary">Topics</label>
          <button
            type="button"
            onClick={addTopic}
            className="inline-flex items-center gap-1 text-sm text-brand-purple-light hover:text-text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add topic
          </button>
        </div>

        {values.topics.length === 0 ? (
          <p className="text-text-muted text-sm">No topics added.</p>
        ) : (
          <div className="space-y-2">
            {values.topics.map((topic, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className={`${inputClass} flex-1`}
                  value={topic}
                  onChange={(e) => updateTopic(index, e.target.value)}
                  placeholder="0:00 Introduction to open source"
                />
                <button
                  type="button"
                  onClick={() => removeTopic(index)}
                  aria-label="Remove topic"
                  className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-dash-raised hover:bg-dash-hover transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
            ))}
          </div>
        )}
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
