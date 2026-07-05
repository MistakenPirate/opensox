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
  // Don't take the whole /blog page down if the API is unreachable on a cold
  // render; fall back to an empty list. (On revalidation Next keeps serving the
  // last good cache, so this only guards the uncached path.)
  let posts: Awaited<ReturnType<typeof getAllPosts>> = [];
  try {
    posts = await getAllPosts();
  } catch (error) {
    console.error("Failed to load blog posts:", error);
  }

  return <BlogList posts={posts} />;
}
