import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { serverTrpc } from "@/lib/trpc-server";

function hardenExternalLinkRel(attrs: string): string {
  if (!/\brel\s*=/i.test(attrs)) {
    return `${attrs} rel="noopener noreferrer"`;
  }

  return attrs.replace(/\brel="([^"]*)"/i, (_match, rel: string) => {
    const tokens = new Set(
      rel
        .trim()
        .split(/\s+/)
        .filter((token: string) => token.length > 0)
    );
    tokens.add("noopener");
    tokens.add("noreferrer");
    return `rel="${[...tokens].join(" ")}"`;
  });
}

function withExternalLinkTargets(html: string): string {
  return html.replace(/<a\b([^>]*)>/gi, (full, attrs) => {
    const href = attrs.match(/\bhref="([^"]*)"/i)?.[1];
    if (!href) return full;

    const isExternal =
      /^https?:\/\//i.test(href) || href.startsWith("//");
    if (!isExternal) return full;

    let next = hardenExternalLinkRel(attrs.trim());
    if (!/\btarget\s*=/i.test(next)) {
      next += ' target="_blank"';
    }
    return `<a ${next}>`;
  });
}

// Markdown body -> sanitized, link-hardened HTML. Unchanged from when posts
// lived on disk; only the source of the markdown moved to the database.
function renderMarkdown(markdown: string): string {
  const rawHtml = marked.parse(markdown) as string;
  const safeHtml = sanitizeHtml(rawHtml, {
    allowedTags: (sanitizeHtml as any).defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...(sanitizeHtml as any).defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
    },
  });
  return withExternalLinkTargets(safeHtml);
}

export type BlogTag = "engineering" | "startup" | "distribution" | "misc";

export interface BlogFrontmatter {
  title: string;
  date: string;
  description: string;
  author: string;
  tag: BlogTag;
  tweetUrl?: string;
  draft?: boolean;
}

export interface BlogMeta extends BlogFrontmatter {
  slug: string;
}

// The API returns Date objects (superjson); the UI works in ISO strings.
function toIsoDate(date: Date | string): string {
  return typeof date === "string" ? date : date.toISOString();
}

export async function getAllPosts(): Promise<BlogMeta[]> {
  const posts = await serverTrpc.blog.list.query();

  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    author: post.author,
    tag: post.tag,
    tweetUrl: post.tweetUrl ?? undefined,
    date: toIsoDate(post.date),
  }));
}

export async function getPostBySlug(
  slug: string
): Promise<{ frontmatter: BlogFrontmatter; html: string } | null> {
  const post = await serverTrpc.blog.getBySlug.query({ slug });
  if (!post) return null;

  return {
    frontmatter: {
      title: post.title,
      date: toIsoDate(post.date),
      description: post.description,
      author: post.author,
      tag: post.tag,
      tweetUrl: post.tweetUrl ?? undefined,
      draft: post.draft,
    },
    html: renderMarkdown(post.content),
  };
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await serverTrpc.blog.list.query();
  return posts.map((post) => post.slug);
}
