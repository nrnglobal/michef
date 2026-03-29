'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Sparkles, X, ChevronDown, ImagePlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RecipeCard } from '@/components/recipe-card'
import type { DraftPlan } from '@/components/add-to-menu-button'
import { GenerateRecipeModal } from '@/components/generate-recipe-modal'
import { RecipeForm } from '@/components/recipe-form'
import { useI18n } from '@/lib/i18n/config'
import type { Recipe } from '@/lib/types'

const CATEGORIES = [
  'all',
  'beef',
  'chicken',
  'seafood',
  'veggies',
  'snacks',
  'carbs',
  'soups',
  'salads',
  'other',
]

interface RecipesClientProps {
  items: Recipe[]
  variantMap: Record<string, Recipe[]>
  draftPlans: DraftPlan[]
}

export function RecipesClient({ items, variantMap, draftPlans }: RecipesClientProps) {
  const router = useRouter()
  const { t } = useI18n()
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [showGenerate, setShowGenerate] = useState(false)
  const [generatedRecipe, setGeneratedRecipe] = useState<Partial<Recipe> | null>(null)
  const [genKey, setGenKey] = useState(0)
  const [fetchingImages, setFetchingImages] = useState(false)
  const [imageResult, setImageResult] = useState<{ updated: number; failed: number; total: number } | null>(null)

  async function handleFetchImages() {
    setFetchingImages(true)
    setImageResult(null)
    try {
      const res = await fetch('/api/recipes/backfill-images', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setImageResult(data)
        router.refresh()
      }
    } finally {
      setFetchingImages(false)
    }
  }

  const filteredRecipes = useMemo(() => {
    return items.filter((recipe) => {
      if (category !== 'all' && recipe.category !== category) return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const titleEn = (recipe.title_en ?? '').toLowerCase()
        const titleEs = (recipe.title_es ?? '').toLowerCase()
        if (!titleEn.includes(q) && !titleEs.includes(q)) return false
      }
      return true
    })
  }, [items, search, category])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--casa-text)' }}>
            {t('recipes.title')}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--casa-text-muted)' }}>
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} in your library
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleFetchImages}
            variant="outline"
            disabled={fetchingImages}
            title="Fetch images from Spoonacular for recipes that don't have one"
            style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text-dark)' }}
            className="gap-1.5"
          >
            <ImagePlus className="w-4 h-4" />
            {fetchingImages ? 'Fetching…' : 'Fetch Images'}
          </Button>
          <Button
            onClick={() => setShowGenerate(true)}
            variant="outline"
            style={{ borderColor: 'var(--casa-primary)', color: 'var(--casa-primary)' }}
            className="gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </Button>
          <Link href="/recipes/new">
            <Button
              style={{ backgroundColor: 'var(--casa-primary)', color: 'var(--casa-surface)' }}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {t('recipes.addRecipe')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Image fetch result */}
      {imageResult && (
        <div
          className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm"
          style={{ backgroundColor: 'var(--casa-surface-3)', color: 'var(--casa-text)' }}
        >
          <span>
            Images fetched: <strong>{imageResult.updated}</strong> updated,{' '}
            <strong>{imageResult.failed}</strong> not found
            {' '}(of {imageResult.total} recipes without images)
          </span>
          <button
            onClick={() => setImageResult(null)}
            className="ml-4 hover:opacity-70"
            aria-label="Dismiss"
            style={{ color: 'var(--casa-text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: 'var(--casa-text-faint)' }}
        />
        <Input
          placeholder={t('recipes.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          style={{ borderColor: 'var(--casa-border)' }}
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList
          className="flex flex-wrap gap-1 h-auto p-1 rounded-lg"
          style={{ backgroundColor: 'var(--casa-surface-3)' }}
        >
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="text-xs px-3 py-1.5 rounded-md data-[state=active]:shadow-sm capitalize"
              style={{
                color: category === cat ? 'var(--casa-primary)' : 'var(--casa-text-dark)',
              }}
            >
              {t(`recipes.categories.${cat}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Generated Recipe Preview */}
      {generatedRecipe && (
        <div
          className="rounded-xl p-6 space-y-4"
          style={{ border: '1px solid var(--casa-primary)', backgroundColor: 'var(--casa-surface)' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--casa-text)' }}>
              Generated Recipe — Review &amp; Save
            </h2>
            <button
              onClick={() => setGeneratedRecipe(null)}
              className="p-1 rounded hover:opacity-70 transition-opacity"
              style={{ color: 'var(--casa-text-muted)' }}
              aria-label="Dismiss generated recipe"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <RecipeForm key={genKey} recipe={generatedRecipe as Recipe} />
        </div>
      )}

      {/* Recipe Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => {
            const variants = variantMap[recipe.id] ?? []
            return (
              <div key={recipe.id}>
                <RecipeCard recipe={recipe} language="en" draftPlans={draftPlans} />
                {variants.length > 0 && (
                  <button
                    onClick={() => setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id)}
                    className="w-full text-xs py-1.5 flex items-center justify-center gap-1"
                    style={{ color: 'var(--casa-text-muted)' }}
                  >
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${expandedRecipe === recipe.id ? 'rotate-180' : ''}`}
                    />
                    + {variants.length} variant{variants.length !== 1 ? 's' : ''}
                  </button>
                )}
                {expandedRecipe === recipe.id &&
                  variants.map((variant) => (
                    <div key={variant.id} className="ml-4 mt-1">
                      <RecipeCard recipe={variant} language="en" draftPlans={draftPlans} />
                    </div>
                  ))}
              </div>
            )
          })}
        </div>
      ) : (
        <div
          className="text-center py-16 rounded-xl border"
          style={{ borderColor: 'var(--casa-border)', borderStyle: 'dashed' }}
        >
          <p className="text-base font-medium" style={{ color: 'var(--casa-text)' }}>
            {t('recipes.noResults')}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--casa-text-faint)' }}>
            {search || category !== 'all'
              ? t('recipes.noResultsHint')
              : 'Add your first recipe to get started'}
          </p>
          {!search && category === 'all' && (
            <Link href="/recipes/new">
              <Button
                className="mt-4"
                style={{ backgroundColor: 'var(--casa-primary)', color: 'var(--casa-surface)' }}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {t('recipes.addRecipe')}
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Generate Recipe Modal */}
      <GenerateRecipeModal
        open={showGenerate}
        onClose={() => setShowGenerate(false)}
        onGenerated={(r) => {
          setGeneratedRecipe(r)
          setGenKey((k) => k + 1)
        }}
      />
    </div>
  )
}
