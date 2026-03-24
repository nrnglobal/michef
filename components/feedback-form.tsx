'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface FeedbackFormProps {
  recipeId: string
  onSubmitted: (feedback: {
    rating?: number
    feedback_text?: string
    adjustment_type?: string
    adjustment_detail?: string
  }) => void
}

export function FeedbackForm({ recipeId, onSubmitted }: FeedbackFormProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [adjustmentType, setAdjustmentType] = useState('')
  const [adjustmentDetail, setAdjustmentDetail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('recipe_feedback').insert({
        recipe_id: recipeId,
        rating: rating ?? null,
        feedback_text: feedbackText || null,
        adjustment_type: adjustmentType || null,
        adjustment_detail: adjustmentDetail || null,
      })

      if (error) {
        toast.error('Failed to save feedback')
        return
      }

      toast.success('Feedback saved')
      onSubmitted({
        rating: rating ?? undefined,
        feedback_text: feedbackText,
        adjustment_type: adjustmentType,
        adjustment_detail: adjustmentDetail,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-xl border" style={{ borderColor: 'var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}>
      <h3 className="text-sm font-semibold" style={{ color: 'var(--casa-text)' }}>Leave Feedback</h3>

      {/* Star Rating */}
      <div>
        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--casa-text-muted)' }}>
          Rating
        </label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1
            const filled = hovered !== null ? value <= hovered : rating !== null && value <= rating
            return (
              <button
                key={i}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHovered(value)}
                onMouseLeave={() => setHovered(null)}
                className="p-0.5 rounded transition-transform hover:scale-110"
                aria-label={`Rate ${value} star${value !== 1 ? 's' : ''}`}
              >
                <Star
                  className="w-5 h-5"
                  style={{
                    color: filled ? '#F59E0B' : '#D1D5DB',
                    fill: filled ? '#F59E0B' : 'none',
                  }}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Comments */}
      <div>
        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--casa-text-muted)' }}>
          Comments
        </label>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          rows={3}
          placeholder="What did you think of this recipe?"
          className="w-full text-sm rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2"
          style={{
            border: '1px solid var(--casa-border)',
            backgroundColor: 'var(--casa-bg)',
            color: 'var(--casa-text)',
          }}
        />
      </div>

      {/* Adjustment type */}
      <div>
        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--casa-text-muted)' }}>
          Adjustment type
        </label>
        <select
          value={adjustmentType}
          onChange={(e) => setAdjustmentType(e.target.value)}
          className="w-full text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
          style={{
            border: '1px solid var(--casa-border)',
            backgroundColor: 'var(--casa-bg)',
            color: 'var(--casa-text)',
          }}
        >
          <option value="">No adjustment needed</option>
          <option value="spicier">Spicier</option>
          <option value="milder">Milder</option>
          <option value="healthier">Healthier</option>
          <option value="simpler">Simpler</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Adjustment detail — shown when adjustment_type is set */}
      {adjustmentType && (
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--casa-text-muted)' }}>
            Adjustment detail
          </label>
          <input
            type="text"
            value={adjustmentDetail}
            onChange={(e) => setAdjustmentDetail(e.target.value)}
            placeholder="Any specific details about the adjustment..."
            className="w-full text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
            style={{
              border: '1px solid var(--casa-border)',
              backgroundColor: 'var(--casa-bg)',
              color: 'var(--casa-text)',
            }}
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={submitting}
        style={{ backgroundColor: 'var(--casa-primary)', color: 'var(--casa-surface)' }}
      >
        {submitting ? 'Saving...' : 'Submit Feedback'}
      </Button>
    </form>
  )
}
