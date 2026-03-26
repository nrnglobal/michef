'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X, Star, ShoppingCart, Languages, FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { FridgeStaple } from '@/lib/types'
import groceryItems from '@/lib/data/grocery-items.json'

const CATEGORIES = ['Produce', 'Protein', 'Dairy', 'Grains', 'Pantry', 'Spices', 'Other']

const fridgeCats = ['Produce', 'Protein', 'Dairy', 'Grains', 'Other']

type ActiveTab = 'all' | 'fridge' | 'pantry' | 'spices'

interface GroceryItem {
  name_en: string
  name_es: string
  category: string
}

interface FormState {
  item_name_en: string
  item_name_es: string
  quantity: string
  category: string
  source: string
  brand: string
}

const emptyForm: FormState = {
  item_name_en: '',
  item_name_es: '',
  quantity: '',
  category: 'Other',
  source: '',
  brand: '',
}

interface ImportRow {
  item_name_en: string
  item_name_es: string
  quantity: string
  category: string
  source: string
  brand: string
  is_staple: boolean
  isDuplicate?: boolean
  existingId?: string
}

interface Props {
  items: FridgeStaple[]
}

interface ItemFormProps {
  form: FormState
  onChange: (f: FormState) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  submitLabel: string
  saving: boolean
  inputStyle: React.CSSProperties
  suggestions: GroceryItem[]
  onSuggestionSelect?: (item: GroceryItem) => void
  onTranslate?: () => void
  translating: boolean
}

function ItemForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  saving,
  inputStyle,
  suggestions,
  onSuggestionSelect,
  onTranslate,
  translating,
}: ItemFormProps) {
  const [highlightIndex, setHighlightIndex] = useState(-1)

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault()
      onSuggestionSelect?.(suggestions[highlightIndex])
      setHighlightIndex(-1)
    } else if (e.key === 'Escape') {
      // Clear suggestions by emptying the name to trigger re-filter
      setHighlightIndex(-1)
      // Just blur to close dropdown
      ;(e.target as HTMLInputElement).blur()
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
            value={form.item_name_en}
            onChange={(e) => {
              onChange({ ...form, item_name_en: e.target.value })
              setHighlightIndex(-1)
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Olive oil"
            className="w-full px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2"
            style={inputStyle}
          />
          {suggestions && suggestions.length > 0 && (
            <ul
              className="absolute left-0 right-0 top-full z-50 rounded-lg border overflow-y-auto"
              style={{
                maxHeight: '240px',
                borderColor: 'var(--casa-border)',
                backgroundColor: 'var(--casa-surface)',
              }}
            >
              {suggestions.map((item, i) => (
                <li
                  key={item.name_en}
                  onClick={() => {
                    onSuggestionSelect?.(item)
                    setHighlightIndex(-1)
                  }}
                  className="px-3 py-2 text-sm cursor-pointer"
                  style={{
                    color: 'var(--casa-text)',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: i === highlightIndex ? 'var(--casa-primary-bg)' : 'transparent',
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
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--casa-text-faint)' }}>
            Name (Spanish)
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={form.item_name_es}
              onChange={(e) => onChange({ ...form, item_name_es: e.target.value })}
              placeholder="e.g. Aceite de oliva"
              className="flex-1 px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => onTranslate?.()}
              disabled={translating || !form.item_name_en.trim()}
              title="Translate"
              className="px-2 py-1.5 rounded-lg border text-sm flex items-center gap-1"
              style={{
                borderColor: 'var(--casa-border)',
                color: translating ? 'var(--casa-text-muted)' : 'var(--casa-primary)',
                backgroundColor: 'var(--casa-surface)',
              }}
            >
              <Languages className="w-4 h-4" />
              {translating && <span className="sr-only">Translating...</span>}
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--casa-text-faint)' }}>
            Quantity
          </label>
          <input
            type="text"
            value={form.quantity}
            onChange={(e) => onChange({ ...form, quantity: e.target.value })}
            placeholder="e.g. 1 bottle"
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
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--casa-text-faint)' }}>
            Source
          </label>
          <input
            type="text"
            value={form.source}
            onChange={(e) => onChange({ ...form, source: e.target.value })}
            placeholder="e.g. Walmart, Costco"
            className="w-full px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--casa-text-faint)' }}>
            Brand
          </label>
          <input
            type="text"
            value={form.brand}
            onChange={(e) => onChange({ ...form, brand: e.target.value })}
            placeholder="e.g. La Costena, McCormick"
            className="w-full px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2"
            style={inputStyle}
          />
        </div>
      </div>
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

export function InventoryClient({ items }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<ActiveTab>('all')
  const [staplesFilter, setStaplesFilter] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addForm, setAddForm] = useState<FormState>(emptyForm)
  const [editForm, setEditForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [stapling, setStapling] = useState<string | null>(null)
  const [addingToList, setAddingToList] = useState<string | null>(null)
  const [shoppingError, setShoppingError] = useState<string | null>(null)
  const [shoppingSuccess, setShoppingSuccess] = useState<string | null>(null)
  const [translating, setTranslating] = useState(false)

  // ── Google Sheets import state ──────────────────────────────────────────
  const [showImport, setShowImport] = useState(false)
  const [sheetUrl, setSheetUrl] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importedItems, setImportedItems] = useState<ImportRow[] | null>(null)
  const [duplicateDecisions, setDuplicateDecisions] = useState<Record<string, 'skip' | 'update'>>({})
  const [importSaving, setImportSaving] = useState(false)

  // ── Autocomplete suggestions ────────────────────────────────────────────
  const addSuggestions = addForm.item_name_en.length >= 1
    ? (groceryItems as GroceryItem[])
        .filter(item => item.name_en.toLowerCase().includes(addForm.item_name_en.toLowerCase()))
        .slice(0, 8)
    : []

  const editSuggestions = editForm.item_name_en.length >= 1
    ? (groceryItems as GroceryItem[])
        .filter(item => item.name_en.toLowerCase().includes(editForm.item_name_en.toLowerCase()))
        .slice(0, 8)
    : []

  function handleSuggestionSelect(item: GroceryItem, formSetter: (f: FormState) => void, currentForm: FormState) {
    formSetter({
      ...currentForm,
      item_name_en: item.name_en,
      item_name_es: item.name_es,
      category: item.category,
    })
  }

  // ── Translate handler ───────────────────────────────────────────────────
  async function handleTranslate(
    englishName: string,
    formSetter: (f: FormState) => void,
    currentForm: FormState
  ) {
    if (!englishName.trim()) return
    setTranslating(true)
    try {
      const res = await fetch('/api/ai/translate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_en: englishName,
          description_en: '',
          ingredients: [],
          instructions_en: '',
        }),
      })
      const data = await res.json()
      if (data.title_es) {
        formSetter({ ...currentForm, item_name_es: data.title_es })
      } else {
        toast.error('Could not translate. Try again.')
      }
    } catch {
      toast.error('Could not translate. Try again.')
    } finally {
      setTranslating(false)
    }
  }

  // ── Google Sheets import handlers ──────────────────────────────────────
  async function handleFetchSheet() {
    setImportError(null)
    setImportedItems(null)
    if (!sheetUrl.trim()) return
    setImportLoading(true)
    try {
      const res = await fetch('/api/inventory/import-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sheetUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        setImportError(data.error || 'Import failed')
        setImportLoading(false)
        return
      }
      // Check for duplicates against existing items (per D-22)
      const existingByName = new Map(
        items.map(item => [item.item_name_en.toLowerCase(), item.id])
      )
      const rows: ImportRow[] = data.items.map((item: ImportRow) => {
        const key = item.item_name_en.toLowerCase()
        return {
          ...item,
          isDuplicate: existingByName.has(key),
          existingId: existingByName.get(key) ?? undefined,
        }
      })
      setImportedItems(rows)
    } catch {
      setImportError('Import failed. Please try again.')
    } finally {
      setImportLoading(false)
    }
  }

  async function handleConfirmImport() {
    if (!importedItems) return
    setImportSaving(true)
    const supabase = createClient()
    let added = 0, updated = 0, skipped = 0

    for (const row of importedItems) {
      if (row.isDuplicate) {
        const decision = duplicateDecisions[row.item_name_en] ?? 'skip'
        if (decision === 'skip') {
          skipped++
          continue
        }
        // Update existing item
        const { error } = await supabase
          .from('fridge_staples')
          .update({
            item_name_es: row.item_name_es || undefined,
            quantity: row.quantity || undefined,
            category: row.category,
            source: row.source || undefined,
            brand: row.brand || undefined,
            is_staple: row.is_staple,
          })
          .eq('id', row.existingId!)
        if (!error) updated++
      } else {
        // Insert new item
        const { error } = await supabase
          .from('fridge_staples')
          .insert({
            item_name_en: row.item_name_en,
            item_name_es: row.item_name_es || row.item_name_en,
            quantity: row.quantity || null,
            category: row.category,
            source: row.source || null,
            brand: row.brand || null,
            is_staple: row.is_staple,
            is_active: true,
          })
        if (!error) added++
      }
    }

    // Build result message
    const parts = []
    if (added > 0) parts.push(`${added} items added`)
    if (updated > 0) parts.push(`${updated} updated`)
    if (skipped > 0) parts.push(`${skipped} skipped`)
    toast.success(parts.join(', ') + '.')

    // Reset import state
    setShowImport(false)
    setSheetUrl('')
    setImportedItems(null)
    setDuplicateDecisions({})
    setImportSaving(false)
    router.refresh()
  }

  // ── Filtered + grouped items ───────────────────────────────────────────────
  const filteredItems = items.filter((item) => {
    if (activeTab === 'fridge') {
      if (!fridgeCats.includes(item.category ?? 'Other')) return false
    } else if (activeTab === 'pantry') {
      if (item.category !== 'Pantry') return false
    } else if (activeTab === 'spices') {
      if (item.category !== 'Spices') return false
    }
    if (staplesFilter && !item.is_staple) return false
    return true
  })

  const categoryGroups = filteredItems.reduce<Record<string, FridgeStaple[]>>((acc, item) => {
    const cat = item.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!addForm.item_name_en.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('fridge_staples').insert({
      item_name_en: addForm.item_name_en.trim(),
      item_name_es: addForm.item_name_es.trim() || addForm.item_name_en.trim(),
      quantity: addForm.quantity.trim() || null,
      category: addForm.category,
      source: addForm.source.trim() || null,
      brand: addForm.brand.trim() || null,
      is_active: true,
    })
    setAddForm(emptyForm)
    setShowAddForm(false)
    setSaving(false)
    router.refresh()
  }

  function startEdit(item: FridgeStaple) {
    setEditingId(item.id)
    setEditForm({
      item_name_en: item.item_name_en,
      item_name_es: item.item_name_es,
      quantity: item.quantity ?? '',
      category: item.category ?? 'Other',
      source: item.source ?? '',
      brand: item.brand ?? '',
    })
  }

  async function handleEdit(e: React.FormEvent, itemId: string) {
    e.preventDefault()
    if (!editForm.item_name_en.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('fridge_staples')
      .update({
        item_name_en: editForm.item_name_en.trim(),
        item_name_es: editForm.item_name_es.trim() || editForm.item_name_en.trim(),
        quantity: editForm.quantity.trim() || null,
        category: editForm.category,
        source: editForm.source.trim() || null,
        brand: editForm.brand.trim() || null,
      })
      .eq('id', itemId)
    setEditingId(null)
    setSaving(false)
    router.refresh()
  }

  async function handleToggle(item: FridgeStaple) {
    setToggling(item.id)
    const supabase = createClient()
    await supabase
      .from('fridge_staples')
      .update({ is_active: !item.is_active })
      .eq('id', item.id)
    setToggling(null)
    router.refresh()
  }

  async function handleDelete(itemId: string) {
    if (!window.confirm('Delete this inventory item?')) return
    setDeleting(itemId)
    const supabase = createClient()
    await supabase.from('fridge_staples').delete().eq('id', itemId)
    setDeleting(null)
    router.refresh()
  }

  async function handleStapleToggle(item: FridgeStaple) {
    setStapling(item.id)
    const supabase = createClient()
    await supabase
      .from('fridge_staples')
      .update({ is_staple: !item.is_staple })
      .eq('id', item.id)
    setStapling(null)
    router.refresh()
  }

  async function handleAddToShoppingList(item: FridgeStaple) {
    setAddingToList(item.id)
    setShoppingError(null)
    setShoppingSuccess(null)

    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data: plan } = await supabase
      .from('menu_plans')
      .select('id')
      .eq('status', 'confirmed')
      .gte('visit_date', today)
      .order('visit_date', { ascending: true })
      .limit(1)
      .single()

    if (!plan) {
      setShoppingError('No upcoming shopping list — confirm a menu first')
      setAddingToList(null)
      return
    }

    const { data: list } = await supabase
      .from('shopping_lists')
      .select('id')
      .eq('menu_plan_id', plan.id)
      .single()

    if (!list) {
      setShoppingError('No upcoming shopping list — confirm a menu first')
      setAddingToList(null)
      return
    }

    await supabase.from('shopping_list_items').insert({
      shopping_list_id: list.id,
      ingredient_name_en: item.item_name_en,
      ingredient_name_es: item.item_name_es,
      quantity: null,
      unit: null,
      category: 'staple',
      is_checked: false,
      is_always_stock: item.is_staple ?? false,
    })

    setAddingToList(null)
    setShoppingSuccess('Added to shopping list')
    setTimeout(() => setShoppingSuccess(null), 2000)
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputStyle = {
    borderColor: 'var(--casa-border)',
    color: 'var(--casa-text)',
    backgroundColor: 'var(--casa-surface)',
  }

  function tabStyle(tab: ActiveTab) {
    const isActive = activeTab === tab
    return {
      backgroundColor: isActive ? 'var(--casa-primary)' : 'var(--casa-surface)',
      color: isActive ? 'white' : 'var(--casa-text-muted)',
      border: isActive ? '1px solid transparent' : '1px solid var(--casa-border)',
    }
  }

  const staplesFilterStyle = {
    backgroundColor: staplesFilter ? 'var(--casa-primary-bg)' : 'var(--casa-surface)',
    color: staplesFilter ? 'var(--casa-primary)' : 'var(--casa-text-muted)',
    border: staplesFilter ? '1px solid var(--casa-primary)' : '1px solid var(--casa-border)',
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Tab bar + Staples filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['all', 'fridge', 'pantry', 'spices'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
              style={tabStyle(tab)}
            >
              {tab === 'all' ? 'Show All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setStaplesFilter(!staplesFilter)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={staplesFilterStyle}
        >
          <Star className="w-3.5 h-3.5" fill={staplesFilter ? 'var(--casa-primary)' : 'none'} />
          Staples
        </button>
      </div>

      {/* Global shopping messages */}
      {shoppingError && (
        <p className="text-sm px-3 py-2 rounded-lg" style={{ color: 'var(--casa-diff-del-text)', backgroundColor: 'var(--casa-diff-del-bg)' }}>
          {shoppingError}
        </p>
      )}
      {shoppingSuccess && (
        <p className="text-sm px-3 py-2 rounded-lg" style={{ color: 'var(--casa-primary)', backgroundColor: 'var(--casa-primary-bg)' }}>
          {shoppingSuccess}
        </p>
      )}

      {/* Category groups */}
      {Object.keys(categoryGroups).sort().length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: 'var(--casa-text-faint)' }}>
          No items in this view
        </p>
      ) : (
        <div className="space-y-3">
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
                    <li key={`edit-${item.id}`}>
                      <ItemForm
                        form={editForm}
                        onChange={setEditForm}
                        onSubmit={(e) => handleEdit(e, item.id)}
                        onCancel={() => setEditingId(null)}
                        submitLabel="Save"
                        saving={saving}
                        inputStyle={inputStyle}
                        suggestions={editSuggestions}
                        onSuggestionSelect={(gi) => handleSuggestionSelect(gi, setEditForm, editForm)}
                        onTranslate={() => handleTranslate(editForm.item_name_en, setEditForm, editForm)}
                        translating={translating}
                      />
                    </li>
                  ) : (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 px-2 py-2 rounded-lg"
                      style={{ borderBottom: '1px solid var(--casa-border)', opacity: !item.is_active ? 0.5 : 1 }}
                    >
                      {/* Star toggle — first action */}
                      <button
                        type="button"
                        onClick={() => handleStapleToggle(item)}
                        disabled={stapling === item.id}
                        title={item.is_staple ? 'Remove from staples' : 'Mark as staple'}
                        className="p-2.5 rounded-md transition-colors shrink-0"
                        style={{ color: item.is_staple ? 'var(--casa-primary)' : 'var(--casa-text-faint)' }}
                      >
                        <Star
                          className="w-3.5 h-3.5"
                          fill={item.is_staple ? 'var(--casa-primary)' : 'none'}
                          color={item.is_staple ? 'var(--casa-primary)' : 'var(--casa-text-faint)'}
                        />
                      </button>

                      {/* Item name */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${!item.is_active ? 'line-through' : ''}`}
                          style={{ color: 'var(--casa-text)' }}
                        >
                          {item.item_name_en}
                        </p>
                        {item.item_name_es && item.item_name_es !== item.item_name_en && (
                          <p className="text-xs" style={{ color: 'var(--casa-text-faint)' }}>
                            {item.item_name_es}
                          </p>
                        )}
                        {(item.source || item.brand) && (
                          <span className="text-xs" style={{ color: 'var(--casa-text-faint)' }}>
                            {[item.source, item.brand].filter(Boolean).join(' \u00b7 ')}
                          </span>
                        )}
                      </div>

                      {item.quantity && (
                        <span className="text-xs shrink-0" style={{ color: 'var(--casa-text-muted)' }}>
                          {item.quantity}
                        </span>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggle(item)}
                          disabled={toggling === item.id}
                          title={item.is_active ? 'Mark out of stock' : 'Mark in stock'}
                          className="p-2.5 rounded-md transition-colors"
                          style={{ color: item.is_active ? 'var(--casa-primary)' : 'var(--casa-text-faint)' }}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          title="Edit item"
                          className="p-2.5 rounded-md transition-colors"
                          style={{ color: 'var(--casa-text-muted)' }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
                          title="Delete item"
                          className="p-2.5 rounded-md transition-colors"
                          style={{ color: 'var(--casa-diff-del-text)' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {/* Add to shopping list — last action */}
                        <button
                          type="button"
                          onClick={() => handleAddToShoppingList(item)}
                          disabled={addingToList === item.id}
                          title="Add to shopping list"
                          className="p-2.5 rounded-md transition-colors"
                          style={{ color: 'var(--casa-text-muted)' }}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showAddForm ? (
        <ItemForm
          form={addForm}
          onChange={setAddForm}
          onSubmit={handleAdd}
          onCancel={() => { setShowAddForm(false); setAddForm(emptyForm) }}
          submitLabel="Add Item"
          saving={saving}
          inputStyle={inputStyle}
          suggestions={addSuggestions}
          onSuggestionSelect={(gi) => handleSuggestionSelect(gi, setAddForm, addForm)}
          onTranslate={() => handleTranslate(addForm.item_name_en, setAddForm, addForm)}
          translating={translating}
        />
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: 'var(--casa-primary)' }}
          >
            <Plus className="w-4 h-4" />
            Add item
          </button>
          <button
            type="button"
            onClick={() => setShowImport(!showImport)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
            style={{
              border: '1px solid var(--casa-border)',
              color: 'var(--casa-primary)',
              backgroundColor: 'var(--casa-surface)',
            }}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Import from Sheets
          </button>
        </div>
      )}

      {/* Google Sheets import panel */}
      {showImport && (
        <div className="p-4 rounded-lg border space-y-3" style={{ borderColor: 'var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium" style={{ color: 'var(--casa-text)' }}>
              Google Sheets share URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2"
                style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text)', backgroundColor: 'var(--casa-bg)', minHeight: '44px' }}
              />
              <button
                type="button"
                onClick={handleFetchSheet}
                disabled={importLoading || !sheetUrl.trim()}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white whitespace-nowrap"
                style={{ backgroundColor: 'var(--casa-primary)' }}
              >
                {importLoading ? 'Fetching...' : 'Fetch Sheet'}
              </button>
            </div>
            <p className="text-xs" style={{ color: 'var(--casa-text-faint)' }}>
              Sheet must be shared with &quot;Anyone with the link&quot;.{' '}
              <a href="/templates/inventory-template.csv" download className="underline" style={{ color: 'var(--casa-primary)' }}>
                Download template
              </a>
            </p>
          </div>

          {importError && (
            <p className="text-sm" style={{ color: 'var(--casa-diff-del-text)' }}>{importError}</p>
          )}

          {importedItems && (
            <div className="space-y-2">
              <p className="text-sm font-medium" style={{ color: 'var(--casa-text)' }}>
                Found {importedItems.length} items.{' '}
                {importedItems.filter(r => r.isDuplicate).length > 0 &&
                  `${importedItems.filter(r => r.isDuplicate).length} duplicates detected.`}
              </p>

              {/* Show duplicate items with skip/update choices */}
              {importedItems.filter(r => r.isDuplicate).map(row => (
                <div key={row.item_name_en} className="flex items-center justify-between p-2 rounded-lg border text-sm" style={{ borderColor: 'var(--casa-border)' }}>
                  <span style={{ color: 'var(--casa-text)' }}>{row.item_name_en}</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDuplicateDecisions(d => ({ ...d, [row.item_name_en]: 'skip' }))}
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: duplicateDecisions[row.item_name_en] === 'skip' || !duplicateDecisions[row.item_name_en]
                          ? 'var(--casa-surface-3)' : 'var(--casa-surface)',
                        color: 'var(--casa-text-muted)',
                      }}
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuplicateDecisions(d => ({ ...d, [row.item_name_en]: 'update' }))}
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: duplicateDecisions[row.item_name_en] === 'update'
                          ? 'var(--casa-primary-bg)' : 'var(--casa-surface)',
                        color: duplicateDecisions[row.item_name_en] === 'update'
                          ? 'var(--casa-primary)' : 'var(--casa-text-muted)',
                      }}
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importSaving}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: 'var(--casa-primary)' }}
              >
                {importSaving ? 'Importing...' : 'Confirm Import'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
