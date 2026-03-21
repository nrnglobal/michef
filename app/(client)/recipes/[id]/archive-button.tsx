'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ArchiveRecipeButtonProps {
  recipeId: string
  isActive: boolean
}

export function ArchiveRecipeButton({ recipeId, isActive }: ArchiveRecipeButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('recipes')
      .update({ is_active: !isActive, updated_at: new Date().toISOString() })
      .eq('id', recipeId)

    if (error) {
      toast.error('Failed to update recipe status')
    } else {
      toast.success(isActive ? 'Recipe archived' : 'Recipe restored')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      style={{
        borderColor: isActive ? '#FCA5A5' : '#86EFAC',
        color: isActive ? '#991B1B' : '#166534',
      }}
    >
      {loading ? '...' : isActive ? 'Archive' : 'Restore'}
    </Button>
  )
}
