export async function POST(request: Request) {
  const { name } = await request.json()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Claude API key not configured' }, { status: 500 })
  }

  const prompt = `You are a culinary translator. Given a food or grocery item name (in any language), return its name in both English and Spanish, plus its grocery category.

Item: ${name?.trim() ?? ''}

Return this exact JSON shape, no markdown, no extra text:
{
  "ingredient_name_en": "English name",
  "ingredient_name_es": "Spanish name",
  "category": "one of: Produce, Meat & Seafood, Dairy & Eggs, Pantry, Bakery, Frozen, Beverages, Cleaning & Household, Other"
}`

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
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      return Response.json({ error: 'Claude API call failed', detail: errBody }, { status: 502 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''
    const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
    const parsed = JSON.parse(clean)
    return Response.json(parsed)
  } catch {
    return Response.json({ error: 'Failed to parse translation response' }, { status: 500 })
  }
}
