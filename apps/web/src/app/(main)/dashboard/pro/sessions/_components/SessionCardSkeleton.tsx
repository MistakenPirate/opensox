export const SessionCardSkeleton = (): JSX.Element => {
    return (
      <div className="bg-ox-content border border-border rounded-lg p-4 animate-pulse">
        <div className="flex items-start justify-between gap-2">
          <div className="h-5 bg-border rounded w-3/4" />
          <div className="w-8 h-8 rounded-full bg-border flex-shrink-0" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-3 bg-border rounded w-full" />
          <div className="h-3 bg-border rounded w-5/6" />
        </div>
      </div>
    );
  };