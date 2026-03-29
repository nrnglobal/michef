import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MenuCard } from './menu-card'

interface MenuPlanRow {
  id: string
  visit_date: string
  status: string
  menu_plan_items: {
    id: string
    recipe_id: string
    sort_order: number
    recipes: { id: string; title_en: string; category: string } | null
  }[]
}

export default async function MenusPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: plans } = await supabase
    .from('menu_plans')
    .select('*, menu_plan_items(id, recipe_id, sort_order, recipes(id, title_en, category))')
    .gte('visit_date', today)
    .order('visit_date', { ascending: true })
    .order('sort_order', { referencedTable: 'menu_plan_items', ascending: true })

  const menuPlans = (plans ?? []) as MenuPlanRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--casa-text)' }}>
          Menu Plans
        </h1>
        <Link href="/menus/new">
          <Button style={{ backgroundColor: 'var(--casa-primary)', color: '#FFFFFF' }}>
            Plan menu
          </Button>
        </Link>
      </div>

      {/* Plan list */}
      {menuPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuPlans.map((plan) => (
            <MenuCard key={plan.id} plan={plan} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div
          className="text-center py-16 rounded-xl border"
          style={{ borderColor: 'var(--casa-border)', borderStyle: 'dashed' }}
        >
          <CalendarDays
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: 'var(--casa-text-faint)' }}
          />
          <p className="text-base font-semibold" style={{ color: 'var(--casa-text)' }}>
            No upcoming menus planned
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--casa-text-muted)' }}>
            Plan your next visit to get started.
          </p>
          <Link href="/menus/new">
            <Button
              className="mt-5"
              style={{ backgroundColor: 'var(--casa-primary)', color: '#FFFFFF' }}
            >
              Plan menu
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
