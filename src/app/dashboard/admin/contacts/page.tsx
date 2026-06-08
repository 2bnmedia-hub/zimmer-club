'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, ArrowRight } from 'lucide-react'

type Contact = {
  id: string
  type: 'email' | 'whatsapp'
  value: string
  label: string
  active: boolean
}

export default function AdminContactsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [newType, setNewType] = useState<'email' | 'whatsapp'>('email')
  const [newValue, setNewValue] = useState('')
  const [newLabel, setNewLabel] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/'); return }
      const { data } = await supabase.from('admin_contacts').select('*').order('created_at')
      setContacts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('admin_contacts').update({ active: !active }).eq('id', id)
    setContacts(prev => prev.map(c => c.id === id ? { ...c, active: !active } : c))
  }

  const deleteContact = async (id: string) => {
    if (!confirm('למחוק?')) return
    await supabase.from('admin_contacts').delete().eq('id', id)
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  const addContact = async () => {
    if (!newValue.trim()) return
    setSaving(true)
    const { data } = await supabase.from('admin_contacts').insert({
      type: newType, value: newValue.trim(), label: newLabel.trim() || newType, active: true,
    }).select().single()
    if (data) {
      setContacts(prev => [...prev, data])
      setNewValue('')
      setNewLabel('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">טוען...</div></div>

  return (
    <div className="min-h-screen bg-gray-50 pt-4" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.push('/dashboard/admin')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowRight className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">ניהול אמצעי תקשורת</h1>
        </div>

        <p className="text-sm text-gray-500 mb-6">פניות מדף "פרסמו אצלנו" יישלחו לכל האמצעים הפעילים למטה.</p>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-3">
          <h2 className="font-bold text-gray-700 mb-4">אמצעים פעילים</h2>
          {contacts.length === 0 && <p className="text-sm text-gray-400">אין אמצעי תקשורת מוגדרים</p>}
          {contacts.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${c.type === 'email' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                {c.type === 'email' ? '📧 אימייל' : '💬 וואטסאפ'}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{c.value}</p>
                {c.label && <p className="text-xs text-gray-400">{c.label}</p>}
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={c.active} onChange={() => toggleActive(c.id, c.active)}
                  className="w-4 h-4 accent-yellow-600" />
                <span className="text-xs text-gray-500">{c.active ? 'פעיל' : 'כבוי'}</span>
              </label>
              <button onClick={() => deleteContact(c.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-700 mb-4">הוסף אמצעי תקשורת</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">סוג</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value as 'email' | 'whatsapp')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600">
                <option value="email">📧 אימייל</option>
                <option value="whatsapp">💬 וואטסאפ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {newType === 'email' ? 'כתובת אימייל' : 'מספר וואטסאפ (עם קידומת מדינה, ללא +)'}
              </label>
              <input value={newValue} onChange={(e) => setNewValue(e.target.value)}
                placeholder={newType === 'email' ? 'admin@example.com' : '972501234567'}
                dir="ltr"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור (אופציונלי)</label>
              <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                placeholder="למשל: אימייל ראשי"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
            </div>
            {success && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-sm text-green-700">נוסף בהצלחה ✅</div>}
            <button onClick={addContact} disabled={saving || !newValue.trim()}
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: '#8B6914' }}>
              <Plus className="w-4 h-4" />
              {saving ? 'מוסיף...' : 'הוסף'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
