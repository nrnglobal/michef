'use client'

import { useState, useMemo } from 'react'
import { Languages, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toTitleCase } from '@/lib/utils'
import type { ShoppingListItem } from '@/lib/types'
import groceryItems from '@/lib/data/grocery-items.json'

interface GroceryItem {
  name_en: string
  name_es: string
  category: string
}

const CATEGORIES = ['Produce', 'Protein', 'Dairy', 'Grains', 'Pantry', 'Spices', 'Other']

interface Props {
  listId: string
  items: ShoppingListItem[]
}

interface FormState {
  ingredient_name_en: string
  ingredient_name_es: string
  quantity: string
  unit: string
  category: string
}

const emptyForm: FormState = {
  ingredient_name_en: '',
  ingredient_name_es: '',
  quantity: '',
  unit: '',
  category: 'Other',
}

const inputStyle = {
  borderColor: 'var(--casa-border)',
  color: 'var(--casa-text)',
  backgroundColor: 'var(--casa-surface)',
}

function ItemForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  saving,
  addToInventory,
  onAddToInventoryChange,
}: {
  form: FormState
  onChange: (f: FormState) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  submitLabel: string
  saving: boolean
  addToInventory?: boolean
  onAddToInventoryChange?: (v: boolean) => void
}) {
  const [translating, setTranslating] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const suggestions = useMemo(() =>
    form.ingredient_name_en.length >= 1
      ? (groceryItems as GroceryItem[])
          .filter(item => item.name_en.toLowerCase().includes(form.ingredient_name_en.toLowerCase()))
          .slice(0, 8)
      : [],
    [form.ingredient_name_en]
  )

  function handleSuggestionSelect(item: GroceryItem) {
    onChange({ ...form, ingredient_name_en: item.name_en, ingredient_name_es: item.name_es, category: item.category })
    setShowSuggestions(false)
    setHighlightedIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      handleSuggestionSelect(suggestions[highlightedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setHighlightedIndex(-1)
    }
  }

  async function handleTranslate() {
    const name = form.ingredient_name_en.trim() || form.ingredient_name_es.trim()
    if (!name) return
    setTranslating(true)
    try {
      const res = await fetch('/api/ai/translate-ingredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('translate failed')
      const data = await res.json()
      onChange({
        ...form,
        ingredient_name_en: data.ingredient_name_en || form.ingredient_name_en,
        ingredient_name_es: data.ingredient_name_es || form.ingredient_name_es,
        category: data.category || form.category,
      })
    } catch {
      // silently fail — user can fill in manually
    } finally {
      setTranslating(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 p-3 rounded-lg border"
      style={{ borderColor: 'var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--casa-text-faint)' }}>
            Name (English) *
          </label>
          <input
            type="text"
            required
            value={form.ingredient_name_en}
            onChange={(e) => { onChange({ ...form, ingredient_name_en: e.target.value }); setHighlightedIndex(-1) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Olive oil"
            className="w-full px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2"
            style={inputStyle}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul
              className="absolute left-0 right-0 top-full z-50 rounded-lg border overflow-y-auto"
              style={{ maxHeight: '240px', borderColor: 'var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}
            >
              {suggestions.map((item, i) => (
                <li
                  key={item.name_en}
                  onMouseDown={() => handleSuggestionSelect(item)}
                  className="px-3 py-2 text-sm cursor-pointer flex items-center justify-between"
                  style={{
                    color: 'var(--casa-text)',
                    minHeight: '44px',
                    backgroundColor: i === highlightedIndex ? 'var(--casa-primary-bg)' : 'transparent',
                  }}
                >
                  <span>{item.name_en}</span>
                  <span className="text-xs" style={{ color: 'var(--casa-text-muted)' }}>{item.name_es}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium" style={{ color: 'var(--casa-text-faint)' }}>
              Name (Spanish)
            </label>
            <button
              type="button"
              onClick={handleTranslate}
              disabled={translating || (!form.ingredient_name_en.trim() && !form.ingredient_name_es.trim())}
              className="flex items-center gap-1 text-xs font-medium disabled:opacity-40"
              style={{ color: 'var(--casa-primary)' }}
              title="Auto-translate"
            >
              {translating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
              Translate
            </button>
          </div>
          <input
            type="text"
            value={form.ingredient_name_es}
            onChange={(e) => onChange({ ...form, ingredient_name_es: e.target.value })}
            placeholder="e.g. Aceite de oliva"
            className="w-full px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2"
            style={inputStyle}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--casa-text-faint)' }}>
            Quantity
          </label>
          <input
            type="text"
            value={form.quantity}
            onChange={(e) => onChange({ ...form, quantity: e.target.value })}
            placeholder="e.g. 2"
            className="w-full px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--casa-text-faint)' }}>
            Unit
          </label>
          <input
            type="text"
            value={form.unit}
            onChange={(e) => onChange({ ...form, unit: e.target.value })}
            placeholder="e.g. cups"
            className="w-full px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--casa-text-faint)' }}>
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => onChange({ ...form, category: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2"
            style={inputStyle}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      {onAddToInventoryChange && (
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--casa-text-muted)' }}>
          <input
            type="checkbox"
            checked={addToInventory ?? false}
            onChange={(e) => onAddToInventoryChange(e.target.checked)}
            className="rounded"
          />
          Also add to inventory
        </label>
      )}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--casa-primary)' }}
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-sm"
          style={{ color: 'var(--casa-text-muted)' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export function ShoppingListClient({ listId, items }: Props) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm)
  const [addToInventory, setAddToInventory] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!addForm.ingredient_name_en.trim()) return
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: addError } = await supabase.from('shopping_list_items').insert({
      shopping_list_id: listId,
      ingredient_name_en: addForm.ingredient_name_en.trim(),
      ingredient_name_es: addForm.ingredient_name_es.trim() || addForm.ingredient_name_en.trim(),
      quantity: addForm.quantity ? parseFloat(addForm.quantity) || null : null,
      unit: addForm.unit.trim() || null,
      category: addForm.category,
      is_checked: false,
      is_always_stock: false,
      is_custom: true,
    })
    setSaving(false)
    if (addError) {
      setError('Failed to add item. Please try again.')
      return
    }
    if (addToInventory) {
      await supabase.from('fridge_staples').insert({
        item_name_en: addForm.ingredient_name_en.trim(),
        item_name_es: addForm.ingredient_name_es.trim() || addForm.ingredient_name_en.trim(),
        quantity: addForm.quantity ? parseFloat(addForm.quantity) || null : null,
        category: addForm.category,
        is_active: true,
        is_staple: false,
      })
    }
    setAddForm(emptyForm)
    setAddToInventory(false)
    setShowAddForm(false)
    router.refresh()
  }

  function startEdit(item: ShoppingListItem) {
    setEditingId(item.id)
    setEditForm({
      ingredient_name_en: item.ingredient_name_en,
      ingredient_name_es: item.ingredient_name_es,
      quantity: item.quantity != null ? String(item.quantity) : '',
      unit: item.unit ?? '',
      category: item.category ?? 'Other',
    })
  }

  async function handleEdit(e: React.FormEvent, itemId: string) {
    e.preventDefault()
    if (!editForm.ingredient_name_en.trim()) return
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: editError } = await supabase
      .from('shopping_list_items')
      .update({
        ingredient_name_en: editForm.ingredient_name_en.trim(),
        ingredient_name_es: editForm.ingredient_name_es.trim() || editForm.ingredient_name_en.trim(),
        quantity: editForm.quantity ? parseFloat(editForm.quantity) || null : null,
        unit: editForm.unit.trim() || null,
        category: editForm.category,
      })
      .eq('id', itemId)
    setSaving(false)
    if (editError) {
      setError('Failed to save changes. Please try again.')
      return
    }
    setEditingId(null)
    router.refresh()
  }

  async function handleDelete(item: ShoppingListItem) {
    if (!window.confirm('Remove this item from the shopping list?')) return
    setDeleting(item.id)
    setError(null)
    const supabase = createClient()
    // Custom items are hard-deleted; recipe-derived items become tombstones so
    // syncShoppingList() knows not to re-add them when recipes change.
    const { error: deleteError } = item.is_custom
      ? await supabase.from('shopping_list_items').delete().eq('id', item.id)
      : await supabase.from('shopping_list_items').update({ manually_removed: true }).eq('id', item.id)
    setDeleting(null)
    if (deleteError) {
      setError('Failed to remove item. Please try again.')
      return
    }
    router.refresh()
  }

  // Group items by category
  const categoryGroups = items.reduce<Record<string, ShoppingListItem[]>>((acc, item) => {
    const cat = item.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm px-3 py-2 rounded-lg" style={{ color: 'var(--casa-diff-del-text)', backgroundColor: 'var(--casa-diff-del-bg)' }}>
          {error}
        </p>
      )}

      {/* Add item — near the top */}
      {showAddForm ? (
        <ItemForm
          form={addForm}
          onChange={setAddForm}
          onSubmit={handleAdd}
          onCancel={() => { setShowAddForm(false); setAddForm(emptyForm); setAddToInventory(false) }}
          submitLabel="Add Item"
          saving={saving}
          addToInventory={addToInventory}
          onAddToInventoryChange={setAddToInventory}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: 'var(--casa-primary)' }}
        >
          <Plus className="w-4 h-4" />
          Add item
        </button>
      )}

      {Object.keys(categoryGroups).sort().map((cat) => (
        <div key={cat}>
          <p
            className="text-xs uppercase tracking-wide font-medium py-1.5 border-b mb-1"
            style={{ color: 'var(--casa-text-faint)', borderColor: 'var(--casa-border)' }}
          >
            {cat}
          </p>
          <ul className="space-y-0.5">
            {categoryGroups[cat].map((item) =>
              editingId === item.id ? (
                <li key={`edit-${item.id}`} className="py-1">
                  <ItemForm
                    form={editForm}
                    onChange={setEditForm}
                    onSubmit={(e) => handleEdit(e, item.id)}
                    onCancel={() => setEditingId(null)}
                    submitLabel="Save"
                    saving={saving}
                  />
                </li>
              ) : (
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
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      title="Edit item"
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                      style={{ color: 'var(--casa-text-muted)' }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deleting === item.id}
                      title="Remove item"
                      className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                      style={{ color: '#DC2626' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        </div>
      ))}

    </div>
  )
}
