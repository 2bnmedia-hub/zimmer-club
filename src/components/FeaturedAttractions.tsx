'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useWishlist } from '@/hooks/useWishlist'
import { IconHeart } from '@/components/icons'

const FALLBACK = [
  { id:'1', name:'טיול ג׳יפים בגולן', city:'רמת הגולן', price_per_person:280, tag:'אדרנלין', slug:'1', img:'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=1200&q=80' },
  { id:'2', name:'שיט בכנרת', city:'כנרת', price_per_person:180, tag:'רומנטי', slug:'2', img:'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800&q=80' },
  { id:'3', name:'סדנת בישול איטלקי', city:'תל אביב', price_per_person:320, tag:'תרבות', slug:'3', img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80' },
  { id:'4', name:'רכיבה על סוסים בגליל', city:'הגליל', price_per_person:250, tag:'טבע', slug:'4', img:'https://images.unsplash.com/photo-1450052590821-8bf91254a353?w=800&q=80' },
  { id:'5', name:'ספא ויין ביקב', city:'שומרון', price_per_person:450, tag:'רילקס', slug:'5', img:'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80' },
  { id:'6', name:'חדר בריחה יוקרה', city:'ירושלים', price_per_person:190, tag:'משחק', slug:'6', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
  { id:'7', name:'ריחפן מעל מכתש רמון', city:'מכתש רמון', price_per_person:380, tag:'אדרנלין', slug:'7', img:'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&q=80' },
]

export function FeaturedAttractions() {
  const [attractions, setAttractions] = useState<any[] | null>(null)
  const { toggle, isLiked } = useWishlist()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: featured } = await supabase
        .from('homepage_featured').select('item_id, slot')
        .eq('section', 'attractions').eq('item_type', 'attraction').order('slot')
      if (featured && featured.length > 0) {
        const ids = featured.map((f: any) => f.item_id)
        const { data } = await supabase.from('attractions').select('*, attraction_images(url)').in('id', ids)
        const sorted = featured.map((f: any) => data?.find((a: any) => a.id === f.item_id)).filter(Boolean)
        setAttractions(sorted)
      } else {
        const { data } = await supabase.from('attractions')
          .select('*, attraction_images(url)').eq('status', 'active')
          .order('created_at', { ascending: false }).limit(7)
        setAttractions(data && data.length > 0 ? data : [])
      }
    }
    load()
  }, [])

  // Use FALLBACK if no real data yet
  const items = attractions && attractions.length > 0 ? attractions : FALLBACK
  const isFallback = !attractions || attractions.length === 0
  const [a0, ...aRest] = items

  return (
    <section className="py-10 bg-white border-t border-stone-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#B8964A', fontSize: '10px' }}>חדש באתר</p>
            <h2 className="text-xl font-bold shimmer-text">אטרקציות חמות</h2>
          </div>
          <Link href="/attractions" className="text-xs font-semibold hover:underline" style={{ color: '#8B6914' }}>כל האטרקציות ←</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5" style={{ gridAutoRows: '162px' }}>

          {/* Featured attraction — 2×2 */}
          {a0 && (
            <div className="col-span-2 row-span-2 group relative rounded-2xl overflow-hidden" style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.14)' }}>
              <Link href={isFallback ? '/attractions' : `/attractions/${a0.slug || a0.id}`} className="absolute inset-0">
                {(isFallback ? a0.img : a0.attraction_images?.[0]?.url)
                  ? <img src={isFallback ? a0.img : a0.attraction_images[0].url} alt={a0.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  : <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-6xl">🎯</div>}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,5,0,0.88) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
                <div className="absolute top-3 right-3">
                  {(isFallback ? a0.tag : a0.activity_type?.[0]) && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90" style={{ color: '#8B6914' }}>
                      {isFallback ? a0.tag : a0.activity_type[0]}
                    </span>
                  )}
                </div>
                {a0.avg_rating && <span className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', color: '#F5C842' }}>★ {Number(a0.avg_rating).toFixed(1)}</span>}
                <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
                  <p className="text-white/55 mb-1 uppercase tracking-widest" style={{ fontSize: '10px' }}>📍 {a0.city}</p>
                  <h3 className="font-bold text-lg leading-tight mb-1">{a0.name}</h3>
                  <p className="font-bold text-base" style={{ color: '#F5C842' }}>החל מ ₪{a0.price_per_person}</p>
                </div>
              </Link>
              {!isFallback && (
                <button onClick={() => toggle(a0.id, 'attraction')} className="absolute top-3 left-10 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md transition-all hover:scale-110 z-10" aria-label="הוסף למועדפים">
                  <IconHeart className={`w-3.5 h-3.5 transition-colors ${isLiked(a0.id, 'attraction') ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              )}
            </div>
          )}

          {/* Small attraction cards */}
          {aRest.map((a: any, i: number) => {
            const img = isFallback ? a.img : (a.attraction_images?.[0]?.url || '')
            const href = isFallback ? '/attractions' : `/attractions/${a.slug || a.id}`
            const tag = isFallback ? a.tag : a.activity_type?.[0]
            return (
              <div key={a.id || i} className="group relative rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.09)' }}>
                <Link href={href} className="absolute inset-0">
                  {img
                    ? <img src={img} alt={a.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    : <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-3xl">🎯</div>}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 55%)' }} />
                  {tag && <span className="absolute top-2 right-2 rounded-full px-1.5 py-0.5 bg-white/90 font-semibold" style={{ color: '#8B6914', fontSize: '9px' }}>{tag}</span>}
                  {a.avg_rating && <span className="absolute top-2 left-2 font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', color: '#F5C842', fontSize: '10px' }}>★ {Number(a.avg_rating).toFixed(1)}</span>}
                  <div className="absolute bottom-0 right-0 left-0 p-2.5 text-white">
                    <p className="text-white/50 leading-none mb-0.5" style={{ fontSize: '9px' }}>📍 {a.city}</p>
                    <h3 className="font-semibold leading-tight line-clamp-1" style={{ fontSize: '12px' }}>{a.name}</h3>
                    <p className="font-bold mt-0.5" style={{ color: '#F5C842', fontSize: '11px' }}>₪{a.price_per_person}</p>
                  </div>
                </Link>
                {!isFallback && (
                  <button onClick={() => toggle(a.id, 'attraction')} className="absolute top-2 left-2 bg-white/90 hover:bg-white p-1 rounded-full shadow transition-all hover:scale-110 z-10" aria-label="הוסף למועדפים">
                    <IconHeart className={`w-3 h-3 transition-colors ${isLiked(a.id, 'attraction') ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
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
