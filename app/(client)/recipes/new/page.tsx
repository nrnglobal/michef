'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { RecipeForm } from '@/components/recipe-form'
import { UrlImportSection } from '@/components/url-import-section'
import type { Recipe } from '@/lib/types'

export default function NewRecipePage() {
  const [importedRecipe, setImportedRecipe] = useState<Partial<Recipe> | null>(null)
  const [importKey, setImportKey] = useState(0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/recipes"
          className="flex items-center gap-1.5 text-sm font-medium hover:underline"
          style={{ color: 'var(--casa-primary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recipes
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--casa-text)' }}>
          Add New Recipe
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--casa-text-muted)' }}>
          Add a new recipe to your library with English and Spanish translations.
        </p>
      </div>

      <UrlImportSection
        onImported={(r) => {
          setImportedRecipe(r)
          setImportKey((k) => k + 1)
        }}
      />

      <RecipeForm key={importKey} recipe={importedRecipe as Recipe | undefined} />
    </div>
  )
}
