'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Copy, MessageSquare, CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FeedbackForm } from '@/components/feedback-form'
import { RecipeDiffView } from '@/components/recipe-diff-view'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Recipe } from '@/lib/types'
import { addRecipeToMenuPlan } from '@/lib/menu-actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface FeedbackPayload {
  rating?: number
  feedback_text?: string
  adjustment_type?: string
  adjustment_detail?: string
}

interface RecipeDetailActionsProps {
  recipe: Recipe
}

export function RecipeDetailActions({ recipe }: RecipeDetailActionsProps) {
  const router = useRouter()
  const [adjustedRecipe, setAdjustedRecipe] = useState<Partial<Recipe> | null>(null)
  const [adjustLoading, setAdjustLoading] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [showAdjustOffer, setShowAdjustOffer] = useState(false)
  const lastFeedbackRef = useRef<FeedbackPayload | null>(null)

  const [menuModalOpen, setMenuModalOpen] = useState(false)
  const [draftMenus, setDraftMenus] = useState<Array<{ id: string; visit_date: string; recipe_count: number }>>([])
  const [loadingMenus, setLoadingMenus] = useState(false)
  const [addingToMenu, setAddingToMenu] = useState<string | null>(null)
  const [menuMessage, setMenuMessage] = useState<string | null>(null)

  async function handleAdjust(feedback?: FeedbackPayload) {
    setAdjustLoading(true)
    try {
      const res = await fetch('/api/ai/adjust-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe,
          feedback: feedback ?? { feedback_text: 'General improvement' },
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Failed to adjust recipe')
        return
      }
      const adjusted = await res.json()
      setAdjustedRecipe(adjusted)
    } catch {
      toast.error('Failed to adjust recipe')
    } finally {
      setAdjustLoading(false)
    }
  }

  async function handleDuplicate() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        title_en: recipe.title_en + ' (copy)',
        title_es: recipe.title_es + ' (copia)',
        description_en: recipe.description_en,
        description_es: recipe.description_es,
        ingredients: recipe.ingredients,
        instructions_en: recipe.instructions_en,
        instructions_es: recipe.instructions_es,
        youtube_url: recipe.youtube_url,
        category: recipe.category,
        protein_type: recipe.protein_type,
        prep_time_minutes: recipe.prep_time_minutes,
        servings: recipe.servings,
        tags: recipe.tags,
        is_active: true,
        parent_recipe_id: recipe.id,
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to duplicate recipe')
    } else {
      toast.success('Recipe duplicated')
      router.push(`/recipes/${data.id}`)
    }
  }

  async function openMenuModal() {
    setMenuModalOpen(true)
    setLoadingMenus(true)
    setMenuMessage(null)
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('menu_plans')
      .select('id, visit_date, menu_plan_items(id)')
      .eq('status', 'draft')
      .gte('visit_date', today)
      .order('visit_date', { ascending: true })
    const menus = (data ?? []).map((p: any) => ({
      id: p.id,
      visit_date: p.visit_date,
      recipe_count: Array.isArray(p.menu_plan_items) ? p.menu_plan_items.length : 0,
    }))
    setDraftMenus(menus)
    setLoadingMenus(false)
  }

  async function handleAddToMenu(menuId: string, visitDate: string) {
    setAddingToMenu(menuId)
    setMenuMessage(null)
    const result = await addRecipeToMenuPlan(menuId, recipe.id)
    if (result.error === 'already_on_menu') {
      setMenuMessage('Already on this menu')
    } else if (result.error) {
      setMenuMessage('Failed to add recipe')
    } else {
      const dateStr = new Date(visitDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
      setMenuMessage(`Added to ${dateStr} menu`)
      setTimeout(() => setMenuModalOpen(false), 1200)
    }
    setAddingToMenu(null)
  }

  return (
    <div className="space-y-4">
      {/* AI action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          onClick={() => handleAdjust()}
          disabled={adjustLoading}
          className="gap-1.5"
          style={{ borderColor: 'var(--casa-primary)', color: 'var(--casa-primary)' }}
        >
          <Sparkles className="w-4 h-4" />
          {adjustLoading ? 'Adjusting...' : 'Adjust with AI'}
        </Button>

        <Button
          variant="outline"
          onClick={handleDuplicate}
          className="gap-1.5"
          style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text-dark)' }}
        >
          <Copy className="w-4 h-4" />
          Duplicate Recipe
        </Button>

        <Button
          variant="outline"
          onClick={openMenuModal}
          className="gap-1.5"
          style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text-dark)' }}
        >
          <CalendarPlus className="w-4 h-4" />
          Add to Menu
        </Button>

        {!showFeedbackForm && !showAdjustOffer && (
          <Button
            variant="outline"
            onClick={() => setShowFeedbackForm(true)}
            className="gap-1.5"
            style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text-dark)' }}
          >
            <MessageSquare className="w-4 h-4" />
            Leave Feedback
          </Button>
        )}
      </div>

      {/* Adjust loading state */}
      {adjustLoading && (
        <p className="text-sm" style={{ color: 'var(--casa-text-muted)' }}>
          Adjusting recipe...
        </p>
      )}

      {/* Feedback form */}
      {showFeedbackForm && (
        <FeedbackForm
          recipeId={recipe.id}
          onSubmitted={(fb) => {
            setShowFeedbackForm(false)
            setShowAdjustOffer(true)
            lastFeedbackRef.current = fb
          }}
        />
      )}

      {/* Automatic adjust offer after feedback (D-05b) */}
      {showAdjustOffer && (
        <Card style={{ border: '1px solid var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}>
          <CardContent className="pt-4 flex items-center justify-between gap-3">
            <p className="text-sm" style={{ color: 'var(--casa-text)' }}>
              Want Claude to adjust this recipe based on your feedback?
            </p>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdjustOffer(false)}
                style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text)' }}
              >
                No thanks
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowAdjustOffer(false)
                  handleAdjust(lastFeedbackRef.current ?? undefined)
                }}
                style={{ backgroundColor: 'var(--casa-primary)', color: 'var(--casa-surface)' }}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Adjust
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diff view (D-09) */}
      {adjustedRecipe && (
        <RecipeDiffView
          original={recipe}
          adjusted={adjustedRecipe}
          recipeId={recipe.id}
          onSaved={() => {
            setAdjustedRecipe(null)
            router.refresh()
          }}
          onDiscarded={() => setAdjustedRecipe(null)}
        />
      )}

      {/* Add to Menu modal (D-16–D-20) */}
      <Dialog open={menuModalOpen} onOpenChange={setMenuModalOpen}>
        <DialogContent style={{ borderColor: 'var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--casa-text)' }}>Add to Menu</DialogTitle>
          </DialogHeader>
          {loadingMenus ? (
            <p className="text-sm py-4" style={{ color: 'var(--casa-text-muted)' }}>Loading menus...</p>
          ) : draftMenus.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm" style={{ color: 'var(--casa-text-muted)' }}>No draft menus — create one first</p>
              <a href="/menus" className="text-sm font-medium mt-2 inline-block" style={{ color: 'var(--casa-primary)' }}>
                Go to Menus
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {draftMenus.map((menu) => {
                const dateStr = new Date(menu.visit_date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })
                return (
                  <button
                    key={menu.id}
                    type="button"
                    onClick={() => handleAddToMenu(menu.id, menu.visit_date)}
                    disabled={addingToMenu === menu.id}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-colors"
                    style={{
                      borderColor: 'var(--casa-border)',
                      backgroundColor: 'var(--casa-surface)',
                      color: 'var(--casa-text)',
                    }}
                  >
                    <span className="text-sm font-medium">{dateStr}</span>
                    <span className="text-xs" style={{ color: 'var(--casa-text-muted)' }}>
                      {addingToMenu === menu.id ? 'Adding...' : `${menu.recipe_count} recipes`}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
          {menuMessage && (
            <p className="text-sm text-center py-2" style={{ color: 'var(--casa-primary)' }}>
              {menuMessage}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
