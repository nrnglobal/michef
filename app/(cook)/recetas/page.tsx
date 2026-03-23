import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Clock, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Recipe } from '@/lib/types'

export default async function RecetasPage() {
  const supabase = await createClient()

  const { data: recipesData } = await supabase
    .from('recipes')
    .select('*')
    .eq('is_active', true)
    .order('title_es', { ascending: true })

  const recipes = (recipesData ?? []) as Recipe[]

  const categoryLabels: Record<string, string> = {
    beef: 'Carne',
    chicken: 'Pollo',
    seafood: 'Mariscos',
    veggies: 'Verduras',
    snacks: 'Snacks',
    carbs: 'Carbohidratos',
    soups: 'Sopas',
    salads: 'Ensaladas',
    other: 'Otros',
  }

  // Group by category
  const grouped = recipes.reduce<Record<string, Recipe[]>>((acc, recipe) => {
    const cat = recipe.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(recipe)
    return acc
  }, {})

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: '#1A1410' }}>
          Mis Recetas
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#6B5B3E' }}>
          {recipes.length} receta{recipes.length !== 1 ? 's' : ''} disponible{recipes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {Object.keys(grouped).length > 0 ? (
        Object.entries(grouped).map(([cat, catRecipes]) => (
          <div key={cat}>
            <h2
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: '#9B8B70' }}
            >
              {categoryLabels[cat] ?? cat}
            </h2>
            <div className="space-y-3">
              {catRecipes.map((recipe) => (
                <Link key={recipe.id} href={`/recetas/${recipe.id}`} className="block">
                <Card
                  style={{ border: '1px solid #E8E0D0', backgroundColor: '#FFFFFF' }}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#FEF9EC' }}
                      >
                        <BookOpen className="w-4 h-4" style={{ color: '#8B6914' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: '#1A1410' }}>
                          {recipe.title_es}
                        </p>
                        {recipe.description_es && (
                          <p
                            className="text-xs mt-0.5 line-clamp-2"
                            style={{ color: '#6B5B3E' }}
                          >
                            {recipe.description_es}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {recipe.prep_time_minutes && (
                            <div
                              className="flex items-center gap-1"
                              style={{ color: '#9B8B70' }}
                            >
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">
                                {recipe.prep_time_minutes} min
                              </span>
                            </div>
                          )}
                          {recipe.servings && (
                            <div
                              className="flex items-center gap-1"
                              style={{ color: '#9B8B70' }}
                            >
                              <Users className="w-3 h-3" />
                              <span className="text-xs">
                                {recipe.servings} porción{recipe.servings !== 1 ? 'es' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Instructions preview */}
                    {recipe.instructions_es && (
                      <div
                        className="mt-3 pt-3 border-t"
                        style={{ borderColor: '#F0EBE0' }}
                      >
                        <p className="text-xs font-medium mb-1" style={{ color: '#9B8B70' }}>
                          Instrucciones
                        </p>
                        <p
                          className="text-xs line-clamp-3 whitespace-pre-line"
                          style={{ color: '#1A1410' }}
                        >
                          {recipe.instructions_es}
                        </p>
                      </div>
                    )}

                    {/* Ingredients preview */}
                    {recipe.ingredients?.length > 0 && (
                      <div
                        className="mt-3 pt-3 border-t"
                        style={{ borderColor: '#F0EBE0' }}
                      >
                        <p className="text-xs font-medium mb-1" style={{ color: '#9B8B70' }}>
                          Ingredientes ({recipe.ingredients.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {recipe.ingredients.slice(0, 5).map((ing, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: '#F0EBE0',
                                color: '#6B5B3E',
                              }}
                            >
                              {ing.name_es}
                            </span>
                          ))}
                          {recipe.ingredients.length > 5 && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: '#F0EBE0',
                                color: '#9B8B70',
                              }}
                            >
                              +{recipe.ingredients.length - 5} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div
          className="text-center py-16 rounded-2xl border"
          style={{ borderColor: '#E8E0D0', borderStyle: 'dashed' }}
        >
          <BookOpen
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: '#C4B49A' }}
          />
          <p className="font-medium" style={{ color: '#1A1410' }}>
            No hay recetas disponibles
          </p>
          <p className="text-sm mt-1" style={{ color: '#9B8B70' }}>
            Las recetas aparecerán aquí cuando sean añadidas.
          </p>
        </div>
      )}
    </div>
  )
}
