'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { consolidateIngredients } from '@/lib/consolidate-ingredients'
import type { Ingredient } from '@/lib/types'

/** Strip parenthetical notes and normalise to lowercase words. */
function normalizeIngredientName(name: string): string {
  return name
    .replace(/\s*\([^)]*\)/g, '') // remove "(Must be cold-pressed + Extra virgin)" etc.
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function containsWholeWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(text)
}

/**
 * Returns true if a recipe ingredient is covered by an inventory item.
 * Handles cases like "Extra Virgin Olive Oil" matching "Olive oil (Must be cold-pressed)".
 * Single-word items require an exact match to avoid "Butter" suppressing "Peanut Butter".
 */
function ingredientMatchesInventory(ingredientName: string, inventoryName: string): boolean {
  const ing = normalizeIngredientName(ingredientName)
  const inv = normalizeIngredientName(inventoryName)

  if (!ing || !inv) return false
  if (ing === inv) return true

  const invWords = inv.split(' ').filter(Boolean)
  const ingWords = ing.split(' ').filter(Boolean)

  // Multi-word inventory item: match if all its words appear in the ingredient
  if (invWords.length >= 2 && invWords.every((w) => containsWholeWord(ing, w))) return true

  // Multi-word ingredient: match if all its words appear in the inventory item
  if (ingWords.length >= 2 && ingWords.every((w) => containsWholeWord(inv, w))) return true

  return false
}

/** Rebuild the shopping list for a plan from its current recipes. Idempotent. */
async function syncShoppingList(planId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: items } = await supabase
    .from('menu_plan_items')
    .select('recipe_id')
    .eq('menu_plan_id', planId)

  const recipeIds = (items ?? []).map((i: { recipe_id: string }) => i.recipe_id)

  // Delete existing shopping list (full rebuild)
  const { data: existingList } = await supabase
    .from('shopping_lists')
    .select('id')
    .eq('menu_plan_id', planId)
    .maybeSingle()

  if (existingList) {
    await supabase.from('shopping_list_items').delete().eq('shopping_list_id', existingList.id)
    await supabase.from('shopping_lists').delete().eq('id', existingList.id)
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

  const { data: list, error: listError } = await supabase
    .from('shopping_lists')
    .insert({ menu_plan_id: planId, status: 'active' })
    .select()
    .single()

  if (listError || !list) return

  const { data: staples } = await supabase.from('fridge_staples').select('item_name_en')
  const inventoryNames = (staples ?? []).map((s: { item_name_en: string }) => s.item_name_en)

  const filteredItems = consolidated
    .map((item) => ({
      shopping_list_id: list.id,
      ingredient_name_en: item.ingredient_name_en,
      ingredient_name_es: item.ingredient_name_es,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      source_recipe_ids: item.source_recipe_ids,
      is_checked: false,
      is_always_stock: false,
    }))
    .filter((item) => !inventoryNames.some((inv) => ingredientMatchesInventory(item.ingredient_name_en, inv)))

  if (filteredItems.length > 0) {
    await supabase.from('shopping_list_items').insert(filteredItems)
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
    .insert({ visit_date: visitDate, status: 'active' })
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
