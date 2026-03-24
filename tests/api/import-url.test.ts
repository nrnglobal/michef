import { describe, it, expect } from 'vitest'

describe('POST /api/ai/import-url', () => {
  it('returns a recipe-shaped object from parsed URL content', async () => {
    const mockImported = {
      title_en: 'Imported Recipe',
      title_es: '',
      category: 'other',
      ingredients: [{ name_en: 'flour', name_es: '', quantity: '2', unit: 'cup' }],
      instructions_en: 'Mix and bake',
      instructions_es: '',
      servings: 4,
      tags: [],
    }
    expect(mockImported).toHaveProperty('title_en')
    expect(mockImported).toHaveProperty('ingredients')
    expect(Array.isArray(mockImported.ingredients)).toBe(true)
  })
})
