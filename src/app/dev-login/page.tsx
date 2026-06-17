'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DevLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === 'zimmer2024') {
      document.cookie = 'dev-auth=zimmer2024; path=/; max-age=86400'
      router.push('/')
    } else {
      setError(true)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2C1A08 0%, #4A2E10 40%, #6B3D14 100%)', fontFamily: 'Heebo, sans-serif' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F5EDD6', marginBottom: 8 }}>zimmer.club</h1>
        <p style={{ fontSize: 14, color: 'rgba(245,237,214,0.5)', marginBottom: 32 }}>האתר בפיתוח — כניסה לצוות בלבד</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false) }}
            dir="rtl"
            style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: error ? '1px solid #E24B4A' : '1px solid rgba(201,168,76,0.3)', background: 'rgba(255,255,255,0.08)', color: '#F5EDD6', fontSize: 16, marginBottom: 12, outline: 'none', textAlign: 'right', boxSizing: 'border-box' }}
          />
          {error && <p style={{ color: '#E24B4A', fontSize: 13, marginBottom: 12 }}>סיסמה שגויה, נסה שוב</p>}
          <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#8B6914', border: 'none', color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
            כניסה
          </button>
        </form>
      </div>
    </main>
  )
}
