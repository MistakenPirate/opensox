export type SessionTopicInput = {
  timestamp: string;
  topic: string;
};

const TOPIC_LINE_PATTERN =
  /^(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]?\s*(.+)$/;

/** absent timestamp in the topic data contract (distinct from a valid 0:00) */
export const NO_TOPIC_TIMESTAMP = "";

export function hasTopicTimestamp(timestamp: string): boolean {
  return timestamp.trim().length > 0;
}

export function formatTopicLine(timestamp: string, topic: string): string {
  const trimmedTopic = topic.trim();
  const trimmedTimestamp = timestamp.trim();
  if (!trimmedTopic) return "";
  if (!hasTopicTimestamp(trimmedTimestamp)) return trimmedTopic;
  return `${trimmedTimestamp} ${trimmedTopic}`;
}

export function parseTopicLine(line: string): SessionTopicInput | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const match = trimmed.match(TOPIC_LINE_PATTERN);
  if (match) {
    return { timestamp: match[1], topic: match[2].trim() };
  }

  return { timestamp: NO_TOPIC_TIMESTAMP, topic: trimmed };
}

export function formatTopicsText(
  topics: { timestamp: string; topic: string }[]
): string {
  return topics
    .map((t) => {
      const timestamp = hasTopicTimestamp(t.timestamp)
        ? t.timestamp
        : NO_TOPIC_TIMESTAMP;
      return formatTopicLine(timestamp, t.topic);
    })
    .filter(Boolean)
    .join("\n");
}

export function parseTopicsText(text: string): SessionTopicInput[] {
  return text
    .split("\n")
    .map(parseTopicLine)
    .filter((t): t is SessionTopicInput => t !== null);
}
