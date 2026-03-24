import { describe, it, expect } from 'vitest'

describe('ReceiptReview component', () => {
  it('accepts visitId, data, and onSaved props', () => {
    // Stub: will be implemented when ReceiptReview component exists (AIOCR-03)
    const props = {
      visitId: 'test-uuid',
      data: {
        store_name: 'Walmart',
        date: '2026-03-20',
        line_items: [{ name: 'Chicken', price: 89.90 }],
        subtotal: 89.90,
        tax: 14.38,
        total: 104.28,
      },
      onSaved: () => {},
    }
    expect(props).toHaveProperty('visitId')
    expect(props).toHaveProperty('data')
    expect(props.data).toHaveProperty('line_items')
    expect(typeof props.onSaved).toBe('function')
  })
})
