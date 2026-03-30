'use client'

import { useState } from 'react'
import { loginWithPasscode } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import en from '@/lib/i18n/en.json'

export default function LoginPage() {
  const t = en
  const [passcode, setPasscode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await loginWithPasscode(passcode)
    // If we get here, login failed (success triggers a redirect)
    setError(result.error)
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#FAFAF8' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ backgroundColor: '#8B6914' }}
          >
            <span className="text-white text-2xl font-bold">CC</span>
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: '#1A1410' }}>
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
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="passcode" style={{ color: '#1A1410' }}>
                  {t.auth.passcode}
                </Label>
                <Input
                  id="passcode"
                  type="password"
                  placeholder={t.auth.passcodePlaceholder}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  required
                  autoFocus
                  disabled={loading}
                  style={{ borderColor: '#E8E0D0', color: '#1A1410', backgroundColor: '#FFFFFF' }}
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

              <Button
                type="submit"
                className="w-full font-medium"
                disabled={loading}
                style={{ backgroundColor: '#8B6914', color: '#FFFFFF' }}
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
