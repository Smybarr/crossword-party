import { useState, useEffect, useCallback } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const quickSignIn = useCallback(
    async (email: string): Promise<{ exists: boolean }> => {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-signin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Auto-signin failed')

      if (data.exists) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: data.token_hash,
          type: 'magiclink',
        })
        if (error) throw error
      }

      return { exists: data.exists }
    },
    []
  )

  const sendMagicLink = useCallback(
    async (email: string, firstName: string, lastName: string) => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      })
      if (error) throw error
    },
    []
  )

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  return { session, profile, loading, quickSignIn, sendMagicLink, signOut }
}
