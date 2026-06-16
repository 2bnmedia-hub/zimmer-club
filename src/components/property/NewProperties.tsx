'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

type Property = {
  slug?: string
  id: string
  name: string
  short_description: string
  category: string[]
  region: string
  city: string
  price_per_night: number
  max_guests: number
  avg_rating: number
  instant_book: boolean
  property_images: { url: string }[]
  accepts_miluim?: boolean
  has_shelter?: boolean
}

export function NewProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('properties')
        .select('*, property_images(url, "order"), accepts_miluim, has_shelter')
        .eq('status', 'active')
        .gte('created_at', new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5)
      setProperties(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading || properties.length === 0) return null

  const [p0, p1, p2, p3, p4] = properties

  return (
    <section className="py-20 overflow-hidden" style={{ background: 'linear-gradient(160deg, #faf7f2 0%, #f0e8d8 100%)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <h2 className="section-title shimmer-text" style={{ fontSize: '170%' }}>נכסים חדשים באתר</h2>
          <Link href="/search" className="text-sm font-medium hover:underline" style={{ color: '#8B6914' }}>כל הנכסים ←</Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 grid-rows-2 gap-4 h-[620px]">

          {/* תא ראשי — שמאל גדול */}
          {p0 && (
            <Link href={`/${p0.slug || p0.id}`}
              className="col-span-12 md:col-span-5 row-span-2 group relative rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
              {p0.property_images?.[0]?.url ? (
                <Image src={p0.property_images[0].url} alt={p0.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-6xl">🏡</div>}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
              <div className="absolute top-5 right-5 flex flex-col gap-2">
                {p0.instant_book && <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: 'linear-gradient(135deg, #C8960C, #8B6914)' }}>הזמנה מיידית</span>}
                {p0.accepts_miluim && <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm" style={{ color: '#8B6914' }}>מילואים</span>}
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-7 text-white">
                <span className="text-xs text-white/50 uppercase tracking-widest">חדש</span>
                <h3 className="font-bold text-2xl mt-1 mb-2">{p0.name}</h3>
                <p className="text-sm text-white/70 mb-4 line-clamp-2">{p0.short_description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">📍 {p0.city} · עד {p0.max_guests} אורחים</p>
                  <p className="font-bold text-lg" style={{ color: '#F5C842' }}>₪{p0.price_per_night?.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          )}

          {/* תא עליון אמצע */}
          {p1 && (
            <Link href={`/${p1.slug || p1.id}`}
              className="col-span-12 md:col-span-4 row-span-1 group relative rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              {p1.property_images?.[0]?.url ? (
                <Image src={p1.property_images[0].url} alt={p1.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-4xl">🏡</div>}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }} />
              <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
                <h3 className="font-bold text-base mb-1">{p1.name}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-white/60">📍 {p1.city}</p>
                  <p className="font-bold text-sm" style={{ color: '#F5C842' }}>₪{p1.price_per_night?.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          )}

          {/* תא תחתון אמצע */}
          {p2 && (
            <Link href={`/${p2.slug || p2.id}`}
              className="col-span-12 md:col-span-4 row-span-1 group relative rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              {p2.property_images?.[0]?.url ? (
                <Image src={p2.property_images[0].url} alt={p2.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-4xl">🏡</div>}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }} />
              {p2.instant_book && <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg, #C8960C, #8B6914)' }}>מיידי</span>}
              <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
                <h3 className="font-bold text-base mb-1">{p2.name}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-white/60">📍 {p2.city}</p>
                  <p className="font-bold text-sm" style={{ color: '#F5C842' }}>₪{p2.price_per_night?.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          )}

          {/* תא ימני עליון — כרטיס עם רקע בהיר */}
          {p3 && (
            <Link href={`/${p3.slug || p3.id}`}
              className="col-span-12 md:col-span-3 row-span-1 group relative rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              {p3.property_images?.[0]?.url ? (
                <Image src={p3.property_images[0].url} alt={p3.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-4xl">🏡</div>}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }} />
              <div className="absolute bottom-0 right-0 left-0 p-4 text-white">
                <h3 className="font-bold text-sm mb-1">{p3.name}</h3>
                <p className="font-bold text-xs" style={{ color: '#F5C842' }}>₪{p3.price_per_night?.toLocaleString()}</p>
              </div>
            </Link>
          )}

          {/* תא ימני תחתון */}
          {p4 && (
            <Link href={`/${p4.slug || p4.id}`}
              className="col-span-12 md:col-span-3 row-span-1 group relative rounded-3xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #2c1810, #5c3317)', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
              {p4.property_images?.[0]?.url && (
                <Image src={p4.property_images[0].url} alt={p4.name} fill className="object-cover opacity-40 transition-transform duration-700 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <span className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C8960C' }}>חדש</span>
                <h3 className="font-bold text-white text-base mb-2">{p4.name}</h3>
                <p className="text-xs text-white/50 mb-3">📍 {p4.city}</p>
                <p className="font-bold" style={{ color: '#F5C842' }}>₪{p4.price_per_night?.toLocaleString()} / לילה</p>
              </div>
            </Link>
          )}

        </div>
      </div>
    </section>
  )
}
