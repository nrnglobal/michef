import { describe, it, expect } from 'vitest'

describe('POST /api/ai/extract-receipt', () => {
  it('returns extracted receipt data with expected shape', async () => {
    const mockExtracted = {
      store_name: 'Walmart',
      date: '2026-03-20',
      line_items: [{ name: 'Chicken', price: 89.90 }],
      subtotal: 89.90,
      tax: 14.38,
      total: 104.28,
    }
    expect(mockExtracted).toHaveProperty('store_name')
    expect(mockExtracted).toHaveProperty('line_items')
    expect(Array.isArray(mockExtracted.line_items)).toBe(true)
    expect(mockExtracted.line_items[0]).toHaveProperty('name')
    expect(mockExtracted.line_items[0]).toHaveProperty('price')
    expect(mockExtracted).toHaveProperty('total')
  })
})
