import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import type { Metadata } from "next";
import BlogThemeSelector from "../blog-theme";
import BlogSocials from "../blog-socials";

// Refresh cached posts periodically so CMS edits show up without a rebuild.
export const revalidate = 60;

export async function generateStaticParams() {
  // Pre-render known posts when the API is reachable at build time; otherwise
  // fall back to on-demand rendering rather than failing the build.
  try {
    const slugs = await getAllSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.frontmatter.title} - Opensox Blog`,
    description: post.frontmatter.description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const date = new Date(post.frontmatter.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <main className="blog-page min-h-screen">
      <article className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="text-sm blog-link transition-colors"
          >
            &larr; Blog
          </Link>
          <BlogThemeSelector />
        </div>

        <header className="mt-8 mb-10">
          <h1 className="blog-heading">
            {post.frontmatter.title}
          </h1>
          <div className="flex items-center gap-3 mt-4 text-sm blog-text-muted">
            <span>{post.frontmatter.author}</span>
            <span>&middot;</span>
            <time>{date}</time>
          </div>
        </header>

        <div
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <div className="mt-12 pt-8 border-t blog-border">
          <BlogSocials />
        </div>
      </article>
    </main>
  );
}
