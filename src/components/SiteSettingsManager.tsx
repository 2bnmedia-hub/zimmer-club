'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IconSettings, IconHome } from '@/components/icons'

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className="relative inline-flex items-center shrink-0 transition-colors"
      style={{
        width: 52, height: 30, borderRadius: 999,
        background: checked ? 'linear-gradient(135deg, #C8960C, #8B6914)' : '#e5e7eb',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span
        className="inline-block rounded-full bg-white transition-transform"
        style={{
          width: 24, height: 24,
          transform: checked ? 'translateX(-24px)' : 'translateX(-2px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  )
}

export function SiteSettingsManager() {
  const supabase = createClient()
  const [zimiEnabled, setZimiEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('site_settings').select('zimi_enabled').eq('id', 1).single()
      setZimiEnabled(!!data?.zimi_enabled)
      setLoading(false)
    }
    load()
  }, [])

  async function toggleZimi() {
    const next = !zimiEnabled
    setSaving(true)
    setMsg('')
    const { error } = await supabase.from('site_settings').update({ zimi_enabled: next, updated_at: new Date().toISOString() }).eq('id', 1)
    if (!error) {
      setZimiEnabled(next)
      setMsg('נשמר ✓')
      setTimeout(() => setMsg(''), 2000)
    } else {
      setMsg('שגיאה בשמירה')
    }
    setSaving(false)
  }

  if (loading) return <div className="text-sm text-gray-400 py-4">טוען הגדרות...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#111827' }}><IconSettings size={22} /> הגדרות האתר</h2>
        {msg && <span className="text-sm font-bold px-4 py-2 rounded-full" style={{ background: '#f0fdf4', color: '#16a34a' }}>{msg}</span>}
      </div>

      <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1.5px solid #f0ece4', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <IconHome size={30} />
            <div>
              <p className="font-bold text-base" style={{ color: '#111827' }}>זימי — עוזר ה-AI באתר</p>
              <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                הפעלה/כיבוי של הווידג&apos;ט הצף שמופיע לגולשים בכל האתר ומאפשר להם לחפש נופש בעזרת צ&apos;אט AI.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {saving && <span className="text-sm text-gray-400">שומר...</span>}
            <Toggle checked={zimiEnabled} onChange={toggleZimi} disabled={saving} />
          </div>
        </div>
      </div>
    </div>
  )
}
