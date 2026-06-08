'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { User, Phone, Mail, Camera, Save, ArrowRight, CheckCircle, AlertCircle, Loader2, ZoomIn, ZoomOut, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/contexts/ProfileContext'

type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  email: string | null
  avatar_url: string | null
  role: string | null
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth, mediaHeight,
  )
}

async function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  canvas.width = crop.width
  canvas.height = crop.height
  ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height)
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95))
}

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
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [formData, setFormData] = useState({ full_name: '', phone: '', email: '' })

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const p = data as Profile
    setProfile(p)
    setFormData({ full_name: p?.full_name || '', phone: p?.phone || '', email: p?.email || user.email || '' })
    setAvatarPreview(p?.avatar_url || null)
    setLoading(false)
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setImgSrc(reader.result as string); setScale(1); setCrop(undefined); setCropModalOpen(true) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 1))
  }

  async function handleCropSave() {
    if (!completedCrop || !imgRef.current || !profile) return
    setUploadingAvatar(true)
    try {
      const blob = await getCroppedImg(imgRef.current, completedCrop)
      const path = `${profile.id}/avatar.jpg`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const urlWithCache = publicUrl + '?t=' + Date.now()
      await supabase.from('profiles').update({ avatar_url: urlWithCache }).eq('id', profile.id)
      setAvatarPreview(urlWithCache)
      setAvatarUrl(urlWithCache)   // עדכון מיידי ב-Navbar
      refresh()                     // רענון ה-Navbar
      setCropModalOpen(false)
      showToast('success', 'תמונת הפרופיל עודכנה')
    } catch {
      showToast('error', 'שגיאה בהעלאת התמונה')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSave() {
    if (!profile) return
    if (newPassword && newPassword !== confirmPassword) { showToast('error', 'הסיסמאות אינן תואמות'); return }
    if (newPassword && newPassword.length < 6) { showToast('error', 'הסיסמה חייבת להכיל לפחות 6 תווים'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({ full_name: formData.full_name, phone: formData.phone, updated_at: new Date().toISOString() }).eq('id', profile.id)
      if (error) throw error
      if (formData.email !== profile.email) { const { error: e } = await supabase.auth.updateUser({ email: formData.email }); if (e) throw e }
      if (newPassword) { const { error: e } = await supabase.auth.updateUser({ password: newPassword }); if (e) throw e; setNewPassword(''); setConfirmPassword('') }
      showToast('success', 'הפרופיל עודכן בהצלחה!')
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'שגיאה בשמירת הפרטים')
    } finally {
      setSaving(false)
    }
  }

  const roleLabel: Record<string, string> = { admin: 'מנהל מערכת', owner: 'בעל נכס', guest: 'גולש' }
  const roleColor: Record<string, string> = { admin: 'bg-purple-100 text-purple-700', owner: 'bg-amber-100 text-amber-700', guest: 'bg-gray-100 text-gray-600' }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]"><Loader2 className="w-8 h-8 animate-spin text-[#C4956A]" /></div>

  return (
    <div className="min-h-screen bg-[#FAF7F2]" dir="rtl">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {cropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" dir="rtl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">עריכת תמונת פרופיל</h3>
              <button onClick={() => setCropModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs text-gray-500">זום:</span>
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"><ZoomOut className="w-4 h-4 text-gray-600" /></button>
                <input type="range" min="0.5" max="3" step="0.05" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="flex-1 accent-[#C4956A]" />
                <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"><ZoomIn className="w-4 h-4 text-gray-600" /></button>
                <span className="text-xs text-gray-500 w-10 text-center">{Math.round(scale * 100)}%</span>
              </div>
              <div className="flex justify-center bg-gray-50 rounded-2xl overflow-hidden max-h-80">
                <ReactCrop crop={crop} onChange={(_, pct) => setCrop(pct)} onComplete={(c) => setCompletedCrop(c)} aspect={1} circularCrop minWidth={50}>
                  <img ref={imgRef} src={imgSrc} alt="crop" style={{ transform: `scale(${scale})`, transformOrigin: 'center', maxHeight: '300px' }} onLoad={onImageLoad} />
                </ReactCrop>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">גרור את המסגרת לבחירת אזור התמונה</p>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setCropModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">ביטול</button>
              <button onClick={handleCropSave} disabled={uploadingAvatar || !completedCrop}
                className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #C4956A, #8B5E3C)' }}>
                {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {uploadingAvatar ? 'שומר...' : 'שמור תמונה'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors">
          <ArrowRight className="w-4 h-4" />חזרה לדף הבית
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">עריכת פרופיל</h1>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-5">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-[#C4956A]/30">
                {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C4956A]/20 to-[#1B5E3B]/20"><User className="w-10 h-10 text-[#C4956A]" /></div>}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 left-0 w-8 h-8 bg-[#C4956A] hover:bg-[#8B5E3C] text-white rounded-full flex items-center justify-center shadow-md transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{formData.full_name || 'שם לא הוגדר'}</p>
              <p className="text-sm text-gray-500 mb-2">{formData.email}</p>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${roleColor[profile?.role || 'guest']}`}>{roleLabel[profile?.role || 'guest']}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">לחץ על סמל המצלמה להעלאת תמונת פרופיל (JPG, PNG עד 5MB)</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-5">
          <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2"><User className="w-4 h-4 text-[#C4956A]" />פרטים אישיים</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">שם מלא</label>
              <input type="text" value={formData.full_name} onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))} placeholder="הכנס את שמך המלא" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C4956A]/30 focus:border-[#C4956A] transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">טלפון</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="050-0000000" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C4956A]/30 focus:border-[#C4956A] transition-all" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">אימייל</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="example@email.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C4956A]/30 focus:border-[#C4956A] transition-all" dir="ltr" />
              <p className="text-xs text-gray-400 mt-1">שינוי אימייל ידרוש אימות מחדש</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-6">שינוי סיסמה</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">סיסמה חדשה</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="השאר ריק אם אינך רוצה לשנות" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C4956A]/30 focus:border-[#C4956A] transition-all" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">אימות סיסמה</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="הכנס שוב את הסיסמה החדשה"
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${confirmPassword && newPassword !== confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#C4956A]/30 focus:border-[#C4956A]'}`} dir="ltr" />
              {confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-red-500 mt-1">הסיסמאות אינן תואמות</p>}
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #C4956A, #8B5E3C)' }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'שומר...' : 'שמור שינויים'}
        </button>
      </div>
    </div>
  )
}
