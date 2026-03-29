export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div
          className="h-8 w-40 rounded-lg animate-pulse"
          style={{ backgroundColor: 'var(--casa-border)' }}
        />
        <div
          className="h-4 w-56 rounded animate-pulse"
          style={{ backgroundColor: 'var(--casa-border)' }}
        />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl animate-pulse"
            style={{ backgroundColor: 'var(--casa-border)' }}
          />
        ))}
      </div>
    </div>
  )
}
