import type { Recipe, CookingRule, MenuPlan } from '@/lib/types'

export interface RulesWarning {
  ruleId: string
  ruleType: string
  message: string
  severity: 'warning'
}

type RecentPlanWithRecipes = MenuPlan & { recipeIds: string[] }

export function validateMenuPlan(
  recipes: Recipe[],
  rules: CookingRule[],
  recentPlans: RecentPlanWithRecipes[]
): RulesWarning[] {
  const warnings: RulesWarning[] = []
  const activeRules = rules.filter((r) => r.is_active)

  for (const rule of activeRules) {
    const def = rule.rule_definition

    if (rule.rule_type === 'dietary' || rule.rule_type === 'allergy') {
      const restriction = (def.restriction as string | undefined)?.toLowerCase()
      if (!restriction) continue
      for (const recipe of recipes) {
        const tagsMatch = recipe.tags?.some((t) =>
          t.toLowerCase().includes(restriction)
        )
        const proteinMatch = recipe.protein_type
          ?.toLowerCase()
          .includes(restriction)
        if (tagsMatch || proteinMatch) {
          warnings.push({
            ruleId: rule.id,
            ruleType: rule.rule_type,
            message:
              (def.description as string | undefined) ??
              `Recipe "${recipe.title_en}" may violate a ${rule.rule_type} rule.`,
            severity: 'warning',
          })
          break
        }
      }
    } else if (rule.rule_type === 'preference') {
      const preference = def.preference as string | undefined
      if (!preference) continue
      // Simple informational preference — only warn if we can evaluate it
      // For now, surface a soft warning so planner can review
      warnings.push({
        ruleId: rule.id,
        ruleType: rule.rule_type,
        message:
          (def.description as string | undefined) ??
          `Preference rule: ${preference}`,
        severity: 'warning',
      })
    } else if (rule.rule_type === 'frequency') {
      const maxFrequency = (def.max_frequency as number | undefined) ?? 2
      const recipeIds = recipes.map((r) => r.id)
      const last4 = recentPlans.slice(0, 4)

      for (const recipeId of recipeIds) {
        const count = last4.filter((p) => p.recipeIds.includes(recipeId)).length
        if (count >= maxFrequency) {
          const recipe = recipes.find((r) => r.id === recipeId)
          warnings.push({
            ruleId: rule.id,
            ruleType: rule.rule_type,
            message:
              (def.description as string | undefined) ??
              `"${recipe?.title_en ?? recipeId}" has been cooked recently and may be repeated too often.`,
            severity: 'warning',
          })
        }
      }
    } else if (rule.rule_type === 'exclusion') {
      const excludedPair = def.excluded_pair as string[] | undefined
      if (!excludedPair || excludedPair.length < 2) continue
      const recipeIds = new Set(recipes.map((r) => r.id))
      if (excludedPair.every((id) => recipeIds.has(id))) {
        warnings.push({
          ruleId: rule.id,
          ruleType: rule.rule_type,
          message:
            (def.description as string | undefined) ??
            'Two incompatible recipes are selected together.',
          severity: 'warning',
        })
      }
    }
  }

  return warnings
}
