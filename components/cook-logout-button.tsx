'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function CookLogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label="Cerrar sesión"
      className="flex items-center justify-center w-9 h-9 rounded-full transition-opacity hover:opacity-70"
      style={{ color: 'var(--casa-text-faint)' }}
    >
      <LogOut className="w-5 h-5" />
    </button>
  )
}
