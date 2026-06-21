"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { useSubscription } from "@/hooks/useSubscription";
import { trpc } from "@/lib/trpc";

import { RefItem } from "./_components/RefItem";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type ProRef,
  type RefCategory,
} from "./_components/ref-types";

type CategoryFilter = "all" | RefCategory;

const PAGE_SIZE = 20;

const ProRefsPage = (): JSX.Element | null => {
  const { isPaidUser, isLoading: subscriptionLoading } = useSubscription();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!subscriptionLoading && !isPaidUser) {
      router.push("/pricing");
    }
  }, [isPaidUser, subscriptionLoading, router]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  const authenticated = !!session?.user && status === "authenticated";

  const { data, isLoading, isError } = trpc.refs.list.useQuery(
    {
      search: debouncedSearch || undefined,
      category: category === "all" ? undefined : category,
      page,
      pageSize: PAGE_SIZE,
    },
    {
      enabled: authenticated && isPaidUser,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    }
  );

  const refs = (data?.items ?? []) as ProRef[];
  const totalPages = data?.totalPages ?? 1;

  const isInitialLoading =
    subscriptionLoading || (isPaidUser && isLoading && !data);

  if (isInitialLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-ox-content">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading references...</p>
        </div>
      </div>
    );
  }

  if (!isPaidUser) {
    return null;
  }

  return (
    <div className="w-full min-h-full bg-ox-content">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Pro References
          </h1>
          <p className="text-text-secondary text-sm md:text-base mt-2">
            The best hand-picked resources from across the internet.
          </p>
        </div>

        <RefsContent
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          refs={refs}
          isError={isError}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

type RefsContentProps = {
  search: string;
  onSearchChange: (value: string) => void;
  category: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
  refs: ProRef[];
  isError: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function RefsContent({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  refs,
  isError,
  page,
  totalPages,
  onPageChange,
}: RefsContentProps): JSX.Element {
  const tabs: { value: CategoryFilter; label: string }[] = useMemo(
    () => [
      { value: "all", label: "All" },
      ...CATEGORY_ORDER.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
    ],
    []
  );

  return (
    <>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={category === tab.value}
              onClick={() => onCategoryChange(tab.value)}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 ${
                category === tab.value
                  ? "bg-brand-purple text-text-primary"
                  : "bg-dash-surface text-text-secondary hover:bg-dash-hover border border-dash-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search references"
            placeholder="Search..."
            className="w-full bg-dash-surface border border-dash-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-brand-purple/50 focus-visible:outline-none"
          />
        </div>
      </div>

      {isError ? (
        <p className="text-text-secondary text-center py-16">
          Failed to load references. Please try again later.
        </p>
      ) : refs.length > 0 ? (
        <>
          <div className="space-y-2">
            {refs.map((ref) => (
              <RefItem key={ref.id} item={ref} />
            ))}
          </div>

          {totalPages > 1 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          ) : null}
        </>
      ) : (
        <p className="text-text-secondary text-center py-16">
          No references found.
        </p>
      )}
    </>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}): JSX.Element {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-dash-surface border border-dash-border text-text-secondary hover:bg-dash-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="text-text-secondary text-sm px-2">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-dash-surface border border-dash-border text-text-secondary hover:bg-dash-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default ProRefsPage;
