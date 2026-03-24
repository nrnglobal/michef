'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { FridgeStaple } from '@/lib/types'

const CATEGORIES = ['Produce', 'Protein', 'Dairy', 'Grains', 'Pantry', 'Spices', 'Other']

interface Props {
  items: FridgeStaple[]
}

interface FormState {
  item_name_en: string
  item_name_es: string
  quantity: string
  category: string
}

const emptyForm: FormState = {
  item_name_en: '',
  item_name_es: '',
  quantity: '',
  category: 'Other',
}

export function InventoryClient({ items }: Props) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addForm, setAddForm] = useState<FormState>(emptyForm)
  const [editForm, setEditForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

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
  }: {
    form: FormState
    onChange: (f: FormState) => void
    onSubmit: (e: React.FormEvent) => void
    onCancel: () => void
    submitLabel: string
  }) {
    return (
      <form onSubmit={onSubmit} className="space-y-3 p-3 rounded-lg border" style={{ borderColor: 'var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--casa-text-faint)' }}>
              Name (English) *
            </label>
            <input
              type="text"
              required
              value={form.item_name_en}
              onChange={(e) => onChange({ ...form, item_name_en: e.target.value })}
              placeholder="e.g. Olive oil"
              className="w-full px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--casa-text-faint)' }}>
              Name (Spanish)
            </label>
            <input
              type="text"
              value={form.item_name_es}
              onChange={(e) => onChange({ ...form, item_name_es: e.target.value })}
              placeholder="e.g. Aceite de oliva"
              className="w-full px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2"
              style={inputStyle}
            />
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

  return (
    <div className="space-y-3">
      {/* Inline edit forms rendered per item (handled below by each row) */}
      {items.map((item) =>
        editingId === item.id ? (
          <ItemForm
            key={`edit-${item.id}`}
            form={editForm}
            onChange={setEditForm}
            onSubmit={(e) => handleEdit(e, item.id)}
            onCancel={() => setEditingId(null)}
            submitLabel="Save"
          />
        ) : (
          <div
            key={item.id}
            className="flex items-center gap-3 px-3 py-2 rounded-lg border"
            style={{ borderColor: 'var(--casa-border)', opacity: !item.is_active ? 0.5 : 1 }}
          >
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
            </div>
            {item.quantity && (
              <span className="text-xs shrink-0" style={{ color: 'var(--casa-text-muted)' }}>
                {item.quantity}
              </span>
            )}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleToggle(item)}
                disabled={toggling === item.id}
                title={item.is_active ? 'Mark out of stock' : 'Mark in stock'}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                style={{ color: item.is_active ? 'var(--casa-primary)' : 'var(--casa-text-faint)' }}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
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
                onClick={() => handleDelete(item.id)}
                disabled={deleting === item.id}
                title="Delete item"
                className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                style={{ color: '#DC2626' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )
      )}

      {/* Add form */}
      {showAddForm ? (
        <ItemForm
          form={addForm}
          onChange={setAddForm}
          onSubmit={handleAdd}
          onCancel={() => { setShowAddForm(false); setAddForm(emptyForm) }}
          submitLabel="Add Item"
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
    </div>
  )
}
