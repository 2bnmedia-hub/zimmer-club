'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useWishlist } from '@/hooks/useWishlist'
import { IconHeart } from '@/components/icons'

const FALLBACK = [
  { id:'1', name:'קרוואן יוקרה גולן', city:'רמת הגולן', price_per_night:890, img:'https://images.unsplash.com/photo-1561361058-c12e02b4c1a5?w=1200&q=80' },
  { id:'2', name:'אוטו קרוואן צפון', city:'גליל עליון', price_per_night:650, img:'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80' },
  { id:'3', name:'קרוואן מוצב ים המלח', city:'ים המלח', price_per_night:750, img:'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80' },
  { id:'4', name:'קרוואן אלפיני חרמון', city:'חרמון', price_per_night:990, img:'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800&q=80' },
  { id:'5', name:'בית על גלגלים כנרת', city:'כנרת', price_per_night:580, img:'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=800&q=80' },
  { id:'6', name:'קרוואן מדבר נגב', city:'נגב', price_per_night:720, img:'https://images.unsplash.com/photo-1520166012956-add9ba0835a4?w=800&q=80' },
  { id:'7', name:'קרוואן כרמל הירוק', city:'הכרמל', price_per_night:680, img:'https://images.unsplash.com/photo-1533282960533-51328aa49826?w=800&q=80' },
]

export function FeaturedCaravans() {
  const [caravans, setCaravans] = useState<any[] | null>(null)
  const { toggle, isLiked } = useWishlist()
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
        const { data } = await supabase.from('caravans')
          .select('*, caravan_images(url)').eq('status', 'active')
          .order('created_at', { ascending: false }).limit(7)
        setCaravans(data && data.length > 0 ? data : [])
      }
    }
    load()
  }, [])

  const items = caravans && caravans.length > 0 ? caravans : FALLBACK
  const isFallback = !caravans || caravans.length === 0
  const [c0, ...cRest] = items

  return (
    <section className="py-10 bg-stone-50/60 border-t border-stone-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#B8964A', fontSize: '10px' }}>חוויה ייחודית</p>
            <h2 className="text-xl font-bold shimmer-text">קרוואנים ומסעות</h2>
          </div>
          <Link href="/caravans" className="text-xs font-semibold hover:underline" style={{ color: '#8B6914' }}>כל הקרוואנים ←</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5" style={{ gridAutoRows: '162px' }}>

          {/* Featured caravan — 2×2 */}
          {c0 && (
            <div className="col-span-2 row-span-2 group relative rounded-2xl overflow-hidden" style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.14)' }}>
              <Link href={isFallback ? '/caravans' : `/caravans/${c0.slug || c0.id}`} className="absolute inset-0">
                {(isFallback ? c0.img : c0.caravan_images?.[0]?.url)
                  ? <img src={isFallback ? c0.img : c0.caravan_images[0].url} alt={c0.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  : <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-6xl">🚐</div>}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,5,0,0.88) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
                {c0.avg_rating && <span className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', color: '#F5C842' }}>★ {Number(c0.avg_rating).toFixed(1)}</span>}
                <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
                  <p className="text-white/55 mb-1 uppercase tracking-widest" style={{ fontSize: '10px' }}>📍 {c0.city}</p>
                  <h3 className="font-bold text-lg leading-tight mb-1">{c0.name}</h3>
                  <p className="font-bold text-base" style={{ color: '#F5C842' }}>₪{c0.price_per_night} <span className="font-normal text-white/50 text-xs">/ לילה</span></p>
                </div>
              </Link>
              {!isFallback && (
                <button onClick={() => toggle(c0.id, 'caravan')} className="absolute top-3 left-3 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md transition-all hover:scale-110 z-10" aria-label="הוסף למועדפים">
                  <IconHeart className={`w-3.5 h-3.5 transition-colors ${isLiked(c0.id, 'caravan') ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              )}
            </div>
          )}

          {/* Small caravan cards */}
          {cRest.map((c: any, i: number) => {
            const img = isFallback ? c.img : (c.caravan_images?.[0]?.url || '')
            const href = isFallback ? '/caravans' : `/caravans/${c.slug || c.id}`
            const liked = !isFallback && isLiked(c.id, 'caravan')
            return (
              <div key={c.id || i} className="group relative rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.09)' }}>
                <Link href={href} className="absolute inset-0">
                  {img
                    ? <img src={img} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    : <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-3xl">🚐</div>}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 55%)' }} />
                  {c.avg_rating && <span className="absolute top-2 left-2 font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', color: '#F5C842', fontSize: '10px' }}>★ {Number(c.avg_rating).toFixed(1)}</span>}
                  <div className="absolute bottom-0 right-0 left-0 p-2.5 text-white">
                    <p className="text-white/50 leading-none mb-0.5" style={{ fontSize: '9px' }}>📍 {c.city}</p>
                    <h3 className="font-semibold leading-tight line-clamp-1" style={{ fontSize: '12px' }}>{c.name}</h3>
                    <p className="font-bold mt-0.5" style={{ color: '#F5C842', fontSize: '11px' }}>₪{c.price_per_night}</p>
                  </div>
                </Link>
                {!isFallback && (
                  <button onClick={() => toggle(c.id, 'caravan')} className="absolute top-2 left-2 bg-white/90 hover:bg-white p-1 rounded-full shadow transition-all hover:scale-110 z-10" aria-label="הוסף למועדפים">
                    <IconHeart className={`w-3 h-3 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
