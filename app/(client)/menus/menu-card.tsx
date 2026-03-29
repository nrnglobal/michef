'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RecipePickerModal } from '@/components/recipe-picker-modal'
import { addRecipeToPlan, removeRecipeFromPlan } from '@/lib/menu-actions'
import { formatDate } from '@/lib/utils'

interface MenuPlanItem {
  id: string
  recipe_id: string
  sort_order: number
  recipes: { id: string; title_en: string; category: string } | null
}

interface MenuPlanWithRecipes {
  id: string
  visit_date: string
  status: string
  menu_plan_items: MenuPlanItem[]
}

interface MenuCardProps {
  plan: MenuPlanWithRecipes
}

export function MenuCard({ plan }: MenuCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [localItems, setLocalItems] = useState<MenuPlanItem[]>(plan.menu_plan_items)

  const selectedRecipeIds = localItems.map((item) => item.recipe_id)

  const refetch = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('menu_plan_items')
      .select('id, recipe_id, sort_order, recipes(id, title_en, category)')
      .eq('menu_plan_id', plan.id)
      .order('sort_order', { ascending: true })
    if (data) setLocalItems(data as unknown as MenuPlanItem[])
  }

  const handleRemoveRecipe = async (itemId: string) => {
    const prevItems = localItems
    setLocalItems((prev) => prev.filter((i) => i.id !== itemId))
    try {
      await removeRecipeFromPlan(plan.id, itemId)
    } catch {
      toast.error("Couldn't remove the recipe. Try again.")
      setLocalItems(prevItems)
    }
  }

  const handlePickerConfirm = async (newRecipeIds: string[]) => {
    const prevItems = localItems
    setIsMutating(true)

    const toAdd = newRecipeIds.filter((id) => !selectedRecipeIds.includes(id))
    const toRemove = localItems.filter(
      (item) => !newRecipeIds.includes(item.recipe_id)
    )

    try {
      for (const item of toRemove) {
        await removeRecipeFromPlan(plan.id, item.id)
      }
      for (const recipeId of toAdd) {
        await addRecipeToPlan(plan.id, recipeId, newRecipeIds.indexOf(recipeId))
      }
      await refetch()
    } catch {
      toast.error("Couldn't update the menu. Try again.")
      setLocalItems(prevItems)
    } finally {
      setIsMutating(false)
    }
  }

  return (
    <Card
      className="rounded-xl"
      style={{
        backgroundColor: 'var(--casa-surface)',
        border: '1px solid var(--casa-border)',
      }}
    >
      <CardContent className="pt-5">
        {/* Header row: date */}
        <p className="text-base font-semibold" style={{ color: 'var(--casa-text)' }}>
          {formatDate(plan.visit_date)}
        </p>

        {/* Recipe list */}
        <div className="mt-3 space-y-1">
          {isMutating ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-9 rounded-lg animate-pulse"
                  style={{ backgroundColor: 'var(--casa-border)' }}
                />
              ))}
            </>
          ) : localItems.length === 0 ? (
            <span className="text-xs" style={{ color: 'var(--casa-text-faint)' }}>
              No recipes yet
            </span>
          ) : (
            localItems.map((item) =>
              item.recipes ? (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                  style={{ backgroundColor: 'var(--casa-surface-2)' }}
                >
                  <Link
                    href={`/recipes/${item.recipes.id}`}
                    className="flex-1 text-sm truncate hover:underline"
                    style={{ color: 'var(--casa-text)' }}
                  >
                    {item.recipes.title_en}
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipe(item.id)}
                    aria-label={`Remove ${item.recipes.title_en}`}
                    className="shrink-0 p-0.5 rounded hover:bg-red-100 transition-colors"
                    style={{ color: 'var(--casa-text-faint)' }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null
            )
          )}
        </div>

        {/* Add recipe button */}
        {!isMutating && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium hover:underline"
            style={{ color: 'var(--casa-primary)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add recipe
          </button>
        )}

        {/* Edit plan link */}
        <div className="mt-3">
          <Link href={`/menus/${plan.id}`}>
            <Button
              variant="outline"
              className="w-full"
              style={{ borderColor: 'var(--casa-primary)', color: 'var(--casa-primary)' }}
            >
              Edit plan
            </Button>
          </Link>
        </div>
      </CardContent>

      {/* Inline recipe picker */}
      <RecipePickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedRecipeIds={selectedRecipeIds}
        onConfirm={handlePickerConfirm}
        maxRecipes={10}
      />
    </Card>
  )
}
