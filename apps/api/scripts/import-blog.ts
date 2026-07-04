/**
 * One-off migration: import the file-based blog posts (apps/web/src/content/blog
 * *.mdx) into the BlogPost table. Idempotent — upserts by slug, so re-running
 * refreshes existing rows instead of duplicating them. The MDX files are kept
 * as the import source / backup; the app reads from the DB after this runs.
 *
 * Usage:
 *   pnpm --filter api import:blog
 *   (from repo root)  pnpm --filter api import:blog
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { PrismaClient, type BlogTag } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const here = path.dirname(fileURLToPath(import.meta.url)); // apps/api/scripts
const BLOG_DIR = path.resolve(here, "../../web/src/content/blog");

const VALID_TAGS: BlogTag[] = [
  "engineering",
  "startup",
  "distribution",
  "misc",
];

async function main(): Promise<void> {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`Blog content directory not found: ${BLOG_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  if (files.length === 0) {
    console.log("No .mdx files found — nothing to import.");
    return;
  }

  let imported = 0;
  const skipped: string[] = [];

  for (const filename of files) {
    const slug = filename.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
    const { data, content } = matter(raw);

    const tag = data.tag as BlogTag;
    if (!VALID_TAGS.includes(tag)) {
      skipped.push(`${filename} (unknown tag "${data.tag}")`);
      continue;
    }

    const date = new Date(data.date);
    if (Number.isNaN(date.getTime())) {
      skipped.push(`${filename} (invalid date "${data.date}")`);
      continue;
    }

    const fields = {
      title: String(data.title ?? ""),
      description: String(data.description ?? ""),
      author: String(data.author ?? ""),
      tag,
      content,
      tweetUrl: data.tweetUrl ? String(data.tweetUrl) : null,
      draft: Boolean(data.draft ?? false),
      date,
    };

    await prisma.blogPost.upsert({
      where: { slug },
      create: { slug, ...fields },
      update: fields,
    });
    imported++;
    console.log(`  ✓ ${slug}`);
  }

  console.log(`\nImported/updated ${imported} post(s).`);
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length}:`);
    for (const s of skipped) console.log(`  - ${s}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
