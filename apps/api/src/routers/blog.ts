import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { BlogTag } from "@prisma/client";
import {
  router,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  isAdminEmail,
  type ProtectedContext,
} from "../trpc.js";
import { blogService } from "../services/blog.service.js";

// Derived from the Prisma enum so the two can't drift apart.
const tagSchema = z.nativeEnum(BlogTag);

// Blank tweet URL from the form means "no tweet", not an invalid URL.
const tweetUrlSchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .pipe(z.string().url("Tweet URL must be a valid URL").optional());

const blogInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    // Goes straight into the /blog/[slug] URL, so keep it URL-safe.
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug may only contain lowercase letters, numbers, and single hyphens"
    ),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  author: z.string().trim().min(1, "Author is required"),
  tag: tagSchema,
  content: z.string().min(1, "Content is required"),
  tweetUrl: tweetUrlSchema.optional(),
  draft: z.boolean().optional().default(false),
  date: z.coerce.date(),
});

function normalizeInput(input: z.infer<typeof blogInputSchema>) {
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

// A duplicate slug is a user error (two posts can't share a URL), so surface it
// as a clean CONFLICT rather than an opaque 500.
function toTRPCError(error: unknown): never {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  ) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "A post with that slug already exists",
    });
  }
  throw error;
}

export const blogRouter = router({
  // Public: the blog index and post pages read through these, no auth.
  list: publicProcedure.query(async ({ ctx }) => {
    return blogService.listPublished(ctx.db.prisma);
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return blogService.getPublishedBySlug(ctx.db.prisma, input.slug);
    }),

  // Lets the CMS UI decide whether to render. Real protection is on the admin
  // mutations below, not here.
  isAdmin: protectedProcedure.query(({ ctx }) => {
    return isAdminEmail((ctx as ProtectedContext).user.email);
  }),

  adminList: adminProcedure.query(async ({ ctx }) => {
    return blogService.listAllForAdmin(ctx.db.prisma);
  }),

  adminCreate: adminProcedure
    .input(blogInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await blogService.createPost(ctx.db.prisma, normalizeInput(input));
      } catch (error) {
        toTRPCError(error);
      }
    }),

  adminUpdate: adminProcedure
    .input(z.object({ id: z.string().min(1), data: blogInputSchema }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await blogService.updatePost(
          ctx.db.prisma,
          input.id,
          normalizeInput(input.data)
        );
      } catch (error) {
        toTRPCError(error);
      }
    }),

  adminDelete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return blogService.deletePost(ctx.db.prisma, input.id);
    }),
});
