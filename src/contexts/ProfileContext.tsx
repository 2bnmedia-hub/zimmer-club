'use client'
import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

type ProfileContextType = {
  avatarUrl: string | null
  setAvatarUrl: (url: string | null) => void
  refreshKey: number
  refresh: () => void
}

const ProfileContext = createContext<ProfileContextType>({
  avatarUrl: null,
  setAvatarUrl: () => {},
  refreshKey: 0,
  refresh: () => {},
})

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const TIMEOUT = 15 * 60 * 1000 // 15 דקות

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.auth.signOut()
        window.location.href = '/auth/login'
      }
    }, TIMEOUT)
  }, [])

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer))
    resetTimer()
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [resetTimer])

  return (
    <ProfileContext.Provider value={{ avatarUrl, setAvatarUrl, refreshKey, refresh }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
