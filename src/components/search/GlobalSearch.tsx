'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Result = {
  id: string
  name: string
  city: string
  slug: string
  type: 'property' | 'caravan' | 'attraction'
  image?: string
}

const TYPE_LABEL: Record<Result['type'], string> = {
  property: 'נכס',
  caravan: 'קרוואן',
  attraction: 'אטרקציה',
}

const TYPE_HREF: Record<Result['type'], string> = {
  property: '/properties',
  caravan: '/caravans',
  attraction: '/attractions',
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const debounced = useDebounce(query, 300)
  const supabase = createClient()

  useEffect(() => {
    if (!debounced.trim() || debounced.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    const q = `%${debounced}%`
    setLoading(true)

    Promise.all([
      supabase
        .from('properties')
        .select('id, name, city, slug')
        .or(`name.ilike.${q},city.ilike.${q},description.ilike.${q},short_description.ilike.${q},address.ilike.${q}`)
        .eq('status', 'active')
        .limit(4),
      supabase
        .from('caravans')
        .select('id, name, city, slug')
        .or(`name.ilike.${q},city.ilike.${q},description.ilike.${q},short_description.ilike.${q}`)
        .eq('status', 'active')
        .limit(3),
      supabase
        .from('attractions')
        .select('id, name, city, slug')
        .or(`name.ilike.${q},city.ilike.${q},description.ilike.${q},short_description.ilike.${q}`)
        .eq('status', 'active')
        .limit(3),
    ]).then(([p, c, a]) => {
      const all: Result[] = [
        ...(p.data || []).map(r => ({ ...r, type: 'property' as const })),
        ...(c.data || []).map(r => ({ ...r, type: 'caravan' as const })),
        ...(a.data || []).map(r => ({ ...r, type: 'attraction' as const })),
      ]
      setResults(all)
      setOpen(all.length > 0)
      setLoading(false)
    })
  }, [debounced])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function go(r: Result) {
    setOpen(false)
    setQuery('')
    router.push(`${TYPE_HREF[r.type]}/${r.slug}`)
  }

  return (
    <div ref={ref} className="relative w-full max-w-lg mx-auto mb-8" dir="rtl">
      <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-white/60">
        <svg className="w-5 h-5 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="חיפוש חופשי - נכס, עיר, אזור..."
          className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 text-right"
        />
        {loading && (
          <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[999999]">
          {results.map(r => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => go(r)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors text-right border-b border-gray-50 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800 truncate">{r.name}</p>
                <p className="text-xs text-gray-400">{r.city}</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800 shrink-0">
                {TYPE_LABEL[r.type]}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && results.length === 0 && !loading && debounced.length >= 2 && (
        <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-6 text-center text-sm text-gray-400 z-[999999]">
          לא נמצאו תוצאות עבור &quot;{debounced}&quot;
        </div>
      )}
    </div>
  )
}
