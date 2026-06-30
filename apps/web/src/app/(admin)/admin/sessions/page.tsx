"use client";

import { useState } from "react";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { trpc } from "@/lib/trpc";

import {
  SessionForm,
  formatTopicsText,
  toDatetimeLocalValue,
  type SessionFormSubmitValues,
  type SessionFormValues,
} from "./_components/SessionForm";

type AdminSessionTopic = {
  id: string;
  timestamp: string;
  topic: string;
  order: number;
};

type AdminSession = {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  sessionDate: Date;
  topics: AdminSessionTopic[];
};

type View =
  | { mode: "list" }
  | { mode: "create" }
  | { mode: "edit"; session: AdminSession };

function toFormValues(session: AdminSession): SessionFormValues {
  return {
    title: session.title,
    description: session.description ?? "",
    youtubeUrl: session.youtubeUrl,
    sessionDate: toDatetimeLocalValue(session.sessionDate),
    topicsText: formatTopicsText(session.topics),
  };
}

function formatSessionDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const SessionsCmsPage = (): JSX.Element => {
  const { status } = useSession();
  const [view, setView] = useState<View>({ mode: "list" });

  const authenticated = status === "authenticated";

  const { data: isAdmin, isLoading: adminCheckLoading } =
    trpc.sessions.isAdmin.useQuery(undefined, { enabled: authenticated });

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
            <h1 className="text-2xl font-bold text-text-primary">
              Pro Recordings CMS
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Add, edit, and remove session recordings shown to Pro members.
            </p>
          </div>
          {view.mode === "list" ? (
            <button
              type="button"
              onClick={() => setView({ mode: "create" })}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple/90 text-text-primary text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New recording
            </button>
          ) : null}
        </div>

        {view.mode === "list" ? (
          <SessionList
            onCreate={() => setView({ mode: "create" })}
            onEdit={(session) => setView({ mode: "edit", session })}
          />
        ) : (
          <SessionEditor
            view={view}
            onDone={() => setView({ mode: "list" })}
          />
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

function SessionList({
  onCreate,
  onEdit,
}: {
  onCreate: () => void;
  onEdit: (session: AdminSession) => void;
}): JSX.Element {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.sessions.adminList.useQuery();
  const deleteSession = trpc.sessions.adminDelete.useMutation({
    onSuccess: () => utils.sessions.adminList.invalidate(),
    onError: (error) =>
      window.alert(`Couldn't delete the recording: ${error.message}`),
  });

  const sessions = (data ?? []) as AdminSession[];

  if (isLoading) {
    return <p className="text-text-secondary">Loading recordings...</p>;
  }

  if (sessions.length === 0) {
    return (
      <div className="border border-dash-border rounded-xl p-10 text-center">
        <p className="text-text-secondary">No recordings yet.</p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 text-brand-purple-light hover:underline text-sm"
        >
          Add your first recording
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="bg-dash-surface border border-dash-border rounded-xl p-4 flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-purple-light bg-brand-purple/10 rounded-full px-2 py-0.5">
                {formatSessionDate(session.sessionDate)}
              </span>
              <span className="text-text-muted text-xs">
                {session.topics.length} topic
                {session.topics.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-text-primary font-medium mt-1.5 truncate">
              {session.title}
            </p>
            <p className="text-text-muted text-xs mt-0.5 truncate">
              {session.youtubeUrl}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(session)}
              aria-label={`Edit ${session.title}`}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-dash-raised hover:bg-dash-hover transition-colors"
            >
              <Pencil className="w-4 h-4 text-text-secondary" />
            </button>
            <button
              type="button"
              disabled={
                deleteSession.isPending &&
                deleteSession.variables?.id === session.id
              }
              onClick={() => {
                if (
                  window.confirm(
                    `Delete "${session.title}"? This can't be undone.`
                  )
                ) {
                  deleteSession.mutate({ id: session.id });
                }
              }}
              aria-label={`Delete ${session.title}`}
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

function SessionEditor({
  view,
  onDone,
}: {
  view: { mode: "create" } | { mode: "edit"; session: AdminSession };
  onDone: () => void;
}): JSX.Element {
  const utils = trpc.useUtils();
  const [error, setError] = useState<string | null>(null);

  const onSuccess = () => {
    utils.sessions.adminList.invalidate();
    onDone();
  };

  const createSession = trpc.sessions.adminCreate.useMutation({
    onSuccess,
    onError: (e) => setError(e.message),
  });
  const updateSession = trpc.sessions.adminUpdate.useMutation({
    onSuccess,
    onError: (e) => setError(e.message),
  });

  const isSubmitting = createSession.isPending || updateSession.isPending;

  const handleSubmit = (values: SessionFormSubmitValues) => {
    setError(null);
    const payload = {
      title: values.title,
      description: values.description || undefined,
      youtubeUrl: values.youtubeUrl,
      sessionDate: new Date(values.sessionDate),
      topics: values.topics,
    };

    if (view.mode === "edit") {
      updateSession.mutate({ id: view.session.id, data: payload });
    } else {
      createSession.mutate(payload);
    }
  };

  return (
    <div className="bg-dash-surface border border-dash-border rounded-xl p-5 md:p-6">
      <h2 className="text-text-primary font-semibold text-lg mb-5">
        {view.mode === "edit" ? "Edit recording" : "New recording"}
      </h2>

      {error ? (
        <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}

      <SessionForm
        initialValues={
          view.mode === "edit" ? toFormValues(view.session) : undefined
        }
        submitLabel={
          view.mode === "edit" ? "Save changes" : "Create recording"
        }
        isSubmitting={isSubmitting}
        onSubmitAction={handleSubmit}
        onCancelAction={onDone}
      />
    </div>
  );
}

export default SessionsCmsPage;
