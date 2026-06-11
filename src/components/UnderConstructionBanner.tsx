'use client'
import { useEffect, useState } from 'react'

export function UnderConstructionBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem('wuc-dismissed')
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    sessionStorage.setItem('wuc-dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div id="wuc-overlay" style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes bar-load { 0%{width:0%} 100%{width:72%} }
        @keyframes fade-up { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes flicker {
          0%,100%{opacity:1} 4%{opacity:0.85} 8%{opacity:1} 15%{opacity:0.6} 16%{opacity:1}
          45%{opacity:1} 46%{opacity:0.4} 47%{opacity:1} 65%{opacity:1}
          66%{opacity:0.7} 68%{opacity:1} 80%{opacity:1} 81%{opacity:0.3} 82%{opacity:1}
        }
        .wuc-dot1{animation:pulse-dot 1.4s ease-in-out infinite}
        .wuc-dot2{animation:pulse-dot 1.4s ease-in-out 0.2s infinite}
        .wuc-dot3{animation:pulse-dot 1.4s ease-in-out 0.4s infinite}
        .wuc-bar{animation:bar-load 2s cubic-bezier(.4,0,.2,1) forwards}
        .wuc-card{animation:fade-up 0.5s ease both}
        .wuc-flicker{animation:flicker 3s linear infinite}
      `}</style>

      <div className="wuc-card" dir="rtl" style={{ background:'#0D0D0D', borderRadius:16, padding:'2.5rem 2rem', maxWidth:480, width:'100%', textAlign:'center' }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:'2rem' }}>
          <span className="wuc-dot1" style={{ width:8, height:8, borderRadius:'50%', background:'#C8960C', display:'inline-block' }} />
          <span className="wuc-dot2" style={{ width:8, height:8, borderRadius:'50%', background:'#C8960C', display:'inline-block' }} />
          <span className="wuc-dot3" style={{ width:8, height:8, borderRadius:'50%', background:'#C8960C', display:'inline-block' }} />
          <span style={{ fontSize:11, letterSpacing:'0.12em', color:'#555', textTransform:'uppercase', fontWeight:500 }}>בנייה פעילה</span>
        </div>

        <div style={{ marginBottom:'0.75rem' }}>
          <span style={{ fontSize:11, letterSpacing:'0.15em', color:'#C8960C', fontWeight:500, textTransform:'uppercase' }}>zimmer.club</span>
        </div>

        <h1 className="wuc-flicker" style={{ fontSize:40, fontWeight:700, lineHeight:1.2, margin:'0 0 1rem', color:'#F5F0E8' }}>
          משהו יפה<br />
          <span style={{ color:'#C8960C' }}>בדרך אליך</span>
        </h1>

        <p style={{ fontSize:14, color:'#888', lineHeight:1.8, margin:'0 auto 2rem', maxWidth:400 }}>
          אנחנו עובדים קשה בשביל לבנות לכם את הפלטפורמה החכמה והחדשנית ביותר לניהול נכסי תיירות ואטרקציות.<br />
          חלק מהדפים עדיין בפיתוח — תודה על הסבלנות.
        </p>

        <div style={{ marginBottom:'2rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:12, color:'#555', fontWeight:500 }}>התקדמות הפיתוח</span>
            <span style={{ fontSize:12, color:'#C8960C', fontWeight:500 }}>72%</span>
          </div>
          <div style={{ height:3, background:'#1E1E1E', borderRadius:99, overflow:'hidden' }}>
            <div className="wuc-bar" style={{ height:'100%', background:'#C8960C', borderRadius:99, width:0 }} />
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:'2rem' }}>
          {[
            { icon:'🏠', label:'נכסים', status:'פעיל', active:true },
            { icon:'🔍', label:'חיפוש', status:'פעיל', active:true },
            { icon:'📅', label:'הזמנות', status:'בקרוב', active:false },
          ].map((item) => (
            <div key={item.label} style={{ background:'#141414', border:'0.5px solid #222', borderRadius:10, padding:14, textAlign:'center' }}>
              <div style={{ fontSize:18 }}>{item.icon}</div>
              <p style={{ fontSize:12, color:'#888', margin:'6px 0 2px' }}>{item.label}</p>
              <p style={{ fontSize:14, color: item.active ? '#F5F0E8' : '#555', fontWeight:500, margin:0 }}>{item.status}</p>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={dismiss} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', background:'#C8960C', borderRadius:99, fontSize:13, fontWeight:500, color:'#0D0D0D', border:'none', cursor:'pointer' }}>
            ← כניסה לאתר
          </button>
          <a href="https://www.google.com" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', background:'transparent', border:'0.5px solid #333', borderRadius:99, fontSize:13, color:'#888', textDecoration:'none' }}>
            → חזרה לגוגל
          </a>
        </div>

      </div>
    </div>
  )
}
