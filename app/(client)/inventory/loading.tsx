export default function Loading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div
            className="h-8 w-32 rounded-lg animate-pulse"
            style={{ backgroundColor: 'var(--casa-border)' }}
          />
          <div
            className="h-4 w-48 rounded animate-pulse"
            style={{ backgroundColor: 'var(--casa-border)' }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl animate-pulse"
            style={{ backgroundColor: 'var(--casa-border)' }}
          />
        ))}
      </div>
    </div>
  )
}
