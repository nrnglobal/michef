'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import en from '@/lib/i18n/en.json'

export default function LoginPage() {
  const t = en
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasSupabaseConfig =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    if (!hasSupabaseConfig) {
      setError(t.auth.noCredentials)
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !data.user) {
      setError(t.auth.loginError)
      setLoading(false)
      return
    }

    // Check profile role and redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', data.user.id)
      .single()

    if (profile?.role === 'cook') {
      router.push('/visita')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#FAFAF8' }}
    >
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ backgroundColor: '#8B6914' }}
          >
            <span className="text-white text-2xl font-bold">CC</span>
          </div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: '#1A1410' }}
          >
            {t.auth.loginTitle}
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6B5B3E' }}>
            {t.auth.loginSubtitle}
          </p>
        </div>

        <Card
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8E0D0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-lg" style={{ color: '#1A1410' }}>
              {t.auth.login}
            </CardTitle>
            <CardDescription style={{ color: '#6B5B3E' }}>
              {hasSupabaseConfig
                ? t.auth.loginSubtitle
                : 'Demo mode — add .env.local to enable authentication'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" style={{ color: '#1A1410' }}>
                  {t.auth.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  style={{ borderColor: '#E8E0D0' }}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" style={{ color: '#1A1410' }}>
                  {t.auth.password}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t.auth.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  style={{ borderColor: '#E8E0D0' }}
                />
              </div>

              {error && (
                <div
                  className="text-sm p-3 rounded-lg"
                  style={{
                    backgroundColor: '#FEF2F2',
                    color: '#991B1B',
                    border: '1px solid #FCA5A5',
                  }}
                >
                  {error}
                </div>
              )}

              {!hasSupabaseConfig && (
                <div
                  className="text-sm p-3 rounded-lg"
                  style={{
                    backgroundColor: '#FEF9EC',
                    color: '#854D0E',
                    border: '1px solid #FCD34D',
                  }}
                >
                  <strong>Setup required:</strong> Copy{' '}
                  <code className="font-mono">.env.local.example</code> to{' '}
                  <code className="font-mono">.env.local</code> and add your
                  Supabase credentials.
                </div>
              )}

              <Button
                type="submit"
                className="w-full font-medium"
                disabled={loading}
                style={{
                  backgroundColor: '#8B6914',
                  color: '#FFFFFF',
                }}
              >
                {loading ? t.auth.loggingIn : t.auth.login}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
