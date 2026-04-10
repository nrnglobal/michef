import { createClient } from '@/lib/supabase/server'
import { ShoppingCart } from 'lucide-react'
import type { ShoppingListItem } from '@/lib/types'
import { ShoppingListClient } from './shopping-list-client'

export default async function ShoppingListsPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Find next upcoming plan
  const { data: plan } = await supabase
    .from('menu_plans')
    .select('id, visit_date')
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
            No upcoming menu yet
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--casa-text-faint)' }}>
            Plan a menu to generate a shopping list.
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
      ) : null}

      <ShoppingListClient listId={list.id} items={allItems} />
    </div>
  )
}
