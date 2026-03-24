import { createClient } from '@/lib/supabase/server'
import type { Recipe } from '@/lib/types'

interface AdjustFeedback {
  rating?: number
  feedback_text?: string
  adjustment_type?: string
  adjustment_detail?: string
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Claude API key not configured' }, { status: 500 })
  }

  const body = await request.json()
  const recipe: Recipe = body.recipe
  const feedback: AdjustFeedback = body.feedback

  if (!recipe || !feedback) {
    return Response.json({ error: 'recipe and feedback are required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: rulesData } = await supabase
    .from('cooking_rules')
    .select('rule_type, rule_definition, is_active')
    .eq('is_active', true)

  const rules = rulesData ?? []

  try {
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
            text: `You are a bilingual household recipe assistant that adjusts recipes based on feedback. You must respect these cooking rules:\n${JSON.stringify(rules)}\n\nAlways return both English and Spanish translations for all text fields.`,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [
          {
            role: 'user',
            content: `Adjust this recipe based on the feedback below. Return the COMPLETE adjusted recipe as JSON (same format as input), not just the changed parts. Return JSON only, no markdown fences.\n\nOriginal recipe:\n${JSON.stringify(recipe)}\n\nFeedback:\n- Rating: ${feedback.rating ?? 'none'}\n- Comment: ${feedback.feedback_text ?? 'none'}\n- Adjustment type: ${feedback.adjustment_type ?? 'none'}\n- Adjustment detail: ${feedback.adjustment_detail ?? 'none'}\n\nReturn the full adjusted recipe in this exact JSON format:\n{\n  "title_en": "...", "title_es": "...",\n  "description_en": "...", "description_es": "...",\n  "category": "...", "protein_type": "...",\n  "prep_time_minutes": 30, "servings": 4,\n  "tags": [...],\n  "ingredients": [{"name_en":"...","name_es":"...","quantity":"...","unit":"...","category":"..."}],\n  "instructions_en": "...", "instructions_es": "..."\n}`,
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

    try {
      const parsed = JSON.parse(clean)
      return Response.json(parsed)
    } catch {
      return Response.json({ error: 'Failed to parse adjusted recipe' }, { status: 500 })
    }
  } catch {
    return Response.json({ error: 'Failed to parse adjusted recipe' }, { status: 500 })
  }
}
