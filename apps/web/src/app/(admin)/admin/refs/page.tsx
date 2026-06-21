"use client";

import { useState } from "react";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { trpc } from "@/lib/trpc";
import {
  CATEGORY_LABELS,
  type RefCategory,
} from "@/app/(main)/dashboard/pro/refs/_components/ref-types";

import { RefForm, type RefFormValues } from "./_components/RefForm";

type AdminRef = {
  id: string;
  category: RefCategory;
  text: string;
  url: string;
  order: number;
};

type View = { mode: "list" } | { mode: "create" } | { mode: "edit"; ref: AdminRef };

function toFormValues(ref: AdminRef): RefFormValues {
  return {
    category: ref.category,
    text: ref.text,
    url: ref.url,
    order: ref.order,
  };
}

const RefsCmsPage = (): JSX.Element => {
  const { status } = useSession();
  const [view, setView] = useState<View>({ mode: "list" });

  const authenticated = status === "authenticated";

  const {
    data: isAdmin,
    isLoading: adminCheckLoading,
    isError: adminCheckError,
    error: adminCheckErrorData,
  } = trpc.refs.isAdmin.useQuery(undefined, { enabled: authenticated });

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

  if (adminCheckError) {
    return (
      <CenteredMessage>
        <p className="text-text-primary font-semibold text-lg">
          Couldn&apos;t verify admin access
        </p>
        <p className="text-text-secondary text-sm">
          {adminCheckErrorData?.message ??
            "A temporary error occurred. Please try again."}
        </p>
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
            <h1 className="text-2xl font-bold text-text-primary">
              Pro References CMS
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Add, edit, and remove references shown to Pro members.
            </p>
          </div>
          {view.mode === "list" ? (
            <button
              type="button"
              onClick={() => setView({ mode: "create" })}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple/90 text-text-primary text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New reference
            </button>
          ) : null}
        </div>

        {view.mode === "list" ? (
          <RefList
            onCreate={() => setView({ mode: "create" })}
            onEdit={(ref) => setView({ mode: "edit", ref })}
          />
        ) : (
          <RefEditor view={view} onDone={() => setView({ mode: "list" })} />
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

function RefList({
  onCreate,
  onEdit,
}: {
  onCreate: () => void;
  onEdit: (ref: AdminRef) => void;
}): JSX.Element {
  const utils = trpc.useUtils();
  const {
    data,
    isLoading,
    isError,
    error,
  } = trpc.refs.adminList.useQuery();
  const deleteRef = trpc.refs.adminDelete.useMutation({
    onSuccess: () => utils.refs.adminList.invalidate(),
    onError: (error) =>
      window.alert(`Couldn't delete the reference: ${error.message}`),
  });

  const refs = data ?? [];

  if (isError) {
    return (
      <p className="text-text-secondary">
        {error?.message ?? "Failed to load references. Please try again."}
      </p>
    );
  }

  if (isLoading) {
    return <p className="text-text-secondary">Loading references...</p>;
  }

  if (refs.length === 0) {
    return (
      <div className="border border-dash-border rounded-xl p-10 text-center">
        <p className="text-text-secondary">No references yet.</p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 text-brand-purple-light hover:underline text-sm"
        >
          Add your first reference
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {refs.map((ref) => (
        <div
          key={ref.id}
          className="bg-dash-surface border border-dash-border rounded-xl p-4 flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-purple-light bg-brand-purple/10 rounded-full px-2 py-0.5">
                {CATEGORY_LABELS[ref.category]}
              </span>
              <span className="text-text-muted text-xs">#{ref.order}</span>
            </div>
            <p className="text-text-primary font-medium mt-1.5 truncate">
              {ref.text}
            </p>
            <p className="text-text-muted text-xs mt-0.5 truncate">{ref.url}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(ref)}
              aria-label={`Edit ${ref.text}`}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-dash-raised hover:bg-dash-hover transition-colors"
            >
              <Pencil className="w-4 h-4 text-text-secondary" />
            </button>
            <button
              type="button"
              disabled={
                deleteRef.isPending && deleteRef.variables?.id === ref.id
              }
              onClick={() => {
                if (
                  window.confirm(`Delete "${ref.text}"? This can't be undone.`)
                ) {
                  deleteRef.mutate({ id: ref.id });
                }
              }}
              aria-label={`Delete ${ref.text}`}
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

function RefEditor({
  view,
  onDone,
}: {
  view: { mode: "create" } | { mode: "edit"; ref: AdminRef };
  onDone: () => void;
}): JSX.Element {
  const utils = trpc.useUtils();
  const [error, setError] = useState<string | null>(null);

  const onSuccess = () => {
    utils.refs.adminList.invalidate();
    onDone();
  };

  const createRef = trpc.refs.adminCreate.useMutation({
    onSuccess,
    onError: (e) => setError(e.message),
  });
  const updateRef = trpc.refs.adminUpdate.useMutation({
    onSuccess,
    onError: (e) => setError(e.message),
  });

  const isSubmitting = createRef.isPending || updateRef.isPending;

  const handleSubmit = (values: RefFormValues) => {
    setError(null);
    const payload = {
      category: values.category,
      text: values.text,
      url: values.url,
      order: values.order,
    };

    if (view.mode === "edit") {
      updateRef.mutate({ id: view.ref.id, data: payload });
    } else {
      createRef.mutate(payload);
    }
  };

  return (
    <div className="bg-dash-surface border border-dash-border rounded-xl p-5 md:p-6">
      <h2 className="text-text-primary font-semibold text-lg mb-5">
        {view.mode === "edit" ? "Edit reference" : "New reference"}
      </h2>

      {error ? (
        <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}

      <RefForm
        initialValues={view.mode === "edit" ? toFormValues(view.ref) : undefined}
        submitLabel={view.mode === "edit" ? "Save changes" : "Create reference"}
        isSubmitting={isSubmitting}
        onSubmitAction={handleSubmit}
        onCancelAction={onDone}
      />
    </div>
  );
}

export default RefsCmsPage;
