'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { consolidateIngredients } from '@/lib/consolidate-ingredients'
import type { Ingredient } from '@/lib/types'

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

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/menus/' + planId)
}

export async function removeRecipeFromPlan(planId: string, itemId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('menu_plan_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/menus/' + planId)
}

export async function confirmMenuPlan(planId: string) {
  const supabase = await createClient()

  // Fetch plan items
  const { data: items, error: itemsError } = await supabase
    .from('menu_plan_items')
    .select('recipe_id')
    .eq('menu_plan_id', planId)

  if (itemsError) throw new Error(itemsError.message)

  const recipeIds = (items ?? []).map((i: { recipe_id: string }) => i.recipe_id)

  // Fetch recipes with ingredients
  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('id, ingredients')
    .in('id', recipeIds)

  if (recipesError) throw new Error(recipesError.message)

  // Fetch active fridge staples
  const { data: staples, error: staplesError } = await supabase
    .from('fridge_staples')
    .select('*')
    .eq('is_active', true)

  if (staplesError) throw new Error(staplesError.message)

  // Consolidate ingredients
  const typedRecipes = (recipes ?? []).map((r: { id: string; ingredients: Ingredient[] }) => ({
    id: r.id,
    ingredients: r.ingredients,
  }))
  const consolidated = consolidateIngredients(typedRecipes)

  // Check for existing shopping list (re-confirm case)
  const { data: existingList } = await supabase
    .from('shopping_lists')
    .select('id')
    .eq('menu_plan_id', planId)
    .maybeSingle()

  if (existingList) {
    await supabase
      .from('shopping_list_items')
      .delete()
      .eq('shopping_list_id', existingList.id)
    await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', existingList.id)
  }

  // Create shopping list
  const { data: list, error: listError } = await supabase
    .from('shopping_lists')
    .insert({ menu_plan_id: planId, status: 'active' })
    .select()
    .single()

  if (listError || !list) throw new Error(listError?.message ?? 'Failed to create shopping list')

  // Insert consolidated ingredient items
  const ingredientItems = consolidated.map((item) => ({
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

  // Insert fridge staple items
  const stapleItems = (staples ?? []).map(
    (s: {
      item_name_en: string
      item_name_es: string
      category?: string
    }) => ({
      shopping_list_id: list.id,
      ingredient_name_en: s.item_name_en,
      ingredient_name_es: s.item_name_es,
      quantity: null,
      unit: null,
      category: s.category ?? 'Staples',
      source_recipe_ids: [],
      is_checked: false,
      is_always_stock: true,
    })
  )

  const allItems = [...ingredientItems, ...stapleItems]
  if (allItems.length > 0) {
    const { error: insertError } = await supabase
      .from('shopping_list_items')
      .insert(allItems)
    if (insertError) throw new Error(insertError.message)
  }

  // Update plan status to confirmed
  const { error: updateError } = await supabase
    .from('menu_plans')
    .update({ status: 'confirmed' })
    .eq('id', planId)

  if (updateError) throw new Error(updateError.message)

  revalidatePath('/menus')
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
  redirect('/menus')
}
