import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/bottom-nav'
import { I18nProvider } from '@/lib/i18n/config'
import { ThemeToggle } from '@/components/theme-toggle'
import { CookLogoutButton } from '@/components/cook-logout-button'

export default async function CookLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  // Redirect clients to their area
  if (profile && profile.role !== 'cook') {
    redirect('/dashboard')
  }

  return (
    <I18nProvider initialLanguage="es">
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: 'var(--casa-bg)' }}
      >
        <div className="fixed top-3 right-4 z-50 flex items-center gap-2">
          <CookLogoutButton />
          <ThemeToggle compact />
        </div>
        <main className="flex-1 pb-20">{children}</main>
        <BottomNav />
      </div>
    </I18nProvider>
  )
}
