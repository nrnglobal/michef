export async function POST(request: Request) {
  const { url } = await request.json()

  // Step 1: Extract sheet ID from URL (per D-19)
  const match = url?.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (!match) {
    return Response.json(
      { error: 'Not a valid Google Sheets URL. Paste the share link from File > Share.' },
      { status: 400 }
    )
  }
  const sheetId = match[1]

  // Step 2: Fetch CSV from Google Sheets public export URL
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
  let csvText: string
  try {
    const res = await fetch(csvUrl, { redirect: 'follow' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    csvText = await res.text()
  } catch {
    return Response.json(
      { error: 'Could not fetch sheet. Make sure it is shared with "Anyone with the link".' },
      { status: 502 }
    )
  }

  // Step 3: Parse CSV by header names (not position — per Pitfall 5)
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) {
    return Response.json(
      { error: 'No items found. Check the sheet has data in the expected columns.' },
      { status: 400 }
    )
  }
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  }).filter(row => row.item_name_en?.trim()) // skip empty rows

  if (rows.length === 0) {
    return Response.json(
      { error: 'No items found. Check the sheet has data in the expected columns.' },
      { status: 400 }
    )
  }

  // Step 4: Batch translate blank Spanish names (per D-23, Pitfall 6)
  const blankSpanish = rows.filter(r => !r.item_name_es?.trim())
  let translations: Record<string, string> = {}

  if (blankSpanish.length > 0) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      try {
        const namesToTranslate = blankSpanish.map(r => r.item_name_en.trim())
        const prompt = `Translate these grocery item names from English to Mexican Spanish. Return a JSON object mapping each English name to its Spanish translation. Be precise with culinary terms.\n\nItems:\n${namesToTranslate.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n\nReturn JSON only: { "English name": "Spanish translation", ... }`

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 2048,
            messages: [{ role: 'user', content: prompt }],
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const text = data.content?.[0]?.text ?? ''
          const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
          translations = JSON.parse(clean)
        }
      } catch {
        // Translation failed — items will have blank Spanish names; user can translate later
      }
    }
  }

  // Step 5: Build parsed items with translations applied
  const VALID_CATEGORIES = ['Produce', 'Protein', 'Dairy', 'Grains', 'Pantry', 'Spices', 'Other']
  const items = rows.map(row => ({
    item_name_en: row.item_name_en?.trim() ?? '',
    item_name_es: row.item_name_es?.trim() || translations[row.item_name_en?.trim()] || '',
    quantity: row.quantity?.trim() ?? '',
    category: VALID_CATEGORIES.includes(row.category?.trim()) ? row.category.trim() : 'Other',
    source: row.source?.trim() ?? '',
    brand: row.brand?.trim() ?? '',
    is_staple: row.is_staple?.toLowerCase() === 'true',
  }))

  return Response.json({ items })
}
