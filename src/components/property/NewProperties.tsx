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
        .limit(4)
      setProperties(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading || properties.length === 0) return null

  return (
    <section className="py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #faf7f2 0%, #f5ede0 100%)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <h2 className="section-title shimmer-text" style={{ fontSize: '170%' }}>נכסים חדשים באתר</h2>
          <Link href="/search" className="text-sm font-medium hover:underline" style={{ color: '#8B6914' }}>כל הנכסים ←</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => {
            const img = p.property_images?.[0]?.url
            return (
              <Link key={p.id} href={`/${p.slug || p.id}`}
                className="group relative rounded-3xl overflow-hidden cursor-pointer"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div className="relative h-64 overflow-hidden">
                  {img ? (
                    <Image src={img} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-5xl">🏡</div>
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                  {p.instant_book && (
                    <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full text-white"
                      style={{ background: 'linear-gradient(135deg, #C8960C, #8B6914)' }}>הזמנה מיידית</span>
                  )}
                  {p.accepts_miluim && (
                    <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm" style={{ color: '#8B6914' }}>מקבלים מילואים</span>
                  )}
                </div>
                <div className="p-5 bg-white">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400 flex items-center gap-1">📍 {p.city}</p>
                    <p className="font-bold text-sm" style={{ color: '#8B6914' }}>החל מ ₪{p.price_per_night?.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">עד {p.max_guests} אורחים</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
