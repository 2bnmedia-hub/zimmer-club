'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setLikedIds(JSON.parse(stored))
    } catch {}
  }, [])

  const toggle = (id: string) => {
    setLikedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
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
