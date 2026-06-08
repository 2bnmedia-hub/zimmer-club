'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Phone, Mail, Camera, Save, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  email: string | null
  avatar_url: string | null
  role: string | null
}

export default function EditProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
  })

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const p = data as Profile
    setProfile(p)
    setFormData({
      full_name: p?.full_name || '',
      phone: p?.phone || '',
      email: p?.email || user.email || '',
    })
    setAvatarPreview(p?.avatar_url || null)
    setLoading(false)
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${profile.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
      showToast('success', 'תמונת הפרופיל עודכנה')
    } catch {
      showToast('error', 'שגיאה בהעלאת התמונה')
      setAvatarPreview(profile.avatar_url)
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSave() {
    if (!profile) return

    if (newPassword && newPassword !== confirmPassword) {
      showToast('error', 'הסיסמאות אינן תואמות')
      return
    }
    if (newPassword && newPassword.length < 6) {
      showToast('error', 'הסיסמה חייבת להכיל לפחות 6 תווים')
      return
    }

    setSaving(true)
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (profileError) throw profileError

      if (formData.email !== profile.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: formData.email })
        if (emailError) throw emailError
      }

      if (newPassword) {
        const { error: passError } = await supabase.auth.updateUser({ password: newPassword })
        if (passError) throw passError
        setNewPassword('')
        setConfirmPassword('')
      }

      showToast('success', 'הפרופיל עודכן בהצלחה!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'שגיאה בשמירת הפרטים'
      showToast('error', msg)
    } finally {
      setSaving(false)
    }
  }

  const roleLabel: Record<string, string> = {
    admin: 'מנהל מערכת',
    owner: 'בעל נכס',
    guest: 'גולש',
  }

  const roleColor: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    owner: 'bg-amber-100 text-amber-700',
    guest: 'bg-gray-100 text-gray-600',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C4956A]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]" dir="rtl">

      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium
          ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-10">

        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors">
          <ArrowRight className="w-4 h-4" />
          חזרה לדף הבית
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">עריכת פרופיל</h1>

        {/* Avatar */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-5">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-[#C4956A]/30">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C4956A]/20 to-[#1B5E3B]/20">
                    <User className="w-10 h-10 text-[#C4956A]" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 left-0 w-8 h-8 bg-[#C4956A] hover:bg-[#8B5E3C] text-white rounded-full flex items-center justify-center shadow-md transition-colors"
              >
                {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{formData.full_name || 'שם לא הוגדר'}</p>
              <p className="text-sm text-gray-500 mb-2">{formData.email}</p>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${roleColor[profile?.role || 'guest']}`}>
                {roleLabel[profile?.role || 'guest']}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">לחץ על סמל המצלמה להעלאת תמונת פרופיל (JPG, PNG עד 5MB)</p>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-5">
          <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-4 h-4 text-[#C4956A]" />
            פרטים אישיים
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">שם מלא</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
                placeholder="הכנס את שמך המלא"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C4956A]/30 focus:border-[#C4956A] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />טלפון
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                placeholder="050-0000000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C4956A]/30 focus:border-[#C4956A] transition-all"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />אימייל
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C4956A]/30 focus:border-[#C4956A] transition-all"
                dir="ltr"
              />
              <p className="text-xs text-gray-400 mt-1">שינוי אימייל ידרוש אימות מחדש</p>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-6">שינוי סיסמה</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">סיסמה חדשה</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="השאר ריק אם אינך רוצה לשנות"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C4956A]/30 focus:border-[#C4956A] transition-all"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">אימות סיסמה</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="הכנס שוב את הסיסמה החדשה"
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all
                  ${confirmPassword && newPassword !== confirmPassword
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-[#C4956A]/30 focus:border-[#C4956A]'}`}
                dir="ltr"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">הסיסמאות אינן תואמות</p>
              )}
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #C4956A, #8B5E3C)' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'שומר...' : 'שמור שינויים'}
        </button>
      </div>
    </div>
  )
}
