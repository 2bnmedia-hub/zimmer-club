'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type FeaturedItem = {
  id: string; section: string; item_id: string; item_type: string; slot: number; name?: string; city?: string
}
type Item = { id: string; name: string; city: string }

export function HomepageFeaturedManager() {
  const supabase = createClient()
  const [featured, setFeatured] = useState<FeaturedItem[]>([])
  const [properties, setProperties] = useState<Item[]>([])
  const [attractions, setAttractions] = useState<Item[]>([])
  const [caravans, setCaravans] = useState<Item[]>([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [{ data: feat }, { data: props }, { data: attrs }, { data: cars }] = await Promise.all([
      supabase.from('homepage_featured').select('*').order('section').order('slot'),
      supabase.from('properties').select('id, name, city').eq('status', 'active').order('name'),
      supabase.from('attractions').select('id, name, city').eq('status', 'active').order('name'),
      supabase.from('caravans').select('id, name, city').eq('status', 'active').order('name'),
    ])

    const featWithNames = (feat || []).map((f: FeaturedItem) => {
      const source = f.item_type === 'property' ? props || []
        : f.item_type === 'attraction' ? attrs || []
        : cars || []
      const found = (source as any[]).find((x: any) => x.id === f.item_id)
      return { ...f, name: found?.name || '—', city: found?.city || '' }
    })

    setFeatured(featWithNames)
    setProperties(props || [])
    setAttractions(attrs || [])
    setCaravans(cars || [])
  }

  function getSlot(section: string, slot: number) {
    return featured.find(f => f.section === section && f.slot === slot)
  }

  async function setSlot(section: string, slot: number, item_id: string, item_type: string) {
    setSaving(true)
    setMsg('')
    const existing = getSlot(section, slot)
    if (item_id === '') {
      if (existing) await supabase.from('homepage_featured').delete().eq('id', existing.id)
    } else {
      if (existing) {
        await supabase.from('homepage_featured').update({ item_id, item_type }).eq('id', existing.id)
      } else {
        await supabase.from('homepage_featured').insert({ section, slot, item_id, item_type })
      }
    }
    await loadAll()
    setSaving(false)
    setMsg('נשמר ✓')
    setTimeout(() => setMsg(''), 2000)
  }

  const sections = [
    { key: 'latest', label: 'הנכסים הנצפים ביותר', slots: 5, type: 'property' as const, icon: '🏠' },
    { key: 'attractions', label: 'אטרקציות חמות', slots: 3, type: 'attraction' as const, icon: '🎯' },
    { key: 'caravans', label: 'קרוואנים ומסעות', slots: 3, type: 'caravan' as const, icon: '🚐' },
  ]

  function getOptions(type: string) {
    if (type === 'property') return properties
    if (type === 'attraction') return attractions
    return caravans
  }

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold" style={{ color: '#111827' }}>✨ ניהול דף הבית</h2>
        {msg && <span className="text-sm font-bold px-4 py-2 rounded-full" style={{ background: '#f0fdf4', color: '#16a34a' }}>{msg}</span>}
        {saving && <span className="text-sm text-gray-400">שומר...</span>}
      </div>

      <div className="space-y-8">
        {sections.map(sec => (
          <div key={sec.key} className="rounded-2xl p-6" style={{ background: '#fff', border: '1.5px solid #f0ece4', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h3 className="text-lg font-bold mb-5" style={{ color: '#8B6914' }}>{sec.icon} {sec.label}</h3>
            <div className="space-y-3">
              {Array.from({ length: sec.slots }, (_, i) => i + 1).map(slot => {
                const current = getSlot(sec.key, slot)
                const options = getOptions(sec.type)
                return (
                  <div key={slot} className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg, #C8960C, #8B6914)', color: '#fff' }}>
                      {slot}
                    </span>
                    <select
                      className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                      style={{ border: '1.5px solid #e5e7eb', background: '#fafafa', color: '#111827' }}
                      value={current?.item_id || ''}
                      onChange={e => setSlot(sec.key, slot, e.target.value, sec.type)}
                    >
                      <option value="">— ריק —</option>
                      {options.map(o => (
                        <option key={o.id} value={o.id}>{o.name} ({o.city})</option>
                      ))}
                    </select>
                    {current && (
                      <button
                        onClick={() => setSlot(sec.key, slot, '', sec.type)}
                        className="text-xs px-3 py-2 rounded-lg font-medium"
                        style={{ background: '#fff1f2', color: '#f43f5e', border: '1px solid #fecdd3' }}
                      >
                        הסר
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
