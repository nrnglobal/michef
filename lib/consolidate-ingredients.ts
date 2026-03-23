import type { Ingredient } from '@/lib/types'

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Produce: [
    'tomato', 'onion', 'garlic', 'lime', 'lemon', 'cilantro', 'jalapeño', 'jalapen',
    'avocado', 'mango', 'cucumber', 'pepper', 'spinach', 'kale', 'lettuce',
    'carrot', 'celery', 'zucchini', 'mushroom', 'date', 'apple', 'banana',
    'ginger', 'scallion', 'green onion', 'cabbage', 'corn', 'potato',
  ],
  Protein: [
    'chicken', 'beef', 'pork', 'shrimp', 'salmon', 'tuna', 'turkey', 'egg',
    'tofu', 'tempeh', 'lentil', 'bean', 'chickpea', 'almond butter', 'peanut butter',
  ],
  Dairy: [
    'cheese', 'milk', 'cream', 'butter', 'yogurt', 'sour cream', 'crema',
    'cotija', 'queso', 'parmesan', 'mozzarella', 'feta',
  ],
  Grains: [
    'oat', 'rice', 'quinoa', 'pasta', 'bread', 'tortilla', 'flour', 'breadcrumb',
    'noodle', 'couscous', 'barley',
  ],
  Pantry: [
    'oil', 'vinegar', 'soy sauce', 'broth', 'stock', 'coconut milk', 'tomato paste',
    'tomato sauce', 'salsa', 'honey', 'maple syrup', 'chocolate chip', 'cocoa',
    'vanilla', 'almond', 'walnut', 'pecan', 'cashew', 'chia', 'flax',
    'tahini', 'mustard', 'mayonnaise', 'ketchup', 'worcestershire',
  ],
  Spices: [
    'salt', 'pepper', 'cumin', 'paprika', 'chili', 'oregano', 'thyme', 'rosemary',
    'cinnamon', 'turmeric', 'cayenne', 'coriander', 'bay leaf', 'allspice',
    'garlic powder', 'onion powder', 'seasoning', 'spice',
  ],
}

function inferCategory(nameEn: string): string {
  const lower = nameEn.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat
  }
  return 'Other'
}

export interface ConsolidatedItem {
  ingredient_name_en: string
  ingredient_name_es: string
  quantity: number | null
  unit: string | null
  category: string
  source_recipe_ids: string[]
}

const UNIT_ALIASES: Record<string, string> = {
  cups: 'cup',
  tbsp: 'tablespoon',
  tsp: 'teaspoon',
  pieces: 'piece',
  cloves: 'clove',
}

function normalizeUnit(unit: string): string {
  const lower = unit.toLowerCase().trim()
  return UNIT_ALIASES[lower] ?? lower
}

function mergeKey(ingredient: Ingredient): string {
  const name = ingredient.name_en.toLowerCase().trim()
  const unit = normalizeUnit(ingredient.unit ?? '')
  return `${name}|${unit}`
}

export function consolidateIngredients(
  recipes: Array<{ id: string; ingredients: Ingredient[] }>
): ConsolidatedItem[] {
  const map = new Map<string, ConsolidatedItem>()

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const key = mergeKey(ingredient)
      const qty = parseFloat(ingredient.quantity)
      const existing = map.get(key)

      if (existing) {
        if (!isNaN(qty) && existing.quantity !== null) {
          existing.quantity = existing.quantity + qty
        } else if (!isNaN(qty) && existing.quantity === null) {
          existing.quantity = qty
        }
        if (!existing.source_recipe_ids.includes(recipe.id)) {
          existing.source_recipe_ids.push(recipe.id)
        }
      } else {
        const normalizedUnit = normalizeUnit(ingredient.unit ?? '')
        map.set(key, {
          ingredient_name_en: ingredient.name_en,
          ingredient_name_es: ingredient.name_es,
          quantity: isNaN(qty) ? null : qty,
          unit: normalizedUnit === '' ? null : normalizedUnit,
          category: ingredient.category ?? inferCategory(ingredient.name_en),
          source_recipe_ids: [recipe.id],
        })
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const catCmp = a.category.localeCompare(b.category)
    if (catCmp !== 0) return catCmp
    return a.ingredient_name_en.localeCompare(b.ingredient_name_en)
  })
}
