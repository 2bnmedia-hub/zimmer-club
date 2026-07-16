'use client'

import { useState, useEffect, useCallback } from 'react'

export type RecentItem = {
  id: string
  slug?: string
  name: string
  city?: string
  price_per_night?: number
  imageUrl?: string
  viewedAt: number
}

const KEY = 'zc_recently_viewed'
const MAX = 10

function load(): RecentItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([])

  useEffect(() => {
    setItems(load())
  }, [])

  const addItem = useCallback((item: Omit<RecentItem, 'viewedAt'>) => {
    setItems(prev => {
      const filtered = prev.filter(i => i.id !== item.id)
      const next = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX)
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const clear = useCallback(() => {
    localStorage.removeItem(KEY)
    setItems([])
  }, [])

  return { items, addItem, clear, count: items.length }
}
