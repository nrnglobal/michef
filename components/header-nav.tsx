'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpen,
  CalendarDays,
  ShoppingCart,
  Settings,
  LogOut,
  ChefHat,
  Refrigerator,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/config'
import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  {
    key: 'nav.recipes',
    href: '/recipes',
    icon: BookOpen,
  },
  {
    key: 'nav.menuPlanning',
    href: '/menus',
    icon: CalendarDays,
  },
  {
    key: 'nav.shoppingLists',
    href: '/shopping-lists',
    icon: ShoppingCart,
  },
  {
    key: 'nav.inventory',
    href: '/inventory',
    icon: Refrigerator,
  },
  {
    key: 'nav.rules',
    href: '/rules',
    icon: Settings,
  },
]

interface HeaderNavProps {
  userName?: string
}

export function HeaderNav({ userName }: HeaderNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header
      className="sticky top-0 z-40 flex items-center h-14 px-4 border-b gap-3"
      style={{
        backgroundColor: 'var(--casa-surface)',
        borderColor: 'var(--casa-border)',
      }}
    >
      {/* Logo */}
      <Link href="/recipes" className="flex items-center gap-2 shrink-0 mr-2">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg"
          style={{ backgroundColor: 'var(--casa-primary)' }}
        >
          <ChefHat className="w-4 h-4 text-white" />
        </div>
        <span
          className="font-semibold text-sm tracking-tight hidden sm:inline"
          style={{ color: 'var(--casa-text)' }}
        >
          Mi Chef
        </span>
      </Link>

      {/* Navigation links */}
      <nav className="flex items-center gap-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0',
                isActive ? 'text-white' : 'hover:bg-gray-50'
              )}
              style={
                isActive
                  ? { backgroundColor: 'var(--casa-primary)', color: 'var(--casa-surface)' }
                  : { color: 'var(--casa-text-dark)' }
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">{t(item.key)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Right: user name, theme toggle, logout */}
      <div className="flex items-center gap-1 shrink-0 ml-auto">
        {userName && (
          <span
            className="text-sm font-medium truncate max-w-[120px] hidden md:inline mr-1"
            style={{ color: 'var(--casa-text-dark)' }}
          >
            {userName}
          </span>
        )}
        <ThemeToggle compact />
        <button
          onClick={handleLogout}
          aria-label={t('nav.logout')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          style={{ color: '#7F1D1D' }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline">{t('nav.logout')}</span>
        </button>
      </div>
    </header>
  )
}
