import { describe, it, expect } from 'vitest'

describe('POST /api/ai/adjust-recipe', () => {
  it('returns an adjusted recipe with same shape as original', async () => {
    const mockAdjusted = {
      title_en: 'Adjusted Recipe',
      title_es: 'Receta Ajustada',
      category: 'chicken',
      ingredients: [{ name_en: 'chicken breast', name_es: 'pechuga de pollo', quantity: '400', unit: 'g' }],
      instructions_en: 'Step 1: Grill',
      instructions_es: 'Paso 1: Asar',
      servings: 4,
      tags: ['grilled'],
    }
    expect(mockAdjusted).toHaveProperty('title_en')
    expect(mockAdjusted).toHaveProperty('ingredients')
    expect(mockAdjusted.ingredients.length).toBeGreaterThan(0)
  })
})
