export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header placeholder */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div
            className="h-8 w-48 rounded-lg animate-pulse"
            style={{ backgroundColor: 'var(--casa-border)' }}
          />
          <div
            className="h-4 w-32 rounded animate-pulse"
            style={{ backgroundColor: 'var(--casa-border)' }}
          />
        </div>
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-xl animate-pulse"
            style={{ backgroundColor: 'var(--casa-border)' }}
          />
        ))}
      </div>
    </div>
  )
}
