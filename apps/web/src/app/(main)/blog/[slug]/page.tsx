import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import type { Metadata } from "next";
import BlogThemeSelector from "../blog-theme";
import BlogSocials from "../blog-socials";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
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
  const post = getPostBySlug(slug);
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
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-sm blog-link transition-colors"
            >
              &larr; Blog
            </Link>
            <Link
              href="/dashboard/home"
              className="text-sm blog-link transition-colors"
            >
              Dashboard
            </Link>
          </div>
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
