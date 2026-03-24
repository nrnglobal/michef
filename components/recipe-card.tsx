'use client'

import Link from 'next/link'
import { Clock, Users, Youtube } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Recipe } from '@/lib/types'
import { useI18n } from '@/lib/i18n/config'

const categoryColors: Record<string, { bg: string; text: string }> = {
  beef: { bg: '#FEF2F2', text: '#991B1B' },
  chicken: { bg: '#FFF7ED', text: '#9A3412' },
  seafood: { bg: '#EFF6FF', text: '#1D4ED8' },
  veggies: { bg: '#F0FDF4', text: '#166534' },
  snacks: { bg: '#FEFCE8', text: '#854D0E' },
  carbs: { bg: '#FAF5FF', text: '#6B21A8' },
  soups: { bg: '#F0F9FF', text: '#0369A1' },
  salads: { bg: '#ECFDF5', text: '#065F46' },
  other: { bg: '#F9FAFB', text: '#374151' },
}

interface RecipeCardProps {
  recipe: Recipe
  language?: 'en' | 'es'
}

export function RecipeCard({ recipe, language = 'en' }: RecipeCardProps) {
  const { t } = useI18n()
  const title = language === 'es' ? recipe.title_es : recipe.title_en
  const description =
    language === 'es' ? recipe.description_es : recipe.description_en

  const categoryStyle = categoryColors[recipe.category] ?? categoryColors.other

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <div
        className={cn(
          'group rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md',
          !recipe.is_active && 'opacity-50'
        )}
        style={{
          backgroundColor: 'var(--casa-surface)',
          borderColor: 'var(--casa-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className="font-semibold text-sm leading-snug line-clamp-2 flex-1 group-hover:underline"
            style={{ color: 'var(--casa-text)' }}
          >
            {title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {recipe.youtube_url && (
              <Youtube className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
            )}
            {!recipe.is_active && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0"
                style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
              >
                {t('recipes.inactive')}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <p
            className="text-xs line-clamp-2 mb-3"
            style={{ color: 'var(--casa-text-muted)' }}
          >
            {description}
          </p>
        )}

        {/* Category badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: categoryStyle.bg,
              color: categoryStyle.text,
            }}
          >
            {t(`recipes.categories.${recipe.category}`) || recipe.category}
          </span>

          {recipe.protein_type && (
            <span
              className="text-xs"
              style={{ color: 'var(--casa-text-faint)' }}
            >
              {recipe.protein_type}
            </span>
          )}
        </div>

        {/* Meta */}
        <div
          className="flex items-center gap-4 mt-3 pt-3 border-t"
          style={{ borderColor: 'var(--casa-surface-3)' }}
        >
          {recipe.prep_time_minutes && (
            <div className="flex items-center gap-1" style={{ color: '#9B8B70' }}>
              <Clock className="w-3 h-3" />
              <span className="text-xs">{t('recipes.prepTime', { minutes: recipe.prep_time_minutes })}</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1" style={{ color: '#9B8B70' }}>
              <Users className="w-3 h-3" />
              <span className="text-xs">
                {recipe.servings === 1
                  ? t('recipes.serving', { count: recipe.servings })
                  : t('recipes.servings', { count: recipe.servings })}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
