'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  X,
  Sparkles,
  ChevronDown,
  Info,
  Trash2,
  Loader2,
  Pencil,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RecipePickerModal } from '@/components/recipe-picker-modal'
import {
  addRecipeToPlan,
  removeRecipeFromPlan,
  confirmMenuPlan,
  deleteMenuPlan,
  updateMenuPlanDate,
} from '@/lib/menu-actions'
import { validateMenuPlan } from '@/lib/rules-engine'
import type { Recipe, CookingRule, MenuPlan } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface MenuPlanItemRow {
  id: string
  menu_plan_id: string
  recipe_id: string
  servings: number
  sort_order: number
  recipes: Recipe | null
}

interface RecentPlanRow {
  id: string
  visit_date: string
  status: string
  menu_plan_items: { recipe_id: string }[]
}

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

export default function MenuPlanPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params.id as string

  const [plan, setPlan] = useState<MenuPlan | null>(null)
  const [planItems, setPlanItems] = useState<MenuPlanItemRow[]>([])
  const [rules, setRules] = useState<CookingRule[]>([])
  const [recentPlans, setRecentPlans] = useState<RecentPlanRow[]>([])
  const [loading, setLoading] = useState(true)

  const [pickerOpen, setPickerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isEditingDate, setIsEditingDate] = useState(false)
  const [dateInput, setDateInput] = useState('')
  const [isUpdatingDate, setIsUpdatingDate] = useState(false)
  const [warningsOpen, setWarningsOpen] = useState(false)
  const [rationaleOpen, setRationaleOpen] = useState(false)
  const [suggestionRationale, setSuggestionRationale] = useState<string>('')

  const [isSuggesting, setIsSuggesting] = useState(false)
  const [isConfirming, startConfirmTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()

  const selectedRecipes = planItems
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => item.recipes)
    .filter(Boolean) as Recipe[]

  const selectedRecipeIds = planItems.map((i) => i.recipe_id)

  const warnings = validateMenuPlan(
    selectedRecipes,
    rules,
    recentPlans.map((p) => ({
      ...p,
      status: p.status as MenuPlan['status'],
      notes: undefined,
      created_at: '',
      updated_at: '',
      recipeIds: p.menu_plan_items.map((i) => i.recipe_id),
    }))
  )

  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()

    const [
      { data: planData },
      { data: itemsData },
      { data: rulesData },
      { data: recentData },
    ] = await Promise.all([
      supabase
        .from('menu_plans')
        .select('*')
        .eq('id', planId)
        .single(),
      supabase
        .from('menu_plan_items')
        .select('*, recipes(*)')
        .eq('menu_plan_id', planId)
        .order('sort_order', { ascending: true }),
      supabase
        .from('cooking_rules')
        .select('*')
        .eq('is_active', true),
      supabase
        .from('menu_plans')
        .select('id, visit_date, status, menu_plan_items(recipe_id)')
        .eq('status', 'confirmed')
        .neq('id', planId)
        .order('visit_date', { ascending: false })
        .limit(4),
    ])

    if (planData) setPlan(planData as MenuPlan)
    if (itemsData) setPlanItems(itemsData as MenuPlanItemRow[])
    if (rulesData) setRules(rulesData as CookingRule[])
    if (recentData) setRecentPlans(recentData as RecentPlanRow[])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId])

  const handlePickerConfirm = async (newRecipeIds: string[]) => {
    const supabase = createClient()

    // Find added and removed
    const toAdd = newRecipeIds.filter((id) => !selectedRecipeIds.includes(id))
    const toRemove = planItems.filter(
      (item) => !newRecipeIds.includes(item.recipe_id)
    )

    // Remove items no longer selected
    for (const item of toRemove) {
      try {
        await removeRecipeFromPlan(planId, item.id)
      } catch {
        toast.error("Couldn't save your changes. Try again.")
        return
      }
    }

    // Add new items
    for (const recipeId of toAdd) {
      const sortOrder = newRecipeIds.indexOf(recipeId)
      try {
        await addRecipeToPlan(planId, recipeId, sortOrder)
      } catch {
        toast.error("Couldn't save your changes. Try again.")
        return
      }
    }

    await fetchData()
  }

  const handleRemoveRecipe = async (itemId: string) => {
    try {
      await removeRecipeFromPlan(planId, itemId)
      await fetchData()
    } catch {
      toast.error("Couldn't save your changes. Try again.")
    }
  }

  const handleSuggestMenu = async () => {
    setIsSuggesting(true)
    setSuggestionRationale('')
    setRationaleOpen(false)

    try {
      const response = await fetch('/api/ai/suggest-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitDate: plan?.visit_date,
          currentRecipeIds: selectedRecipeIds,
        }),
      })

      if (!response.ok) {
        throw new Error('API error')
      }

      const data = await response.json()
      const suggestedIds: string[] = (data.recipes ?? []).map(
        (r: { id: string }) => r.id
      )
      const rationale: string = data.summary_rationale ?? ''

      // Clear current items and add suggested ones
      for (const item of planItems) {
        await removeRecipeFromPlan(planId, item.id)
      }

      for (let i = 0; i < suggestedIds.length; i++) {
        await addRecipeToPlan(planId, suggestedIds[i], i)
      }

      await fetchData()

      if (rationale) {
        setSuggestionRationale(rationale)
        setRationaleOpen(true)
      }
    } catch {
      toast.error("Couldn't generate suggestions. Try again.")
    } finally {
      setIsSuggesting(false)
    }
  }

  const handleConfirm = () => {
    startConfirmTransition(async () => {
      try {
        await confirmMenuPlan(planId)
        router.push('/menus')
      } catch {
        toast.error("Couldn't create the shopping list. Confirm the menu again to retry.")
      }
    })
  }

  const handleDelete = () => {
    startDeleteTransition(async () => {
      try {
        await deleteMenuPlan(planId)
        router.push('/menus')
      } catch {
        toast.error("Couldn't delete the plan. Try again.")
      }
    })
  }

  const handleDateSave = async () => {
    if (!dateInput || dateInput === plan?.visit_date) {
      setIsEditingDate(false)
      return
    }
    setIsUpdatingDate(true)
    try {
      await updateMenuPlanDate(planId, dateInput)
      await fetchData()
      setIsEditingDate(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Couldn't update the date.")
    } finally {
      setIsUpdatingDate(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl animate-pulse"
            style={{ backgroundColor: 'var(--casa-border)' }}
          />
        ))}
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="text-center py-16">
        <p style={{ color: 'var(--casa-text-faint)' }}>Plan not found.</p>
      </div>
    )
  }

  const isConfirmed = plan.status === 'confirmed'

  return (
    <div className="space-y-6 pb-32">
      {/* Date display / edit */}
      <div>
        {isEditingDate ? (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-base font-semibold"
              style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text)', backgroundColor: 'var(--casa-surface)' }}
              disabled={isUpdatingDate}
            />
            <button
              type="button"
              onClick={handleDateSave}
              disabled={isUpdatingDate}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--casa-primary)' }}
            >
              {isUpdatingDate ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditingDate(false)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{ color: 'var(--casa-text-muted)' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { setDateInput(plan.visit_date); setIsEditingDate(true) }}
            className="text-left group flex items-center gap-2"
          >
            <h1 className="text-2xl font-semibold group-hover:underline" style={{ color: 'var(--casa-text)' }}>
              {formatDate(plan.visit_date)}
            </h1>
            <Pencil className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--casa-text-muted)' }} />
          </button>
        )}
        <p className="text-sm mt-1" style={{ color: 'var(--casa-text-muted)' }}>
          {isConfirmed ? 'Confirmed' : 'Draft'}
        </p>
      </div>

      {/* Recipe slots */}
      {isSuggesting ? (
        <div className="space-y-3">
          <p className="text-sm font-medium" style={{ color: 'var(--casa-text-muted)' }}>
            Finding the best recipes for this visit...
          </p>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl animate-pulse"
              style={{ backgroundColor: '#E8E0D0' }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {selectedRecipes.length === 0 ? (
            <div
              className="text-center py-8 rounded-xl border"
              style={{ borderColor: 'var(--casa-border)', borderStyle: 'dashed' }}
            >
              <p className="text-sm" style={{ color: 'var(--casa-text-faint)' }}>
                No recipes selected yet. Add 2–10 recipes to continue.
              </p>
            </div>
          ) : (
            planItems
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((item) => {
                if (!item.recipes) return null
                const recipe = item.recipes
                const catStyle =
                  categoryColors[recipe.category] ?? categoryColors.other

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-4 rounded-xl border"
                    style={{
                      backgroundColor: 'var(--casa-surface)',
                      borderColor: 'var(--casa-border)',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/recipes/${recipe.id}`}
                        className="font-medium text-sm leading-snug truncate block hover:underline"
                        style={{ color: 'var(--casa-primary)' }}
                      >
                        {recipe.title_en}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-medium"
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
                            style={{ color: 'var(--casa-text-faint)' }}
                          >
                            {recipe.prep_time_minutes} min
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipe(item.id)}
                      aria-label={`Remove ${recipe.title_en}`}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      style={{ color: 'var(--casa-text-faint)' }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setPickerOpen(true)}
          disabled={selectedRecipes.length >= 10 || isSuggesting}
          style={{ borderColor: 'var(--casa-primary)', color: 'var(--casa-primary)' }}
        >
          Add recipes
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleSuggestMenu}
          disabled={isSuggesting}
          className="gap-1.5"
          style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text-muted)' }}
        >
          {isSuggesting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Suggest menu
        </Button>
      </div>

      {/* AI rationale box */}
      {suggestionRationale && (
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}
        >
          <button
            type="button"
            className="flex items-center gap-2 w-full text-left"
            onClick={() => setRationaleOpen((v) => !v)}
          >
            <Info className="w-4 h-4 shrink-0" style={{ color: '#1D4ED8' }} />
            <span
              className="text-sm font-medium flex-1"
              style={{ color: '#1D4ED8' }}
            >
              Why these recipes?
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${rationaleOpen ? 'rotate-180' : ''}`}
              style={{ color: '#1D4ED8' }}
            />
          </button>
          {rationaleOpen && (
            <p className="text-sm mt-2" style={{ color: '#1E40AF' }}>
              {suggestionRationale}
            </p>
          )}
        </div>
      )}

      {/* Rules warnings */}
      {warnings.length > 0 && (
        <div
          role="alert"
          className="rounded-xl border p-4"
          style={{ backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }}
        >
          <button
            type="button"
            className="flex items-center gap-2 w-full text-left"
            onClick={() => setWarningsOpen((v) => !v)}
          >
            <span
              className="text-sm font-medium flex-1"
              style={{ color: '#9A3412' }}
            >
              Cooking rules warning ({warnings.length})
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${warningsOpen ? 'rotate-180' : ''}`}
              style={{ color: '#9A3412' }}
            />
          </button>
          {warningsOpen && (
            <ul className="mt-2 space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="text-sm" style={{ color: '#7C2D12' }}>
                  {w.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Bottom action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 md:p-0 border-t md:border-t-0"
        style={{ backgroundColor: 'var(--casa-surface)', borderColor: 'var(--casa-border)' }}
      >
        <button
          type="button"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={isDeleting}
          className="flex items-center gap-1.5 text-sm font-medium hover:underline"
          style={{ color: '#DC2626' }}
        >
          <Trash2 className="w-4 h-4" />
          Delete plan
        </button>

        <Button
          type="button"
          onClick={handleConfirm}
          disabled={isConfirming || selectedRecipes.length < 2}
          className="sm:ml-auto min-w-[140px]"
          style={{ backgroundColor: 'var(--casa-primary)', color: '#FFFFFF' }}
        >
          {isConfirming ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              Confirming...
            </>
          ) : (
            'Confirm menu'
          )}
        </Button>
      </div>

      {/* Recipe picker modal */}
      <RecipePickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedRecipeIds={selectedRecipeIds}
        onConfirm={handlePickerConfirm}
        maxRecipes={10}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent style={{ borderColor: 'var(--casa-border)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--casa-text)' }}>Delete plan?</DialogTitle>
            <DialogDescription style={{ color: 'var(--casa-text-muted)' }}>
              This will delete the plan for {plan ? formatDate(plan.visit_date) : ''}. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              style={{ borderColor: 'var(--casa-border)' }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete plan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
