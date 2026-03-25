import { createClient } from '@/lib/supabase/server'
import { Refrigerator } from 'lucide-react'
import type { FridgeStaple } from '@/lib/types'
import { InventoryClient } from './inventory-client'

export default async function InventoryPage() {
  const supabase = await createClient()

  const { data: items } = await supabase
    .from('fridge_staples')
    .select('*')
    .order('category')
    .order('item_name_en')

  const allItems = (items ?? []) as FridgeStaple[]

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--casa-text)' }}>
            Inventory
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--casa-text-muted)' }}>
            Track what you have on hand
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
        <div
          className="flex flex-col items-center py-16 text-center rounded-xl border"
          style={{ borderColor: 'var(--casa-border)', borderStyle: 'dashed' }}
        >
          <Refrigerator className="w-10 h-10 mb-3" style={{ color: 'var(--casa-icon-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--casa-text)' }}>
            No inventory items yet
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--casa-text-faint)' }}>
            Add items you keep on hand so your shopping list only shows what&apos;s missing.
          </p>
        </div>
      ) : (
        <InventoryClient items={allItems} />
      )}
    </div>
  )
}
