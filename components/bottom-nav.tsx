'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingCart, BookOpen, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const cookNavItems = [
  { labelEs: 'Próxima Visita', href: '/visita', icon: Home },
  { labelEs: 'Compras', href: '/compras', icon: ShoppingCart },
  { labelEs: 'Recetas', href: '/recetas', icon: BookOpen },
  { labelEs: 'Mensajes', href: '/mensajes', icon: MessageSquare },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t z-50"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E8E0D0',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-stretch">
        {cookNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-3 gap-1 text-xs font-medium transition-colors min-h-[60px]',
                isActive ? '' : 'opacity-60'
              )}
              style={{
                color: isActive ? '#8B6914' : '#4A3B28',
              }}
            >
              <Icon
                className="w-6 h-6"
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className="text-[11px] font-medium leading-tight text-center">
                {item.labelEs}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
