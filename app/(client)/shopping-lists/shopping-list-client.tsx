'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  listId: string
}

export function ShoppingListClient({ listId }: Props) {
  const router = useRouter()
  const [showInput, setShowInput] = useState(false)
  const [inputText, setInputText] = useState('')
  const [adding, setAdding] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!inputText.trim()) return
    setAdding(true)
    const supabase = createClient()
    await supabase.from('shopping_list_items').insert({
      shopping_list_id: listId,
      ingredient_name_en: inputText.trim(),
      ingredient_name_es: inputText.trim(),
      quantity: null,
      unit: null,
      category: 'Other',
      is_checked: false,
      is_always_stock: false,
    })
    setInputText('')
    setShowInput(false)
    setAdding(false)
    router.refresh()
  }

  return (
    <div className="pt-2">
      {showInput ? (
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            autoFocus
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Add an item…"
            className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2"
            style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text)', backgroundColor: 'var(--casa-surface)' }}
            onKeyDown={(e) => { if (e.key === 'Escape') { setShowInput(false); setInputText('') } }}
            disabled={adding}
          />
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--casa-primary)' }}
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setShowInput(false); setInputText('') }}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ color: 'var(--casa-text-muted)' }}
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowInput(true)}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: 'var(--casa-primary)' }}
        >
          <Plus className="w-4 h-4" />
          Add item
        </button>
      )}
    </div>
  )
}
