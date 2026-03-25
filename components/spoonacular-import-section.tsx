'use client'

import { useState } from 'react'
import { Search, ChevronDown, Loader2 } from 'lucide-react'
import type { Recipe, Ingredient } from '@/lib/types'

interface SpoonacularResult {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  dishTypes: string[]
}

interface SpoonacularImportSectionProps {
  onImported: (recipe: Partial<Recipe>) => void
}

export function SpoonacularImportSection({ onImported }: SpoonacularImportSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [importing, setImporting] = useState<number | null>(null)
  const [results, setResults] = useState<SpoonacularResult[]>([])
  const [error, setError] = useState<string | null>(null)

  async function handleSearch() {
    if (!query.trim() || searching) return

    setSearching(true)
    setError(null)
    setResults([])

    try {
      const res = await fetch(`/api/spoonacular/search?query=${encodeURIComponent(query)}`)
      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Search failed. Please try again.')
        return
      }

      setResults(data)
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  async function handleImport(result: SpoonacularResult) {
    if (importing !== null) return

    setImporting(result.id)
    setError(null)

    try {
      // Fetch full recipe details
      const detailRes = await fetch(`/api/spoonacular/detail?id=${result.id}`)
      const detailData = await detailRes.json()

      if (!detailRes.ok || detailData.error) {
        setError(detailData.error || 'Could not import recipe details.')
        return
      }

      // Auto-translate Spanish fields
      try {
        const translateRes = await fetch('/api/ai/translate-recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title_en: detailData.title_en,
            description_en: detailData.description_en,
            ingredients: detailData.ingredients,
            instructions_en: detailData.instructions_en,
          }),
        })

        if (translateRes.ok) {
          const translateData = await translateRes.json()

          // Merge Spanish fields into recipe data
          const mergedIngredients: Ingredient[] = (detailData.ingredients ?? []).map(
            (ing: Ingredient, idx: number) => ({
              ...ing,
              name_es: translateData.ingredient_names_es?.[idx] ?? '',
            })
          )

          const merged: Partial<Recipe> = {
            ...detailData,
            title_es: translateData.title_es ?? '',
            description_es: translateData.description_es ?? '',
            instructions_es: translateData.instructions_es ?? '',
            ingredients: mergedIngredients,
          }

          onImported(merged)
        } else {
          // Translation failed — still import with empty Spanish fields
          onImported(detailData as Partial<Recipe>)
        }
      } catch {
        // Translation error — still import with empty Spanish fields
        onImported(detailData as Partial<Recipe>)
      }
    } catch {
      setError('Could not import recipe. Please try again.')
    } finally {
      setImporting(null)
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
          <Search className="w-4 h-4" />
          Import from Spoonacular
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a recipe..."
              className="flex-1 px-3 py-2 text-sm rounded-md"
              style={{
                border: '1px solid var(--casa-border)',
                color: 'var(--casa-text)',
                backgroundColor: 'transparent',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch()
                }
              }}
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={!query.trim() || searching}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 transition-opacity"
              style={{
                backgroundColor: 'var(--casa-primary)',
                color: '#FFFFFF',
              }}
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--casa-error, #991B1B)' }}>
              {error}
            </p>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{
                    backgroundColor: 'var(--casa-bg)',
                    border: '1px solid var(--casa-border)',
                  }}
                >
                  {result.image && (
                    <img
                      src={result.image}
                      alt={result.title}
                      className="rounded object-cover flex-shrink-0"
                      style={{ width: 48, height: 48 }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--casa-text-dark)' }}>
                      {result.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--casa-text-muted)' }}>
                      {result.readyInMinutes} min &middot; {result.servings} servings
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleImport(result)}
                    disabled={importing !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md disabled:opacity-50 transition-opacity flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--casa-primary)',
                      color: '#FFFFFF',
                    }}
                  >
                    {importing === result.id ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      'Import'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
