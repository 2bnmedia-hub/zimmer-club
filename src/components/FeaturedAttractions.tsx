'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

type Attraction = {
  id: string
  name: string
  city: string
  region: string
  price_per_person: number
  activity_type: string[]
  attraction_images?: { url: string }[]
  slug?: string
}

const FALLBACK = [
  { name: 'טיול ג׳יפים בגולן', city: 'רמת הגולן', price_per_person: 280, tag: 'אדרנלין', img: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=600&q=80' },
  { name: 'שיט בכנרת', city: 'כנרת', price_per_person: 180, tag: 'רומנטי', img: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=600&q=80' },
  { name: 'סדנת בישול איטלקי', city: 'תל אביב', price_per_person: 320, tag: 'תרבות', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80' },
]

export function FeaturedAttractions() {
  const [attractions, setAttractions] = useState<Attraction[] | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: featured } = await supabase
        .from('homepage_featured')
        .select('item_id, slot')
        .eq('section', 'attractions')
        .eq('item_type', 'attraction')
        .order('slot')

      if (featured && featured.length > 0) {
        const ids = featured.map((f: any) => f.item_id)
        const { data } = await supabase
          .from('attractions')
          .select('*, attraction_images(url)')
          .in('id', ids)
        const sorted = featured
          .map((f: any) => data?.find((a: any) => a.id === f.item_id))
          .filter(Boolean) as Attraction[]
        setAttractions(sorted)
      } else {
        setAttractions([])
      }
    }
    load()
  }, [])

  const useFallback = attractions !== null && attractions.length === 0

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#B8964A' }}>חדש באתר</p>
            <h2 className="section-title shimmer-text" style={{ fontSize: '170%' }}>אטרקציות חמות</h2>
          </div>
          <Link href="/attractions" className="text-sm font-medium hover:underline" style={{ color: '#8B6914' }}>כל האטרקציות ←</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useFallback
            ? FALLBACK.map((item, i) => (
                <div key={i} className="group relative rounded-3xl overflow-hidden cursor-pointer"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                  <div className="relative h-64 overflow-hidden">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                    <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm" style={{ color: '#8B6914' }}>{item.tag}</span>
                  </div>
                  <div className="p-5 bg-white">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">📍 {item.city}</p>
                      <p className="font-bold text-sm" style={{ color: '#8B6914' }}>החל מ ₪{item.price_per_person}</p>
                    </div>
                  </div>
                </div>
              ))
            : (attractions || []).map((item) => {
                const img = item.attraction_images?.[0]?.url
                const tag = item.activity_type?.[0] || ''
                return (
                  <Link key={item.id} href={`/attractions/${item.slug || item.id}`}
                    className="group relative rounded-3xl overflow-hidden cursor-pointer"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                    <div className="relative h-64 overflow-hidden">
                      {img
                        ? <Image src={img} alt={item.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-5xl">🎯</div>
                      }
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                      {tag && <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm" style={{ color: '#8B6914' }}>{tag}</span>}
                    </div>
                    <div className="p-5 bg-white">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">📍 {item.city}</p>
                        <p className="font-bold text-sm" style={{ color: '#8B6914' }}>החל מ ₪{item.price_per_person}</p>
                      </div>
                    </div>
                  </Link>
                )
              })
          }
        </div>
      </div>
    </section>
  )
}
