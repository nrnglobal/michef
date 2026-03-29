'use client'

import { useTransition, useState, useRef, useEffect } from 'react'
import { CalendarPlus, Check, ChevronDown } from 'lucide-react'
import { addRecipeToMenuPlan } from '@/lib/menu-actions'
import { formatDate } from '@/lib/utils'

export interface DraftPlan {
  id: string
  visit_date: string
  status: string
}

interface AddToMenuButtonProps {
  recipeId: string
  draftPlans: DraftPlan[]
}

export function AddToMenuButton({ recipeId, draftPlans }: AddToMenuButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [added, setAdded] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleAdd(planId: string) {
    setOpen(false)
    startTransition(async () => {
      const result = await addRecipeToMenuPlan(planId, recipeId)
      if (!result?.error) setAdded(true)
    })
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (draftPlans.length === 1) {
      handleAdd(draftPlans[0].id)
    } else {
      setOpen((v) => !v)
    }
  }

  const label = added
    ? 'Added!'
    : isPending
    ? 'Adding…'
    : 'Add to Menu'

  return (
    <div ref={ref} className="relative" onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
      <button
        onClick={handleClick}
        disabled={isPending || added || draftPlans.length === 0}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-lg border transition-all disabled:opacity-50"
        style={
          added
            ? { borderColor: '#166534', color: '#166534', backgroundColor: '#F0FDF4' }
            : { borderColor: 'var(--casa-primary)', color: 'var(--casa-primary)', backgroundColor: 'transparent' }
        }
      >
        {added ? (
          <Check className="w-3 h-3" />
        ) : (
          <CalendarPlus className="w-3 h-3" />
        )}
        {label}
        {!added && !isPending && draftPlans.length > 1 && (
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {open && draftPlans.length > 1 && (
        <div
          className="absolute bottom-full mb-1 left-0 right-0 rounded-lg border shadow-md z-10 overflow-hidden"
          style={{ backgroundColor: 'var(--casa-surface)', borderColor: 'var(--casa-border)' }}
        >
          {draftPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAdd(plan.id) }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--casa-surface-3)] transition-colors flex items-center justify-between gap-2"
              style={{ color: 'var(--casa-text)' }}
            >
              <span>{formatDate(plan.visit_date)}</span>
              {plan.status === 'confirmed' && (
                <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
                  Confirmed
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
