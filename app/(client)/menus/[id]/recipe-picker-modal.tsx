'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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

const categoryColors: Record<string, { bg: string; text: string }> = {
  beef: { bg: '#FEF2F2', text: '#991B1B' },
  chicken: { bg: '#FFF7ED', text: '#9A3412' },
  seafood: { bg: '#EFF6FF', text: '#1D4ED8' },
  veggies: { bg: '#F0FDF4', text: '#166534' },
  snacks: { bg: '#FEFCE8', text: '#854D0E' },
  carbs: { bg: '#FAF5FF', text: '#6B21A8' },
  soups: { bg: '#F0F9FF', text: '#0369A1' },
  salads: { bg: '#ECFDF5', text: '#065F46' },
  other: { bg: '#F9FAFB', text: '#374151' },
}

interface RecipePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRecipeIds: string[]
  onConfirm: (recipeIds: string[]) => void
  maxRecipes?: number
}

export function RecipePickerModal({
  open,
  onOpenChange,
  selectedRecipeIds,
  onConfirm,
  maxRecipes = 4,
}: RecipePickerModalProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState<string[]>(selectedRecipeIds)

  // Sync selection when modal opens
  useEffect(() => {
    if (open) {
      setSelected(selectedRecipeIds)
    }
  }, [open, selectedRecipeIds])

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('recipes')
      .select('*')
      .eq('is_active', true)
      .order('title_en', { ascending: true })

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
    if (!open) return
    const timeout = setTimeout(() => {
      fetchRecipes()
    }, 300)
    return () => clearTimeout(timeout)
  }, [fetchRecipes, open])

  const toggleRecipe = (recipeId: string) => {
    setSelected((prev) => {
      if (prev.includes(recipeId)) {
        return prev.filter((id) => id !== recipeId)
      }
      if (prev.length >= maxRecipes) return prev
      return [...prev, recipeId]
    })
  }

  const atLimit = selected.length >= maxRecipes

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl w-full h-full sm:h-auto max-h-[80vh] flex flex-col overflow-hidden"
        style={{ borderColor: '#E8E0D0' }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: '#1A1410' }}>Add recipes</DialogTitle>
          <p
            className="text-sm"
            style={{ color: atLimit ? '#8B6914' : '#6B5B3E' }}
          >
            {selected.length} of {maxRecipes} selected
          </p>
        </DialogHeader>

        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: '#9B8B70' }}
          />
          <Input
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            style={{ borderColor: '#E8E0D0' }}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex-shrink-0">
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
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Recipe Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl animate-pulse"
                  style={{ backgroundColor: '#E8E0D0' }}
                />
              ))}
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
              {recipes.map((recipe) => {
                const isSelected = selected.includes(recipe.id)
                const isDisabled = !isSelected && atLimit
                const catStyle =
                  categoryColors[recipe.category] ?? categoryColors.other

                return (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => toggleRecipe(recipe.id)}
                    disabled={isDisabled}
                    aria-label={`${isSelected ? 'Deselect' : 'Select'} ${recipe.title_en}`}
                    aria-pressed={isSelected}
                    className="relative text-left rounded-xl border p-3 transition-all"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: isSelected ? '#8B6914' : '#E8E0D0',
                      outline: isSelected ? '2px solid #8B6914' : undefined,
                      outlineOffset: isSelected ? '0px' : undefined,
                      opacity: isDisabled ? 0.4 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {/* Checkmark overlay */}
                    {isSelected && (
                      <span
                        className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full"
                        style={{ backgroundColor: '#8B6914' }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}

                    <p
                      className="text-sm font-medium leading-snug line-clamp-2 pr-6"
                      style={{ color: '#1A1410' }}
                    >
                      {recipe.title_en}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: catStyle.bg,
                          color: catStyle.text,
                        }}
                      >
                        {recipe.category}
                      </span>
                      {recipe.prep_time_minutes && (
                        <span
                          className="text-xs"
                          style={{ color: '#9B8B70' }}
                        >
                          {recipe.prep_time_minutes} min
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm" style={{ color: '#9B8B70' }}>
                No recipes found
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            type="button"
            disabled={selected.length < 2}
            onClick={() => {
              onConfirm(selected)
              onOpenChange(false)
            }}
            style={
              selected.length >= 2
                ? { backgroundColor: '#8B6914', color: '#FFFFFF' }
                : undefined
            }
          >
            Confirm selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
