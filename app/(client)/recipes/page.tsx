import { createClient } from '@/lib/supabase/server'
import type { Recipe } from '@/lib/types'
import { RecipesClient } from './recipes-client'

export default async function RecipesPage() {
  const supabase = await createClient()

  // Fetch all active top-level recipes server-side
  const { data: topLevelData } = await supabase
    .from('recipes')
    .select('*')
    .is('parent_recipe_id', null)
    .order('created_at', { ascending: false })

  const recipes = (topLevelData as Recipe[]) ?? []

  // Fetch variants for all top-level recipes
  const topLevelIds = recipes.map((r) => r.id)
  let variantMap: Record<string, Recipe[]> = {}

  if (topLevelIds.length > 0) {
    const { data: variantsData } = await supabase
      .from('recipes')
      .select('*')
      .in('parent_recipe_id', topLevelIds)
      .eq('is_active', true)

    const variantList = (variantsData as Recipe[]) ?? []
    for (const v of variantList) {
      if (!variantMap[v.parent_recipe_id!]) variantMap[v.parent_recipe_id!] = []
      variantMap[v.parent_recipe_id!].push(v)
    }
  }

  return <RecipesClient items={recipes} variantMap={variantMap} />
}
