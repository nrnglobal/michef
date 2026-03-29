import { createClient } from '@/lib/supabase/server'
import type { Recipe } from '@/lib/types'

// Build a prioritised list of search queries for a recipe, from specific to broad.
function buildSearchQueries(title: string, proteinType?: string | null): string[] {
  const queries: string[] = [title.trim()]

  // Strip parenthetical descriptors: "Bacon (cooked)" → "Bacon"
  const withoutParens = title.replace(/\s*\([^)]*\)/g, '').trim()
  if (withoutParens && withoutParens !== title.trim()) queries.push(withoutParens)

  // Strip leading possessive names: "Marcus' Chicken" → "Chicken"
  const withoutPossessive = title.replace(/^\S+'s?\s+/i, '').trim()
  if (withoutPossessive && withoutPossessive !== title.trim()) queries.push(withoutPossessive)

  // Strip both: "Marcus' Chicken (cooked)" → "Chicken"
  const cleaned = withoutPossessive.replace(/\s*\([^)]*\)/g, '').trim()
  if (cleaned && cleaned !== withoutPossessive) queries.push(cleaned)

  // Last resort: protein type (e.g. "chicken", "salmon")
  if (proteinType?.trim()) queries.push(proteinType.trim())

  return [...new Set(queries)].filter(Boolean)
}

async function searchSpoonacular(query: string, apiKey: string): Promise<string | null> {
  const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=1&apiKey=${apiKey}`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) return null

  const data = await res.json()
  const image: string | undefined = data.results?.[0]?.image
  if (!image) return null

  // Spoonacular sometimes returns just a filename — ensure a full URL
  return image.startsWith('http') ? image : `https://spoonacular.com/recipeImages/${image}`
}

export async function POST() {
  const apiKey = process.env.SPOONACULAR_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Spoonacular API key not configured' }, { status: 500 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('recipes')
    .select('id, title_en, protein_type')
    .or('image_url.is.null,image_url.eq.')

  if (error) {
    return Response.json({ error: 'Failed to fetch recipes' }, { status: 500 })
  }

  const recipes = (data ?? []) as Pick<Recipe, 'id' | 'title_en' | 'protein_type'>[]

  let updated = 0
  let failed = 0

  for (const recipe of recipes) {
    if (!recipe.title_en?.trim()) {
      failed++
      continue
    }

    const queries = buildSearchQueries(recipe.title_en, recipe.protein_type)
    let imageUrl: string | null = null

    for (const query of queries) {
      try {
        imageUrl = await searchSpoonacular(query, apiKey)
        if (imageUrl) break
      } catch {
        // try next query
      }
      await new Promise((r) => setTimeout(r, 150))
    }

    if (!imageUrl) {
      failed++
      continue
    }

    const { error: updateError } = await supabase
      .from('recipes')
      .update({ image_url: imageUrl })
      .eq('id', recipe.id)

    if (updateError) {
      failed++
    } else {
      updated++
    }

    await new Promise((r) => setTimeout(r, 150))
  }

  return Response.json({
    total: recipes.length,
    updated,
    failed,
    skipped: recipes.length - updated - failed,
  })
}
