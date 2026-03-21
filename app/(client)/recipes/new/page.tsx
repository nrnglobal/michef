import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { RecipeForm } from '@/components/recipe-form'

export default function NewRecipePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/recipes"
          className="flex items-center gap-1.5 text-sm font-medium hover:underline"
          style={{ color: '#8B6914' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recipes
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold" style={{ color: '#1A1410' }}>
          Add New Recipe
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#6B5B3E' }}>
          Add a new recipe to your library with English and Spanish translations.
        </p>
      </div>

      <RecipeForm />
    </div>
  )
}
