'use client'
import { useState } from 'react'

export default function DevLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    if (password === 'zimmer2024') {
      document.cookie = 'dev-auth=zimmer2024; path=/; max-age=86400'
      window.location.href = '/'
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2C1A08 0%, #4A2E10 40%, #6B3D14 100%)', fontFamily: 'Heebo, sans-serif' }}>
      <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 24, padding: '52px 44px', width: '100%', maxWidth: 420, textAlign: 'center', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 52, marginBottom: 18 }}>🔒</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F5EDD6', marginBottom: 8, letterSpacing: 1 }}>zimmer.club</h1>
        <p style={{ fontSize: 14, color: 'rgba(245,237,214,0.45)', marginBottom: 36 }}>האתר בפיתוח — כניסה לצוות בלבד</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="password"
            placeholder="הזן סיסמה"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false) }}
            dir="rtl"
            autoFocus
            style={{
              width: '100%',
              padding: '15px 18px',
              borderRadius: 14,
              border: error ? '1.5px solid #E24B4A' : '1px solid rgba(201,168,76,0.35)',
              background: 'rgba(255,255,255,0.09)',
              color: '#F5EDD6',
              fontSize: 16,
              outline: 'none',
              textAlign: 'right',
              boxSizing: 'border-box',
              fontFamily: 'Heebo, sans-serif',
            }}
          />
          {error && (
            <p style={{ color: '#E24B4A', fontSize: 13, margin: 0 }}>סיסמה שגויה — נסה שוב</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: 14,
              background: loading || !password ? 'rgba(139,105,20,0.4)' : '#8B6914',
              border: 'none',
              color: 'white',
              fontSize: 16,
              fontWeight: 700,
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              fontFamily: 'Heebo, sans-serif',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'נכנס...' : 'כניסה'}
          </button>
        </form>
      </div>
    </div>
  )
}
