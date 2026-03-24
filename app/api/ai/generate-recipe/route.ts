import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { category, proteinFocus } = await request.json()
  const supabase = await createClient()

  // 1. Fetch active cooking rules
  const { data: rules } = await supabase
    .from('cooking_rules')
    .select('rule_type, rule_definition, is_active')
    .eq('is_active', true)

  // 2. Fetch recent recipe titles (last 20)
  const { data: existingRecipes } = await supabase
    .from('recipes')
    .select('title_en, category, protein_type')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(20)

  // 3. Fetch recent feedback to understand preferences
  const { data: recentFeedback } = await supabase
    .from('recipe_feedback')
    .select('recipe_id, rating, feedback_text')
    .order('created_at', { ascending: false })
    .limit(10)

  // 4. Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'Claude API key not configured' },
      { status: 500 }
    )
  }

  try {
    // 5. Call Claude API with prompt caching on system prompt (D-20)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: [
          {
            type: 'text',
            text: `You are a bilingual household recipe assistant. You create recipes in both English and Spanish.\n\nActive cooking rules:\n${JSON.stringify(rules)}\n\nExisting recipes in library (avoid duplicates):\n${JSON.stringify(existingRecipes)}\n\nRecent feedback on recipes:\n${JSON.stringify(recentFeedback)}`,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [
          {
            role: 'user',
            content: `Generate one new ${category} recipe${proteinFocus ? ` featuring ${proteinFocus}` : ''}. Return JSON only, no markdown. Format:\n{\n  "title_en": "English title",\n  "title_es": "Spanish title",\n  "description_en": "Brief English description",\n  "description_es": "Brief Spanish description",\n  "category": "${category}",\n  "protein_type": "${proteinFocus || ''}",\n  "prep_time_minutes": 30,\n  "servings": 4,\n  "tags": ["tag1", "tag2"],\n  "ingredients": [{"name_en":"ingredient","name_es":"ingrediente","quantity":"100","unit":"g","category":"produce"}],\n  "instructions_en": "Step 1: ...",\n  "instructions_es": "Paso 1: ..."\n}`,
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
      { error: 'Failed to parse AI response' },
      { status: 500 }
    )
  }
}
