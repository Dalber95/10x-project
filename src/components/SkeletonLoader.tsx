import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonLoader() {
  return (
    <div className="space-y-4" role="status" aria-label="Ładowanie propozycji fiszek">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>

      {[1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className="border rounded-lg p-6 space-y-4 bg-card"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-20 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-32 w-full" />
          </div>

          <div className="flex gap-2 justify-end">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      ))}

      <span className="sr-only">Generowanie fiszek, proszę czekać...</span>
    </div>
  );
}

