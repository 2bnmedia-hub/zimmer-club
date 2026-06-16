'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { IconUser, IconPhone, IconArrowRight, IconEye, IconEyeOff, IconTrash, IconPlus, IconLoader, IconCamera, IconSave, IconAlertCircle, IconCheckCircle, IconZoomIn, IconZoomOut, IconX } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/contexts/ProfileContext'

type Contact = { id: string; type: 'email' | 'whatsapp'; value: string; label: string; active: boolean }
type Profile = { id: string; full_name: string | null; phone: string | null; email: string | null; avatar_url: string | null; role: string | null }

function centerAspectCrop(w: number, h: number, a: number) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, a, w, h), w, h)
}
async function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const sx = image.naturalWidth / image.width, sy = image.naturalHeight / image.height
  canvas.width = crop.width; canvas.height = crop.height
  ctx.drawImage(image, crop.x * sx, crop.y * sy, crop.width * sx, crop.height * sy, 0, 0, crop.width, crop.height)
  return new Promise(res => canvas.toBlob(b => res(b!), 'image/jpeg', 0.95))
}

const inp = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C4956A]/30 focus:border-[#C4956A] transition-all bg-white"

export default function EditProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const { setAvatarUrl, refresh } = useProfile()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [formData, setFormData] = useState({ full_name: '', phone: '', email: '' })
  const [contacts, setContacts] = useState<Contact[]>([])
  const [newType, setNewType] = useState<'email' | 'whatsapp'>('email')
  const [newValue, setNewValue] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [savingContact, setSavingContact] = useState(false)

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const p = data as Profile
    setProfile(p)
    setFormData({ full_name: p?.full_name || '', phone: p?.phone || '', email: p?.email || user.email || '' })
    setAvatarPreview(p?.avatar_url || null)
    const { data: cd } = await supabase.from('admin_contacts').select('*').order('created_at')
    setContacts(cd || [])
    setLoading(false)
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message }); setTimeout(() => setToast(null), 3000)
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setImgSrc(reader.result as string); setScale(1); setCrop(undefined); setCropModalOpen(true) }
    reader.readAsDataURL(file); e.target.value = ''
  }

  async function handleCropSave() {
    if (!completedCrop || !imgRef.current || !profile) return
    setUploadingAvatar(true)
    try {
      const blob = await getCroppedImg(imgRef.current, completedCrop)
      const path = `${profile.id}/avatar.jpg`
      const { error: ue } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (ue) throw ue
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = publicUrl + '?t=' + Date.now()
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id)
      setAvatarPreview(url); setAvatarUrl(url); refresh(); setCropModalOpen(false)
      showToast('success', 'תמונה עודכנה')
    } catch { showToast('error', 'שגיאה בהעלאה') }
    finally { setUploadingAvatar(false) }
  }

  async function handleSave() {
    if (!profile) return
    if (newPassword && newPassword !== confirmPassword) { showToast('error', 'הסיסמאות אינן תואמות'); return }
    if (newPassword && newPassword.length < 6) { showToast('error', 'סיסמה קצרה מדי'); return }
    setSaving(true)
    try {
      await supabase.from('profiles').update({ full_name: formData.full_name, phone: formData.phone, updated_at: new Date().toISOString() }).eq('id', profile.id)
      if (formData.email !== profile.email) await supabase.auth.updateUser({ email: formData.email })
      if (newPassword) { await supabase.auth.updateUser({ password: newPassword }); setNewPassword(''); setConfirmPassword('') }
      showToast('success', 'נשמר בהצלחה!')
    } catch (err: any) { showToast('error', err?.message || 'שגיאה') }
    finally { setSaving(false) }
  }

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
    setSavingContact(true)
    const { data } = await supabase.from('admin_contacts').insert({ type: newType, value: newValue.trim(), label: newLabel.trim() || newType, active: true }).select().single()
    if (data) { setContacts(prev => [...prev, data]); setNewValue(''); setNewLabel(''); showToast('success', 'נוסף') }
    setSavingContact(false)
  }

  const roleLabel: Record<string, string> = { admin: 'מנהל', owner: 'בעל נכס', guest: 'גולש' }
  const roleColor: Record<string, string> = { admin: 'bg-purple-100 text-purple-700', owner: 'bg-amber-100 text-amber-700', guest: 'bg-gray-100 text-gray-500' }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]"><IconLoader className="w-6 h-6 animate-spin text-[#C4956A]" /></div>

  return (
    <div className="min-h-screen bg-[#FAF7F2]" dir="rtl">

      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <IconCheckCircle className="w-4 h-4" /> : <IconAlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {cropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" dir="rtl">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="font-semibold text-sm text-gray-900">עריכת תמונה</h3>
              <button onClick={() => setCropModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full"><IconX className="w-4 h-4" /></button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1.5 rounded-lg bg-gray-100"><IconZoomOut className="w-3.5 h-3.5" /></button>
                <input type="range" min="0.5" max="3" step="0.05" value={scale} onChange={e => setScale(Number(e.target.value))} className="flex-1 accent-[#C4956A]" />
                <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="p-1.5 rounded-lg bg-gray-100"><IconZoomIn className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex justify-center bg-gray-50 rounded-xl overflow-hidden max-h-64">
                <ReactCrop crop={crop} onChange={(_, pct) => setCrop(pct)} onComplete={c => setCompletedCrop(c)} aspect={1} circularCrop minWidth={50}>
                  <img ref={imgRef} src={imgSrc} alt="crop" style={{ transform: `scale(${scale})`, transformOrigin: 'center', maxHeight: '250px' }} onLoad={e => { const { width, height } = e.currentTarget; setCrop(centerAspectCrop(width, height, 1)) }} />
                </ReactCrop>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-3 border-t">
              <button onClick={() => setCropModalOpen(false)} className="flex-1 py-2.5 rounded-xl border text-sm text-gray-600">ביטול</button>
              <button onClick={handleCropSave} disabled={uploadingAvatar || !completedCrop}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #C4956A, #8B5E3C)' }}>
                {uploadingAvatar ? <IconLoader className="w-3.5 h-3.5 animate-spin" /> : <IconSave className="w-3.5 h-3.5" />}
                שמור
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto px-4 py-6">

        <div className="flex items-center gap-3 mb-5">
          <Link href="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <IconArrowRight className="w-4 h-4" />חזרה
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-base font-bold text-gray-900">עריכת פרופיל</h1>
        </div>

        {/* תמונה + שם */}
        <div className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-[#C4956A]/20">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C4956A]/10 to-[#1B5E3B]/10"><IconUser className="w-7 h-7 text-[#C4956A]" /></div>}
              </div>
              <button onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-0.5 -left-0.5 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm text-green-500 hover:text-green-700 transition-colors">
                <IconCamera className="w-3 h-3" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{formData.full_name || 'שם לא הוגדר'}</p>
              <p className="text-xs text-gray-400 truncate mb-1.5">{formData.email}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColor[profile?.role || 'guest']}`}>{roleLabel[profile?.role || 'guest']}</span>
            </div>
          </div>
        </div>

        {/* פרטים אישיים */}
        <div className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">פרטים אישיים</h2>
          <div className="space-y-2.5">
            <div>
              <label className="block text-xs text-gray-500 mb-1">שם מלא</label>
              <input type="text" value={formData.full_name} onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))} placeholder="שם מלא" className={inp} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">טלפון</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="050-0000000" className={inp} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">אימייל</label>
              <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="example@email.com" className={inp} dir="ltr" />
              <p className="text-xs text-gray-400 mt-1">שינוי אימייל ידרוש אימות מחדש</p>
            </div>
          </div>
        </div>

        {/* סיסמה */}
        <div className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">שינוי סיסמה</h2>
          <div className="space-y-2.5">
            <div className="relative">
              <label className="block text-xs text-gray-500 mb-1">סיסמה חדשה</label>
              <input type={showPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="השאר ריק אם אינך רוצה לשנות" className={inp + ' pl-9'} dir="ltr" />
              <button type="button" onClick={() => setShowPass(s => !s)} className="absolute left-2.5 bottom-2.5 text-gray-400">
                {showPass ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
              </button>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">אימות סיסמה</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="הכנס שוב"
                className={inp + (confirmPassword && newPassword !== confirmPassword ? ' border-red-300' : '')} dir="ltr" />
              {confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-red-500 mt-1">הסיסמאות אינן תואמות</p>}
            </div>
          </div>
        </div>

        {/* אמצעי תקשורת — מנהל בלבד */}
        {profile?.role === 'admin' && (
          <div className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">אמצעי תקשורת</h2>
            <p className="text-xs text-gray-400 mb-3">פניות מ"פרסמו אצלנו" יישלחו לאמצעים הפעילים</p>
            <div className="space-y-2 mb-3">
              {contacts.length === 0 && <p className="text-xs text-gray-400">אין אמצעי תקשורת</p>}
              {contacts.map(c => (
                <div key={c.id} className="flex items-center gap-2 p-2.5 border border-gray-100 rounded-xl">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg shrink-0 ${c.type === 'email' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                    {c.type === 'email' ? '📧' : '💬'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{c.value}</p>
                    {c.label && <p className="text-xs text-gray-400">{c.label}</p>}
                  </div>
                  <label className="flex items-center gap-1 cursor-pointer shrink-0">
                    <input type="checkbox" checked={c.active} onChange={() => toggleActive(c.id, c.active)} className="w-3.5 h-3.5 accent-yellow-600" />
                    <span className="text-xs text-gray-400">{c.active ? 'פעיל' : 'כבוי'}</span>
                  </label>
                  <button onClick={() => deleteContact(c.id)} className="p-1 text-red-400 hover:text-red-600 shrink-0">
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <select value={newType} onChange={e => setNewType(e.target.value as 'email' | 'whatsapp')} className={inp}>
                  <option value="email">📧 אימייל</option>
                  <option value="whatsapp">💬 וואטסאפ</option>
                </select>
                <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="תיאור" className={inp} />
              </div>
              <div className="flex gap-2">
                <input value={newValue} onChange={e => setNewValue(e.target.value)}
                  placeholder={newType === 'email' ? 'admin@example.com' : '972501234567'}
                  dir="ltr" className={inp + ' flex-1'} />
                <button onClick={addContact} disabled={savingContact || !newValue.trim()}
                  className="px-3 py-2 rounded-xl text-white text-sm font-bold flex items-center gap-1 disabled:opacity-50 shrink-0"
                  style={{ background: 'linear-gradient(135deg, #C4956A, #8B5E3C)' }}>
                  <IconPlus className="w-3.5 h-3.5" />{savingContact ? '...' : 'הוסף'}
                </button>
              </div>
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #C4956A, #8B5E3C)' }}>
          {saving ? <IconLoader className="w-4 h-4 animate-spin" /> : <IconSave className="w-4 h-4" />}
          {saving ? 'שומר...' : 'שמור שינויים'}
        </button>

      </div>
    </div>
  )
}
