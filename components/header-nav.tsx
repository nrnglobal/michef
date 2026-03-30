'use client'

import { useState } from 'react'
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
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: 'var(--casa-surface)',
        borderColor: 'var(--casa-border)',
      }}
    >
      {/* Main header bar */}
      <div className="flex items-center h-14 px-4 gap-3">
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

        {/* Desktop navigation links (md and above) */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
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
                <span>{t(item.key)}</span>
              </Link>
            )
          })}
        </nav>

        {/* Spacer on mobile to push right items to the edge */}
        <div className="flex-1 md:hidden" />

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
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            style={{ color: '#7F1D1D' }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">{t('nav.logout')}</span>
          </button>

          {/* Hamburger toggle (mobile only) */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: 'var(--casa-text-dark)' }}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <nav
          className="md:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{
            backgroundColor: 'var(--casa-surface)',
            borderColor: 'var(--casa-border)',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'text-white' : 'hover:bg-gray-50'
                )}
                style={
                  isActive
                    ? { backgroundColor: 'var(--casa-primary)', color: 'var(--casa-surface)' }
                    : { color: 'var(--casa-text-dark)' }
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t(item.key)}</span>
              </Link>
            )
          })}

          {/* Divider */}
          <div
            className="my-1 border-t"
            style={{ borderColor: 'var(--casa-border)' }}
          />

          {/* User name in mobile menu */}
          {userName && (
            <div
              className="px-3 py-1.5 text-sm font-medium truncate"
              style={{ color: 'var(--casa-text-dark)' }}
            >
              {userName}
            </div>
          )}

          {/* Logout in mobile menu */}
          <button
            onClick={() => {
              closeMobileMenu()
              handleLogout()
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors w-full text-left"
            style={{ color: '#7F1D1D' }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{t('nav.logout')}</span>
          </button>
        </nav>
      )}
    </header>
  )
}
