export async function POST(request: Request) {
  const body = await request.json()
  const { url } = body

  if (!url || typeof url !== 'string' || !url.trim()) {
    return Response.json({ error: 'URL is required' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Claude API key not configured' }, { status: 500 })
  }

  let pageContent: string
  try {
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MiChef/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!pageResponse.ok) {
      return Response.json(
        { error: 'Could not fetch URL', status: pageResponse.status },
        { status: 502 }
      )
    }
    pageContent = await pageResponse.text()
  } catch {
    return Response.json({ error: 'Could not fetch URL' }, { status: 502 })
  }

  const truncated = pageContent.slice(0, 50000)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `Extract a recipe from the following web page HTML. Return JSON only, no markdown fences. If you cannot find a recipe, return {"error": "no recipe found"}. If some fields are unclear, make your best guess and leave unclear fields as empty strings.\n\nFormat:\n{\n  "title_en": "English title",\n  "title_es": "Spanish translation of title",\n  "description_en": "Brief English description",\n  "description_es": "Brief Spanish description",\n  "category": "one of: beef, chicken, seafood, veggies, snacks, carbs, soups, salads, other",\n  "protein_type": "main protein or empty string",\n  "prep_time_minutes": 30,\n  "servings": 4,\n  "tags": ["tag1", "tag2"],\n  "ingredients": [{"name_en":"ingredient","name_es":"Spanish name","quantity":"100","unit":"g","category":"produce"}],\n  "instructions_en": "Step 1: ...",\n  "instructions_es": "Paso 1: ..."\n}\n\nWeb page content:\n${truncated}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      return Response.json(
        { error: 'Claude API call failed', status: response.status, detail: errBody },
        { status: 502 }
      )
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''
    const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
    const parsed = JSON.parse(clean)

    if (parsed.error) {
      return Response.json(
        { error: parsed.error || 'No recipe found on this page' },
        { status: 422 }
      )
    }

    return Response.json(parsed)
  } catch {
    return Response.json({ error: 'Failed to parse recipe from URL' }, { status: 500 })
  }
}
