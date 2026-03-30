'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginWithPasscode(passcode: string): Promise<{ error: string }> {
  const users = [
    {
      passcode: process.env.APP_CLIENT_PASSCODE,
      email: process.env.APP_CLIENT_EMAIL,
      userId: process.env.APP_CLIENT_USER_ID,
    },
    {
      passcode: process.env.APP_COOK_PASSCODE,
      email: process.env.APP_COOK_EMAIL,
      userId: process.env.APP_COOK_USER_ID,
    },
  ]

  // Debug: check which env vars are present (never logs values)
  const debug = users.map((u, i) => ({
    index: i,
    hasPasscode: !!u.passcode,
    hasEmail: !!u.email,
    hasUserId: !!u.userId,
    passcodeLength: u.passcode?.length ?? 0,
    inputLength: passcode.length,
    matches: u.passcode === passcode,
  }))
  console.log('[login debug]', JSON.stringify(debug))

  const match = users.find(
    (u) => u.passcode && u.email && u.userId && passcode === u.passcode
  )

  if (!match) {
    return { error: `Incorrect passcode. Debug: ${JSON.stringify(debug)}` }
  }

  // Sync the passcode as the Supabase password (env var is source of truth)
  const admin = createAdminClient()
  const { error: updateError } = await admin.auth.admin.updateUserById(match.userId!, { password: passcode })
  if (updateError) {
    return { error: `Password sync failed: ${updateError.message}` }
  }

  // Sign in to create a session
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: match.email!,
    password: passcode,
  })

  if (error || !data.user) {
    return { error: `Sign in failed: ${error?.message ?? 'no user returned'}` }
  }

  // Role-based redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', data.user.id)
    .single()

  redirect(profile?.role === 'cook' ? '/visita' : '/dashboard')
}
