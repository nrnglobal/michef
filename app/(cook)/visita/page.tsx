import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarDays, ChefHat, ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateEs } from '@/lib/utils'
import type { Visit, MenuPlan, Recipe } from '@/lib/types'

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: '#F9FAFB', text: '#374151', label: 'Borrador' },
  confirmed: { bg: '#EFF6FF', text: '#1D4ED8', label: 'Confirmado' },
  shopping: { bg: '#FFF7ED', text: '#9A3412', label: 'De compras' },
  cooking: { bg: 'var(--casa-primary-bg)', text: 'var(--casa-primary-text)', label: 'Cocinando' },
  done: { bg: '#F0FDF4', text: '#166534', label: 'Listo' },
}

export default async function VisitaPage() {
  const supabase = await createClient()

  // Get upcoming visit
  const { data: visitData } = await supabase
    .from('visits')
    .select('*')
    .gte('visit_date', new Date().toISOString().split('T')[0])
    .order('visit_date', { ascending: true })
    .limit(1)
    .single()

  const visit = visitData as Visit | null

  // Get associated menu plan with recipes if visit exists
  let menuPlan: MenuPlan | null = null
  let menuRecipes: Recipe[] = []

  if (visit?.menu_plan_id) {
    const { data: planData } = await supabase
      .from('menu_plans')
      .select('*')
      .eq('id', visit.menu_plan_id)
      .single()

    menuPlan = planData as MenuPlan | null
  }

  // Fallback: if no visit or no menu_plan_id, check for a confirmed menu plan directly
  if (!menuPlan) {
    const { data: directPlan } = await supabase
      .from('menu_plans')
      .select('*')
      .eq('status', 'confirmed')
      .gte('visit_date', new Date().toISOString().split('T')[0])
      .order('visit_date', { ascending: true })
      .limit(1)
      .single()

    if (directPlan) {
      menuPlan = directPlan as MenuPlan
    }
  }

  if (menuPlan) {
    const { data: items } = await supabase
      .from('menu_plan_items')
      .select('recipe_id, sort_order')
      .eq('menu_plan_id', menuPlan.id)
      .order('sort_order', { ascending: true })

    if (items && items.length > 0) {
      const recipeIds = items.map((i) => i.recipe_id)
      const { data: recipes } = await supabase
        .from('recipes')
        .select('*')
        .in('id', recipeIds)

      // Sort recipes according to menu plan order
      if (recipes) {
        const recipeMap = new Map(recipes.map((r) => [r.id, r]))
        menuRecipes = items
          .map((i) => recipeMap.get(i.recipe_id))
          .filter(Boolean) as Recipe[]
      }
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--casa-primary)' }}
        >
          <ChefHat className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--casa-text)' }}>
            Próxima Visita
          </h1>
          <p className="text-xs" style={{ color: 'var(--casa-text-muted)' }}>
            Tu próxima sesión de cocina
          </p>
        </div>
      </div>

      {visit ? (
        <>
          {/* Visit Date Card */}
          <Card style={{ border: '1px solid var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}>
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--casa-primary)' }} />
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--casa-text-faint)' }}>
                    Fecha de visita
                  </p>
                  <p className="font-semibold text-base capitalize" style={{ color: 'var(--casa-text)' }}>
                    {formatDateEs(visit.visit_date)}
                  </p>

                  {menuPlan && (
                    <div className="mt-2">
                      {(() => {
                        const s = statusColors[menuPlan.status] ?? statusColors.draft
                        return (
                          <Badge
                            style={{
                              backgroundColor: s.bg,
                              color: s.text,
                              border: 'none',
                            }}
                          >
                            {s.label}
                          </Badge>
                        )
                      })()}
                    </div>
                  )}

                  {visit.notes && (
                    <p className="text-sm mt-2" style={{ color: 'var(--casa-text-muted)' }}>
                      {visit.notes}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu */}
          <div>
            <h2 className="font-semibold mb-3" style={{ color: 'var(--casa-text)' }}>
              Menú del día
            </h2>

            {menuRecipes.length > 0 ? (
              <div className="space-y-3">
                {menuRecipes.map((recipe, idx) => (
                  <Link key={recipe.id} href={`/recetas/${recipe.id}?from=visita`} className="block">
                    <Card style={{ border: '1px solid var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                            style={{ backgroundColor: 'var(--casa-primary-bg)', color: 'var(--casa-primary)' }}
                          >
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm" style={{ color: 'var(--casa-text)' }}>
                              {recipe.title_es}
                            </p>
                            {recipe.prep_time_minutes && (
                              <p className="text-xs mt-1" style={{ color: 'var(--casa-text-faint)' }}>
                                {recipe.prep_time_minutes} min
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-10 rounded-xl border"
                style={{ borderColor: 'var(--casa-border)', borderStyle: 'dashed' }}
              >
                <p className="text-sm" style={{ color: 'var(--casa-text-faint)' }}>
                  No hay menú asignado para esta visita aún.
                </p>
              </div>
            )}
          </div>

          {/* Shopping list link */}
          {menuPlan?.status === 'confirmed' && menuRecipes.length > 0 && (
            <Link
              href="/lista"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border text-sm font-semibold transition-colors hover:opacity-90"
              style={{
                color: 'var(--casa-primary)',
                borderColor: 'var(--casa-primary)',
                backgroundColor: 'transparent',
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              Lista de compras
            </Link>
          )}


          {/* Payment info */}
          {(visit.grocery_total || visit.service_fee || visit.total_payment) && (
            <Card style={{ border: '1px solid var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}>
              <CardContent className="pt-5">
                <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--casa-text)' }}>
                  Información de pago
                </h3>
                <div className="space-y-2">
                  {visit.grocery_total && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--casa-text-muted)' }}>Compras</span>
                      <span style={{ color: 'var(--casa-text)' }}>
                        ${visit.grocery_total.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {visit.service_fee && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--casa-text-muted)' }}>Servicio</span>
                      <span style={{ color: 'var(--casa-text)' }}>
                        ${visit.service_fee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {visit.total_payment && (
                    <div
                      className="flex justify-between text-sm font-semibold pt-2 border-t"
                      style={{ borderColor: 'var(--casa-border)' }}
                    >
                      <span style={{ color: 'var(--casa-text)' }}>Total</span>
                      <span style={{ color: 'var(--casa-primary)' }}>
                        ${visit.total_payment.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <Badge
                    style={{
                      backgroundColor:
                        visit.payment_status === 'paid' ? '#F0FDF4' : '#FFF7ED',
                      color:
                        visit.payment_status === 'paid' ? '#166534' : '#9A3412',
                      border: 'none',
                    }}
                  >
                    {visit.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div
          className="text-center py-16 rounded-2xl border"
          style={{ borderColor: 'var(--casa-border)', borderStyle: 'dashed' }}
        >
          <CalendarDays
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: 'var(--casa-icon-muted)' }}
          />
          <p className="font-medium" style={{ color: 'var(--casa-text)' }}>
            No hay visita próxima
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--casa-text-faint)' }}>
            Tu próxima sesión aparecerá aquí cuando sea programada.
          </p>
        </div>
      )}
    </div>
  )
}
