import type { BlogTag, Prisma, PrismaClient } from "@prisma/client";
import type { ExtendedPrismaClient } from "../prisma.js";

type Db = ExtendedPrismaClient | PrismaClient;

// Listing metadata for the public blog index. Deliberately omits `content` so
// the full markdown body isn't shipped for every card on the list page.
const PUBLIC_LIST_SELECT = {
  slug: true,
  title: true,
  description: true,
  author: true,
  tag: true,
  tweetUrl: true,
  date: true,
} satisfies Prisma.BlogPostSelect;

export type PublicBlogMeta = Prisma.BlogPostGetPayload<{
  select: typeof PUBLIC_LIST_SELECT;
}>;

export type BlogInput = {
  slug: string;
  title: string;
  description: string;
  author: string;
  tag: BlogTag;
  content: string;
  tweetUrl?: string | null | undefined;
  draft: boolean;
  date: Date;
};

export const blogService = {
  // --- Public reads (no auth; the blog is public) ---

  /**
   * Published posts, newest first, for the public index. Drafts are hidden.
   */
  async listPublished(db: Db): Promise<PublicBlogMeta[]> {
    return db.blogPost.findMany({
      where: { draft: false },
      select: PUBLIC_LIST_SELECT,
      orderBy: { date: "desc" },
    });
  },

  /**
   * A single published post including its markdown body. Returns null for a
   * missing or draft slug so the caller can 404.
   */
  async getPublishedBySlug(db: Db, slug: string) {
    const post = await db.blogPost.findUnique({ where: { slug } });
    if (!post || post.draft) return null;
    return post;
  },

  // --- Admin CMS (gated by adminProcedure in the router) ---

  /** Full list including drafts and content, for the CMS. */
  async listAllForAdmin(db: Db) {
    return db.blogPost.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
  },

  async createPost(db: Db, input: BlogInput) {
    return db.blogPost.create({ data: toData(input) });
  },

  async updatePost(db: Db, id: string, input: BlogInput) {
    return db.blogPost.update({ where: { id }, data: toData(input) });
  },

  async deletePost(db: Db, id: string) {
    await db.blogPost.delete({ where: { id } });
    return { id };
  },
};

function toData(input: BlogInput): Prisma.BlogPostUncheckedCreateInput {
  return {
    slug: input.slug,
    title: input.title,
    description: input.description,
    author: input.author,
    tag: input.tag,
    content: input.content,
    tweetUrl: input.tweetUrl ?? null,
    draft: input.draft,
    date: input.date,
  };
}
