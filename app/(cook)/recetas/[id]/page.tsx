import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, Youtube } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Recipe, Ingredient } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function RecetaDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (!recipe) notFound()
  const r = recipe as Recipe

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Back link */}
      <Link
        href="/recetas"
        className="flex items-center gap-1.5 text-sm font-medium hover:underline"
        style={{ color: '#8B6914' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Mis Recetas
      </Link>

      {/* Title + Meta */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: '#1A1410' }}>
          {r.title_es}
        </h1>
        {r.description_es && (
          <p className="text-sm mt-1" style={{ color: '#6B5B3E' }}>
            {r.description_es}
          </p>
        )}
        <div className="flex items-center gap-4 mt-3">
          {r.prep_time_minutes && (
            <div className="flex items-center gap-1" style={{ color: '#9B8B70' }}>
              <Clock className="w-4 h-4" />
              <span className="text-sm">{r.prep_time_minutes} min</span>
            </div>
          )}
          {r.servings && (
            <div className="flex items-center gap-1" style={{ color: '#9B8B70' }}>
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {r.servings} porción{r.servings !== 1 ? 'es' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* YouTube */}
      {r.youtube_url && (
        <a
          href={r.youtube_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: '#EF4444' }}
        >
          <Youtube className="w-4 h-4" />
          Ver en YouTube
        </a>
      )}

      {/* Ingredients */}
      {r.ingredients?.length > 0 && (
        <Card style={{ border: '1px solid #E8E0D0', backgroundColor: '#FFFFFF' }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: '#1A1410' }}>
              Ingredientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {r.ingredients.map((ing: Ingredient, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1.5 border-b last:border-0"
                  style={{ borderColor: '#F0EBE0' }}
                >
                  <span className="text-sm font-medium" style={{ color: '#1A1410' }}>
                    {ing.name_es}
                  </span>
                  <span className="text-sm" style={{ color: '#6B5B3E' }}>
                    {ing.quantity} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {r.instructions_es && (
        <div>
          <h2 className="font-semibold mb-3" style={{ color: '#1A1410' }}>
            Instrucciones
          </h2>
          <div
            className="text-sm whitespace-pre-wrap leading-relaxed"
            style={{ color: '#1A1410' }}
          >
            {r.instructions_es}
          </div>
        </div>
      )}
    </div>
  )
}
