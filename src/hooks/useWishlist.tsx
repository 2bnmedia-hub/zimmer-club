'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'zimmer_wishlist'

type WishlistContextType = {
  likedIds: string[]
  toggle: (id: string) => void
  isLiked: (id: string) => boolean
}

const WishlistContext = createContext<WishlistContextType>({
  likedIds: [],
  toggle: () => {},
  isLiked: () => false,
})

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  // טעינה ראשונית
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        // טען מ-Supabase
        const { data } = await supabase
          .from('wishlists')
          .select('property_id')
          .eq('user_id', user.id)
        const ids = data?.map((r: any) => r.property_id) || []
        setLikedIds(ids)
        // סנכרן localStorage
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)) } catch {}
      } else {
        // טען מ-localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) setLikedIds(JSON.parse(stored))
        } catch {}
      }
    }
    init()
  }, [])

  const toggle = async (id: string) => {
    const isCurrentlyLiked = likedIds.includes(id)
    const next = isCurrentlyLiked ? likedIds.filter(x => x !== id) : [...likedIds, id]

    // עדכן state מיידית
    setLikedIds(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}

    // אם משתמש רשום — עדכן Supabase
    if (userId) {
      if (isCurrentlyLiked) {
        await supabase.from('wishlists').delete()
          .eq('user_id', userId).eq('property_id', id)
      } else {
        await supabase.from('wishlists').insert({ user_id: userId, property_id: id })
      }
    }
  }

  const isLiked = (id: string) => likedIds.includes(id)

  return (
    <WishlistContext.Provider value={{ likedIds, toggle, isLiked }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}
