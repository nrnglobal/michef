'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { ReceiptData } from './receipt-upload'

interface ReceiptReviewProps {
  visitId: string
  data: ReceiptData
  onSaved: () => void
}

export function ReceiptReview({ visitId, data, onSaved }: ReceiptReviewProps) {
  const [storeName, setStoreName] = useState(data.store_name ?? '')
  const [date, setDate] = useState(data.date ?? '')
  const [lineItems, setLineItems] = useState(data.line_items ?? [])
  const [subtotal, setSubtotal] = useState(data.subtotal !== null ? String(data.subtotal) : '')
  const [tax, setTax] = useState(data.tax !== null ? String(data.tax) : '')
  const [total, setTotal] = useState(data.total !== null ? String(data.total) : '')
  const [saving, setSaving] = useState(false)

  function updateLineItemName(idx: number, name: string) {
    setLineItems((prev) => prev.map((item, i) => (i === idx ? { ...item, name } : item)))
  }

  function updateLineItemPrice(idx: number, price: string) {
    setLineItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, price: parseFloat(price) || 0 } : item))
    )
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, { name: '', price: 0 }])
  }

  function removeLineItem(idx: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const supabase = createClient()
      const totalNum = parseFloat(total) || null
      const extractedData = {
        store_name: storeName || null,
        date: date || null,
        line_items: lineItems,
        subtotal: parseFloat(subtotal) || null,
        tax: parseFloat(tax) || null,
        total: totalNum,
      }

      const { error } = await supabase
        .from('visits')
        .update({
          receipt_extracted_data: extractedData,
          grocery_total: totalNum,
        })
        .eq('id', visitId)

      if (error) throw error

      toast.success('Recibo guardado')
      onSaved()
    } catch {
      toast.error('Error al guardar el recibo')
    } finally {
      setSaving(false)
    }
  }

  function handleDiscard() {
    onSaved()
  }

  const inputStyle = {
    border: '1px solid var(--casa-border)',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '14px',
    color: 'var(--casa-text)',
    backgroundColor: 'var(--casa-surface)',
    width: '100%',
  } as React.CSSProperties

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--casa-text-muted)',
    display: 'block',
    marginBottom: '4px',
  } as React.CSSProperties

  return (
    <div
      className="rounded-xl border"
      style={{
        border: '1px solid var(--casa-border)',
        backgroundColor: 'var(--casa-surface)',
      }}
    >
      {/* Card header */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: 'var(--casa-border)' }}
      >
        <h3 className="font-semibold text-sm" style={{ color: 'var(--casa-text)' }}>
          Datos del recibo
        </h3>
        <p className="text-xs" style={{ color: 'var(--casa-text-faint)' }}>
          Receipt Data — review and correct before saving
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Store name */}
        <div>
          <label style={labelStyle}>Tienda / Store</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            style={inputStyle}
            placeholder="Nombre de la tienda"
          />
        </div>

        {/* Date */}
        <div>
          <label style={labelStyle}>Fecha / Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Line items */}
        <div>
          <label style={labelStyle}>Artículos / Line Items</label>
          <div className="space-y-2">
            {lineItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateLineItemName(idx, e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Artículo"
                />
                <input
                  type="number"
                  value={item.price || ''}
                  onChange={(e) => updateLineItemPrice(idx, e.target.value)}
                  style={{ ...inputStyle, width: '80px' }}
                  placeholder="$0"
                  step="0.01"
                  min="0"
                />
                <button
                  onClick={() => removeLineItem(idx)}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold"
                  style={{ color: '#9A3412', backgroundColor: '#FFF7ED' }}
                  aria-label="Eliminar artículo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addLineItem}
            className="mt-2 text-xs font-semibold"
            style={{ color: 'var(--casa-primary)' }}
          >
            + Agregar artículo
          </button>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label style={labelStyle}>Subtotal</label>
            <input
              type="number"
              value={subtotal}
              onChange={(e) => setSubtotal(e.target.value)}
              style={inputStyle}
              placeholder="$0"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label style={labelStyle}>IVA / Tax</label>
            <input
              type="number"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              style={inputStyle}
              placeholder="$0"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label style={labelStyle}>Total</label>
            <input
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              style={inputStyle}
              placeholder="$0"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--casa-primary)',
              color: 'white',
              minHeight: '48px',
            }}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={handleDiscard}
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors hover:opacity-90 disabled:opacity-50"
            style={{
              border: '1px solid var(--casa-border)',
              color: 'var(--casa-text-muted)',
              backgroundColor: 'transparent',
              minHeight: '48px',
            }}
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  )
}
