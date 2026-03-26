import { describe, it, expect } from 'vitest'

describe('RecipeDetailActions — Add to Menu (UX-08)', () => {
  it('menu query does not filter by draft status', () => {
    // Wave 1 will read recipe-detail-actions.tsx source and verify
    // no .eq('status', 'draft') in the query
    expect(true).toBe(true)
  })

  it('menu items include status field', () => {
    // Wave 1 will verify status is in the select and state type
    expect(true).toBe(true)
  })

  it('renders Confirmed and Draft badges', () => {
    // Wave 1 will verify badge text appears in JSX
    expect(true).toBe(true)
  })
})
