import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarDays, BookOpen, Settings, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [
    { data: profile },
    { data: recipes, count: recipeCount },
    { data: rules },
    { data: visits },
    { data: confirmedPlans },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single(),
    supabase
      .from('recipes')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('cooking_rules')
      .select('id')
      .eq('is_active', true),
    supabase
      .from('visits')
      .select('*')
      .gte('visit_date', today)
      .order('visit_date', { ascending: true })
      .limit(1),
    supabase
      .from('menu_plans')
      .select('id, visit_date, menu_plan_items(recipe_id, recipes(title_en))')
      .eq('status', 'confirmed')
      .gte('visit_date', today)
      .order('visit_date', { ascending: true })
      .limit(1),
  ])

  const nextVisit = visits?.[0]
  const activeRuleCount = rules?.length ?? 0
  const totalRecipes = recipeCount ?? 0
  const recentRecipes = recipes ?? []
  const userName = profile?.name ?? 'there'
  const nextConfirmedPlan = confirmedPlans?.[0] as {
    id: string
    visit_date: string
    menu_plan_items: { recipe_id: string; recipes: { title_en: string } | null }[]
  } | undefined

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--casa-text)' }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--casa-text-muted)' }}>
          Welcome back, {userName}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card style={{ border: '1px solid var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--casa-text-faint)' }}>
                  Total Recipes
                </p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--casa-text)' }}>
                  {totalRecipes}
                </p>
              </div>
              <div
                className="p-2.5 rounded-lg"
                style={{ backgroundColor: 'var(--casa-primary-bg)' }}
              >
                <BookOpen className="w-5 h-5" style={{ color: 'var(--casa-primary)' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ border: '1px solid var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--casa-text-faint)' }}>
                  Active Rules
                </p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--casa-text)' }}>
                  {activeRuleCount}
                </p>
              </div>
              <div
                className="p-2.5 rounded-lg"
                style={{ backgroundColor: 'var(--casa-primary-bg)' }}
              >
                <Settings className="w-5 h-5" style={{ color: 'var(--casa-primary)' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ border: '1px solid var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--casa-text-faint)' }}>
                  Next Visit
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: 'var(--casa-text)' }}>
                  {nextVisit ? formatDate(nextVisit.visit_date) : 'Not scheduled'}
                </p>
              </div>
              <div
                className="p-2.5 rounded-lg"
                style={{ backgroundColor: 'var(--casa-primary-bg)' }}
              >
                <CalendarDays className="w-5 h-5" style={{ color: 'var(--casa-primary)' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Visit */}
      {nextVisit && (
        <Card style={{ border: '1px solid var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}>
          <CardHeader>
            <CardTitle className="text-base font-semibold" style={{ color: 'var(--casa-text)' }}>
              Upcoming Visit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: 'var(--casa-text)' }}>
                  {formatDate(nextVisit.visit_date)}
                </p>
                {nextVisit.notes && (
                  <p className="text-sm mt-1" style={{ color: 'var(--casa-text-muted)' }}>
                    {nextVisit.notes}
                  </p>
                )}
              </div>
              <Badge
                className="text-xs"
                style={{
                  backgroundColor: 'var(--casa-primary-bg)',
                  color: 'var(--casa-primary-text)',
                  border: '1px solid #FCD34D',
                }}
              >
                {nextVisit.payment_status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu Plan CTA */}
      <Card style={{ border: '1px solid var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}>
        <CardHeader>
          <CardTitle className="text-base font-semibold" style={{ color: 'var(--casa-text)' }}>
            Menu Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextConfirmedPlan ? (
            <div className="space-y-3">
              <p className="text-sm" style={{ color: 'var(--casa-text-muted)' }}>
                {formatDate(nextConfirmedPlan.visit_date)}
              </p>
              {nextConfirmedPlan.menu_plan_items.length > 0 && (
                <ul className="space-y-1">
                  {nextConfirmedPlan.menu_plan_items.slice(0, 4).map((item, i) => (
                    <li key={i} className="text-sm" style={{ color: 'var(--casa-text)' }}>
                      {item.recipes?.title_en ?? '—'}
                    </li>
                  ))}
                </ul>
              )}
              <Link href={`/menus/${nextConfirmedPlan.id}`}>
                <Button
                  variant="outline"
                  className="gap-1.5"
                  style={{ borderColor: 'var(--casa-primary)', color: 'var(--casa-primary)' }}
                >
                  <CalendarDays className="w-4 h-4" />
                  View plan
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: 'var(--casa-text-muted)' }}>
                No menu planned yet
              </p>
              <Link href="/menus">
                <Button
                  className="gap-1.5"
                  style={{ backgroundColor: 'var(--casa-primary)', color: 'var(--casa-surface)' }}
                >
                  <CalendarDays className="w-4 h-4" />
                  Plan menu
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Recipes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: 'var(--casa-text)' }}>
            Recent Recipes
          </h2>
          <Link
            href="/recipes"
            className="flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: 'var(--casa-primary)' }}
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentRecipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                <div
                  className="flex items-center gap-3 p-3.5 rounded-xl border hover:shadow-sm transition-shadow cursor-pointer"
                  style={{ backgroundColor: 'var(--casa-surface)', borderColor: 'var(--casa-border)' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--casa-primary-bg)' }}
                  >
                    <BookOpen className="w-4 h-4" style={{ color: 'var(--casa-primary)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--casa-text)' }}>
                      {recipe.title_en}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--casa-text-faint)' }}>
                      {recipe.category}
                      {recipe.prep_time_minutes
                        ? ` · ${recipe.prep_time_minutes} min`
                        : ''}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-10 rounded-xl border"
            style={{ borderColor: 'var(--casa-border)', borderStyle: 'dashed' }}
          >
            <BookOpen
              className="w-8 h-8 mx-auto mb-2"
              style={{ color: 'var(--casa-icon-muted)' }}
            />
            <p className="text-sm" style={{ color: 'var(--casa-text-faint)' }}>
              No recipes added yet
            </p>
            <Link
              href="/recipes/new"
              className="text-sm font-medium mt-1 inline-block hover:underline"
              style={{ color: 'var(--casa-primary)' }}
            >
              Add your first recipe
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
