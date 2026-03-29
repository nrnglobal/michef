'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

  const isConfirmed = plan.status === 'confirmed'
  const isDraft = plan.status === 'draft'
  const selectedRecipeIds = localItems.map((item) => item.recipe_id)

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
        const sortOrder = newRecipeIds.indexOf(recipeId)
        await addRecipeToPlan(plan.id, recipeId, sortOrder)
      }

      // Re-fetch this plan's items to update the pill strip
      const supabase = createClient()
      const { data } = await supabase
        .from('menu_plan_items')
        .select('id, recipe_id, sort_order, recipes(id, title_en, category)')
        .eq('menu_plan_id', plan.id)
        .order('sort_order', { ascending: true })

      if (data) {
        setLocalItems(data as unknown as MenuPlanItem[])
      }
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
        backgroundColor: isConfirmed ? 'var(--casa-surface-2)' : 'var(--casa-surface)',
        border: '1px solid var(--casa-border)',
      }}
    >
      <CardContent className="pt-5">
        {/* Header row: date + status badge */}
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-base font-semibold"
            style={{ color: 'var(--casa-text)' }}
          >
            {formatDate(plan.visit_date)}
          </p>
          <Badge
            className="text-xs capitalize shrink-0"
            style={
              isConfirmed
                ? {
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                  }
                : {
                    backgroundColor: '#F0EBE0',
                    color: '#6B5B3E',
                    border: '1px solid #D6CABF',
                  }
            }
          >
            {isConfirmed ? 'Confirmed' : 'Draft'}
          </Badge>
        </div>

        {/* Recipe pill strip */}
        <div className="mt-3">
          {isMutating ? (
            /* Skeleton placeholders during mutation */
            <div className="flex gap-2 overflow-x-auto pb-1">
              <span
                className="inline-block h-6 w-20 rounded-full animate-pulse shrink-0"
                style={{ backgroundColor: 'var(--casa-border)' }}
              />
              <span
                className="inline-block h-6 w-20 rounded-full animate-pulse shrink-0"
                style={{ backgroundColor: 'var(--casa-border)' }}
              />
              <span
                className="inline-block h-6 w-20 rounded-full animate-pulse shrink-0"
                style={{ backgroundColor: 'var(--casa-border)' }}
              />
            </div>
          ) : localItems.length === 0 ? (
            <span className="text-xs" style={{ color: 'var(--casa-text-faint)' }}>
              No recipes yet
            </span>
          ) : (
            <div className="overflow-x-auto flex gap-2 pb-1">
              {localItems.map((item) =>
                item.recipes ? (
                  <span
                    key={item.id}
                    className="rounded-full text-xs px-2 py-0.5 whitespace-nowrap truncate shrink-0"
                    style={{
                      backgroundColor: 'var(--casa-surface-2)',
                      border: '1px solid var(--casa-border)',
                      color: 'var(--casa-text)',
                      maxWidth: '160px',
                    }}
                    title={item.recipes.title_en}
                  >
                    {item.recipes.title_en}
                  </span>
                ) : null
              )}
            </div>
          )}
        </div>

        {/* Add recipes button — draft only */}
        {isDraft && (
          <div className="mt-2">
            {isMutating ? (
              <Button disabled variant="outline" size="sm" className="w-full sm:w-auto">
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                Adding...
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                style={{
                  borderColor: 'var(--casa-primary)',
                  color: 'var(--casa-primary)',
                }}
                onClick={() => setPickerOpen(true)}
              >
                Add recipes
              </Button>
            )}
          </div>
        )}

        {/* View / Edit plan link */}
        <div className="mt-3">
          <Link href={`/menus/${plan.id}`}>
            <Button
              variant="outline"
              className="w-full"
              style={{
                borderColor: 'var(--casa-primary)',
                color: 'var(--casa-primary)',
              }}
            >
              {isConfirmed ? 'View plan' : 'Edit plan'}
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
