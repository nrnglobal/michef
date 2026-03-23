import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface MenuPlanRow {
  id: string
  visit_date: string
  status: string
  menu_plan_items: { id: string }[]
}

export default async function MenusPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: plans } = await supabase
    .from('menu_plans')
    .select('*, menu_plan_items(id)')
    .gte('visit_date', today)
    .order('visit_date', { ascending: true })

  const menuPlans = (plans ?? []) as MenuPlanRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: '#1A1410' }}>
          Menu Plans
        </h1>
        <Link href="/menus/new">
          <Button style={{ backgroundColor: '#8B6914', color: '#FFFFFF' }}>
            Plan menu
          </Button>
        </Link>
      </div>

      {/* Plan list */}
      {menuPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuPlans.map((plan) => {
            const isConfirmed = plan.status === 'confirmed'
            const recipeCount = plan.menu_plan_items?.length ?? 0

            return (
              <Card
                key={plan.id}
                style={{
                  border: '1px solid #E8E0D0',
                  backgroundColor: '#FFFFFF',
                }}
                className="rounded-xl"
              >
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold" style={{ color: '#1A1410' }}>
                        {formatDate(plan.visit_date)}
                      </p>
                      <p className="text-sm" style={{ color: '#6B5B3E' }}>
                        {recipeCount} recipe{recipeCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge
                      className="text-xs capitalize"
                      style={
                        isConfirmed
                          ? {
                              backgroundColor: '#EFF6FF',
                              color: '#1D4ED8',
                              border: '1px solid #BFDBFE',
                            }
                          : {
                              backgroundColor: '#F0EBE0',
                              color: '#6B5B3E',
                              border: '1px solid #D6CABF',
                            }
                      }
                    >
                      {isConfirmed ? 'Confirmed' : 'Draft'}
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <Link href={`/menus/${plan.id}`}>
                      <Button
                        variant="outline"
                        className="w-full"
                        style={{ borderColor: '#8B6914', color: '#8B6914' }}
                      >
                        Edit plan
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Empty state */
        <div
          className="text-center py-16 rounded-xl border"
          style={{ borderColor: '#E8E0D0', borderStyle: 'dashed' }}
        >
          <CalendarDays
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: '#C4B49A' }}
          />
          <p className="text-base font-semibold" style={{ color: '#1A1410' }}>
            No upcoming menus planned
          </p>
          <p className="text-sm mt-1" style={{ color: '#9B8B70' }}>
            Plan your next visit to get started.
          </p>
          <Link href="/menus/new">
            <Button
              className="mt-5"
              style={{ backgroundColor: '#8B6914', color: '#FFFFFF' }}
            >
              Plan menu
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
