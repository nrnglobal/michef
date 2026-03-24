'use client'

import { useState } from 'react'
import { Link as LinkIcon, ChevronDown, Loader2, Globe } from 'lucide-react'
import type { Recipe } from '@/lib/types'

interface UrlImportSectionProps {
  onImported: (recipe: Partial<Recipe>) => void
}

export function UrlImportSection({ onImported }: UrlImportSectionProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  async function handleImport() {
    if (!url.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'No pude importar esa receta.')
        // If there is partial recipe data alongside the error, still call onImported
        const { error: _err, ...rest } = data
        if (Object.keys(rest).length > 0) {
          onImported(rest as Partial<Recipe>)
        }
        return
      }

      onImported(data as Partial<Recipe>)
    } catch {
      setError('No pude importar esa receta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        border: '1px solid var(--casa-border)',
        borderRadius: '0.75rem',
        backgroundColor: 'var(--casa-surface)',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
        style={{ color: 'var(--casa-text-dark)' }}
      >
        <span className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
          Import from URL
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/recipe"
              className="flex-1 px-3 py-2 text-sm rounded-md"
              style={{
                border: '1px solid var(--casa-border)',
                color: 'var(--casa-text)',
                backgroundColor: 'transparent',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleImport()
                }
              }}
            />
            <button
              type="button"
              onClick={handleImport}
              disabled={!url.trim() || loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 transition-opacity"
              style={{
                backgroundColor: 'var(--casa-primary)',
                color: '#FFFFFF',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing recipe...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Import
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--casa-error, #991B1B)' }}>
              {error || 'No pude importar esa receta.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
