'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { consolidateIngredients } from '@/lib/consolidate-ingredients'
import type { Ingredient } from '@/lib/types'


/** Sync the shopping list for a plan from its current recipes.
 *  Non-destructive: preserves custom items and respects manually-removed tombstones. */
async function syncShoppingList(planId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: planItems } = await supabase
    .from('menu_plan_items')
    .select('recipe_id')
    .eq('menu_plan_id', planId)

  const recipeIds = (planItems ?? []).map((i: { recipe_id: string }) => i.recipe_id)

  // Get or create the shopping list — never delete it so custom items survive
  let { data: list } = await supabase
    .from('shopping_lists')
    .select('id')
    .eq('menu_plan_id', planId)
    .maybeSingle()

  if (!list) {
    const { data: newList, error: listError } = await supabase
      .from('shopping_lists')
      .insert({ menu_plan_id: planId, status: 'active' })
      .select()
      .single()
    if (listError || !newList) return
    list = newList
  }

  // Fetch existing items to separate custom/tombstone items from stale recipe items
  const { data: existingItems } = await supabase
    .from('shopping_list_items')
    .select('id, ingredient_name_en, is_custom, manually_removed')
    .eq('shopping_list_id', list.id)

  // Build set of ingredient names the user has explicitly removed (case-insensitive)
  const removedNames = new Set(
    (existingItems ?? [])
      .filter((i: { manually_removed: boolean }) => i.manually_removed)
      .map((i: { ingredient_name_en: string }) => i.ingredient_name_en.toLowerCase().trim())
  )

  // Delete only stale recipe-derived items; custom items and tombstones stay
  const staleIds = (existingItems ?? [])
    .filter((i: { is_custom: boolean; manually_removed: boolean }) => !i.is_custom && !i.manually_removed)
    .map((i: { id: string }) => i.id)
  if (staleIds.length > 0) {
    await supabase.from('shopping_list_items').delete().in('id', staleIds)
  }

  if (recipeIds.length < 2) return

  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, ingredients')
    .in('id', recipeIds)

  const consolidated = consolidateIngredients(
    (recipes ?? []).map((r: { id: string; ingredients: Ingredient[] }) => ({
      id: r.id,
      ingredients: r.ingredients,
    }))
  )

  // Skip any ingredient the user has manually removed
  const newItems = consolidated
    .filter((item) => !removedNames.has(item.ingredient_name_en.toLowerCase().trim()))
    .map((item) => ({
      shopping_list_id: list.id,
      // Normalise names so future tombstone comparisons are consistent
      ingredient_name_en: item.ingredient_name_en.trim(),
      ingredient_name_es: item.ingredient_name_es.trim(),
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      source_recipe_ids: item.source_recipe_ids,
      is_checked: false,
      is_always_stock: false,
      is_custom: false,
      manually_removed: false,
    }))

  if (newItems.length > 0) {
    await supabase.from('shopping_list_items').insert(newItems)
  }
}

export async function createMenuPlan(formData: FormData) {
  const visitDate = formData.get('visit_date') as string
  if (!visitDate) {
    throw new Error('visit_date is required')
  }

  const supabase = await createClient()

  // Check for existing plan on this date (D-04)
  const { data: existing } = await supabase
    .from('menu_plans')
    .select('id')
    .eq('visit_date', visitDate)
    .maybeSingle()

  if (existing) {
    redirect('/menus/' + existing.id)
  }

  const { data: plan, error } = await supabase
    .from('menu_plans')
    .insert({ visit_date: visitDate, status: 'draft' })
    .select()
    .single()

  if (error || !plan) {
    throw new Error(error?.message ?? 'Failed to create menu plan')
  }

  // Create visit record immediately so the cook can see it
  await supabase.from('visits').insert({ visit_date: visitDate, menu_plan_id: plan.id })

  revalidatePath('/menus')
  redirect('/menus/' + plan.id)
}

export async function addRecipeToPlan(
  planId: string,
  recipeId: string,
  sortOrder: number
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('menu_plan_items')
    .insert({ menu_plan_id: planId, recipe_id: recipeId, sort_order: sortOrder })

  if (error) throw new Error(error.message)

  await syncShoppingList(planId, supabase)
  revalidatePath('/menus/' + planId)
}

export async function addRecipeToMenuPlan(menuPlanId: string, recipeId: string) {
  const supabase = await createClient()

  // Check if recipe is already on this plan
  const { data: existing } = await supabase
    .from('menu_plan_items')
    .select('id')
    .eq('menu_plan_id', menuPlanId)
    .eq('recipe_id', recipeId)
    .maybeSingle()

  if (existing) return { error: 'already_on_menu' }

  // Get current max sort_order
  const { data: items } = await supabase
    .from('menu_plan_items')
    .select('sort_order')
    .eq('menu_plan_id', menuPlanId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSort = items && items.length > 0 ? items[0].sort_order + 1 : 0

  const { error } = await supabase
    .from('menu_plan_items')
    .insert({ menu_plan_id: menuPlanId, recipe_id: recipeId, sort_order: nextSort })

  if (error) return { error: error.message }

  await syncShoppingList(menuPlanId, supabase)
  revalidatePath('/menus/' + menuPlanId)
  revalidatePath('/menus')
  return { success: true }
}

export async function removeRecipeFromPlan(planId: string, itemId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('menu_plan_items').delete().eq('id', itemId)

  if (error) throw new Error(error.message)

  await syncShoppingList(planId, supabase)
  revalidatePath('/menus/' + planId)
}


export async function deleteMenuPlan(planId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('menu_plans')
    .delete()
    .eq('id', planId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/menus')
}

export async function updateMenuPlanDate(planId: string, newDate: string) {
  if (!newDate) throw new Error('visit_date is required')

  const supabase = await createClient()

  // Check for conflict with another plan on the same date
  const { data: existing } = await supabase
    .from('menu_plans')
    .select('id')
    .eq('visit_date', newDate)
    .neq('id', planId)
    .maybeSingle()

  if (existing) throw new Error('A plan already exists for that date')

  const { error } = await supabase
    .from('menu_plans')
    .update({ visit_date: newDate })
    .eq('id', planId)

  if (error) throw new Error(error.message)

  // Keep visit record in sync
  await supabase.from('visits').update({ visit_date: newDate }).eq('menu_plan_id', planId)

  revalidatePath('/menus')
  revalidatePath('/menus/' + planId)
  revalidatePath('/visita')
}
