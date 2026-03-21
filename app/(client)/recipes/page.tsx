'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RecipeCard } from '@/components/recipe-card'
import { createClient } from '@/lib/supabase/client'
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

export default function RecipesPage() {
  const { t } = useI18n()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })

    if (category !== 'all') {
      query = query.eq('category', category)
    }

    if (search.trim()) {
      query = query.ilike('title_en', `%${search.trim()}%`)
    }

    const { data } = await query
    setRecipes((data as Recipe[]) ?? [])
    setLoading(false)
  }, [category, search])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchRecipes()
    }, 300)
    return () => clearTimeout(timeout)
  }, [fetchRecipes])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#1A1410' }}>
            {t('recipes.title')}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B5B3E' }}>
            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} in your library
          </p>
        </div>
        <Link href="/recipes/new">
          <Button
            style={{ backgroundColor: '#8B6914', color: '#FFFFFF' }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {t('recipes.addRecipe')}
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: '#9B8B70' }}
        />
        <Input
          placeholder={t('recipes.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          style={{ borderColor: '#E8E0D0' }}
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList
          className="flex flex-wrap gap-1 h-auto p-1 rounded-lg"
          style={{ backgroundColor: '#F0EBE0' }}
        >
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="text-xs px-3 py-1.5 rounded-md data-[state=active]:shadow-sm capitalize"
              style={{
                color: category === cat ? '#8B6914' : '#4A3B28',
              }}
            >
              {t(`recipes.categories.${cat}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Recipe Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-xl animate-pulse"
              style={{ backgroundColor: '#E8E0D0' }}
            />
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} language="en" />
          ))}
        </div>
      ) : (
        <div
          className="text-center py-16 rounded-xl border"
          style={{ borderColor: '#E8E0D0', borderStyle: 'dashed' }}
        >
          <p className="text-base font-medium" style={{ color: '#1A1410' }}>
            {t('recipes.noResults')}
          </p>
          <p className="text-sm mt-1" style={{ color: '#9B8B70' }}>
            {search || category !== 'all'
              ? t('recipes.noResultsHint')
              : 'Add your first recipe to get started'}
          </p>
          {!search && category === 'all' && (
            <Link href="/recipes/new">
              <Button
                className="mt-4"
                style={{ backgroundColor: '#8B6914', color: '#FFFFFF' }}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {t('recipes.addRecipe')}
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
