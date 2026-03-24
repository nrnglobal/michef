import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, Youtube, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Recipe, RecipeFeedback, Ingredient } from '@/lib/types'
import { ArchiveRecipeButton } from './archive-button'
import { RecipeDetailActions } from './recipe-detail-actions'
import { toTitleCase, formatInstructions } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (!recipe) notFound()

  const r = recipe as Recipe

  const { data: feedbackRows } = await supabase
    .from('recipe_feedback')
    .select('*')
    .eq('recipe_id', id)
    .order('created_at', { ascending: false })

  const feedback = (feedbackRows ?? []) as RecipeFeedback[]

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/recipes"
          className="flex items-center gap-1.5 text-sm font-medium hover:underline"
          style={{ color: 'var(--casa-primary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recipes
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/recipes/${id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text-dark)' }}
            >
              Edit Recipe
            </Button>
          </Link>
          <ArchiveRecipeButton recipeId={id} isActive={r.is_active} />
        </div>
      </div>

      {/* AI actions: Adjust, Duplicate, Feedback */}
      <RecipeDetailActions recipe={r} />

      {/* Title + Meta */}
      <div>
        <div className="flex items-start gap-3 mb-2">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--casa-text)' }}>
              {r.title_en}
            </h1>
            <p className="text-base mt-0.5" style={{ color: 'var(--casa-text-muted)' }}>
              {r.title_es}
            </p>
          </div>
          {!r.is_active && (
            <Badge
              variant="outline"
              style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
            >
              Archived
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 mt-3">
          <span
            className="inline-flex items-center text-sm font-medium px-2.5 py-0.5 rounded-full capitalize"
            style={{ backgroundColor: 'var(--casa-primary-bg)', color: 'var(--casa-primary-text)' }}
          >
            {r.category}
          </span>
          {r.protein_type && (
            <span className="text-sm" style={{ color: 'var(--casa-text-muted)' }}>
              {r.protein_type}
            </span>
          )}
          {r.prep_time_minutes && (
            <div className="flex items-center gap-1" style={{ color: 'var(--casa-text-faint)' }}>
              <Clock className="w-4 h-4" />
              <span className="text-sm">{r.prep_time_minutes} min</span>
            </div>
          )}
          {r.servings && (
            <div className="flex items-center gap-1" style={{ color: 'var(--casa-text-faint)' }}>
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {r.servings} serving{r.servings !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {r.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {r.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--casa-surface-3)', color: 'var(--casa-text-muted)' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
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
          Watch on YouTube
        </a>
      )}

      {/* Descriptions */}
      {(r.description_en || r.description_es) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {r.description_en && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--casa-text-faint)' }}>
                English
              </p>
              <p className="text-sm" style={{ color: 'var(--casa-text)' }}>
                {r.description_en}
              </p>
            </div>
          )}
          {r.description_es && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--casa-text-faint)' }}>
                Español
              </p>
              <p className="text-sm" style={{ color: 'var(--casa-text)' }}>
                {r.description_es}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Ingredients */}
      {r.ingredients?.length > 0 && (
        <Card style={{ border: '1px solid var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: 'var(--casa-text)' }}>
              Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {r.ingredients.map((ing: Ingredient, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1.5 border-b last:border-0"
                  style={{ borderColor: 'var(--casa-surface-3)' }}
                >
                  <div>
                    <span className="text-sm font-medium" style={{ color: 'var(--casa-text)' }}>
                      {toTitleCase(ing.name_en)}
                    </span>
                    {ing.name_es && ing.name_es !== ing.name_en && (
                      <span className="text-xs ml-1" style={{ color: 'var(--casa-text-faint)' }}>
                        / {toTitleCase(ing.name_es)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--casa-text-muted)' }}>
                    {ing.quantity} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {(r.instructions_en || r.instructions_es) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {r.instructions_en && (
            <div>
              <h2 className="font-semibold mb-3" style={{ color: 'var(--casa-text)' }}>
                Instructions (English)
              </h2>
              <ol className="list-decimal list-outside pl-5 space-y-2">
                {formatInstructions(r.instructions_en).map((step, i) => (
                  <li key={i} className="text-sm leading-relaxed" style={{ color: 'var(--casa-text)' }}>{step}.</li>
                ))}
              </ol>
            </div>
          )}
          {r.instructions_es && (
            <div>
              <h2 className="font-semibold mb-3" style={{ color: 'var(--casa-text)' }}>
                Instrucciones (Español)
              </h2>
              <ol className="list-decimal list-outside pl-5 space-y-2">
                {formatInstructions(r.instructions_es).map((step, i) => (
                  <li key={i} className="text-sm leading-relaxed" style={{ color: 'var(--casa-text)' }}>{step}.</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      <div>
        <h2 className="font-semibold mb-3" style={{ color: 'var(--casa-text)' }}>
          Feedback History
        </h2>
        {feedback.length > 0 ? (
          <div className="space-y-3">
            {feedback.map((fb) => (
              <Card
                key={fb.id}
                style={{ border: '1px solid var(--casa-border)', backgroundColor: 'var(--casa-bg)' }}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {fb.rating && (
                        <div className="flex items-center gap-1 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-3.5 h-3.5"
                              style={{
                                color: i < fb.rating! ? '#F59E0B' : '#D1D5DB',
                                fill: i < fb.rating! ? '#F59E0B' : 'none',
                              }}
                            />
                          ))}
                        </div>
                      )}
                      {fb.feedback_text && (
                        <p className="text-sm" style={{ color: 'var(--casa-text)' }}>
                          {fb.feedback_text}
                        </p>
                      )}
                      {fb.adjustment_type && (
                        <p className="text-xs mt-1" style={{ color: 'var(--casa-text-faint)' }}>
                          {fb.adjustment_type}: {fb.adjustment_detail}
                        </p>
                      )}
                    </div>
                    <time className="text-xs shrink-0 ml-4" style={{ color: 'var(--casa-text-faint)' }}>
                      {new Date(fb.created_at).toLocaleDateString()}
                    </time>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--casa-text-faint)' }}>
            No feedback yet for this recipe.
          </p>
        )}
      </div>
    </div>
  )
}
