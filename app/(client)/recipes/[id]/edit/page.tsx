import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RecipeForm } from '@/components/recipe-form'
import type { Recipe } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditRecipePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (!recipe) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/recipes/${id}`}
          className="flex items-center gap-1.5 text-sm font-medium hover:underline"
          style={{ color: 'var(--casa-primary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recipe
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--casa-text)' }}>
          Edit Recipe
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--casa-text-muted)' }}>
          Update recipe details and translations.
        </p>
      </div>

      <RecipeForm recipe={recipe as Recipe} />
    </div>
  )
}
