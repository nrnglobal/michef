import { createClient } from '@/lib/supabase/server'
import { ShoppingCart } from 'lucide-react'
import { toTitleCase } from '@/lib/utils'
import type { ShoppingListItem } from '@/lib/types'
import { ShoppingListClient } from './shopping-list-client'

export default async function ShoppingListsPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Find next upcoming confirmed plan
  const { data: plan } = await supabase
    .from('menu_plans')
    .select('id, visit_date')
    .eq('status', 'confirmed')
    .gte('visit_date', today)
    .order('visit_date', { ascending: true })
    .limit(1)
    .single()

  if (!plan) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--casa-text)' }}>
          Shopping List
        </h1>
        <div
          className="flex flex-col items-center py-16 text-center rounded-xl border"
          style={{ borderColor: 'var(--casa-border)', borderStyle: 'dashed' }}
        >
          <ShoppingCart className="w-10 h-10 mb-3" style={{ color: 'var(--casa-icon-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--casa-text)' }}>
            No confirmed menu yet
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--casa-text-faint)' }}>
            Confirm a menu plan to generate a shopping list.
          </p>
        </div>
      </div>
    )
  }

  // Get shopping list for this plan
  const { data: list } = await supabase
    .from('shopping_lists')
    .select('id')
    .eq('menu_plan_id', plan.id)
    .single()

  if (!list) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--casa-text)' }}>
          Shopping List
        </h1>
        <p className="text-sm" style={{ color: 'var(--casa-text-faint)' }}>
          Shopping list not found for this plan.
        </p>
      </div>
    )
  }

  const { data: items } = await supabase
    .from('shopping_list_items')
    .select('*')
    .eq('shopping_list_id', list.id)
    .order('category')
    .order('ingredient_name_en')

  const allItems = (items ?? []) as ShoppingListItem[]

  // Group by category
  const categoryGroups = allItems.reduce<Record<string, ShoppingListItem[]>>((acc, item) => {
    const cat = item.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--casa-text)' }}>
            Shopping List
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--casa-text-muted)' }}>
            Visit on {new Date(plan.visit_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ color: 'var(--casa-primary)', backgroundColor: 'var(--casa-primary-bg)' }}
        >
          {allItems.length} items
        </span>
      </div>

      {allItems.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <ShoppingCart className="w-10 h-10 mb-3" style={{ color: 'var(--casa-icon-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--casa-text)' }}>List is empty</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(categoryGroups).sort().map((cat) => (
            <div key={cat}>
              <p
                className="text-xs uppercase tracking-wide font-medium py-1.5 border-b mb-1"
                style={{ color: 'var(--casa-text-faint)', borderColor: 'var(--casa-border)' }}
              >
                {cat}
              </p>
              <ul className="space-y-0.5">
                {categoryGroups[cat].map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 px-1 py-2.5 rounded-lg"
                    style={{ borderBottom: '1px solid var(--casa-border)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--casa-text)' }}>
                        {toTitleCase(item.ingredient_name_en)}
                      </p>
                      {item.ingredient_name_es && item.ingredient_name_es !== item.ingredient_name_en && (
                        <p className="text-xs" style={{ color: 'var(--casa-text-faint)' }}>
                          {toTitleCase(item.ingredient_name_es)}
                        </p>
                      )}
                    </div>
                    {(item.quantity || item.unit) && (
                      <p className="text-sm shrink-0" style={{ color: 'var(--casa-text-muted)' }}>
                        {item.quantity ? `${item.quantity}` : ''}{item.unit ? ` ${item.unit}` : ''}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <ShoppingListClient listId={list.id} />
    </div>
  )
}
