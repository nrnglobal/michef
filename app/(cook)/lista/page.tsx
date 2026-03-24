'use client'

import { useEffect, useState } from 'react'
import { Plus, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/lib/i18n/config'
import { toTitleCase, formatDateEs } from '@/lib/utils'
import type { ShoppingListItem } from '@/lib/types'

export default function ListaPage() {
  const { t } = useI18n()
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [listId, setListId] = useState<string | null>(null)
  const [visitDate, setVisitDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInput, setShowInput] = useState(false)
  const [inputText, setInputText] = useState('')

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // 1. Find next upcoming visit (same source of truth as /visita)
      const { data: visitData } = await supabase
        .from('visits')
        .select('id, visit_date, menu_plan_id')
        .gte('visit_date', new Date().toISOString().split('T')[0])
        .order('visit_date', { ascending: true })
        .limit(1)
        .single()

      if (!visitData?.menu_plan_id) {
        setLoading(false)
        return
      }

      setVisitDate(visitData.visit_date)

      // 2. Find shopping list for that plan
      const { data: listData } = await supabase
        .from('shopping_lists')
        .select('id')
        .eq('menu_plan_id', visitData.menu_plan_id)
        .single()

      if (!listData) {
        setLoading(false)
        return
      }

      setListId(listData.id)

      // 3. Fetch all items
      const { data: itemsData } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('shopping_list_id', listData.id)
        .order('category')
        .order('ingredient_name_es')

      if (itemsData) {
        setItems(itemsData as ShoppingListItem[])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  async function handleCheck(itemId: string, checked: boolean) {
    // 1. Optimistic local update
    setItems(prev =>
      prev.map(i =>
        i.id === itemId
          ? { ...i, is_checked: checked, checked_at: checked ? new Date().toISOString() : undefined }
          : i
      )
    )

    // 2. Persist to Supabase
    const supabase = createClient()
    const { error } = await supabase
      .from('shopping_list_items')
      .update({
        is_checked: checked,
        checked_at: checked ? new Date().toISOString() : null,
      })
      .eq('id', itemId)

    // 3. Revert on error
    if (error) {
      setItems(prev =>
        prev.map(i =>
          i.id === itemId
            ? { ...i, is_checked: !checked, checked_at: undefined }
            : i
        )
      )
      toast.error(t('shopping.checkError'))
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!inputText.trim() || !listId) return

    const newItem: ShoppingListItem = {
      id: crypto.randomUUID(),
      shopping_list_id: listId,
      ingredient_name_en: inputText.trim(),
      ingredient_name_es: inputText.trim(),
      quantity: undefined,
      unit: undefined,
      category: 'Other',
      is_checked: false,
      is_always_stock: false,
    }

    // Optimistic add
    setItems(prev => [...prev, newItem])
    setInputText('')
    setShowInput(false)

    const supabase = createClient()
    await supabase.from('shopping_list_items').insert({
      shopping_list_id: listId,
      ingredient_name_en: newItem.ingredient_name_en,
      ingredient_name_es: newItem.ingredient_name_es,
      quantity: null,
      unit: null,
      category: 'Other',
      is_checked: false,
      is_always_stock: false,
    })
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 flex items-center justify-center py-16">
        <p className="text-sm" style={{ color: 'var(--casa-text-faint)' }}>
          {t('common.loading')}
        </p>
      </div>
    )
  }

  const checkedCount = items.filter(i => i.is_checked).length

  if (items.length === 0 && !listId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex flex-col items-center py-16 text-center">
          <ShoppingCart className="w-10 h-10 mb-3" style={{ color: 'var(--casa-icon-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--casa-text)' }}>
            {t('shopping.emptyList')}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--casa-text-faint)' }}>
            {t('shopping.emptyListBody')}
          </p>
        </div>
      </div>
    )
  }

  // Group items by category
  const categoryGroups = items.reduce<Record<string, ShoppingListItem[]>>((acc, item) => {
    const cat = item.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const categories = Object.keys(categoryGroups).sort()

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--casa-text)' }}>
          Lista de Compras
        </h1>
        {visitDate && (
          <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--casa-text-faint)' }}>
            {formatDateEs(visitDate)}
          </p>
        )}
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ color: 'var(--casa-primary)', backgroundColor: 'var(--casa-primary-bg)' }}
          aria-live="polite"
        >
          {t('shopping.runningCount', { n: checkedCount, total: items.length })}
        </span>
      </div>

      {/* Ad-hoc input (shown when + is tapped) */}
      {showInput && (
        <form onSubmit={handleAddItem} className="flex gap-2">
          <input
            type="text"
            autoFocus
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={t('shopping.addItemPlaceholder')}
            className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2"
            style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text)' }}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setShowInput(false)
                setInputText('')
              }
            }}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--casa-primary)' }}
          >
            Agregar
          </button>
        </form>
      )}

      {/* Recipe items grouped by category */}
      {categories.map((cat, catIdx) => (
        <div key={cat}>
          {catIdx > 0 && <Separator className="my-2" />}
          <p
            className="text-xs uppercase tracking-wide font-medium py-2 border-b"
            style={{ color: 'var(--casa-text-faint)', borderColor: 'var(--casa-border)' }}
          >
            {cat}
          </p>
          <ul>
            {categoryGroups[cat].map(item => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-1 min-h-12 transition-opacity"
                style={{ opacity: item.is_checked ? 0.5 : 1 }}
              >
                <Checkbox
                  checked={item.is_checked}
                  onCheckedChange={(checked: boolean) => handleCheck(item.id, checked)}
                  aria-label={`${item.ingredient_name_es}${item.quantity ? `, ${item.quantity}` : ''}${item.unit ? ` ${item.unit}` : ''}`}
                  className="w-6 h-6 shrink-0"
                  style={{ accentColor: 'var(--casa-primary)' } as React.CSSProperties}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm"
                    style={{ color: item.is_checked ? 'var(--casa-text-faint)' : 'var(--casa-text)' }}
                  >
                    {toTitleCase(item.ingredient_name_es)}
                  </p>
                  {(item.quantity || item.unit) && (
                    <p className="text-xs" style={{ color: 'var(--casa-text-faint)' }}>
                      {item.quantity ? `${item.quantity} ` : ''}{item.unit ?? ''}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Empty state when list exists but no items */}
      {items.length === 0 && listId && (
        <div className="flex flex-col items-center py-16 text-center">
          <ShoppingCart className="w-10 h-10 mb-3" style={{ color: 'var(--casa-icon-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--casa-text)' }}>
            {t('shopping.emptyList')}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--casa-text-faint)' }}>
            {t('shopping.emptyListBody')}
          </p>
        </div>
      )}

      {/* Floating add button */}
      {listId && (
        <button
          type="button"
          onClick={() => setShowInput(s => !s)}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--casa-primary)' }}
          aria-label={t('shopping.addItem')}
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  )
}
