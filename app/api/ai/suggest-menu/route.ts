import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { visitDate, currentRecipeIds } = await request.json()
  const supabase = await createClient()

  // 1. Fetch all active recipes
  const { data: allRecipes } = await supabase
    .from('recipes')
    .select('id, title_en, category, protein_type, tags')
    .eq('is_active', true)

  // 2. Fetch active cooking rules
  const { data: rules } = await supabase
    .from('cooking_rules')
    .select('rule_type, rule_definition, is_active')
    .eq('is_active', true)

  // 3. Fetch recent confirmed plans (last 4) with their recipe IDs
  const { data: recentPlans } = await supabase
    .from('menu_plans')
    .select('id, visit_date, menu_plan_items(recipe_id)')
    .eq('status', 'confirmed')
    .order('visit_date', { ascending: false })
    .limit(4)

  // 4. Build Claude prompt
  const prompt = `You are a household menu planning assistant. Suggest 2-4 recipes for a cooking visit on ${visitDate}.

Available recipes:
${JSON.stringify(
    allRecipes?.map((r) => ({
      id: r.id,
      title: r.title_en,
      category: r.category,
      protein: r.protein_type,
      tags: r.tags,
    })),
    null,
    2
  )}

Active cooking rules:
${JSON.stringify(
    rules?.map((r) => ({ type: r.rule_type, definition: r.rule_definition })),
    null,
    2
  )}

Recently cooked recipe IDs (avoid repeating):
${JSON.stringify(
    recentPlans?.flatMap(
      (p: { menu_plan_items?: { recipe_id: string }[] }) =>
        p.menu_plan_items?.map((i) => i.recipe_id) ?? []
    ) ?? []
  )}

Currently selected recipe IDs (may be empty):
${JSON.stringify(currentRecipeIds ?? [])}

Return JSON only, no markdown. Format:
{
  "recipes": [
    { "id": "uuid", "title_en": "name", "rationale_en": "why this recipe" }
  ],
  "summary_rationale": "overall reasoning"
}`

  // 5. Call Claude API
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'Claude API key not configured' },
      { status: 500 }
    )
  }

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
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
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
