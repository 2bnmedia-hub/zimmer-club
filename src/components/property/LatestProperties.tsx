'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { coverImage } from '@/lib/utils'

type Property = {
  slug?: string; id: string; name: string; short_description: string
  city: string; price_per_night: number; max_guests: number
  instant_book: boolean; property_images: { url: string; is_primary?: boolean }[]; avg_rating?: number; accepts_miluim?: boolean; has_shelter?: boolean
}

const TARGET = 7

const PH_DESTINATIONS = [
  { name: 'גליל עליון', region: 'galil',     emoji: '🌲', from: '#1a3d2b', to: '#2d5c42', price: '₪850' },
  { name: 'רמת הגולן',  region: 'golan',     emoji: '⛰️',  from: '#1c3045', to: '#2d4a6a', price: '₪950' },
  { name: 'ים המלח',   region: 'dead_sea',  emoji: '🌅', from: '#3d2b1a', to: '#6a4a2d', price: '₪1,100' },
  { name: 'כרמל',      region: 'carmel',    emoji: '🌊', from: '#1a2d40', to: '#2d4a61', price: '₪780' },
  { name: 'הנגב',      region: 'negev',     emoji: '🏜️', from: '#3a2a15', to: '#5c4020', price: '₪720' },
  { name: 'ירושלים',   region: 'jerusalem', emoji: '🕌', from: '#2a2015', to: '#4a3820', price: '₪890' },
]

function PlaceholderFeatured() {
  return (
    <Link href="/advertise" className="col-span-2 row-span-2 group relative rounded-2xl overflow-hidden" style={{ boxShadow: '0 6px 28px rgba(0,0,0,0.14)' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #1e3a28 0%, #2d5c42 60%, #1a3328 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(200,150,12,0.22), transparent 55%)' }} />
      <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 18px, rgba(255,255,255,0.018) 18px, rgba(255,255,255,0.018) 19px)' }} />
      <div className="absolute inset-0 transition-opacity duration-700" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="opacity-10 group-hover:opacity-18 transition-opacity duration-500" style={{ fontSize: 110 }}>🏡</span>
      </div>
      <div className="absolute top-3 right-3">
        <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#C8960C,#8B6914)', boxShadow: '0 2px 10px rgba(200,150,12,0.45)' }}>+ פרסם נכס</span>
      </div>
      <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
        <span className="text-white/80 font-medium" style={{ fontSize: '9px' }}>מקום פנוי</span>
      </div>
      <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
        <p className="text-white/50 mb-1 uppercase tracking-widest" style={{ fontSize: '10px' }}>📍 הנכס המיוחד שלך</p>
        <h3 className="font-bold text-xl leading-tight mb-1.5">הצטרפו ל-zimmer.club</h3>
        <p className="text-sm text-white/65 mb-3">פרסמו את הנכס שלכם וקבלו הזמנות ישירות</p>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-white/30 text-white/90 hover:bg-white/10 transition-colors">
          גלו כיצד ←
        </span>
      </div>
    </Link>
  )
}

function PlaceholderCard({ index }: { index: number }) {
  const d = PH_DESTINATIONS[index % PH_DESTINATIONS.length]
  return (
    <Link href={`/search?region=${d.region}`} className="group relative rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${d.from}, ${d.to})` }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 25%, rgba(255,255,255,0.07), transparent 65%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 62%)' }} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="opacity-14 group-hover:opacity-22 transition-opacity duration-400" style={{ fontSize: 36 }}>{d.emoji}</span>
      </div>
      <div className="absolute bottom-0 right-0 left-0 p-2.5 text-white">
        <h3 className="font-semibold leading-tight" style={{ fontSize: '12px' }}>{d.name}</h3>
        <p className="font-bold mt-0.5" style={{ color: '#F5C842', fontSize: '11px' }}>{d.price} <span className="font-normal text-white/40" style={{ fontSize: '9px' }}>/ לילה</span></p>
      </div>
      <div className="absolute top-2 right-2">
        <span className="font-bold rounded-full px-1.5 py-0.5 text-white/80" style={{ fontSize: '9px', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>בקרוב</span>
      </div>
    </Link>
  )
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
          .select('*, property_images(url, "order", is_primary), accepts_miluim, has_shelter').in('id', ids)
        const sorted = featured.map((f: any) => data?.find((p: any) => p.id === f.item_id)).filter(Boolean) as Property[]
        setProperties(sorted)
      } else {
        const { data } = await supabase.from('properties')
          .select('*, property_images(url, "order", is_primary), accepts_miluim, has_shelter')
          .eq('status', 'active').order('created_at', { ascending: false }).limit(TARGET)
        setProperties(data || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return null

  const [p0, ...rest] = properties
  const smallCount = rest.length
  const placeholders = Math.max(0, TARGET - 1 - smallCount)

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#B8964A', fontSize: '10px' }}>✦ המומלצים שלנו</p>
            <h2 className="text-xl font-bold shimmer-text">הנכסים הנצפים ביותר</h2>
          </div>
          <Link href="/search" className="text-xs font-semibold hover:underline" style={{ color: '#8B6914' }}>כל הנכסים ←</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5" style={{ gridAutoRows: '162px' }}>

          {p0 ? (
            <Link href={p0.slug ? `/properties/${p0.slug}` : `/property/${p0.id}`}
              className="col-span-2 row-span-2 group relative rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.14)' }}>
              <div className="absolute inset-0">
                {coverImage(p0.property_images)
                  ? <Image src={coverImage(p0.property_images)!} alt={p0.name} fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  : <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-6xl">🏡</div>}
              </div>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,5,0,0.88) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
              <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                {p0.instant_book && <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#C8960C,#8B6914)' }}>הזמנה מיידית</span>}
                {p0.accepts_miluim && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90" style={{ color: '#1d4ed8' }}>🎖 מילואים</span>}
              </div>
              {p0.avg_rating && <span className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', color: '#F5C842' }}>★ {p0.avg_rating.toFixed(1)}</span>}
              <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
                <p className="text-white/55 mb-1 uppercase tracking-widest" style={{ fontSize: '10px' }}>📍 {p0.city}</p>
                <h3 className="font-bold text-lg leading-tight mb-1">{p0.name}</h3>
                <p className="font-bold text-base" style={{ color: '#F5C842' }}>₪{p0.price_per_night?.toLocaleString()} <span className="font-normal text-white/50 text-xs">/ לילה</span></p>
              </div>
            </Link>
          ) : <PlaceholderFeatured />}

          {rest.map((p) => (
            <Link key={p.id} href={p.slug ? `/properties/${p.slug}` : `/property/${p.id}`}
              className="group relative rounded-xl overflow-hidden"
              style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.09)' }}>
              <div className="absolute inset-0">
                {coverImage(p.property_images)
                  ? <Image src={coverImage(p.property_images)!} alt={p.name} fill sizes="(max-width:768px) 50vw, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  : <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-3xl">🏡</div>}
              </div>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 55%)' }} />
              {p.avg_rating && <span className="absolute top-2 left-2 font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', color: '#F5C842', fontSize: '10px' }}>★ {p.avg_rating.toFixed(1)}</span>}
              {p.instant_book && <span className="absolute top-2 right-2 text-white rounded-full px-1.5 py-0.5 font-semibold" style={{ background: 'linear-gradient(135deg,#C8960C,#8B6914)', fontSize: '9px' }}>מיידי</span>}
              <div className="absolute bottom-0 right-0 left-0 p-2.5 text-white">
                <p className="text-white/50 leading-none mb-0.5" style={{ fontSize: '9px' }}>📍 {p.city}</p>
                <h3 className="font-semibold leading-tight line-clamp-1" style={{ fontSize: '12px' }}>{p.name}</h3>
                <p className="font-bold mt-0.5" style={{ color: '#F5C842', fontSize: '11px' }}>₪{p.price_per_night?.toLocaleString()}</p>
              </div>
            </Link>
          ))}

          {Array.from({ length: placeholders }).map((_, i) => <PlaceholderCard key={`ph-${i}`} index={i} />)}
        </div>
      </div>
    </section>
  )
}
