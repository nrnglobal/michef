import type { Ingredient } from '@/lib/types'

const CATEGORIES = ['beef', 'chicken', 'seafood', 'veggies', 'snacks', 'carbs', 'soups', 'salads', 'other']

function mapDishTypesToCategory(dishTypes: string[]): string {
  for (const dt of dishTypes) {
    const lower = dt.toLowerCase()
    if (lower.includes('soup') || lower.includes('stew')) return 'soups'
    if (lower.includes('salad')) return 'salads'
    if (lower.includes('snack') || lower.includes('appetizer') || lower.includes('fingerfood')) return 'snacks'
    if (
      lower.includes('bread') ||
      lower.includes('pasta') ||
      lower.includes('rice') ||
      lower.includes('side dish')
    )
      return 'carbs'
    if (lower.includes('beef') || lower.includes('pork') || lower.includes('lamb')) return 'beef'
    if (lower.includes('chicken') || lower.includes('poultry')) return 'chicken'
    if (lower.includes('seafood') || lower.includes('fish')) return 'seafood'
    if (lower.includes('vegetarian') || lower.includes('vegan')) return 'veggies'
  }
  return 'other'
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return Response.json({ error: 'Recipe ID is required' }, { status: 400 })
  }

  const apiKey = process.env.SPOONACULAR_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Spoonacular API key not configured' }, { status: 500 })
  }

  try {
    const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return Response.json({ error: 'Could not fetch recipe details' }, { status: 502 })
    }

    const data = await response.json()

    // Map ingredients
    const ingredients: Ingredient[] = (data.extendedIngredients ?? []).map(
      (ing: { name: string; amount: number; unit: string; aisle?: string }) => ({
        name_en: ing.name ?? '',
        name_es: '',
        quantity: String(ing.amount ?? ''),
        unit: ing.unit ?? '',
        category: ing.aisle ?? '',
      })
    )

    // Map instructions
    let instructions_en = ''
    if (data.analyzedInstructions?.[0]?.steps?.length > 0) {
      instructions_en = (
        data.analyzedInstructions[0].steps as { number: number; step: string }[]
      )
        .map((s) => `Step ${s.number}: ${s.step}`)
        .join('\n')
    } else if (data.instructions) {
      instructions_en = stripHtml(data.instructions)
    }

    // Map description
    const rawSummary = data.summary ? stripHtml(data.summary) : ''
    const description_en = rawSummary.slice(0, 500)

    // Map category
    const dishTypes: string[] = data.dishTypes ?? []
    const category = mapDishTypesToCategory(dishTypes)

    // Validate category is in the known list
    const safeCategory = CATEGORIES.includes(category) ? category : 'other'

    const mapped = {
      title_en: data.title ?? '',
      title_es: '',
      description_en,
      description_es: '',
      prep_time_minutes: data.readyInMinutes ?? undefined,
      servings: data.servings ?? 2,
      category: safeCategory,
      ingredients,
      instructions_en,
      instructions_es: '',
      tags: (dishTypes as string[]).slice(0, 5),
      image_url: data.image ?? '',
    }

    return Response.json(mapped)
  } catch {
    return Response.json({ error: 'Could not fetch recipe details' }, { status: 502 })
  }
}
