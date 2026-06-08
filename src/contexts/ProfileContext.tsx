'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

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
  return (
    <ProfileContext.Provider value={{ avatarUrl, setAvatarUrl, refreshKey, refresh }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
