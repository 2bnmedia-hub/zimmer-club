export default function DeleteDataPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      dir="rtl"
      style={{ background: 'linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 100%)' }}
    >
      <div className="mb-10 flex flex-col items-center gap-3">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(139,105,20,0.10)', border: '1.5px solid rgba(139,105,20,0.18)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <p className="text-xs tracking-widest uppercase" style={{ color: '#B8964A', letterSpacing: '0.18em' }}>
          zimmer.club
        </p>
      </div>

      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: '#fff',
          boxShadow: '0 8px 48px rgba(139,105,20,0.10), 0 1.5px 6px rgba(139,105,20,0.06)',
          border: '1px solid rgba(139,105,20,0.10)',
        }}
      >
        <div
          className="px-8 pt-8 pb-6"
          style={{ borderBottom: '1px solid rgba(139,105,20,0.08)' }}
        >
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: '#2D1E0F', letterSpacing: '-0.01em' }}
          >
            מחיקת נתונים אישיים
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#7A6652' }}>
            אנו מכבדים את פרטיותך ומתחייבים לטפל בבקשות מחיקת נתונים באופן מהיר ומלא.
          </p>
        </div>

        <div className="px-8 py-7">
          <p className="text-xs font-semibold mb-5 tracking-widest uppercase" style={{ color: '#B8964A', letterSpacing: '0.14em' }}>
            שלבים למחיקת החשבון
          </p>

          <ol className="space-y-5">
            {[
              { n: '01', text: 'כנס לחשבונך באתר zimmer.club' },
              { n: '02', text: 'עבור לעמוד הפרופיל שלך' },
              { n: '03', text: 'לחץ על "מחק חשבון" — כל הנתונים שלך יימחקו לצמיתות' },
            ].map(({ n, text }) => (
              <li key={n} className="flex items-start gap-4">
                <span
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(139,105,20,0.08)', color: '#8B6914', border: '1px solid rgba(139,105,20,0.15)' }}
                >
                  {n}
                </span>
                <span className="text-sm leading-relaxed pt-1.5" style={{ color: '#3D2B1A' }}>
                  {text}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ height: '1px', background: 'rgba(139,105,20,0.08)', margin: '0 2rem' }} />

        <div className="px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs" style={{ color: '#9A7C5E' }}>
            לא מצאת את מה שחיפשת?
          </p>
          
          <a href="mailto:info@zimmer.club"
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
            style={{
              background: 'rgba(139,105,20,0.08)',
              color: '#8B6914',
              border: '1px solid rgba(139,105,20,0.18)',
              textDecoration: 'none',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <polyline points="2,4 12,13 22,4"/>
            </svg>
            info@zimmer.club
          </a>
        </div>
      </div>

      <p className="mt-8 text-xs text-center" style={{ color: '#C4A882' }}>
        בקשות מחיקה מטופלות תוך 30 יום · zimmer.club מחויבת לפרטיותך
      </p>
    </div>
  )
}
