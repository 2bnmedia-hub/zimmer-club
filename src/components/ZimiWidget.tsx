'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Mic, Square } from 'lucide-react'
import { ZimiCharacter } from './ZimiCharacter'
import type { SearchResult } from '@/app/api/chat/route'

type Msg = { role: 'user' | 'assistant'; content: string; results?: SearchResult[] }
type ZimiState = 'idle' | 'wave' | 'talk' | 'listen'
type Gender = 'male' | 'female'

function ResultCard({ r, onClose }: { r: SearchResult; onClose: () => void }) {
  const href = `/${r.type === 'property' ? 'properties' : r.type === 'caravan' ? 'caravans' : 'attractions'}/${r.slug}`
  return (
    <a
      href={href}
      onClick={onClose}
      className="zimi-card"
      style={{
        display: 'flex', gap: 10, alignItems: 'center',
        padding: '8px 10px', borderRadius: 12,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(200,150,12,0.22)',
        textDecoration: 'none', cursor: 'pointer',
      }}
    >
      {r.image ? (
        <img src={r.image} alt={r.name} style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 52, height: 52, borderRadius: 8, background: 'rgba(200,150,12,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🏡</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#FDE68A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
        <div style={{ fontSize: 11, color: 'rgba(245,208,120,0.55)', marginTop: 2 }}>{r.city}{r.region && r.region !== r.city ? ` · ${r.region}` : ''}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, alignItems: 'center' }}>
          {r.price_per_night > 0 && (
            <span style={{ fontSize: 12, color: '#F5D078', fontWeight: 700 }}>₪{r.price_per_night.toLocaleString()} / לילה</span>
          )}
          {r.avg_rating > 0 && (
            <span style={{ fontSize: 11, color: 'rgba(245,208,120,0.7)' }}>⭐ {Number(r.avg_rating).toFixed(1)}</span>
          )}
        </div>
      </div>
    </a>
  )
}

/* ─── Big centered mic button ─── */
function BigMic({ recording, loading, onClick }: { recording: boolean; loading: boolean; onClick: () => void }) {
  const color = recording ? '#ef4444' : '#C8960C'
  const bg = recording
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    : 'linear-gradient(135deg, #8B6914 0%, #C8960C 50%, #F5D078 100%)'

  return (
    <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {/* Sonar rings */}
      {(recording || !loading) && <>
        <div className={recording ? 'sonar1' : 'breathe1'} style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `2px solid ${color}`, opacity: recording ? 0.5 : 0.2,
        }} />
        <div className={recording ? 'sonar2' : 'breathe2'} style={{
          position: 'absolute', inset: 12, borderRadius: '50%',
          border: `2px solid ${color}`, opacity: recording ? 0.35 : 0.15,
        }} />
      </>}
      {/* Loading ring */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 8, borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: '#C8960C', borderRightColor: '#F5D078',
          animation: 'spin 1s linear infinite',
        }} />
      )}
      {/* Main button */}
      <button
        onClick={onClick}
        disabled={loading}
        aria-label={recording ? 'עצרי הקלטה' : 'התחילי הקלטה'}
        style={{
          width: 100, height: 100, borderRadius: '50%',
          background: loading ? 'linear-gradient(135deg, #e5e7eb, #d1d5db)' : bg,
          border: 'none', cursor: loading ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: recording
            ? '0 0 0 0 rgba(239,68,68,0.4), 0 12px 40px rgba(239,68,68,0.45)'
            : '0 12px 40px rgba(200,150,12,0.5), 0 4px 16px rgba(200,150,12,0.3)',
          animation: recording ? 'recGlow 1.2s ease-out infinite' : 'none',
          transition: 'background 0.3s, box-shadow 0.3s',
          position: 'relative', zIndex: 1,
        }}
      >
        {loading
          ? <span style={{ fontSize: 32 }}>🏡</span>
          : recording
            ? <Square size={34} color="#fff" fill="#fff" />
            : <Mic size={38} color="#fff" strokeWidth={1.8} />
        }
      </button>
    </div>
  )
}

export default function ZimiWidget() {
  const [open, setOpen] = useState(false)
  const [shown, setShown] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [state, setState] = useState<ZimiState>('wave')
  const [gender, setGender] = useState<Gender>('male')
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'שלום! אני זימי 🏡 עוזר ה-AI של zimmer.club — שאל אותי הכל על נופש בישראל!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [pos, setPos] = useState({ x: 24, y: 24 })
  const dragging = useRef(false)
  const recRef = useRef<any>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const didDrag = useRef(false)
  const widgetRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setDismissed(true)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setShown(true)
      setState('wave')
      setTimeout(() => setState('idle'), 4000)
    }, 2000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  /* drag */
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true; didDrag.current = false
    const rect = widgetRef.current!.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging.current || !widgetRef.current) return
      didDrag.current = true
      const w = widgetRef.current.offsetWidth, h = widgetRef.current.offsetHeight
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - w, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - h, window.innerHeight - (e.clientY - dragOffset.current.y) - h)),
      })
    }
    const up = () => { dragging.current = false }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    dragging.current = true; didDrag.current = false
    const t = e.touches[0], rect = widgetRef.current!.getBoundingClientRect()
    dragOffset.current = { x: t.clientX - rect.left, y: t.clientY - rect.top }
  }, [])

  function handleOpen() { setOpen(true); setState('talk') }
  function handleClose() { setOpen(false); setState('wave'); setTimeout(() => setState('idle'), 2500) }

  /* voice */
  function startRecording() {
    const SR = (typeof window !== 'undefined') && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    if (!SR) return
    const rec = new SR()
    rec.lang = 'he-IL'; rec.continuous = false; rec.interimResults = false
    recRef.current = rec
    rec.onstart = () => setRecording(true)
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript
      setRecording(false)
      sendText(text)
    }
    rec.onerror = () => setRecording(false)
    rec.onend = () => setRecording(false)
    rec.start()
  }
  function stopRecording() { recRef.current?.stop(); setRecording(false) }
  function toggleMic() { recording ? stopRecording() : startRecording() }

  const hasSpeechSupport = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  /* send */
  async function sendText(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Msg = { role: 'user', content: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true); setState('talk')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg], gender }),
      })
      const data = await res.json()
      if (data.detectedGender) setGender(data.detectedGender)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        results: data.results,
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'שגיאה — נסה שוב 😊' }])
    }
    setLoading(false); setState('idle')
  }

  async function send() { await sendText(input) }

  if (!shown) return null

  return (
    <>
      <style>{`
        /* Widget animations */
        @keyframes pulse       { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        @keyframes spin        { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes bubblePop   { 0%{transform:scale(0.8);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        @keyframes dotPulse    { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes widgetRise  { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes overlayIn   { from{opacity:0} to{opacity:1} }
        @keyframes panelUp     { from{transform:translateY(40px) scale(0.96);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
        @keyframes recGlow     { 0%{box-shadow:0 0 0 0 rgba(239,68,68,0.5),0 12px 40px rgba(239,68,68,0.45)} 70%{box-shadow:0 0 0 18px rgba(239,68,68,0),0 12px 40px rgba(239,68,68,0.45)} 100%{box-shadow:0 0 0 0 rgba(239,68,68,0),0 12px 40px rgba(239,68,68,0.45)} }
        @keyframes sonarOut    { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(1.45);opacity:0} }
        @keyframes breatheRing { 0%,100%{transform:scale(1);opacity:0.2} 50%{transform:scale(1.06);opacity:0.08} }
        .sonar1  { animation: sonarOut 1.6s ease-out infinite; }
        .sonar2  { animation: sonarOut 1.6s ease-out infinite 0.5s; }
        .breathe1{ animation: breatheRing 3s ease-in-out infinite; }
        .breathe2{ animation: breatheRing 3s ease-in-out infinite 1s; }
        .zimi-rise { animation: widgetRise 0.5s ease forwards; }
        .zimi-pop  { animation: bubblePop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .dot1 { animation: dotPulse 1.2s ease-in-out infinite 0s; }
        .dot2 { animation: dotPulse 1.2s ease-in-out infinite 0.2s; }
        .dot3 { animation: dotPulse 1.2s ease-in-out infinite 0.4s; }
        .zimi-input:focus { border-color: #C8960C !important; box-shadow: 0 0 0 3px rgba(200,150,12,0.2); }
        .zimi-drag { cursor: grab; user-select: none; }
        .zimi-drag:active { cursor: grabbing; }
        .zimi-overlay { animation: overlayIn 0.25s ease forwards; }
        .zimi-panel  { animation: panelUp 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .msg-scroll::-webkit-scrollbar { width: 4px; }
        .msg-scroll::-webkit-scrollbar-thumb { background: rgba(200,150,12,0.25); border-radius: 4px; }
        .chip-btn:hover { background: #FEF3C7 !important; }
        .zimi-card:hover { background: rgba(255,255,255,0.1) !important; border-color: rgba(200,150,12,0.45) !important; }

        /* ZimiCharacter animations */
        @keyframes zc-float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes zc-nod      { 0%,100%{transform:translateY(0) rotate(0deg)} 30%{transform:translateY(-3px) rotate(-1deg)} 70%{transform:translateY(2px) rotate(0.8deg)} }
        @keyframes zc-blink-kf { 0%,82%,100%{opacity:0} 86%,96%{opacity:1} }
        .zc-float    { animation: zc-float 4s ease-in-out infinite; }
        .zc-nod      { animation: zc-nod   0.7s ease-in-out infinite; }
        .zc-blink-lid{ animation: zc-blink-kf 6s ease-in-out infinite 1s; opacity: 0; }
      `}</style>

      {/* ───────── DISMISSED: small pill ───────── */}
      {dismissed && (
        <button
          ref={widgetRef as any}
          onMouseDown={isMobile ? undefined : onMouseDown}
          onTouchStart={isMobile ? undefined : onTouchStart}
          onClick={() => { if (!didDrag.current) { setDismissed(false); if (!isMobile) return; handleOpen() } }}
          aria-label="פתחי את זימי"
          style={{
            position: 'fixed',
            bottom: isMobile ? 20 : pos.y,
            ...(isMobile ? { right: 16 } : { left: pos.x }),
            zIndex: 9999,
            width: isMobile ? 52 : 58,
            height: isMobile ? 52 : 58,
            borderRadius: '50%', border: '2.5px solid #C8960C',
            background: 'linear-gradient(135deg, #FFF8E7, #FEF3C7)',
            cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isMobile ? 24 : 28,
            boxShadow: '0 4px 16px rgba(200,150,12,0.35)',
            touchAction: isMobile ? 'auto' : 'none',
          }}
        >🏡</button>
      )}

      {/* ───────── CLOSED: floating character (desktop only) ───────── */}
      {!dismissed && !open && !isMobile && (
        <div
          ref={widgetRef}
          className="zimi-rise"
          style={{ position: 'fixed', bottom: pos.y, left: pos.x, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 190 }}
        >
          {/* Speech bubble */}
          <div className="zimi-pop" onClick={handleOpen} style={{ cursor: 'pointer', position: 'relative', width: '100%' }}>
            <svg width="190" height="60" viewBox="0 0 190 60" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="zw-bub" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFBEB"/><stop offset="100%" stopColor="#FEF3C7"/>
                </linearGradient>
                <filter id="zw-shadow" x="-10%" y="-10%" width="130%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(200,150,12,0.25)"/>
                </filter>
              </defs>
              <path d="M12,3 Q3,3 3,12 L3,38 Q3,47 12,47 L60,47 Q68,58 80,60 Q88,58 88,47 L178,47 Q187,47 187,38 L187,12 Q187,3 178,3 Z"
                fill="url(#zw-bub)" stroke="#C8960C" strokeWidth="1.4" filter="url(#zw-shadow)"/>
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 14, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 14px', direction: 'rtl' }}>
              <strong style={{ fontSize: 12, color: '#5C3A00', marginBottom: 2 }}>היי! אני זימי ✨</strong>
              <span style={{ fontSize: 10.5, color: '#8B6914', lineHeight: 1.5 }}>מחפשים נופש? אני אמצא לכם!</span>
            </div>
            <button onClick={e => { e.stopPropagation(); setDismissed(true) }} aria-label="סגרי" style={{
              position: 'absolute', top: -6, left: -6, width: 22, height: 22, borderRadius: '50%',
              border: '1.5px solid #C8960C', background: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)', padding: 0,
            }}><X size={12} color="#8B6914" /></button>
          </div>
          {/* Character card */}
          <div
            className="zimi-drag"
            onMouseDown={onMouseDown} onTouchStart={onTouchStart} onClick={handleOpen}
            style={{
              background: 'linear-gradient(180deg, #FFF8E7 0%, #FFFBF0 100%)',
              borderRadius: 22,
              boxShadow: '0 -4px 20px rgba(200,150,12,0.18), 0 4px 16px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              position: 'relative', cursor: 'grab', overflow: 'hidden',
              border: '1.5px solid rgba(200,150,12,0.28)', touchAction: 'none',
              width: 190, height: 200,
            }}
          >
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>
              <ZimiCharacter state={state} size={190} />
            </div>
            <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.85)', borderRadius: 8, padding: '3px 7px', fontSize: 10, color: '#8B6914', display: 'flex', alignItems: 'center', gap: 3, backdropFilter: 'blur(4px)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <svg width="9" height="9" viewBox="0 0 9 9" fill="#C8960C"><circle cx="2" cy="2" r="1.1"/><circle cx="7" cy="2" r="1.1"/><circle cx="2" cy="7" r="1.1"/><circle cx="7" cy="7" r="1.1"/></svg>
              גרור
            </div>
          </div>
        </div>
      )}

      {/* ───────── OPEN: full-screen overlay ───────── */}
      {open && (
        <div
          className="zimi-overlay"
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(8, 4, 0, 0.72)',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: isMobile ? '0' : '20px 16px',
          }}
        >
          <div
            className="zimi-panel"
            role="dialog"
            aria-modal="true"
            aria-label="זימי — עוזר AI של zimmer.club"
            style={{
              width: '100%', maxWidth: isMobile ? '100%' : 480,
              background: 'linear-gradient(180deg, #1a0f00 0%, #0d0800 100%)',
              borderRadius: isMobile ? '24px 24px 0 0' : 32,
              border: '1px solid rgba(200,150,12,0.25)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,150,12,0.1)',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              maxHeight: isMobile ? '85vh' : '90vh',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '18px 20px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid rgba(200,150,12,0.12)',
              background: 'linear-gradient(135deg, rgba(139,105,20,0.3), rgba(200,150,12,0.15))',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', border: '1.5px solid rgba(200,150,12,0.35)', overflow: 'hidden', boxShadow: '0 4px 12px rgba(200,150,12,0.35)', flexShrink: 0, background: '#C8A870' }}>
                  <img src="/luci.png" alt="זימי" style={{ width: '230%', height: '230%', objectFit: 'cover', objectPosition: '48% 18%', display: 'block', marginLeft: '-65%', marginTop: '-8%' }} draggable={false} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#F5D078', letterSpacing: '-0.3px' }}>זימי</div>
                  <div style={{ fontSize: 11, color: 'rgba(245,208,120,0.6)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
                    עוזרת zimmer.club
                  </div>
                </div>
              </div>
              <button onClick={handleClose} aria-label="סגור שיחה" style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer', borderRadius: '50%', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={16} color="rgba(255,255,255,0.7)" aria-hidden="true" /></button>
            </div>

            {/* Messages */}
            <div
              className="msg-scroll"
              style={{
                overflowY: 'auto', padding: '16px 18px 8px',
                display: 'flex', flexDirection: 'column', gap: 10,
                flexGrow: 1, minHeight: 0, direction: 'rtl',
              }}
            >
              {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-start' : 'flex-end', maxWidth: '88%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{
                    background: m.role === 'user'
                      ? 'rgba(255,255,255,0.08)'
                      : 'linear-gradient(135deg, rgba(200,150,12,0.25), rgba(139,105,20,0.2))',
                    border: m.role === 'user'
                      ? '1px solid rgba(255,255,255,0.08)'
                      : '1px solid rgba(200,150,12,0.3)',
                    borderRadius: m.role === 'user' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                    padding: '10px 14px', fontSize: 14, lineHeight: 1.65,
                    color: m.role === 'user' ? 'rgba(255,255,255,0.85)' : '#FDE68A',
                  }}>{m.content}</div>
                  {m.results && m.results.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                      {m.results.map(r => <ResultCard key={r.id} r={r} onClose={handleClose} />)}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-end', background: 'rgba(200,150,12,0.15)', border: '1px solid rgba(200,150,12,0.25)', borderRadius: '18px 18px 4px 18px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span className="dot1" style={{ width: 7, height: 7, borderRadius: '50%', background: '#C8960C', display: 'inline-block' }} />
                  <span className="dot2" style={{ width: 7, height: 7, borderRadius: '50%', background: '#C8960C', display: 'inline-block' }} />
                  <span className="dot3" style={{ width: 7, height: 7, borderRadius: '50%', background: '#C8960C', display: 'inline-block' }} />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick suggestions */}
            {messages.length <= 1 && (
              <div style={{ padding: '0 18px 4px', display: 'flex', gap: 6, flexWrap: 'wrap', direction: 'rtl', flexShrink: 0 }}>
                {['צימר בגליל', 'וילה עם בריכה', 'גלמפינג בנגב', 'נופש רומנטי'].map(s => (
                  <button key={s} className="chip-btn" onClick={() => sendText(s)} style={{
                    fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 20,
                    border: '1px solid rgba(200,150,12,0.4)', background: 'transparent',
                    color: '#F5D078', cursor: 'pointer', transition: 'all 0.15s',
                  }}>{s}</button>
                ))}
              </div>
            )}

            {/* ── MIC CENTER ── */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '20px 0 16px', flexShrink: 0,
            }}>
              {hasSpeechSupport && (
                <BigMic recording={recording} loading={loading} onClick={toggleMic} />
              )}
              <p style={{
                marginTop: 12, fontSize: 13, fontWeight: 600,
                color: recording ? '#fca5a5' : loading ? '#F5D078' : 'rgba(245,208,120,0.6)',
                letterSpacing: '0.02em', transition: 'color 0.3s',
              }}>
                {loading
                  ? gender === 'female' ? 'חושבת...' : 'חושב...'
                  : recording
                    ? gender === 'female' ? '🎙 מקשיבה — לחצי לסיום' : '🎙 מקשיב — לחץ לסיום'
                    : 'לחץ למיקרופון'}
              </p>
            </div>

            {/* Text input row */}
            <div style={{
              padding: '10px 16px 20px', borderTop: '1px solid rgba(200,150,12,0.1)',
              display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0,
              background: 'rgba(0,0,0,0.2)',
            }}>
              <button onClick={send} disabled={loading || recording || !input.trim()} style={{
                background: !input.trim() || loading || recording
                  ? 'rgba(200,150,12,0.2)'
                  : 'linear-gradient(135deg, #8B6914, #C8960C)',
                border: 'none', borderRadius: 14, width: 42, height: 42,
                cursor: !input.trim() || loading || recording ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, boxShadow: input.trim() ? '0 4px 14px rgba(200,150,12,0.4)' : 'none',
                transition: 'all 0.2s',
              }}>
                <Send size={17} color={input.trim() && !loading && !recording ? '#fff' : 'rgba(200,150,12,0.5)'} />
              </button>
              <input
                className="zimi-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="או הקלידי כאן..."
                disabled={recording || loading}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(200,150,12,0.2)',
                  borderRadius: 14, padding: '11px 14px',
                  fontSize: 14, outline: 'none',
                  fontFamily: 'inherit', direction: 'rtl',
                  color: '#fff',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
