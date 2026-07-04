import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";
import BlogList from "./blog-list";

export const metadata: Metadata = {
  title: "Opensox Blog",
  description: "Thoughts on open source, startups, and building in public.",
};

// Posts come from the database now, so cache the render and refresh it
// periodically instead of baking it in at build time.
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getAllPosts();

  return <BlogList posts={posts} />;
}
