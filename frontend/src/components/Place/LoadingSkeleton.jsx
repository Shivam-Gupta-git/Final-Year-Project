export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          {/* Image skeleton */}
          <div className="aspect-[4/3] bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100
                          animate-pulse" />

          {/* Body skeleton */}
          <div className="p-4 flex flex-col gap-3">
            {/* Category badge */}
            <div className="h-5 w-24 rounded-full bg-gray-100 animate-pulse" />

            {/* Title */}
            <div className="h-4 w-3/4 rounded-lg bg-gray-100 animate-pulse" />

            {/* Stars */}
            <div className="flex gap-1">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-3 w-3 rounded bg-gray-100 animate-pulse" />
              ))}
            </div>

            {/* Description lines */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
              <div className="h-3 w-4/5 rounded bg-gray-100 animate-pulse" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-50">
              <div className="h-3 w-20 rounded bg-gray-100 animate-pulse" />
              <div className="h-3 w-12 rounded bg-gray-100 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}