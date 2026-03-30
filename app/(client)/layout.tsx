import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HeaderNav } from '@/components/header-nav'
import { I18nProvider } from '@/lib/i18n/config'

export default async function ClientLayout({
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
    .select('*')
    .eq('user_id', user.id)
    .single()

  // If no profile or wrong role, redirect appropriately
  if (profile?.role === 'cook') {
    redirect('/visita')
  }

  const userName = profile?.name ?? user.email ?? 'User'

  return (
    <I18nProvider initialLanguage="en">
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--casa-bg)' }}>
        <HeaderNav userName={userName} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </I18nProvider>
  )
}
