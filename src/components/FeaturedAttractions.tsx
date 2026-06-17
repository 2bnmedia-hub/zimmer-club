'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const FALLBACK = [
  { id:'1', name:'טיול ג׳יפים בגולן', city:'רמת הגולן', price_per_person:280, tag:'אדרנלין', avg_rating: null, slug:'1', img:'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=1200&q=80' },
  { id:'2', name:'שיט בכנרת', city:'כנרת', price_per_person:180, tag:'רומנטי', avg_rating: null, slug:'2', img:'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800&q=80' },
  { id:'3', name:'סדנת בישול איטלקי', city:'תל אביב', price_per_person:320, tag:'תרבות', avg_rating: null, slug:'3', img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80' },
]

export function FeaturedAttractions() {
  const [attractions, setAttractions] = useState<any[] | null>(null)
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
        setAttractions([])
      }
    }
    load()
  }, [])

  const items = attractions && attractions.length > 0 ? attractions : FALLBACK
  const isFallback = !attractions || attractions.length === 0
  const [a0, a1, a2] = items

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: '#B8964A' }}>חדש באתר</p>
            <h2 className="section-title shimmer-text" style={{ fontSize: '2rem' }}>אטרקציות חמות</h2>
          </div>
          <Link href="/attractions" className="text-sm font-medium hover:underline" style={{ color: '#8B6914' }}>כל האטרקציות ←</Link>
        </div>
        <div className="grid grid-rows-2 gap-3" style={{ height: '520px' }}>

          {a0 && (
            <Link
              href={isFallback ? '/attractions' : `/attractions/${a0.slug || a0.id}`}
              className="row-span-1 group relative rounded-2xl overflow-hidden block"
              style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.10)' }}
            >
              <img src={isFallback ? a0.img : (a0.attraction_images?.[0]?.url || '')} alt={a0.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)' }} />
              <span className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm" style={{ color: '#8B6914' }}>
                {isFallback ? a0.tag : a0.activity_type?.[0]}
              </span>
              {a0.avg_rating && (
                <span className="absolute top-4 left-4 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.45)', color: '#F5C842' }}>
                  ★ {Number(a0.avg_rating).toFixed(1)}
                </span>
              )}
              <div className="absolute bottom-0 right-0 left-0 p-6 text-white">
                <p className="text-xs text-white/50 mb-1">📍 {a0.city}</p>
                <h3 className="font-bold text-2xl mb-1">{a0.name}</h3>
                <p className="font-bold" style={{ color: '#F5C842' }}>החל מ ₪{a0.price_per_person}</p>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[a1, a2].filter(Boolean).map((a, i) => (
              <Link
                key={i}
                href={isFallback ? '/attractions' : `/attractions/${a.slug || a.id}`}
                className="group relative rounded-2xl overflow-hidden block"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              >
                <img src={isFallback ? a.img : (a.attraction_images?.[0]?.url || '')} alt={a.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
                <span className="absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm" style={{ color: '#8B6914' }}>
                  {isFallback ? a.tag : a.activity_type?.[0]}
                </span>
                {a.avg_rating && (
                  <span className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.45)', color: '#F5C842' }}>
                    ★ {Number(a.avg_rating).toFixed(1)}
                  </span>
                )}
                <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
                  <p className="text-xs text-white/50 mb-0.5">📍 {a.city}</p>
                  <h3 className="font-semibold text-base mb-1">{a.name}</h3>
                  <p className="font-bold text-sm" style={{ color: '#F5C842' }}>החל מ ₪{a.price_per_person}</p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
