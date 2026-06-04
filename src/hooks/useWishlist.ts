import { useState, useEffect } from 'react'

const STORAGE_KEY = 'zimmer_wishlist'

export function useWishlist() {
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

  return { likedIds, toggle, isLiked }
}
