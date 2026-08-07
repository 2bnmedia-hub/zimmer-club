'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'zimmer_wishlist_v2'

export type LikeType = 'property' | 'caravan' | 'attraction'

function makeKey(id: string, type: LikeType) {
  return `${type}:${id}`
}

type WishlistContextType = {
  likedKeys: string[]
  toggle: (id: string, type?: LikeType) => void
  isLiked: (id: string, type?: LikeType) => boolean
  totalCount: number
  // Legacy support for property-only access
  likedIds: string[]
}

const WishlistContext = createContext<WishlistContextType>({
  likedKeys: [],
  toggle: () => {},
  isLiked: () => false,
  totalCount: 0,
  likedIds: [],
})

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [likedKeys, setLikedKeys] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()

      // Load localStorage always (for caravans/attractions + offline)
      let localKeys: string[] = []
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) localKeys = JSON.parse(stored)
      } catch {}

      if (user) {
        setUserId(user.id)
        // Sync property likes from Supabase
        const { data } = await supabase
          .from('wishlists')
          .select('property_id')
          .eq('user_id', user.id)
        const dbKeys = (data || []).map((r: any) => makeKey(r.property_id, 'property'))
        // Merge: db properties + ALL local keys (localStorage as fallback if Supabase sync lagged)
        const merged = Array.from(new Set([...dbKeys, ...localKeys]))
        setLikedKeys(merged)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)) } catch {}
      } else {
        setLikedKeys(localKeys)
      }
    }
    init()
  }, [])

  const toggle = async (id: string, type: LikeType = 'property') => {
    const key = makeKey(id, type)
    // Read CURRENT state before update (for Supabase op)
    const isCurrentlyLiked = likedKeys.includes(key)

    // Functional update — always works on the latest state, fixes stale-closure on rapid clicks
    setLikedKeys(prev => {
      const alreadyLiked = prev.includes(key)
      const next = alreadyLiked ? prev.filter(k => k !== key) : [...prev, key]
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })

    // Sync property likes to Supabase for logged-in users
    if (userId && type === 'property') {
      if (isCurrentlyLiked) {
        await supabase.from('wishlists').delete()
          .eq('user_id', userId).eq('property_id', id)
      } else {
        // upsert avoids duplicate-key errors if the row already exists
        await supabase.from('wishlists')
          .upsert({ user_id: userId, property_id: id }, { onConflict: 'user_id,property_id' })
      }
    }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUserId(null)
        setLikedKeys([])
        try { localStorage.removeItem(STORAGE_KEY) } catch {}
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const isLiked = (id: string, type: LikeType = 'property') => likedKeys.includes(makeKey(id, type))

  // Legacy: property IDs only (for backward compatibility)
  const likedIds = likedKeys
    .filter(k => k.startsWith('property:'))
    .map(k => k.replace('property:', ''))

  return (
    <WishlistContext.Provider value={{ likedKeys, toggle, isLiked, totalCount: likedKeys.length, likedIds }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}
