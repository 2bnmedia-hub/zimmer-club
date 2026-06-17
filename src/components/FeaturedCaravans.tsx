'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

type Caravan = {
  id: string; name: string; city: string; price_per_night: number
  caravan_images?: { url: string }[]; slug?: string
}

const FALLBACK = [
  { id:'1', name:'קרוואן יוקרה גולן', city:'רמת הגולן', price_per_night:890, img:'https://images.unsplash.com/photo-1561361058-c12e02b4c1a5?w=800&q=80' },
  { id:'2', name:'אוטו קרוואן צפון', city:'גליל עליון', price_per_night:650, img:'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80' },
  { id:'3', name:'קרוואן מוצב ים המלח', city:'ים המלח', price_per_night:750, img:'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80' },
]

export function FeaturedCaravans() {
  const [caravans, setCaravans] = useState<any[] | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: featured } = await supabase
        .from('homepage_featured').select('item_id, slot')
        .eq('section', 'caravans').eq('item_type', 'caravan').order('slot')
      if (featured && featured.length > 0) {
        const ids = featured.map((f: any) => f.item_id)
        const { data } = await supabase.from('caravans').select('*, caravan_images(url)').in('id', ids)
        const sorted = featured.map((f: any) => data?.find((c: any) => c.id === f.item_id)).filter(Boolean)
        setCaravans(sorted)
      } else {
        setCaravans([])
      }
    }
    load()
  }, [])

  const items = caravans && caravans.length > 0 ? caravans : FALLBACK
  const isFallback = !caravans || caravans.length === 0
  const [c0, c1, c2] = items

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: '#B8964A' }}>חוויה ייחודית</p>
            <h2 className="section-title shimmer-text" style={{ fontSize: '2rem' }}>קרוואנים ומסעות</h2>
          </div>
          <Link href="/caravans" className="text-sm font-medium hover:underline" style={{ color: '#8B6914' }}>כל הקרוואנים ←</Link>
        </div>
        <div className="grid grid-cols-3 gap-3" style={{ height: '520px' }}>
          {[c0, c1, c2].filter(Boolean).map((c, i) => {
            const img = isFallback ? (c as any).img : (c.caravan_images?.[0]?.url || '')
            const href = isFallback ? '/caravans' : `/caravans/${c.slug || c.id}`
            return (
              <Link key={c.id || i} href={href} className="group relative rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}>
                {img
                  ? <img src={img} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  : <div className="absolute inset-0 bg-stone-100 flex items-center justify-center text-6xl">🚐</div>
                }
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 55%)' }} />
                <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
                  <p className="text-xs text-white/50 mb-1">📍 {c.city}</p>
                  <h3 className="font-bold text-base mb-1">{c.name}</h3>
                  <p className="font-bold text-sm" style={{ color: '#F5C842' }}>₪{c.price_per_night} ללילה</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
