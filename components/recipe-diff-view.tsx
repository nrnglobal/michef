'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Recipe, Ingredient } from '@/lib/types'

type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged'

interface IngredientDiff {
  ingredient: Ingredient
  status: DiffStatus
  original?: Ingredient
}

interface LineDiff {
  text: string
  status: 'added' | 'removed' | 'unchanged'
}

function diffIngredients(original: Ingredient[], adjusted: Ingredient[]): IngredientDiff[] {
  const result: IngredientDiff[] = []
  const adjustedMap = new Map(adjusted.map((ing) => [ing.name_en.toLowerCase(), ing]))
  const originalMap = new Map(original.map((ing) => [ing.name_en.toLowerCase(), ing]))

  // Check each adjusted ingredient against originals
  for (const adj of adjusted) {
    const key = adj.name_en.toLowerCase()
    const orig = originalMap.get(key)
    if (!orig) {
      result.push({ ingredient: adj, status: 'added' })
    } else if (orig.quantity !== adj.quantity || orig.unit !== adj.unit) {
      result.push({ ingredient: adj, status: 'changed', original: orig })
    } else {
      result.push({ ingredient: adj, status: 'unchanged' })
    }
  }

  // Find removed ingredients (in original but not in adjusted)
  for (const orig of original) {
    const key = orig.name_en.toLowerCase()
    if (!adjustedMap.has(key)) {
      result.push({ ingredient: orig, status: 'removed' })
    }
  }

  return result
}

function diffInstructions(original: string, adjusted: string): LineDiff[] {
  const origLines = original.split('\n').filter((l) => l.trim())
  const adjLines = adjusted.split('\n').filter((l) => l.trim())
  const result: LineDiff[] = []

  const maxLen = Math.max(origLines.length, adjLines.length)

  for (let i = 0; i < maxLen; i++) {
    const origLine = origLines[i]
    const adjLine = adjLines[i]

    if (origLine === undefined) {
      result.push({ text: adjLine, status: 'added' })
    } else if (adjLine === undefined) {
      result.push({ text: origLine, status: 'removed' })
    } else if (origLine.trim() === adjLine.trim()) {
      result.push({ text: adjLine, status: 'unchanged' })
    } else {
      result.push({ text: origLine, status: 'removed' })
      result.push({ text: adjLine, status: 'added' })
    }
  }

  return result
}

interface RecipeDiffViewProps {
  original: Recipe
  adjusted: Partial<Recipe>
  recipeId: string
  onSaved: () => void
  onDiscarded: () => void
}

export function RecipeDiffView({
  original,
  adjusted,
  recipeId,
  onSaved,
  onDiscarded,
}: RecipeDiffViewProps) {
  const [saving, setSaving] = useState(false)

  const ingredientDiffs = diffIngredients(
    original.ingredients ?? [],
    adjusted.ingredients ?? original.ingredients ?? []
  )

  const instructionDiffs = diffInstructions(
    original.instructions_en ?? '',
    adjusted.instructions_en ?? original.instructions_en ?? ''
  )

  const hasOtherChanges =
    (adjusted.title_en && adjusted.title_en !== original.title_en) ||
    (adjusted.servings !== undefined && adjusted.servings !== original.servings) ||
    (adjusted.prep_time_minutes !== undefined && adjusted.prep_time_minutes !== original.prep_time_minutes)

  async function handleSave() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('recipes')
        .update({
          title_en: adjusted.title_en,
          title_es: adjusted.title_es,
          description_en: adjusted.description_en,
          description_es: adjusted.description_es,
          ingredients: adjusted.ingredients,
          instructions_en: adjusted.instructions_en,
          instructions_es: adjusted.instructions_es,
          category: adjusted.category,
          protein_type: adjusted.protein_type,
          prep_time_minutes: adjusted.prep_time_minutes,
          servings: adjusted.servings,
          tags: adjusted.tags,
        })
        .eq('id', recipeId)

      if (error) {
        toast.error('Failed to save recipe')
        return
      }

      toast.success('Recipe updated')
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-xl border space-y-6 p-4"
      style={{ borderColor: 'var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold" style={{ color: 'var(--casa-text)' }}>
          Adjusted Recipe — Review Changes
        </h3>
      </div>

      {/* Ingredients diff */}
      <div>
        <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--casa-text)' }}>
          Ingredients
        </h4>
        <div className="space-y-1">
          {ingredientDiffs.map((diff, idx) => {
            if (diff.status === 'unchanged') {
              return (
                <div key={idx} className="text-sm px-2 py-1 rounded" style={{ color: 'var(--casa-text)' }}>
                  {diff.ingredient.quantity} {diff.ingredient.unit} {diff.ingredient.name_en}
                </div>
              )
            }
            if (diff.status === 'added') {
              return (
                <div
                  key={idx}
                  className="text-sm px-2 py-1 rounded"
                  style={{ background: 'var(--casa-diff-add-bg)', color: 'var(--casa-diff-add-text)' }}
                >
                  + {diff.ingredient.quantity} {diff.ingredient.unit} {diff.ingredient.name_en}
                </div>
              )
            }
            if (diff.status === 'removed') {
              return (
                <div
                  key={idx}
                  className="text-sm px-2 py-1 rounded line-through"
                  style={{ background: 'var(--casa-diff-del-bg)', color: 'var(--casa-diff-del-text)' }}
                >
                  {diff.ingredient.quantity} {diff.ingredient.unit} {diff.ingredient.name_en}
                </div>
              )
            }
            // changed
            return (
              <div key={idx} className="space-y-0.5">
                <div
                  className="text-sm px-2 py-1 rounded line-through"
                  style={{ background: 'var(--casa-diff-del-bg)', color: 'var(--casa-diff-del-text)' }}
                >
                  {diff.original!.quantity} {diff.original!.unit} {diff.original!.name_en}
                </div>
                <div
                  className="text-sm px-2 py-1 rounded"
                  style={{ background: 'var(--casa-diff-add-bg)', color: 'var(--casa-diff-add-text)' }}
                >
                  + {diff.ingredient.quantity} {diff.ingredient.unit} {diff.ingredient.name_en}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Instructions diff */}
      <div>
        <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--casa-text)' }}>
          Instructions
        </h4>
        <div className="space-y-1">
          {instructionDiffs.map((line, idx) => {
            if (line.status === 'unchanged') {
              return (
                <div key={idx} className="text-sm px-2 py-1 rounded" style={{ color: 'var(--casa-text)' }}>
                  {line.text}
                </div>
              )
            }
            if (line.status === 'added') {
              return (
                <div
                  key={idx}
                  className="text-sm px-2 py-1 rounded"
                  style={{ background: 'var(--casa-diff-add-bg)', color: 'var(--casa-diff-add-text)' }}
                >
                  + {line.text}
                </div>
              )
            }
            return (
              <div
                key={idx}
                className="text-sm px-2 py-1 rounded line-through"
                style={{ background: 'var(--casa-diff-del-bg)', color: 'var(--casa-diff-del-text)' }}
              >
                {line.text}
              </div>
            )
          })}
        </div>
      </div>

      {/* Other changes */}
      {hasOtherChanges && (
        <div>
          <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--casa-text)' }}>
            Other changes
          </h4>
          <div className="space-y-1 text-sm">
            {adjusted.title_en && adjusted.title_en !== original.title_en && (
              <div style={{ color: 'var(--casa-text)' }}>
                <span style={{ color: 'var(--casa-text-muted)' }}>Title: </span>
                <span
                  className="line-through mr-1"
                  style={{ color: 'var(--casa-diff-del-text)' }}
                >
                  {original.title_en}
                </span>
                <span style={{ color: 'var(--casa-diff-add-text)' }}>{adjusted.title_en}</span>
              </div>
            )}
            {adjusted.servings !== undefined && adjusted.servings !== original.servings && (
              <div style={{ color: 'var(--casa-text)' }}>
                <span style={{ color: 'var(--casa-text-muted)' }}>Servings: </span>
                <span
                  className="line-through mr-1"
                  style={{ color: 'var(--casa-diff-del-text)' }}
                >
                  {original.servings}
                </span>
                <span style={{ color: 'var(--casa-diff-add-text)' }}>{adjusted.servings}</span>
              </div>
            )}
            {adjusted.prep_time_minutes !== undefined && adjusted.prep_time_minutes !== original.prep_time_minutes && (
              <div style={{ color: 'var(--casa-text)' }}>
                <span style={{ color: 'var(--casa-text-muted)' }}>Prep time: </span>
                <span
                  className="line-through mr-1"
                  style={{ color: 'var(--casa-diff-del-text)' }}
                >
                  {original.prep_time_minutes} min
                </span>
                <span style={{ color: 'var(--casa-diff-add-text)' }}>{adjusted.prep_time_minutes} min</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--casa-border)' }}>
        <Button
          onClick={handleSave}
          disabled={saving}
          style={{ backgroundColor: 'var(--casa-primary)', color: 'var(--casa-surface)' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="outline" onClick={onDiscarded} style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text)' }}>
          Discard
        </Button>
      </div>
    </div>
  )
}
