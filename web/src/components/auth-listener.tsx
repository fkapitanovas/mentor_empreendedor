'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthListener() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    if (!hash) return

    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')

    if (accessToken && type === 'recovery') {
      const supabase = createClient()
      void supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      }).then(() => {
        window.history.replaceState(null, '', window.location.pathname)
        router.push('/reset-password')
      })
    }
  }, [router])

  return null
}
