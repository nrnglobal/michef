import { createClient } from '@/lib/supabase/server'
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

      <InventoryClient items={allItems} />
    </div>
  )
}
