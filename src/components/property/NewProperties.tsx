'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

type Property = {
  slug?: string; id: string; name: string; short_description: string
  city: string; price_per_night: number; max_guests: number
  instant_book: boolean; property_images: { url: string }[]; accepts_miluim?: boolean; has_shelter?: boolean; avg_rating?: number
}

export function NewProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('properties')
        .select('*, property_images(url, "order"), accepts_miluim, has_shelter')
        .eq('status', 'active')
        .gte('created_at', new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false }).limit(5)
      setProperties(data || [])
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
          <h2 className="section-title shimmer-text" style={{ fontSize: '2rem' }}>נכסים חדשים באתר</h2>
          <Link href="/search" className="text-sm font-medium hover:underline" style={{ color: '#8B6914' }}>כל הנכסים ←</Link>
        </div>
        <div className="grid grid-cols-3 grid-rows-2 gap-3" style={{ height: '520px' }}>
          {[p1, p2, p3, p4].filter(Boolean).map((p) => p && (
            <Link key={p.id} href={`/${p.slug || p.id}`} className="col-span-1 row-span-1 group relative rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              {p.property_images?.[0]?.url ? <Image src={p.property_images[0].url} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-stone-100 flex items-center justify-center text-4xl">🏡</div>}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
              {p.avg_rating && <span className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.45)', color: '#F5C842' }}>★ {p.avg_rating.toFixed(1)}</span>}
              <div className="absolute top-3 right-3 flex flex-col gap-1">
                {p.accepts_miluim && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/90" style={{ color: '#1d4ed8' }}>🎖 מילואים</span>}
                {p.has_shelter && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/90" style={{ color: '#15803d' }}>🛡 מרחב מוגן</span>}
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-4 text-white">
                <p className="text-xs text-white/50 mb-0.5">📍 {p.city}</p>
                <h3 className="font-semibold text-sm mb-1">{p.name}</h3>
                <p className="font-bold text-xs" style={{ color: '#F5C842' }}>₪{p.price_per_night?.toLocaleString()} / לילה</p>
              </div>
            </Link>
          ))}
          {p0 && (
            <Link href={`/${p0.slug || p0.id}`} className="col-span-1 row-span-2 group relative rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.10)', gridColumn: '3', gridRow: '1 / span 2' }}>
              {p0.property_images?.[0]?.url ? <Image src={p0.property_images[0].url} alt={p0.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-stone-100 flex items-center justify-center text-6xl">🏡</div>}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 60%)' }} />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {p0.instant_book && <span className="text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#C8960C,#8B6914)' }}>הזמנה מיידית</span>}
                {p0.accepts_miluim && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm" style={{ color: '#1d4ed8' }}>🎖 מקבלים שובר מילואים</span>}
                {p0.has_shelter && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm" style={{ color: '#15803d' }}>🛡 קיים מרחב מוגן</span>}
              </div>
              {p0.avg_rating && <span className="absolute top-4 left-4 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.45)', color: '#F5C842' }}>★ {p0.avg_rating.toFixed(1)}</span>}
              <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
                <span className="text-xs text-white/40 uppercase tracking-widest">חדש</span>
                <h3 className="font-bold text-lg mt-1 mb-1">{p0.name}</h3>
                <p className="text-sm text-white/60 mb-2 line-clamp-2">{p0.short_description}</p>
                <p className="font-bold text-sm" style={{ color: '#F5C842' }}>₪{p0.price_per_night?.toLocaleString()} / לילה</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
