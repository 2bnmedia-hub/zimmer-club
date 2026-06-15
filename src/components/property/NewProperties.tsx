'use client'

import { useEffect, useState, useRef } from 'react'
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
  reviews?: { id: string }[]
  accepts_miluim?: boolean
  has_shelter?: boolean
}

export function NewProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('properties')
        .select('*, property_images(url, "order"), reviews(id), accepts_miluim, has_shelter')
        .eq('status', 'active')
        .gte('created_at', new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })
        .limit(8)
      setProperties(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading || properties.length === 0) return null

  return (
    <section className="section-padding bg-white !pt-8">
      <div className="page-container !max-w-[90rem] !px-2">
        <div className="flex items-end justify-between mb-6">
          <h2 className="section-title shimmer-text" style={{fontSize: "170%"}}>נכסים חדשים באתר</h2>
          <Link href="/search" className="text-sm font-semibold text-gold-deep hover:underline hidden sm:block">
            כל הנכסים ←
          </Link>
        </div>

        <div className="relative">
          <button onClick={() => scroll('right')} className="absolute z-10 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95" style={{right:-20,top:'35%',width:56,height:56,borderRadius:16,background:'rgba(255,255,255,0.95)',boxShadow:'0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(184,134,11,0.15)',border:'1.5px solid rgba(212,168,67,0.25)',cursor:'pointer',backdropFilter:'blur(8px)'}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b8860b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button onClick={() => scroll('left')} className="absolute z-10 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95" style={{left:-20,top:'35%',width:56,height:56,borderRadius:16,background:'rgba(255,255,255,0.95)',boxShadow:'0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(184,134,11,0.15)',border:'1.5px solid rgba(212,168,67,0.25)',cursor:'pointer',backdropFilter:'blur(8px)'}}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b8860b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory" style={{scrollbarWidth:'none', msOverflowStyle:'none'}}>
            {properties.map((p) => {
              const firstImage = p.property_images?.[0]?.url
              const reviewCount = p.reviews?.length || 0
              const rating = p.avg_rating || 0
              return (
                <div key={p.id} className="snap-start flex-shrink-0 w-[280px] sm:w-[300px] group bg-white rounded-xl overflow-hidden border border-sand-100 hover:shadow-lg transition-all duration-300 flex flex-col">
                  <Link href={`/${p.slug || p.id}`} className="block">
                    <div className="relative overflow-hidden bg-gray-100 aspect-[3/2]">
                      {firstImage ? (
                        <Image src={firstImage} alt={p.name} fill className="object-cover object-center group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🏡</div>
                      )}
                      {p.instant_book && (
                        <span className="absolute top-2 right-2 text-xs font-bold text-white px-2 py-1 rounded-lg shadow-md"
                          style={{ background: 'linear-gradient(135deg, #f5d078 0%, #d4a843 40%, #b8860b 100%)', boxShadow: '0 2px 8px rgba(184,134,11,0.4)' }}>
                          מיידי
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 text-base mb-1">{p.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{p.city}</p>
                    <div className="flex items-center gap-1 mb-3">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`text-sm ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                      ))}
                      <span className="text-xs text-gray-400 mr-1">{reviewCount} חוות דעת</span>
                    </div>
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      {p.accepts_miluim && (
                        <span className="text-xs px-2 py-0.5 rounded-full border" style={{background:'#faf7ed', borderColor:'#e8d9a0', color:'#6b5e3e'}}>מקבלים מילואים</span>
                      )}
                      {p.has_shelter && (
                        <span className="text-xs px-2 py-0.5 rounded-full border" style={{background:'#faf7ed', borderColor:'#e8d9a0', color:'#6b5e3e'}}>מרחב מוגן</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">עד {p.max_guests} אורחים</p>
                    <p className="text-sm font-bold mt-1" style={{ color: '#8B6914' }}>
                      החל מ: {p.price_per_night?.toLocaleString()}₪ / לילה
                    </p>
                    <div className="flex gap-2 mt-auto pt-3">
                      <a href={`https://wa.me/?text=${encodeURIComponent(p.name)}`}
                        className="flex-1 text-center text-xs py-2 rounded-lg bg-green-50 text-green-700 font-medium hover:bg-green-100 transition-colors">
                        WhatsApp 💬
                      </a>
                      <Link href={`/${p.slug || p.id}`}
                        className="flex-1 text-center text-xs py-2 rounded-lg bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition-colors">
                        התקשר 📞
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
