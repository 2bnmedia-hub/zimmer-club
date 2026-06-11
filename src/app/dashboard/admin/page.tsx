'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { IconArrowRight, IconTrash, IconEdit, IconPlus, IconCheck, IconPhone, IconX, IconEye } from '@/components/icons'
import dynamic from 'next/dynamic'
const IsraelMap = dynamic(() => import('@/components/map/IsraelMap'), { ssr: false, loading: () => <div style={{ height: '300px', background: '#f9f5ef', borderRadius: '16px' }} className="animate-pulse" /> })

type Item = {
  id: string; name: string; status: string; created_at: string
  price_per_night?: number; price_per_person?: number
  category?: string[]; caravan_type?: string; activity_type?: string[]
  region?: string; city?: string; lat?: number; lng?: number
}

const REGION_LABELS: Record<string, string> = {
  north:'צפון', galil_upper:'גליל עליון', galil_lower:'גליל תחתון',
  galil_west:'גליל מערבי', kinneret:'כנרת', hermon:'חרמון',
  golan:'רמת הגולן', center:'מרכז', jerusalem:'ירושלים',
  dead_sea:'ים המלח', negev:'דרום', eilat:'אילת',
}

function KpiCard({ label, value, icon, grad, color, border }: any) {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden"
      style={{ background: grad, border: `1.5px solid ${border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0"
        style={{ background: 'rgba(255,255,255,0.6)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'rgba(0,0,0,0.45)' }}>{label}</p>
        <p className="text-lg font-bold leading-tight" style={{ color }}>{value}</p>
      </div>
    </div>
  )
}

function DonutChart({ active, pending, rejected, total, label }: {
  active: number; pending: number; rejected: number; total: number; label: string; color: string
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  React.useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const size = 100; const cx = 50; const cy = 50; const r = 34; const sw = 10
    ctx.clearRect(0, 0, size, size)
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2)
    ctx.strokeStyle = '#f0ece4'; ctx.lineWidth = sw; ctx.stroke()
    if (total === 0) return
    const segs = [
      { value: active, color: '#10b981' },
      { value: pending, color: '#f59e0b' },
      { value: rejected, color: '#f43f5e' },
    ].filter(s => s.value > 0)
    let start = -Math.PI/2
    segs.forEach(s => {
      const sweep = (s.value/total)*Math.PI*2 - 0.06
      if (sweep <= 0) return
      ctx.beginPath(); ctx.arc(cx, cy, r, start, start+sweep)
      ctx.strokeStyle = s.color; ctx.lineWidth = sw; ctx.lineCap = 'round'; ctx.stroke()
      start += (s.value/total)*Math.PI*2
    })
  }, [active, pending, rejected, total])

  return (
    <div className="rounded-2xl p-4 flex flex-col items-center"
      style={{ background: '#fff', border: '1.5px solid #f0ece4', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <p className="text-sm font-semibold mb-3 text-center" style={{ color: '#6b7280', fontSize: '14px' }}>{label}</p>
      <div className="relative mb-3">
        <canvas ref={canvasRef} width={100} height={100} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold" style={{ color: '#111827' }}>{total}</span>
          <span className="text-sm" style={{ color: '#9ca3af' }}>סה״כ</span>
        </div>
      </div>
      <div className="w-full space-y-1.5">
        {[
          { label:'פעילים', value:active, color:'#10b981', bg:'#f0fdf4' },
          { label:'ממתינים', value:pending, color:'#f59e0b', bg:'#fffbeb' },
          { label:'נדחו', value:rejected, color:'#f43f5e', bg:'#fff1f2' },
        ].map(r => (
          <div key={r.label} className="flex items-center justify-between px-2.5 py-1 rounded-lg"
            style={{ background: r.bg }}>
            <span className="text-sm" style={{ color: '#6b7280' }}>{r.label}</span>
            <span className="text-sm font-bold" style={{ color: r.value > 0 ? r.color : '#d1d5db' }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-20 shrink-0 text-right" style={{ color: '#6b7280' }}>{label}</span>
      <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
        <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
          style={{ width: max > 0 ? `${Math.max((value/max)*100, value > 0 ? 8 : 0)}%` : '0%', background: color }}>
          {value > 0 && <span className="text-white text-sm font-bold">{value}</span>}
        </div>
      </div>
    </div>
  )
}

function FullTable({ title, items, onApprove, onReject, onDelete, editPath, viewPath, priceLabel, typeLabel }: any) {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? items : items.filter((i: Item) => i.status === filter)
  const pending = items.filter((i: Item) => i.status === 'pending').length
  const ss = (s: string) => {
    if (s === 'active') return { bg:'#f0fdf4', color:'#16a34a', label:'פעיל' }
    if (s === 'pending') return { bg:'#fffbeb', color:'#d97706', label:'ממתין' }
    if (s === 'rejected') return { bg:'#fff1f2', color:'#e11d48', label:'נדחה' }
    return { bg:'#f9fafb', color:'#111827', label:s }
  }
  return (
    <div className="bg-white rounded-2xl overflow-hidden mt-6"
      style={{ border: '1.5px solid #f0ece4', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
      <div className="px-6 py-4 flex items-center gap-3 flex-wrap" style={{ borderBottom: '1px solid #f5f0e8' }}>
        <h2 className="font-bold text-sm" style={{ color: '#111827' }}>{title}</h2>
        <span className="text-sm text-gray-400">({items.length})</span>
        {pending > 0 && <span className="text-sm font-bold px-2.5 py-1 rounded-full ml-auto" style={{ background:'#fffbeb', color:'#d97706' }}>{pending} ממתינים</span>}
        <div className="flex gap-1 mr-auto">
          {['all','pending','active','rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-full text-sm font-medium transition-all"
              style={{ background: filter===f ? '#111827' : '#f9f5ef', color: filter===f ? '#fff' : '#6b7280' }}>
              {f==='all'?'הכל':f==='pending'?'ממתינים':f==='active'?'פעילים':'נדחו'}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? <div className="py-12 text-center text-gray-400 text-sm">אין פריטים</div> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background:'#faf8f4' }}>
              <tr className="text-sm" style={{ color:'#111827' }}>
                {['שם','סוג','מחיר','אזור','תאריך','סטטוס','פעולות'].map(h => (
                  <th key={h} className="px-5 py-3 text-right font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: Item) => {
                const s = ss(item.status)
                const date = new Date(item.created_at).toLocaleDateString('he-IL', { day:'2-digit', month:'2-digit', year:'2-digit' })
                return (
                  <tr key={item.id} className="border-t transition-colors hover:bg-amber-50/20" style={{ borderColor:'#f5f0e8' }}>
                    <td className="px-5 py-3 font-medium text-sm" style={{ color:'#111827' }}>{item.name}</td>
                    <td className="px-5 py-3 text-sm" style={{ color:'#111827' }}>{typeLabel(item)}</td>
                    <td className="px-5 py-3 text-sm font-semibold" style={{ color:'#8B6914' }}>{priceLabel(item)}</td>
                    <td className="px-5 py-3 text-sm" style={{ color:'#111827' }}>{item.city || REGION_LABELS[item.region||''] || '—'}</td>
                    <td className="px-5 py-3 text-sm" style={{ color:'#111827' }}>{date}</td>
                    <td className="px-5 py-3"><span className="px-2.5 py-1 rounded-full text-sm font-semibold" style={{ background:s.bg, color:s.color }}>{s.label}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {item.status!=='active' && <button onClick={()=>onApprove(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-all" style={{ background:'#f0fdf4' }}><IconCheck className="w-3.5 h-3.5 text-gray-900"/></button>}
                        {item.status!=='rejected' && <button onClick={()=>onReject(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-all" style={{ background:'#fff1f2' }}><IconX className="w-3.5 h-3.5 text-gray-900"/></button>}
                        {viewPath && <Link href={viewPath(item.id)} target="_blank" className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-all" style={{ background:'#f0f9ff' }}><IconEye className="w-3.5 h-3.5 text-gray-900"/></Link>}
                        <Link href={editPath(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-all" style={{ background:'#f9fafb' }}><IconEdit className="w-3.5 h-3.5 text-gray-900"/></Link>
                        <button onClick={()=>onDelete(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-all" style={{ background:'#fff1f2' }}><IconTrash className="w-3.5 h-3.5 text-gray-900"/></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [properties, setProperties] = useState<Item[]>([])
  const [attractions, setAttractions] = useState<Item[]>([])
  const [caravans, setCaravans] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState('')
  const [activeTab, setActiveTab] = useState<'overview'|'properties'|'caravans'|'attractions'|'hotels'|'camping'>('overview')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/dashboard/owner'); return }
      setAdminName(profile?.full_name || '')
      const [{ data: p }, { data: a }, { data: c }] = await Promise.all([
        supabase.from('properties').select('*').order('created_at', { ascending: false }),
        supabase.from('attractions').select('*').order('created_at', { ascending: false }),
        supabase.from('caravans').select('*').order('created_at', { ascending: false }),
      ])
      setProperties(p||[]); setAttractions(a||[]); setCaravans(c||[])
      setLoading(false)
    }
    load()
  }, [])

  const approve = async (table: string, id: string, setter: any) => {
    await supabase.from(table).update({ status:'active' }).eq('id', id)
    setter((prev: Item[]) => prev.map(i => i.id===id ? {...i, status:'active'} : i))
  }
  const reject = async (table: string, id: string, setter: any) => {
    await supabase.from(table).update({ status:'rejected' }).eq('id', id)
    setter((prev: Item[]) => prev.map(i => i.id===id ? {...i, status:'rejected'} : i))
  }
  const remove = async (table: string, id: string, setter: any) => {
    if (!confirm('למחוק לצמיתות?')) return
    await supabase.from(table).delete().eq('id', id)
    setter((prev: Item[]) => prev.filter(i => i.id!==id))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#f8f6f2' }}>
      <div className="text-gray-400 text-sm">טוען נתונים...</div>
    </div>
  )

  const allItems = [...properties, ...caravans, ...attractions]
  const totalPending = allItems.filter(i => i.status==='pending').length

  const regionCounts: Record<string, number> = {}
  allItems.forEach(item => { if (item.region) regionCounts[item.region] = (regionCounts[item.region]||0)+1 })
  const maxRegion = Math.max(...Object.values(regionCounts), 1)

  const regionBarData = Object.entries(regionCounts).sort((a,b)=>b[1]-a[1]).slice(0,8)
    .map(([region, count], i) => ({ label: REGION_LABELS[region]||region, value: count, color: `hsl(${30+i*10},${65-i*2}%,${42+i*3}%)` }))

  const categoryCount: Record<string,number> = {}
  properties.forEach(p => { const cat = p.category?.[0]||'other'; categoryCount[cat]=(categoryCount[cat]||0)+1 })

  const mapPins = [
    ...properties.filter(p=>p.lat&&p.lng).map(p=>({ lat:p.lat!, lng:p.lng!, name:p.name, type:'property' as const, status:p.status })),
    ...caravans.filter(c=>c.lat&&c.lng).map(c=>({ lat:c.lat!, lng:c.lng!, name:c.name, type:'caravan' as const, status:c.status })),
    ...attractions.filter(a=>a.lat&&a.lng).map(a=>({ lat:a.lat!, lng:a.lng!, name:a.name, type:'attraction' as const, status:a.status })),
  ]

  const tabs = [
    { key:'overview', label:'סקירה כללית', icon:'📊' },
    { key:'properties', label:'צימרים, וילות ובקתות', icon:'🏠' },
    { key:'attractions', label:'אטרקציות', icon:'🎯' },
    { key:'caravans', label:'קרוואנים', icon:'🚐' },
    { key:'hotels', label:'מלונות', icon:'🏨' },
    { key:'camping', label:'קמפינג', icon:'⛺' },
  ]

  return (
    <div className="min-h-screen" dir="rtl" style={{ background:'#f8f6f2' }}>

      {/* Header */}
      <header style={{ background:'#fff', borderBottom:'1.5px solid #f0ece4', boxShadow:'0 2px 12px rgba(139,105,20,0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap relative">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm flex items-center gap-1.5 transition-opacity hover:opacity-70" style={{ color:'#111827' }}>
              <IconArrowRight className="w-3.5 h-3.5"/>חזרה לאתר
            </Link>
            <div className="w-px h-4" style={{ background:'#e5e7eb' }}/>
            <div className="flex items-center gap-2">
              <p className="text-sm" style={{ color:'#111827' }}>לוח בקרה</p>
              <span style={{ color:'#e5e7eb' }}>|</span>
              <h1 className="text-lg font-bold leading-tight" style={{ color:'#2D1E0F' }}>שלום, {adminName} המנהל</h1>
            </div>
          </div>
          {totalPending > 0 && (
            <span className="absolute left-1/2 -translate-x-1/2 text-lg font-bold px-5 py-2.5 rounded-full animate-pulse"
              style={{ background:'#fffbeb', color:'#d97706', border:'1px solid #fde68a' }}>
              ⏳ {totalPending} <span style={{ color:'#dc2626' }}>ממתינים</span>
            </span>
          )}
          <div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/dashboard/properties/new"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-md"
              style={{ background:'#fff', color:'#111827', border:'1.5px solid #e5e7eb' }}>
              <IconPlus className="w-3.5 h-3.5 text-gray-900" />צימר/וילה/בקתה
            </Link>
            <Link href="/dashboard/caravans/new"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-md"
              style={{ background:'#fff', color:'#111827', border:'1.5px solid #e5e7eb' }}>
              <IconPlus className="w-3.5 h-3.5 text-gray-900" />קרוואן
            </Link>
            <Link href="/dashboard/attractions/new"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-md"
              style={{ background:'#fff', color:'#111827', border:'1.5px solid #e5e7eb' }}>
              <IconPlus className="w-3.5 h-3.5 text-gray-900" />אטרקציה
            </Link>
            <Link href="/dashboard/admin/contacts"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-md"
              style={{ background:'#fff', color:'#111827', border:'1.5px solid #e5e7eb' }}>
              <IconPhone className="w-3.5 h-3.5 text-gray-900" />תקשורת
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex justify-center gap-0 overflow-x-auto" style={{ scrollbarWidth:'none' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className="flex items-center gap-1.5 px-4 py-3 text-sm border-b-2 transition-all whitespace-nowrap"
              style={{
                borderColor: activeTab===tab.key ? '#8B6914' : 'transparent',
                color: activeTab===tab.key ? '#8B6914' : '#111827',
                fontWeight: activeTab===tab.key ? '700' : '400',
                background: 'transparent',
              }}>
              {tab.icon} {tab.key === 'overview' ? <strong style={{fontSize:'1.1em'}}>{tab.label}</strong> : tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'overview' && (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KpiCard label="סה״כ באתר" value={allItems.length} icon="🌐"
                grad="linear-gradient(135deg,#eff6ff,#dbeafe)" color="#1d4ed8" border="#93c5fd" />
              <KpiCard label="פעילים" value={allItems.filter(i=>i.status==='active').length} icon="✅"
                grad="linear-gradient(135deg,#f0fdf4,#dcfce7)" color="#15803d" border="#86efac" />
              <KpiCard label="ממתינים לאישור" value={totalPending} icon="⏳"
                grad="linear-gradient(135deg,#fffbeb,#fef9c3)" color="#b45309" border="#fde68a" />
              <KpiCard label="נדחו" value={allItems.filter(i=>i.status==='rejected').length} icon="❌"
                grad="linear-gradient(135deg,#fff1f2,#ffe4e6)" color="#be123c" border="#fda4af" />
            </div>

            {/* Donuts */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
              <DonutChart label="צימרים, וילות ובקתות" total={properties.length}
                active={properties.filter(p=>p.status==='active').length}
                pending={properties.filter(p=>p.status==='pending').length}
                rejected={properties.filter(p=>p.status==='rejected').length} color="#8B6914" />
              <DonutChart label="קרוואנים" total={caravans.length}
                active={caravans.filter(c=>c.status==='active').length}
                pending={caravans.filter(c=>c.status==='pending').length}
                rejected={caravans.filter(c=>c.status==='rejected').length} color="#C4956A" />
              <DonutChart label="אטרקציות" total={attractions.length}
                active={attractions.filter(a=>a.status==='active').length}
                pending={attractions.filter(a=>a.status==='pending').length}
                rejected={attractions.filter(a=>a.status==='rejected').length} color="#B8964A" />
              <DonutChart label="מלונות" total={properties.filter(p=>p.category?.[0]==='hotel').length}
                active={properties.filter(p=>p.category?.[0]==='hotel'&&p.status==='active').length}
                pending={properties.filter(p=>p.category?.[0]==='hotel'&&p.status==='pending').length}
                rejected={properties.filter(p=>p.category?.[0]==='hotel'&&p.status==='rejected').length} color="#8B6914" />
              <DonutChart label="קמפינג" total={properties.filter(p=>p.category?.[0]==='camping').length}
                active={properties.filter(p=>p.category?.[0]==='camping'&&p.status==='active').length}
                pending={properties.filter(p=>p.category?.[0]==='camping'&&p.status==='pending').length}
                rejected={properties.filter(p=>p.category?.[0]==='camping'&&p.status==='rejected').length} color="#8B6914" />
              <div className="rounded-2xl p-4 flex flex-col justify-center" style={{ background:'linear-gradient(135deg,#fdf8ef,#fef3d0)', border:'1.5px solid #f5d98b' }}>
                <p className="text-sm font-bold mb-3 text-center" style={{ color:'#111827' }}>סה״כ באתר</p>
                {[
                  { label:'נכסים', value:properties.length, color:'#fbbf24' },
                  { label:'קרוואנים', value:caravans.length, color:'#C4956A' },
                  { label:'אטרקציות', value:attractions.length, color:'#34d399' },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium" style={{ color:'#111827' }}>{r.label}</span>
                    <span className="text-sm font-bold" style={{ color:r.color }}>{r.value}</span>
                  </div>
                ))}
                <div className="mt-2 pt-2" style={{ borderTop:'1px solid rgba(139,105,20,0.15)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold" style={{ color:'#111827' }}>סה״כ</span>
                    <span className="text-lg font-bold" style={{ color:'#111827' }}>{allItems.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Map */}
              <div className="bg-white rounded-2xl p-5" style={{ border:'1.5px solid #f0ece4', boxShadow:'0 2px 16px rgba(0,0,0,0.05)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background:'#fdf8ef' }}>🗺</div>
                  <p className="font-bold text-sm" style={{ color:'#111827' }}>פיזור גיאוגרפי</p>
                </div>
                <IsraelMap pins={mapPins} />
              </div>

              {/* Bar charts */}
              <div className="bg-white rounded-2xl p-5" style={{ border:'1.5px solid #f0ece4', boxShadow:'0 2px 16px rgba(0,0,0,0.05)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background:'#fdf8ef' }}>📊</div>
                  <p className="font-bold text-sm" style={{ color:'#111827' }}>נכסים לפי אזור</p>
                </div>
                <div className="space-y-2.5">
                  {regionBarData.map(d => <HBar key={d.label} label={d.label} value={d.value} max={maxRegion} color={d.color} />)}
                </div>
                <div className="mt-5 pt-4" style={{ borderTop:'1px solid #f5f0e8' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background:'#fdf8ef' }}>🏠</div>
                    <p className="font-bold text-sm" style={{ color:'#111827' }}>סוגי נכסים</p>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(categoryCount).map(([cat,count],i) => (
                      <HBar key={cat} label={({'zimmer':'צימר','villa':'וילה','complex':'מתחם','hotel':'מלון','camping':'קמפינג'} as any)[cat]||cat}
                        value={count} max={Math.max(...Object.values(categoryCount),1)}
                        color={`hsl(${30+i*15},65%,${42+i*4}%)`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Pending */}
              <div className="bg-white rounded-2xl p-5" style={{ border:'1.5px solid #f0ece4', boxShadow:'0 2px 16px rgba(0,0,0,0.05)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background:'#fffbeb' }}>⏳</div>
                  <p className="font-bold text-sm" style={{ color:'#111827' }}>ממתינים לאישור</p>
                  {totalPending > 0 && <span className="mr-auto text-sm font-bold px-2 py-0.5 rounded-full" style={{ background:'#fffbeb', color:'#d97706' }}>{totalPending}</span>}
                </div>
                {totalPending === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-lg mb-2">✅</p>
                    <p className="text-sm text-gray-400">הכל מאושר!</p>
                  </div>
                ) : (
                  <div className="space-y-2 overflow-y-auto" style={{ maxHeight:'360px' }}>
                    {[
                      { items: properties.filter(p=>p.status==='pending'), type:'נכס', table:'properties', setter:setProperties },
                      { items: caravans.filter(c=>c.status==='pending'), type:'קרוואן', table:'caravans', setter:setCaravans },
                      { items: attractions.filter(a=>a.status==='pending'), type:'אטרקציה', table:'attractions', setter:setAttractions },
                    ].flatMap(group => group.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background:'#fffbeb', border:'1px solid #fde68a' }}>
                        <Link href={`/${group.table}/${item.id}`} target="_blank"
                          className="min-w-0 flex-1 hover:opacity-70 transition-opacity cursor-pointer">
                          <p className="text-sm font-semibold truncate" style={{ color:'#111827' }}>{item.name}</p>
                          <p className="text-sm flex items-center gap-1" style={{ color:'#111827' }}>
                            {group.type} · {item.city || REGION_LABELS[item.region||''] || ''} · {new Date(item.created_at).toLocaleDateString('he-IL')}
                            <span className="text-xs" style={{ color:'#d97706' }}>← צפייה</span>
                          </p>
                        </Link>
                        <div className="flex gap-1.5 mr-3 shrink-0">
                          <button onClick={()=>approve(group.table, item.id, group.setter)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-all"
                            style={{ background:'#f0fdf4' }}><IconCheck className="w-4 h-4 text-green-600"/></button>
                          <button onClick={()=>reject(group.table, item.id, group.setter)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-all"
                            style={{ background:'#fff1f2' }}><IconX className="w-4 h-4 text-red-500"/></button>
                        </div>
                      </div>
                    )))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab==='properties' && <FullTable title="צימרים, וילות ובקתות" items={properties}
          onApprove={(id:string)=>approve('properties',id,setProperties)} onReject={(id:string)=>reject('properties',id,setProperties)}
          onDelete={(id:string)=>remove('properties',id,setProperties)} editPath={(id:string)=>`/dashboard/properties/${id}/edit`}
          priceLabel={(item:Item)=>item.price_per_night?`₪${item.price_per_night}`:'—'}
          typeLabel={(item:Item)=>({zimmer:'צימר',complex:'מתחם צימרים',villa:'וילה',caravan:'קרוואן',hotel:'מלון',camping:'קמפינג',attraction:'אטרקציה'}as any)[item.category?.[0]||'']||item.category?.[0]||'—'} />}

        {activeTab==='attractions' && <FullTable title="אטרקציות" items={attractions}
          onApprove={(id:string)=>approve('attractions',id,setAttractions)} onReject={(id:string)=>reject('attractions',id,setAttractions)}
          onDelete={(id:string)=>remove('attractions',id,setAttractions)} editPath={(id:string)=>`/dashboard/attractions/${id}/edit`}
          priceLabel={(item:Item)=>item.price_per_person?`₪${item.price_per_person}`:'—'}
          typeLabel={(item:Item)=>item.activity_type?.[0]||'—'} />}

        {activeTab==='caravans' && <FullTable title="קרוואנים" items={caravans}
          onApprove={(id:string)=>approve('caravans',id,setCaravans)} onReject={(id:string)=>reject('caravans',id,setCaravans)}
          onDelete={(id:string)=>remove('caravans',id,setCaravans)} editPath={(id:string)=>`/dashboard/caravans/${id}/edit`}
          priceLabel={(item:Item)=>item.price_per_night?`₪${item.price_per_night}`:'—'}
          typeLabel={(item:Item)=>({'auto':'אוטו','trailer':'נגרר','stationed':'מוצב','truck':'משאית'} as any)[item.caravan_type||'']||'—'} />}

        {activeTab==='hotels' && <FullTable title="מלונות" items={properties.filter(p=>p.category?.[0]==='hotel')}
          onApprove={(id:string)=>approve('properties',id,setProperties)} onReject={(id:string)=>reject('properties',id,setProperties)}
          onDelete={(id:string)=>remove('properties',id,setProperties)} editPath={(id:string)=>`/dashboard/properties/${id}/edit`}
          priceLabel={(item:Item)=>item.price_per_night?`₪${item.price_per_night}`:'—'}
          typeLabel={()=>'מלון'} />}

        {activeTab==='camping' && <FullTable title="קמפינג" items={properties.filter(p=>p.category?.[0]==='camping')}
          onApprove={(id:string)=>approve('properties',id,setProperties)} onReject={(id:string)=>reject('properties',id,setProperties)}
          onDelete={(id:string)=>remove('properties',id,setProperties)} editPath={(id:string)=>`/dashboard/properties/${id}/edit`}
          priceLabel={(item:Item)=>item.price_per_night?`₪${item.price_per_night}`:'—'}
          typeLabel={()=>'קמפינג'} />}

      </main>
    </div>
  )
}
