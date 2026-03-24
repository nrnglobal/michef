'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/lib/i18n/config'
import type { Recipe } from '@/lib/types'

const CATEGORIES = [
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

interface GenerateRecipeModalProps {
  open: boolean
  onClose: () => void
  onGenerated: (recipe: Partial<Recipe>) => void
}

export function GenerateRecipeModal({ open, onClose, onGenerated }: GenerateRecipeModalProps) {
  const { t } = useI18n()
  const [category, setCategory] = useState('')
  const [proteinFocus, setProteinFocus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleGenerate() {
    if (!category) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, proteinFocus: proteinFocus || undefined }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error ?? 'Failed to generate recipe')
        setLoading(false)
        return
      }

      onGenerated(data)
      onClose()
    } catch {
      setError('Failed to generate recipe. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl p-6 space-y-5 shadow-xl"
        style={{ backgroundColor: 'var(--casa-surface)', border: '1px solid var(--casa-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-xl font-semibold" style={{ color: 'var(--casa-text)' }}>
          {t('generateRecipe.title')}
        </h2>

        {/* Category select */}
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--casa-text)' }}>{t('generateRecipe.category')}</Label>
          <Select value={category} onValueChange={(v) => setCategory(v ?? '')} disabled={loading}>
            <SelectTrigger style={{ borderColor: 'var(--casa-border)' }}>
              <SelectValue placeholder={t('recipeForm.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {t(`recipes.categories.${cat}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Protein focus input */}
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--casa-text)' }}>{t('generateRecipe.proteinFocus')}</Label>
          <Input
            value={proteinFocus}
            onChange={(e) => setProteinFocus(e.target.value)}
            placeholder={t('generateRecipe.proteinFocusPlaceholder')}
            disabled={loading}
            style={{ borderColor: 'var(--casa-border)' }}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm" style={{ color: '#991B1B' }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            onClick={handleGenerate}
            disabled={!category || loading}
            style={{ backgroundColor: 'var(--casa-primary)', color: '#FFFFFF' }}
            className="gap-1.5"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? t('generateRecipe.generating') : t('generateRecipe.generate')}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text-dark)' }}
          >
            {t('generateRecipe.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}
