'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  ShoppingCart,
  DollarSign,
  MessageSquare,
  Settings,
  LogOut,
  ChefHat,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/config'

const navItems = [
  {
    key: 'nav.dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    active: true,
  },
  {
    key: 'nav.recipes',
    href: '/recipes',
    icon: BookOpen,
    active: true,
  },
  {
    key: 'nav.menuPlanning',
    href: '/menu-planning',
    icon: CalendarDays,
    active: false,
  },
  {
    key: 'nav.shoppingLists',
    href: '/shopping-lists',
    icon: ShoppingCart,
    active: false,
  },
  {
    key: 'nav.finances',
    href: '/finances',
    icon: DollarSign,
    active: false,
  },
  {
    key: 'nav.messages',
    href: '/client-messages',
    icon: MessageSquare,
    active: false,
  },
  {
    key: 'nav.rules',
    href: '/rules',
    icon: Settings,
    active: true,
  },
]

interface SidebarProps {
  userName?: string
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className="w-60 flex flex-col h-full border-r"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E8E0D0',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: '#E8E0D0' }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ backgroundColor: '#8B6914' }}
        >
          <ChefHat className="w-4 h-4 text-white" />
        </div>
        <span
          className="font-semibold text-base tracking-tight"
          style={{ color: '#1A1410' }}
        >
          Casa Cook
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                {item.active ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'text-white'
                        : 'hover:bg-gray-50'
                    )}
                    style={
                      isActive
                        ? { backgroundColor: '#8B6914', color: '#FFFFFF' }
                        : { color: '#4A3B28' }
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{t(item.key)}</span>
                  </Link>
                ) : (
                  <div
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-not-allowed"
                    style={{ color: '#B8A89A' }}
                    title="Coming in Phase 2"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{t(item.key)}</span>
                    <span
                      className="ml-auto text-xs px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: '#F5F0E8',
                        color: '#9B8B70',
                        fontSize: '10px',
                      }}
                    >
                      Soon
                    </span>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User + Logout */}
      <div
        className="px-3 py-4 border-t"
        style={{ borderColor: '#E8E0D0' }}
      >
        {userName && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium truncate" style={{ color: '#9B8B70' }}>
              Signed in as
            </p>
            <p className="text-sm font-semibold truncate" style={{ color: '#1A1410' }}>
              {userName}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          style={{ color: '#7F1D1D' }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  )
}
