export async function POST(request: Request) {
  const { title_en, description_en, ingredients, instructions_en } = await request.json()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'Claude API key not configured' },
      { status: 500 }
    )
  }

  // Build ingredient list for translation — include ALL ingredient positions so the
  // response array indices align with the form's ingredient array indices.
  const ingredientsToTranslate = (ingredients ?? [])
    .map((ing: { name_en: string }, idx: number) => `${idx}: ${ing.name_en?.trim() ?? ''}`)
    .join('\n')

  const prompt = `You are a professional culinary translator. Translate the following recipe content from English to Spanish. Return JSON only, no markdown, no extra text.

English content:
- Title: ${title_en ?? ''}
- Description: ${description_en ?? ''}
- Instructions: ${instructions_en ?? ''}
- Ingredient names (index: name):
${ingredientsToTranslate}

Return this exact JSON shape:
{
  "title_es": "Spanish title",
  "description_es": "Spanish description or empty string if no English description",
  "instructions_es": "Spanish instructions or empty string if no English instructions",
  "ingredient_names_es": ["name0_es", "name1_es", "..."]
}

Translate naturally and accurately. Keep cooking terms precise. Ingredient names should be common Spanish culinary names. If a field is empty or missing, return an empty string for it.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
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

    return Response.json(parsed)
  } catch {
    return Response.json(
      { error: 'Failed to parse translation response' },
      { status: 500 }
    )
  }
}
