'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { IconArrowRight, IconTrash, IconEdit, IconPlus, IconCheck, IconPhone, IconX, IconEye } from '@/components/icons'
import { AdminGenericReviews } from '@/components/AdminGenericReviews'
import { HomepageFeaturedManager } from '@/components/HomepageFeaturedManager'
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

function FullTable({ title, items, onApprove, onReject, onDelete, editPath, viewPath, priceLabel, typeLabel, reviewsTable, reviewsForeignKey }: any) {
  const [filter, setFilter] = useState('all')
  const [reviewsId, setReviewsId] = useState<string | null>(null)
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
                  <React.Fragment key={item.id}>
                  <tr className="border-t transition-colors hover:bg-amber-50/20" style={{ borderColor:'#f5f0e8' }}>
                    <td className="px-5 py-3 font-medium text-sm" style={{ color:'#111827' }}>{item.name}</td>
                    <td className="px-5 py-3 text-sm" style={{ color:'#111827' }}>{typeLabel(item)}</td>
                    <td className="px-5 py-3 text-sm font-semibold" style={{ color:'#8B6914' }}>{priceLabel(item)}</td>
                    <td className="px-5 py-3 text-sm" style={{ color:'#111827' }}>{item.city || REGION_LABELS[item.region||''] || '—'}</td>
                    <td className="px-5 py-3 text-sm" style={{ color:'#111827' }}>{date}</td>
                    <td className="px-5 py-3"><span className="px-2.5 py-1 rounded-full text-sm font-semibold" style={{ background:s.bg, color:s.color }}>{s.label}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {item.status!=='active' && <button onClick={()=>onApprove(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-all" style={{ background:'#f0fdf4' }}><IconCheck className="w-3.5 h-3.5" color="#111827"/></button>}
                        {item.status!=='rejected' && <button onClick={()=>onReject(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-all" style={{ background:'#fff1f2' }}><IconX className="w-3.5 h-3.5" color="#111827"/></button>}
                        {viewPath && <Link href={viewPath(item.id)} target="_blank" className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-all" style={{ background:'#f0f9ff' }}><IconEye className="w-3.5 h-3.5" color="#111827"/></Link>}
                        <Link href={editPath(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-all" style={{ background:'#f9fafb' }}><IconEdit className="w-3.5 h-3.5" color="#111827"/></Link>
                        <button onClick={()=>onDelete(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-all" style={{ background:'#fff1f2' }}><IconTrash className="w-3.5 h-3.5" color="#111827"/></button>
                      </div>
                    </td>
                  </tr>
                  {reviewsTable && reviewsId === item.id && (
                    <tr key={item.id + '-reviews'}>
                      <td colSpan={7} className="px-5 py-4 bg-amber-50/30">
                        <AdminGenericReviews entityId={item.id} table={reviewsTable} foreignKey={reviewsForeignKey} />
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


function UsersTable({ users }: { users: any[] }) {
  const [search, setSearch] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState('all')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [sortKey, setSortKey] = React.useState('created_at')
  const [sortDir, setSortDir] = React.useState<'asc'|'desc'>('desc')

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase()
      const matchSearch = !q || (u.full_name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q) || (u.phone||'').includes(q)
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      const matchStatus = statusFilter === 'all' || u.status === statusFilter
      return matchSearch && matchRole && matchStatus
    })
    .sort((a, b) => {
      const av = String(a[sortKey] ?? '')
      const bv = String(b[sortKey] ?? '')
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ k }: { k: string }) => (
    <span className="inline-flex flex-col ml-2" style={{ lineHeight:'1', gap:'2px', verticalAlign:'middle' }}>
      <span style={{ fontSize:'8px', color: sortKey===k && sortDir==='asc' ? '#8B6914' : '#6b7280', fontWeight:'900', display:'block' }}>▲</span>
      <span style={{ fontSize:'8px', color: sortKey===k && sortDir==='desc' ? '#8B6914' : '#6b7280', fontWeight:'900', display:'block' }}>▼</span>
    </span>
  )

  const exportData = (type: 'csv' | 'xlsx') => {
    const headers = ['שם מלא', 'אימייל', 'טלפון', 'תפקיד', 'תאריך הרשמה', 'סטטוס']
    const rows = filtered.map(u => [
      u.full_name || '',
      u.email || '',
      u.phone || '',
      u.role === 'admin' ? 'מנהל' : u.role === 'owner' ? 'בעל נכס' : 'גולש',
      u.created_at ? new Date(u.created_at).toLocaleDateString('he-IL') : '',
      u.status === 'active' ? 'פעיל' : u.status === 'pending' ? 'ממתין' : 'לא פעיל',
    ])
    if (type === 'csv') {
      const bom = '\uFEFF'
      const csv = bom + [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click()
      URL.revokeObjectURL(url)
    } else {
      let xml = '<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="משתמשים"><Table>'
      ;[headers, ...rows].forEach(row => {
        xml += '<Row>' + row.map(cell => `<Cell><Data ss:Type="String">${String(cell).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</Data></Cell>`).join('') + '</Row>'
      })
      xml += '</Table></Worksheet></Workbook>'
      const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'users.xlsx'; a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background:'#fff', border:'1px solid rgba(139,105,20,0.1)' }}>
      <div className="px-6 py-4 border-b space-y-3" style={{ borderColor:'rgba(139,105,20,0.1)' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg" style={{ color:'#2D1E0F' }}>משתמשים רשומים ({filtered.length}/{users.length})</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => exportData('csv')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-80"
              style={{ background:'linear-gradient(135deg, #25D366, #128C7E)' }}>⬇ CSV</button>
            <button onClick={() => exportData('xlsx')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-80"
              style={{ background:'linear-gradient(135deg, #25D366, #128C7E)' }}>⬇ Excel</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 חיפוש לפי שם, אימייל, טלפון..."
            className="flex-1 min-w-48 border rounded-xl px-4 py-2 text-sm outline-none"
            style={{ borderColor:'rgba(139,105,20,0.2)' }} />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm outline-none"
            style={{ borderColor:'rgba(139,105,20,0.2)' }}>
            <option value="all">כל התפקידים</option>
            <option value="admin">מנהל</option>
            <option value="owner">בעל נכס</option>
            <option value="guest">גולש</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm outline-none"
            style={{ borderColor:'rgba(139,105,20,0.2)' }}>
            <option value="all">כל הסטטוסים</option>
            <option value="active">פעיל</option>
            <option value="pending">ממתין</option>
            <option value="inactive">לא פעיל</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background:'#faf7f2' }}>
              {[
                { label:'שם מלא', key:'full_name' },
                { label:'אימייל', key:'email' },
                { label:'טלפון', key:'phone' },
                { label:'תפקיד', key:'role', cls:'w-px whitespace-nowrap' },
                { label:'נכסים בבעלות החשבון', key:'listings' },
                { label:'תאריך הרשמה', key:'created_at' },
                { label:'סטטוס', key:'status' },
              ].map(({ label, key }) => (
                <th key={key} onClick={() => toggleSort(key)}
                  className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider cursor-pointer select-none hover:opacity-70 whitespace-nowrap"
                  style={{ color:'#8B6914' }}>
                  <SortIcon k={key} />{label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color:'#9A7C5E' }}>לא נמצאו משתמשים</td></tr>
            )}
            {filtered.map(u => (
              <tr key={u.id} className="border-t hover:bg-amber-50/20 transition-colors" style={{ borderColor:'#f5f0e8' }}>
                <td className="px-4 py-3 text-sm font-medium text-center" style={{ color:'#111827' }}>{u.full_name || '—'}</td>
                <td className="px-4 py-3 text-sm text-center" style={{ color:'#111827' }}>{u.email || '—'}</td>
                <td className="px-4 py-3 text-sm text-center" style={{ color:'#111827' }}>{u.phone || '—'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-bold"
                    style={{ background: u.role==='admin' ? '#fef3c7' : u.role==='owner' ? '#f0fdf4' : '#f3f4f6', color: u.role==='admin' ? '#92400e' : u.role==='owner' ? '#166534' : '#374151' }}>
                    {u.role==='admin' ? 'מנהל' : u.role==='owner' ? 'בעל נכס' : 'גולש'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {u.listings && u.listings.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {u.listings.map((name: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background:'#fef3c7', color:'#92400e' }}>{name}</span>
                      ))}
                    </div>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color:'#6b7280' }}>
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('he-IL', { day:'2-digit', month:'2-digit', year:'2-digit' }) : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full"
                      style={{ background: u.status==='active' ? '#22c55e' : u.status==='pending' ? '#eab308' : '#ef4444' }} />
                    <span className="text-xs" style={{ color:'#6b7280' }}>
                      {u.status==='active' ? 'פעיל' : u.status==='pending' ? 'ממתין' : 'לא פעיל'}
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const DEMO_ROW = {
  id: '__demo__',
  name: 'צימר הגליל העליון',
  city: 'ראש פינה',
  region: 'north',
  owner: { full_name: 'יוסי כהן', phone: '050-1234567', email: 'yossi@example.com' },
  whatsapp1: null, phone_landline: null, email1: null,
  admin_join_date: '2025-01-01',
  admin_payment_start: '2025-02-01',
  admin_monthly_price: 350,
  admin_contract_end: '2026-06-30',
  admin_contract_url: '',
  admin_reminder_date: '2026-05-16',
  admin_notes: 'לקוח ותיק, שילם מראש לרבעון',
}

function FinancialManagement({ properties }: { properties: Item[] }) {
  const supabase = createClient()
  const [contracts, setContracts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [editForm, setEditForm] = React.useState<any>({})
  const [saving, setSaving] = React.useState(false)
  const [contractUploading, setContractUploading] = React.useState(false)
  const [filterStatus, setFilterStatus] = React.useState<'all'|'active'|'expiring'|'expired'>('all')
  const [search, setSearch] = React.useState('')
  const [favorites, setFavorites] = React.useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('fin_favorites') || '[]')) }
    catch { return new Set() }
  })
  const [showFavOnly, setShowFavOnly] = React.useState(false)

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem('fin_favorites', JSON.stringify([...next]))
      return next
    })
  }

  React.useEffect(() => {
    async function load() {
      const { data: props } = await supabase
        .from('properties')
        .select('id, name, city, region, status, owner_id, whatsapp1, phone_landline, email1, admin_join_date, admin_payment_start, admin_monthly_price, admin_contract_end, admin_contract_url, admin_reminder_date, admin_notes')
        .order('admin_join_date', { ascending: false, nullsFirst: false })

      const ownerIds = [...new Set((props || []).map((p: any) => p.owner_id).filter(Boolean))]
      let profileMap: Record<string, any> = {}
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, phone, email')
          .in('id', ownerIds)
        profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]))
      }

      setContracts((props || []).map((p: any) => ({ ...p, owner: profileMap[p.owner_id] || null })))
      setLoading(false)
    }
    load()
  }, [])

  const today = new Date()

  const getContractStatus = (row: any) => {
    if (!row.admin_contract_end) return 'no_contract'
    const days = Math.ceil((new Date(row.admin_contract_end).getTime() - today.getTime()) / 86400000)
    if (days <= 0) return 'expired'
    if (days <= 60) return 'expiring'
    return 'active'
  }

  const totalMonthly = contracts.reduce((s, r) => s + (r.admin_monthly_price || 0), 0)
  const activeContracts = contracts.filter(r => getContractStatus(r) === 'active').length
  const expiringContracts = contracts.filter(r => getContractStatus(r) === 'expiring').length
  const expiredContracts = contracts.filter(r => getContractStatus(r) === 'expired').length

  const filtered = contracts.filter(r => {
    const matchStatus = filterStatus === 'all' || getContractStatus(r) === filterStatus
    const matchFav = !showFavOnly || favorites.has(r.id)
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (r.name || '').toLowerCase().includes(q) ||
      (r.owner?.full_name || '').toLowerCase().includes(q) ||
      (r.owner?.phone || r.phone_landline || r.whatsapp1 || '').includes(q) ||
      (r.owner?.email || r.email1 || '').toLowerCase().includes(q)
    return matchStatus && matchFav && matchSearch
  })

  const openEdit = (row: any) => {
    if (expandedId === row.id) { setExpandedId(null); return }
    setExpandedId(row.id)
    setEditForm({
      admin_join_date: row.admin_join_date || '',
      admin_payment_start: row.admin_payment_start || '',
      admin_monthly_price: row.admin_monthly_price?.toString() || '',
      admin_contract_end: row.admin_contract_end || '',
      admin_contract_url: row.admin_contract_url || '',
      admin_reminder_date: row.admin_reminder_date || '',
      admin_notes: row.admin_notes || '',
    })
  }

  const saveContract = async (id: string) => {
    if (id === '__demo__') { setExpandedId(null); return }
    setSaving(true)
    await supabase.from('properties').update({
      admin_join_date: editForm.admin_join_date || null,
      admin_payment_start: editForm.admin_payment_start || null,
      admin_monthly_price: editForm.admin_monthly_price ? parseInt(editForm.admin_monthly_price) : null,
      admin_contract_end: editForm.admin_contract_end || null,
      admin_contract_url: editForm.admin_contract_url || null,
      admin_reminder_date: editForm.admin_reminder_date || null,
      admin_notes: editForm.admin_notes || null,
    }).eq('id', id)
    setContracts(prev => prev.map(r => r.id === id ? {
      ...r,
      admin_join_date: editForm.admin_join_date || null,
      admin_payment_start: editForm.admin_payment_start || null,
      admin_monthly_price: editForm.admin_monthly_price ? parseInt(editForm.admin_monthly_price) : null,
      admin_contract_end: editForm.admin_contract_end || null,
      admin_contract_url: editForm.admin_contract_url || null,
      admin_reminder_date: editForm.admin_reminder_date || null,
      admin_notes: editForm.admin_notes || null,
    } : r))
    setExpandedId(null)
    setSaving(false)
  }

  const handleContractUpload = async (e: React.ChangeEvent<HTMLInputElement>, propId: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setContractUploading(true)
    const ext = file.name.split('.').pop()
    const path = `contracts/${propId}/contract_${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('contracts').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(data.path)
      setEditForm((prev: any) => ({ ...prev, admin_contract_url: urlData.publicUrl }))
    }
    setContractUploading(false)
  }

  const setReminder45 = () => {
    if (!editForm.admin_contract_end) return
    const end = new Date(editForm.admin_contract_end)
    end.setDate(end.getDate() - 45)
    setEditForm((prev: any) => ({ ...prev, admin_reminder_date: end.toISOString().split('T')[0] }))
  }

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'

  const contractStatusBadge = (row: any) => {
    const s = getContractStatus(row)
    if (s === 'expired') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">⛔ פג</span>
    if (s === 'expiring') {
      const days = Math.ceil((new Date(row.admin_contract_end).getTime() - today.getTime()) / 86400000)
      return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">🔔 {days}י׳</span>
    }
    if (s === 'active') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">✅</span>
    return <span className="text-gray-300 text-xs">—</span>
  }

  const exportData = (type: 'csv' | 'xlsx' | 'pdf') => {
    const allRows = [DEMO_ROW, ...filtered]
    const headers = ['שם העסק', 'שם הבעלים', 'טלפון', 'אימייל', 'תאריך הצטרפות', 'תחילת תשלום', 'עלות חודשית', 'סיום חוזה', 'תזכורת', 'הערות']
    const rows = allRows.map(r => [
      r.name || '',
      r.owner?.full_name || '',
      r.owner?.phone || (r as any).phone_landline || (r as any).whatsapp1 || '',
      r.owner?.email || (r as any).email1 || '',
      r.admin_join_date ? new Date(r.admin_join_date).toLocaleDateString('he-IL') : '',
      (r as any).admin_payment_start ? new Date((r as any).admin_payment_start).toLocaleDateString('he-IL') : '',
      r.admin_monthly_price ? `₪${r.admin_monthly_price}` : '',
      r.admin_contract_end ? new Date(r.admin_contract_end).toLocaleDateString('he-IL') : '',
      (r as any).admin_reminder_date ? new Date((r as any).admin_reminder_date).toLocaleDateString('he-IL') : '',
      (r as any).admin_notes || '',
    ])

    if (type === 'csv') {
      const bom = '﻿'
      const csv = bom + [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'ניהול-כספי.csv'; a.click()
      URL.revokeObjectURL(url)
      return
    }

    if (type === 'xlsx') {
      let xml = '<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="ניהול כספי"><Table>'
      ;[headers, ...rows].forEach(row => {
        xml += '<Row>' + row.map(cell => `<Cell><Data ss:Type="String">${String(cell).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</Data></Cell>`).join('') + '</Row>'
      })
      xml += '</Table></Worksheet></Workbook>'
      const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'ניהול-כספי.xlsx'; a.click()
      URL.revokeObjectURL(url)
      return
    }

    if (type === 'pdf') {
      const win = window.open('', '_blank')
      if (!win) return
      const totalMonthlyExport = allRows.reduce((s, r) => s + (r.admin_monthly_price || 0), 0)
      const tableRows = [headers, ...rows].map((r, i) =>
        `<tr style="background:${i === 0 ? '#8B6914' : i % 2 === 0 ? '#faf8f4' : '#fff'}; color:${i === 0 ? '#fff' : '#111'}">
          ${r.map(cell => `<td style="padding:8px 12px;border:1px solid #f0ece4;font-size:12px;white-space:nowrap">${cell}</td>`).join('')}
        </tr>`
      ).join('')
      win.document.write(`<!DOCTYPE html><html dir="rtl"><head>
        <meta charset="UTF-8">
        <title>ניהול כספי — zimmer.club</title>
        <style>body{font-family:Arial,sans-serif;margin:24px;direction:rtl} h1{color:#2D1E0F;font-size:20px} .summary{color:#8B6914;font-size:14px;margin-bottom:16px} table{border-collapse:collapse;width:100%} @media print{body{margin:0}}</style>
      </head><body>
        <h1>💰 ניהול כספי — zimmer.club</h1>
        <p class="summary">סה״כ ${allRows.length} עסקים | הכנסה חודשית: ₪${totalMonthlyExport.toLocaleString()} | תאריך הפקה: ${new Date().toLocaleDateString('he-IL')}</p>
        <table>${tableRows}</table>
      </body></html>`)
      win.document.close()
      win.focus()
      setTimeout(() => { win.print() }, 500)
    }
  }

  if (loading) return <div className="py-20 text-center text-gray-400 text-sm">טוען...</div>

  return (
    <div className="mt-6 space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg,#fdf8ef,#fef3d0)', border: '1.5px solid #f5d98b' }}>
          <span className="text-2xl">💰</span>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">הכנסה חודשית</p>
            <p className="text-xl font-bold" style={{ color: '#8B6914' }}>₪{totalMonthly.toLocaleString()}</p>
          </div>
        </div>
        <div className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer" style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1.5px solid #86efac' }} onClick={() => setFilterStatus(filterStatus === 'active' ? 'all' : 'active')}>
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">חוזים פעילים</p>
            <p className="text-xl font-bold text-green-700">{activeContracts}</p>
          </div>
        </div>
        <div className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer" style={{ background: 'linear-gradient(135deg,#fffbeb,#fef9c3)', border: '1.5px solid #fde68a' }} onClick={() => setFilterStatus(filterStatus === 'expiring' ? 'all' : 'expiring')}>
          <span className="text-2xl">🔔</span>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">מסתיימים בקרוב</p>
            <p className="text-xl font-bold text-amber-700">{expiringContracts}</p>
          </div>
        </div>
        <div className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer" style={{ background: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: '1.5px solid #fda4af' }} onClick={() => setFilterStatus(filterStatus === 'expired' ? 'all' : 'expired')}>
          <span className="text-2xl">⛔</span>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">פגי תוקף</p>
            <p className="text-xl font-bold text-red-700">{expiredContracts}</p>
          </div>
        </div>
      </div>

      {/* Search + filter + export */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 חיפוש לפי שם, בעלים, טלפון, אימייל..."
          className="flex-1 min-w-60 border rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ borderColor: 'rgba(139,105,20,0.2)' }}
        />
        <button
          onClick={() => setShowFavOnly(p => !p)}
          className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border"
          style={{
            background: showFavOnly ? '#fef3c7' : '#fff',
            color: showFavOnly ? '#92400e' : '#6b7280',
            borderColor: showFavOnly ? '#fbbf24' : '#e5e7eb',
          }}
        >
          {showFavOnly ? '⭐' : '☆'} מועדפים
          {favorites.size > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: showFavOnly ? '#fbbf24' : '#f3f4f6', color: showFavOnly ? '#fff' : '#6b7280' }}>
              {favorites.size}
            </span>
          )}
        </button>
        {filterStatus !== 'all' && (
          <button onClick={() => setFilterStatus('all')} className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200">
            ✕ נקה סינון
          </button>
        )}
        <span className="text-sm text-gray-400">{filtered.length} עסקים</span>

        {/* Export buttons */}
        <div className="flex items-center gap-2 mr-auto">
          <button onClick={() => exportData('csv')}
            className="px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-80 flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}>
            ⬇ CSV
          </button>
          <button onClick={() => exportData('xlsx')}
            className="px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-80 flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg,#217346,#155724)' }}>
            ⬇ Excel
          </button>
          <button onClick={() => exportData('pdf')}
            className="px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-80 flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg,#c0392b,#922b21)' }}>
            ⬇ PDF
          </button>
        </div>
      </div>

      {/* Main table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1.5px solid #f0ece4', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: '#faf8f4' }}>
              <tr style={{ color: '#8B6914' }}>
                {[
                  { label: '☆', hint: 'מועדפים' },
                  { label: 'שם העסק', hint: 'שם הנכס' },
                  { label: 'שם הבעלים', hint: 'מפרופיל המשתמש' },
                  { label: 'טלפון', hint: 'מפרופיל המשתמש' },
                  { label: 'אימייל', hint: 'מפרופיל המשתמש' },
                  { label: 'תאריך הצטרפות', hint: 'נקבע אוטומטית ביום האישור' },
                  { label: 'עלות חודשית', hint: 'מוזן ידנית' },
                  { label: 'חוזה חתום', hint: 'מוזן ידנית' },
                  { label: 'הערות', hint: 'מוזן ידנית' },
                  { label: '', hint: '' },
                ].map(h => (
                  <th key={h.label} title={h.hint} className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-help">{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
                {/* Placeholder / demo row */}
                {(() => {
                  const row = DEMO_ROW
                  const isOpen = expandedId === row.id
                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        className="border-t transition-colors hover:bg-amber-50/20 cursor-pointer"
                        style={{ borderColor: '#f5f0e8', background: isOpen ? '#fdf8ef' : favorites.has(row.id) ? 'linear-gradient(90deg,#fffbeb,#fef9c3)' : 'linear-gradient(90deg,#fffef5,#fefce8)' }}
                        onClick={() => openEdit(row)}
                      >
                        {/* כוכב מועדפים */}
                        <td className="px-3 py-3" onClick={e => { e.stopPropagation(); toggleFav(row.id) }}>
                          <button className="text-lg leading-none transition-transform hover:scale-125"
                            title={favorites.has(row.id) ? 'הסר ממועדפים' : 'הוסף למועדפים'}>
                            {favorites.has(row.id) ? '⭐' : '☆'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-semibold text-sm" style={{ color: '#111827' }}>{row.name}</p>
                              <p className="text-xs text-gray-400">{row.city}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">✅</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-400 border border-blue-100">דוגמה</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#374151' }}>{row.owner.full_name}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-blue-500" dir="ltr">{row.owner.phone}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-blue-500">{row.owner.email}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{fmtDate(row.admin_join_date)}</td>
                        <td className="px-4 py-3 text-sm font-bold whitespace-nowrap" style={{ color: '#8B6914' }}>₪{row.admin_monthly_price}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-300">לא הועלה</span>
                        </td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <p className="text-xs text-gray-400 truncate">{row.admin_notes}</p>
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => openEdit(row)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80 whitespace-nowrap"
                            style={{ background: isOpen ? '#111827' : '#f9f5ef', color: isOpen ? '#fff' : '#8B6914', border: '1px solid #e5d98b' }}
                          >
                            {isOpen ? '✕ סגור' : '✏️ ערוך'}
                          </button>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr>
                          <td colSpan={9} style={{ background: '#fdf8ef', borderBottom: '2px solid #f5d98b' }}>
                            <div className="px-6 py-5" dir="rtl">
                              <div className="rounded-2xl p-5 border border-amber-200 bg-white space-y-4">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-bold text-base flex items-center gap-2" style={{ color: '#8B6914' }}>
                                    🔐 פרטי התקשרות — {row.name}
                                  </h3>
                                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-400 border border-blue-100">שורת דוגמה — שינויים לא יישמרו</span>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div>
                                    <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">תאריך הצטרפות</label>
                                    <input type="date" value={editForm.admin_join_date}
                                      onChange={e => setEditForm((p: any) => ({ ...p, admin_join_date: e.target.value }))}
                                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 bg-white" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">תחילת תשלום</label>
                                    <input type="date" value={editForm.admin_payment_start}
                                      onChange={e => setEditForm((p: any) => ({ ...p, admin_payment_start: e.target.value }))}
                                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 bg-white" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">מחיר לחודש (₪)</label>
                                    <input type="number" min="0" value={editForm.admin_monthly_price}
                                      onChange={e => setEditForm((p: any) => ({ ...p, admin_monthly_price: e.target.value }))}
                                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 bg-white" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">סיום חוזה</label>
                                    <input type="date" value={editForm.admin_contract_end}
                                      onChange={e => setEditForm((p: any) => ({ ...p, admin_contract_end: e.target.value }))}
                                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 bg-white" />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">הערות</label>
                                  <textarea value={editForm.admin_notes}
                                    onChange={e => setEditForm((p: any) => ({ ...p, admin_notes: e.target.value }))}
                                    rows={2}
                                    className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 bg-white resize-none" />
                                </div>
                                <div className="flex items-center gap-3 pt-2 border-t border-amber-100">
                                  <button onClick={() => setExpandedId(null)}
                                    className="px-6 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                                    סגור
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })()}

                {filtered.map(row => {
                  const phone = row.owner?.phone || row.phone_landline || row.whatsapp1 || null
                  const email = row.owner?.email || row.email1 || null
                  const isOpen = expandedId === row.id
                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        className="border-t transition-colors hover:bg-amber-50/20 cursor-pointer"
                        style={{ borderColor: '#f5f0e8', background: isOpen ? '#fdf8ef' : favorites.has(row.id) ? '#fffbeb' : undefined }}
                        onClick={() => openEdit(row)}
                      >
                        {/* כוכב מועדפים */}
                        <td className="px-3 py-3" onClick={e => { e.stopPropagation(); toggleFav(row.id) }}>
                          <button className="text-lg leading-none transition-transform hover:scale-125"
                            title={favorites.has(row.id) ? 'הסר ממועדפים' : 'הוסף למועדפים'}>
                            {favorites.has(row.id) ? '⭐' : '☆'}
                          </button>
                        </td>
                        {/* שם עסק */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-semibold text-sm" style={{ color: '#111827' }}>{row.name}</p>
                              <p className="text-xs text-gray-400">{row.city || REGION_LABELS[row.region] || ''}</p>
                            </div>
                            {contractStatusBadge(row)}
                          </div>
                        </td>
                        {/* בעלים */}
                        <td className="px-4 py-3 text-sm" style={{ color: '#374151' }}>
                          {row.owner?.full_name || <span className="text-gray-300">—</span>}
                        </td>
                        {/* טלפון */}
                        <td className="px-4 py-3">
                          {phone
                            ? <a href={`tel:${phone}`} onClick={e => e.stopPropagation()} className="text-sm text-blue-600 hover:underline" dir="ltr">{phone}</a>
                            : <span className="text-gray-300 text-sm">—</span>}
                        </td>
                        {/* אימייל */}
                        <td className="px-4 py-3">
                          {email
                            ? <a href={`mailto:${email}`} onClick={e => e.stopPropagation()} className="text-sm text-blue-600 hover:underline">{email}</a>
                            : <span className="text-gray-300 text-sm">—</span>}
                        </td>
                        {/* תאריך הצטרפות */}
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{fmtDate(row.admin_join_date)}</td>
                        {/* עלות חודשית */}
                        <td className="px-4 py-3 text-sm font-bold whitespace-nowrap" style={{ color: row.admin_monthly_price ? '#8B6914' : '#d1d5db' }}>
                          {row.admin_monthly_price ? `₪${row.admin_monthly_price.toLocaleString()}` : '—'}
                        </td>
                        {/* חוזה */}
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          {row.admin_contract_url
                            ? <a href={row.admin_contract_url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline whitespace-nowrap">
                                📄 צפייה
                              </a>
                            : <span className="text-xs text-gray-300">לא הועלה</span>}
                        </td>
                        {/* הערות */}
                        <td className="px-4 py-3 max-w-[180px]">
                          <p className="text-xs text-gray-500 truncate">{row.admin_notes || <span className="text-gray-200">—</span>}</p>
                        </td>
                        {/* פעולות */}
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => openEdit(row)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80 whitespace-nowrap"
                            style={{ background: isOpen ? '#111827' : '#f9f5ef', color: isOpen ? '#fff' : '#8B6914', border: '1px solid #e5d98b' }}
                          >
                            {isOpen ? '✕ סגור' : '✏️ ערוך'}
                          </button>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr>
                          <td colSpan={9} style={{ background: '#fdf8ef', borderBottom: '2px solid #f5d98b' }}>
                            <div className="px-6 py-5" dir="rtl">
                              <div className="rounded-2xl p-5 border border-amber-200 bg-white space-y-4">
                                <h3 className="font-bold text-base flex items-center gap-2" style={{ color: '#8B6914' }}>
                                  🔐 פרטי התקשרות — {row.name}
                                </h3>

                                {/* תאריכים + מחיר */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div>
                                    <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">תאריך הצטרפות</label>
                                    <input type="date" value={editForm.admin_join_date}
                                      onChange={e => setEditForm((p: any) => ({ ...p, admin_join_date: e.target.value }))}
                                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 bg-white" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">תחילת תשלום</label>
                                    <input type="date" value={editForm.admin_payment_start}
                                      onChange={e => setEditForm((p: any) => ({ ...p, admin_payment_start: e.target.value }))}
                                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 bg-white" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">מחיר לחודש (₪)</label>
                                    <input type="number" min="0" value={editForm.admin_monthly_price}
                                      onChange={e => setEditForm((p: any) => ({ ...p, admin_monthly_price: e.target.value }))}
                                      placeholder="0"
                                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 bg-white" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">סיום חוזה</label>
                                    <input type="date" value={editForm.admin_contract_end}
                                      onChange={e => setEditForm((p: any) => ({ ...p, admin_contract_end: e.target.value }))}
                                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 bg-white" />
                                  </div>
                                </div>

                                {/* חוזה + תזכורת */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">חוזה חתום</label>
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer border transition-colors ${contractUploading ? 'opacity-50 cursor-not-allowed' : 'border-amber-200 hover:bg-amber-50'} bg-white`}>
                                        <span>📎</span>
                                        {contractUploading ? 'מעלה...' : 'העלה חוזה (PDF/DOC)'}
                                        <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="hidden" disabled={contractUploading}
                                          onChange={e => handleContractUpload(e, row.id)} />
                                      </label>
                                      {editForm.admin_contract_url && (
                                        <a href={editForm.admin_contract_url} target="_blank" rel="noopener noreferrer"
                                          className="flex items-center gap-1.5 text-sm text-amber-700 font-medium hover:underline">
                                          📄 צפה בחוזה
                                        </a>
                                      )}
                                    </div>
                                    {editForm.admin_contract_url && <p className="text-xs text-gray-400 mt-1 truncate">{editForm.admin_contract_url}</p>}
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">תזכורת חידוש</label>
                                    <div className="flex items-center gap-2">
                                      <input type="date" value={editForm.admin_reminder_date}
                                        onChange={e => setEditForm((p: any) => ({ ...p, admin_reminder_date: e.target.value }))}
                                        className="flex-1 border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 bg-white" />
                                      <button type="button" onClick={setReminder45} disabled={!editForm.admin_contract_end}
                                        className="px-3 py-2.5 rounded-xl text-xs font-bold border border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap">
                                        🔔 45 יום לפני
                                      </button>
                                    </div>
                                    {editForm.admin_reminder_date && (
                                      <p className="text-xs text-gray-500 mt-1">תזכורת: {new Date(editForm.admin_reminder_date).toLocaleDateString('he-IL')}</p>
                                    )}
                                  </div>
                                </div>

                                {/* הערות */}
                                <div>
                                  <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">הערות</label>
                                  <textarea
                                    value={editForm.admin_notes}
                                    onChange={e => setEditForm((p: any) => ({ ...p, admin_notes: e.target.value }))}
                                    placeholder="הערות פנימיות על הלקוח, ההתקשרות, תנאים מיוחדים..."
                                    rows={3}
                                    className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 bg-white resize-none"
                                  />
                                </div>

                                {/* כפתורים */}
                                <div className="flex items-center gap-3 pt-2 border-t border-amber-100">
                                  <button onClick={() => saveContract(row.id)} disabled={saving}
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #C8960C, #8B6914)' }}>
                                    {saving ? 'שומר...' : '💾 שמור'}
                                  </button>
                                  <button onClick={() => setExpandedId(null)}
                                    className="px-6 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                                    ביטול
                                  </button>
                                  <Link href={`/dashboard/properties/${row.id}/edit`}
                                    className="mr-auto text-xs text-gray-400 hover:text-gray-600 hover:underline">
                                    עריכה מלאה של הנכס ←
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-sm text-gray-300">
                      אין עסקים נוספים
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>
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
  const [adminAvatar, setAdminAvatar] = useState('')
  const [activeTab, setActiveTab] = useState<'overview'|'properties'|'caravans'|'attractions'|'hotels'|'camping'|'users'|'featured'|'financial'>('overview')
  const [users, setUsers] = useState<any[]>([])
  const [contractAlerts, setContractAlerts] = useState<{id:string;name:string;admin_contract_end:string;days:number}[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role, full_name, avatar_url').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/dashboard/owner'); return }
      setAdminName(profile?.full_name || '')
      setAdminAvatar(profile?.avatar_url || '')
      const [{ data: p }, { data: a }, { data: c }] = await Promise.all([
        supabase.from('properties').select('*').order('created_at', { ascending: false }),
        supabase.from('attractions').select('*').order('created_at', { ascending: false }),
        supabase.from('caravans').select('*').order('created_at', { ascending: false }),
      ])
      setProperties(p||[]); setAttractions(a||[]); setCaravans(c||[])

      // בדוק חוזים שמסתיימים תוך 60 יום או עברו את תאריך התזכורת
      const today = new Date()
      const alerts = (p || [])
        .filter((prop: any) => prop.admin_contract_end)
        .map((prop: any) => ({
          id: prop.id,
          name: prop.name,
          admin_contract_end: prop.admin_contract_end,
          days: Math.ceil((new Date(prop.admin_contract_end).getTime() - today.getTime()) / 86400000),
        }))
        .filter((a: any) => a.days <= 60)
        .sort((a: any, b: any) => a.days - b.days)
      setContractAlerts(alerts)
      const { data: usersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (usersData) {
      const { data: props } = await supabase.from('properties').select('owner_id, status, name')
      const { data: caravs } = await supabase.from('caravans').select('owner_id, status, name')
      const { data: attrs } = await supabase.from('attractions').select('owner_id, status, name')
      const allListings = [...(props||[]), ...(caravs||[]), ...(attrs||[])]
      const enriched = usersData.map(u => {
        const myListings = allListings.filter(l => l.owner_id === u.id)
        const status = myListings.some(l => l.status === 'active') ? 'active'
          : myListings.some(l => l.status === 'pending') ? 'pending'
          : 'inactive'
        const listingNames = myListings.map((l: any) => l.name).filter(Boolean)
        return { ...u, status, listings: listingNames }
      })
      setUsers(enriched)
    }
    setLoading(false)
    }
    load()
  }, [])

  const approve = async (table: string, id: string, setter: any) => {
    const today = new Date().toISOString().split('T')[0]
    const update: Record<string, any> = { status: 'active' }
    if (table === 'properties') {
      // בדוק אם כבר יש תאריך הצטרפות — אם לא, קבע היום
      const { data: existing } = await supabase.from('properties').select('admin_join_date').eq('id', id).single()
      if (!existing?.admin_join_date) update.admin_join_date = today
    }
    await supabase.from(table).update(update).eq('id', id)
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
    { key:'users', label:'משתמשים', icon:'👥' },
    { key:'featured', label:'ניהול דף הבית', icon:'✨' },
    { key:'financial', label:'ניהול כספי', icon:'💰' },
  ]

  return (
    <div className="min-h-screen" dir="rtl" style={{ background:'#f8f6f2' }}>

      {/* Contract Alerts Banner */}
      {contractAlerts.length > 0 && (
        <div className="bg-red-600 text-white px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
            <span className="text-base">⚠️</span>
            <span className="font-bold text-sm">התראות חוזים:</span>
            {contractAlerts.map(a => (
              <Link
                key={a.id}
                href={`/dashboard/properties/${a.id}/edit`}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-medium transition-colors"
              >
                {a.name} —{' '}
                {a.days <= 0 ? '⛔ פג!' : a.days === 1 ? 'מחר!' : `עוד ${a.days} ימים`}
              </Link>
            ))}
          </div>
        </div>
      )}

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
            <Link href="/dashboard/admin/leads"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-md"
              style={{ background:'#FDF3DC', color:'#8B6914', border:'1.5px solid #f0c040' }}>
              📩 פניות פרסום
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
                        <Link href={
                            group.table === 'properties'
                              ? `/properties/${(item as any).slug || item.id}?from=dashboard`
                              : `/${group.table}/${(item as any).slug || item.id}?from=dashboard`
                          } target="_blank"
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
          viewPath={(id:string)=>`/attractions/${id}?from=dashboard`}
          reviewsTable="attraction_reviews" reviewsForeignKey="attraction_id"
          priceLabel={(item:Item)=>item.price_per_person?`₪${item.price_per_person}`:'—'}
          typeLabel={(item:Item)=>item.activity_type?.[0]||'—'} />}

        {activeTab==='caravans' && <FullTable title="קרוואנים" items={caravans}
          onApprove={(id:string)=>approve('caravans',id,setCaravans)} onReject={(id:string)=>reject('caravans',id,setCaravans)}
          onDelete={(id:string)=>remove('caravans',id,setCaravans)} editPath={(id:string)=>`/dashboard/caravans/${id}/edit`}
          viewPath={(id:string)=>`/caravans/${id}?from=dashboard`}
          reviewsTable="caravan_reviews" reviewsForeignKey="caravan_id"
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

        {activeTab === 'users' && <UsersTable users={users} />}

        {activeTab === 'featured' && <HomepageFeaturedManager />}

        {activeTab === 'financial' && <FinancialManagement properties={properties} />}

      </main>
    </div>
  )
}
