import { createClient } from '@/lib/supabase/server'
import type { Recipe } from '@/lib/types'
import { RecipesClient } from './recipes-client'
import type { DraftPlan } from '@/components/add-to-menu-button'

export default async function RecipesPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

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

  // Fetch upcoming draft menu plans for the "Add to Menu" button
  const { data: plansData } = await supabase
    .from('menu_plans')
    .select('id, visit_date, status')
    .in('status', ['draft', 'confirmed'])
    .gte('visit_date', today)
    .order('visit_date', { ascending: true })

  const draftPlans: DraftPlan[] = (plansData ?? []) as DraftPlan[]

  return <RecipesClient items={recipes} variantMap={variantMap} draftPlans={draftPlans} />
}
