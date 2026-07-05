"use client";

import { useState } from "react";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { trpc } from "@/lib/trpc";
import type { BlogTag } from "@/lib/blog";

import { BlogForm, type BlogFormValues } from "./_components/BlogForm";

type AdminBlogPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  tag: BlogTag;
  content: string;
  tweetUrl: string | null;
  draft: boolean;
  date: string | Date;
};

type View =
  | { mode: "list" }
  | { mode: "create" }
  | { mode: "edit"; post: AdminBlogPost };

function toDateInput(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function toFormValues(post: AdminBlogPost): BlogFormValues {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    author: post.author,
    tag: post.tag,
    date: toDateInput(post.date),
    draft: post.draft,
    tweetUrl: post.tweetUrl ?? "",
    content: post.content,
  };
}

const BlogCmsPage = (): JSX.Element => {
  const { status } = useSession();
  const [view, setView] = useState<View>({ mode: "list" });

  const authenticated = status === "authenticated";

  const { data: isAdmin, isLoading: adminCheckLoading } =
    trpc.blog.isAdmin.useQuery(undefined, { enabled: authenticated });

  if (status === "loading" || (authenticated && adminCheckLoading)) {
    return (
      <CenteredMessage>
        <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </CenteredMessage>
    );
  }

  if (!authenticated) {
    return (
      <CenteredMessage>
        <p className="text-text-secondary">You need to sign in to continue.</p>
        <Link href="/login" className="text-brand-purple-light hover:underline">
          Go to login
        </Link>
      </CenteredMessage>
    );
  }

  if (!isAdmin) {
    return (
      <CenteredMessage>
        <p className="text-text-primary font-semibold text-lg">Access denied</p>
        <p className="text-text-secondary text-sm">
          This area is restricted to administrators.
        </p>
      </CenteredMessage>
    );
  }

  return (
    <div className="min-h-screen bg-ox-content">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Blog CMS</h1>
            <p className="text-text-secondary text-sm mt-1">
              Write, edit, and remove blog posts.
            </p>
          </div>
          {view.mode === "list" ? (
            <button
              type="button"
              onClick={() => setView({ mode: "create" })}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple/90 text-text-primary text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New post
            </button>
          ) : null}
        </div>

        {view.mode === "list" ? (
          <BlogPostList
            onCreate={() => setView({ mode: "create" })}
            onEdit={(post) => setView({ mode: "edit", post })}
          />
        ) : (
          <BlogEditor view={view} onDone={() => setView({ mode: "list" })} />
        )}
      </div>
    </div>
  );
};

function CenteredMessage({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="min-h-screen bg-ox-content flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center px-4">
        {children}
      </div>
    </div>
  );
}

function BlogPostList({
  onCreate,
  onEdit,
}: {
  onCreate: () => void;
  onEdit: (post: AdminBlogPost) => void;
}): JSX.Element {
  const utils = trpc.useUtils();
  const { data, isLoading, isError, error, refetch } =
    trpc.blog.adminList.useQuery();
  const deletePost = trpc.blog.adminDelete.useMutation({
    onSuccess: () => utils.blog.adminList.invalidate(),
    onError: (error) =>
      window.alert(`Couldn't delete the post: ${error.message}`),
  });

  const posts = (data ?? []) as AdminBlogPost[];

  if (isLoading) {
    return <p className="text-text-secondary">Loading posts...</p>;
  }

  // Surface fetch failures before the empty state, so a load error isn't
  // mistaken for "no posts yet".
  if (isError) {
    return (
      <div className="border border-red-500/20 bg-red-500/10 rounded-xl p-6 text-center">
        <p className="text-red-400 text-sm">
          Couldn&apos;t load posts: {error.message}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 text-brand-purple-light hover:underline text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="border border-dash-border rounded-xl p-10 text-center">
        <p className="text-text-secondary">No posts yet.</p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 text-brand-purple-light hover:underline text-sm"
        >
          Write your first post
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-dash-surface border border-dash-border rounded-xl p-4 flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-purple-light bg-brand-purple/10 rounded-full px-2 py-0.5 capitalize">
                {post.tag}
              </span>
              {post.draft ? (
                <span className="text-xs text-amber-400 bg-amber-400/10 rounded-full px-2 py-0.5">
                  Draft
                </span>
              ) : null}
              <span className="text-text-muted text-xs">
                {toDateInput(post.date)}
              </span>
            </div>
            <p className="text-text-primary font-medium mt-1.5 truncate">
              {post.title}
            </p>
            <p className="text-text-muted text-xs mt-0.5 truncate">
              /blog/{post.slug}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(post)}
              aria-label={`Edit ${post.title}`}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-dash-raised hover:bg-dash-hover transition-colors"
            >
              <Pencil className="w-4 h-4 text-text-secondary" />
            </button>
            <button
              type="button"
              disabled={
                deletePost.isPending && deletePost.variables?.id === post.id
              }
              onClick={() => {
                if (
                  window.confirm(`Delete "${post.title}"? This can't be undone.`)
                ) {
                  deletePost.mutate({ id: post.id });
                }
              }}
              aria-label={`Delete ${post.title}`}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-dash-raised hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function BlogEditor({
  view,
  onDone,
}: {
  view: { mode: "create" } | { mode: "edit"; post: AdminBlogPost };
  onDone: () => void;
}): JSX.Element {
  const utils = trpc.useUtils();
  const [error, setError] = useState<string | null>(null);

  const onSuccess = () => {
    utils.blog.adminList.invalidate();
    onDone();
  };

  const createPost = trpc.blog.adminCreate.useMutation({
    onSuccess,
    onError: (e) => setError(e.message),
  });
  const updatePost = trpc.blog.adminUpdate.useMutation({
    onSuccess,
    onError: (e) => setError(e.message),
  });

  const isSubmitting = createPost.isPending || updatePost.isPending;

  const handleSubmit = (values: BlogFormValues) => {
    setError(null);
    const payload = {
      slug: values.slug,
      title: values.title,
      description: values.description,
      author: values.author,
      tag: values.tag,
      content: values.content,
      tweetUrl: values.tweetUrl || undefined,
      draft: values.draft,
      date: values.date,
    };

    if (view.mode === "edit") {
      updatePost.mutate({ id: view.post.id, data: payload });
    } else {
      createPost.mutate(payload);
    }
  };

  return (
    <div className="bg-dash-surface border border-dash-border rounded-xl p-5 md:p-6">
      <h2 className="text-text-primary font-semibold text-lg mb-5">
        {view.mode === "edit" ? "Edit post" : "New post"}
      </h2>

      {error ? (
        <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}

      <BlogForm
        initialValues={
          view.mode === "edit" ? toFormValues(view.post) : undefined
        }
        submitLabel={view.mode === "edit" ? "Save changes" : "Publish post"}
        isSubmitting={isSubmitting}
        onSubmitAction={handleSubmit}
        onCancelAction={onDone}
      />
    </div>
  );
}

export default BlogCmsPage;
