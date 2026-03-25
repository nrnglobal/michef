export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') ?? ''
  const number = searchParams.get('number') ?? '10'

  if (!query.trim()) {
    return Response.json({ error: 'Query is required' }, { status: 400 })
  }

  const apiKey = process.env.SPOONACULAR_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Spoonacular API key not configured' }, { status: 500 })
  }

  try {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=${number}&apiKey=${apiKey}&addRecipeInformation=true`
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return Response.json({ error: 'Spoonacular search failed' }, { status: 502 })
    }

    const data = await response.json()

    const results = (data.results ?? []).map(
      (item: {
        id: number
        title: string
        image: string
        readyInMinutes: number
        servings: number
        dishTypes: string[]
      }) => ({
        id: item.id,
        title: item.title,
        image: item.image,
        readyInMinutes: item.readyInMinutes,
        servings: item.servings,
        dishTypes: item.dishTypes ?? [],
      })
    )

    return Response.json(results)
  } catch {
    return Response.json({ error: 'Spoonacular search failed' }, { status: 502 })
  }
}
