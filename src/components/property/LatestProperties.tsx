'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

type Property = {
  slug?: string; id: string; name: string; short_description: string
  city: string; price_per_night: number; max_guests: number
  instant_book: boolean; property_images: { url: string }[]
}

export function LatestProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: featured } = await supabase
        .from('homepage_featured').select('item_id, slot')
        .eq('section', 'latest').eq('item_type', 'property').order('slot')
      if (featured && featured.length > 0) {
        const ids = featured.map((f: any) => f.item_id)
        const { data } = await supabase.from('properties')
          .select('*, property_images(url, "order")').in('id', ids)
        const sorted = featured.map((f: any) => data?.find((p: any) => p.id === f.item_id)).filter(Boolean) as Property[]
        setProperties(sorted)
      } else {
        const { data } = await supabase.from('properties')
          .select('*, property_images(url, "order")')
          .eq('status', 'active').order('created_at', { ascending: false }).limit(5)
        setProperties(data || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading || properties.length === 0) return null
  const [p0, p1, p2, p3, p4] = properties

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-6">
          <h2 className="section-title shimmer-text" style={{ fontSize: '2rem' }}>הנכסים הנצפים ביותר</h2>
          <Link href="/search" className="text-sm font-medium hover:underline" style={{ color: '#8B6914' }}>כל הנכסים ←</Link>
        </div>
        {/* גדול שמאל + 2x2 ימין */}
        <div className="grid grid-cols-3 grid-rows-2 gap-3" style={{ height: '520px' }}>
          {p0 && (
            <Link href={`/${p0.slug || p0.id}`} className="col-span-1 row-span-2 group relative rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.10)' }}>
              {p0.property_images?.[0]?.url ? <Image src={p0.property_images[0].url} alt={p0.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-stone-100 flex items-center justify-center text-6xl">🏡</div>}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 60%)' }} />
              {p0.instant_book && <span className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#C8960C,#8B6914)' }}>הזמנה מיידית</span>}
              <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
                <p className="text-xs text-white/50 mb-1">📍 {p0.city}</p>
                <h3 className="font-bold text-lg mb-1">{p0.name}</h3>
                <p className="font-bold text-sm" style={{ color: '#F5C842' }}>₪{p0.price_per_night?.toLocaleString()} / לילה</p>
              </div>
            </Link>
          )}
          {[p1, p2, p3, p4].filter(Boolean).map((p) => p && (
            <Link key={p.id} href={`/${p.slug || p.id}`} className="col-span-1 row-span-1 group relative rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              {p.property_images?.[0]?.url ? <Image src={p.property_images[0].url} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-stone-100 flex items-center justify-center text-4xl">🏡</div>}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
              <div className="absolute bottom-0 right-0 left-0 p-4 text-white">
                <p className="text-xs text-white/50 mb-0.5">📍 {p.city}</p>
                <h3 className="font-semibold text-sm mb-1">{p.name}</h3>
                <p className="font-bold text-xs" style={{ color: '#F5C842' }}>₪{p.price_per_night?.toLocaleString()} / לילה</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
