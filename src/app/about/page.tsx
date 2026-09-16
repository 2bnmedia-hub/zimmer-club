import type { Metadata } from 'next'
import Link from 'next/link'
import { IconChevronLeft } from '@/components/icons'

export const metadata: Metadata = {
  title: 'אודות zimmer.club — הסיפור שלנו',
  description: 'zimmer.club נוצרה מתוך אמונה שישראלים ראויים לחופשה שמתחילה ברגע שמוצאים אותה. צימרים, וילות, קרוואנים ואטרקציות — במקום אחד, ללא עמלות.',
  alternates: { canonical: 'https://www.zimmer.club/about' },
  openGraph: {
    title: 'אודות zimmer.club',
    description: 'הסיפור מאחורי פלטפורמת האירוח המובילה בישראל.',
    url: 'https://www.zimmer.club/about',
    locale: 'he_IL',
    type: 'website',
  },
}

export default function AboutPage() {
  const cats = [
    { icon: '🏡', title: 'צימרים', text: 'בקתות וחדרים רומנטיים בטבע, מהגליל ועד הנגב' },
    { icon: '🏰', title: 'וילות יוקרה', text: "וילות פרטיות עם בריכה, ג'קוזי ונוף פנורמי" },
    { icon: '🚐', title: 'קרוואנים', text: 'מסעות ייחודיים בקרוואנים מאובזרים לכל הארץ' },
    { icon: '🎯', title: 'אטרקציות', text: 'חוויות בלתי נשכחות — קטיף, טיולים, ספא ועוד' },
  ]

  const values = [
    { icon: '🔍', title: 'שקיפות מוחלטת', text: 'אנחנו לא גובים עמלות הזמנה מהאורח. כשאתם מזמינים — כל שקל הולך לבעל הנכס, ואתם יודעים בדיוק על מה אתם משלמים.' },
    { icon: '🤝', title: 'קשר ישיר ואמיתי', text: 'zimmer.club מחברת ישירות בין האורח לבעל הנכס — כי אתם ראויים לתשובה מאדם, לא מבוט.' },
    { icon: '⭐', title: 'איכות שאפשר לסמוך עליה', text: 'כל נכס עובר אימות. הדירוגים שלנו אמיתיים, הביקורות — מאורחים שהיו שם.' },
  ]

  const included = [
    'פרסום נכסים ללא הגבלה, ללא עלות',
    'תמונות ווידאו ללא הגבלה',
    'קשר ישיר עם אורחים — ללא מתווכים',
    '0% עמלה על הזמנות, לתמיד',
    'לוח בקרה לניהול תאריכים, מחירים וביקורות',
  ]

  const chat = [
    { role: 'user', text: 'רוצה וילה עם בריכה פרטית לשבת הקרובה, 4 אנשים, עד 2,000₪' },
    { role: 'ai', text: 'מצאתי 3 וילות! הכי מומלצת: וילה הגפן בגליל — בריכה פרטית, ג׳קוזי, נוף עוצר נשימה. 1,800₪/לילה, פנויה לתאריך.' },
    { role: 'user', text: 'מה עם קרוואן עם ילדים?' },
    { role: 'ai', text: 'קרוואן המלכים בנגב — מושלם למשפחות, 550₪/לילה, אזור משחקים ומטבח מאובזר. רוצה שאשריין?' },
  ]

  return (
    <main dir="rtl" className="bg-[#FDFAF4] text-[#2C2418] overflow-x-hidden font-sans">

      {/* ── HERO ── */}
      <section className="min-h-[420px] md:min-h-[500px] flex items-center justify-center text-center px-4 py-16 md:py-24"
        style={{ background: 'linear-gradient(135deg,#2C1A08 0%,#4A2E10 40%,#6B3D14 100%)' }}>
        <div className="max-w-2xl w-full">
          <span className="text-[11px] font-medium tracking-[3px] text-[#C9A84C] uppercase block mb-4">הסיפור שלנו</span>
          <h1 className="text-3xl md:text-5xl font-light text-[#F5EDD6] leading-snug mb-4">
            נולדנו מתוך<br />
            <strong className="font-bold text-[#C9A84C]">אכזבה אחת מדי</strong>
          </h1>
          <p className="text-sm md:text-lg text-[#F5EDD6]/70 font-light max-w-lg mx-auto mb-8 leading-relaxed">
            zimmer.club נוצרה מתוך אמונה פשוטה: ישראלים ראויים לחופשה שמתחילה ברגע שמוצאים אותה — צימרים, וילות, קרוואנים ואטרקציות — במקום אחד.
          </p>
          <div className="w-12 h-0.5 bg-[#C9A84C] mx-auto opacity-60" />
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <div className="max-w-5xl mx-auto px-4 pt-14 pb-8">
        <div className="text-center mb-8">
          <p className="text-[10px] font-medium tracking-[3px] text-[#8B6914] uppercase mb-2">מה תמצאו אצלנו</p>
          <h2 className="text-xl md:text-3xl font-bold text-[#2C2418]">כל סוגי האירוח בישראל — מקום אחד</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {cats.map(c => (
            <div key={c.title} className="bg-white rounded-2xl p-4 md:p-6 border border-[#8B6914]/10 text-center">
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="text-sm md:text-base font-bold text-[#2C2418] mb-1">{c.title}</h3>
              <p className="text-xs text-[#5C4A28] leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── STORY ── */}
      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
        <div>
          <p className="text-[10px] font-medium tracking-[3px] text-[#8B6914] uppercase mb-3">איך הכל התחיל</p>
          <h2 className="text-xl md:text-3xl font-bold text-[#2C2418] leading-snug mb-5">שנים של חיפוש.<br />רגע אחד של החלטה.</h2>
          <p className="text-sm md:text-base text-[#5C4A28] leading-relaxed mb-4">שנים של חיפוש אחר הצימר המושלם, הוילה הנכונה, הקרוואן המושלם — תשלום עמלות נסתרות, ובסוף — אכזבה. ידענו שהשוק הישראלי ראוי למשהו אחר.</p>
          <p className="text-sm md:text-base text-[#5C4A28] leading-relaxed mb-4">פלטפורמה שמחברת ישירות — <strong className="text-[#2C2418]">ללא תיווך, ללא הפתעות, ללא עמלות.</strong></p>
          <p className="text-sm md:text-base text-[#5C4A28] leading-relaxed">ב-2024 החלטנו לבנות אותה. היום zimmer.club הוא הבית הדיגיטלי של מעל 1,000 נכסים ברחבי ישראל.</p>
        </div>
        <div className="bg-[#F5EDD6] rounded-2xl p-6 md:p-10 text-center border border-[#8B6914]/15">
          <div className="text-5xl md:text-6xl font-bold text-[#8B6914] leading-none">1,000+</div>
          <div className="text-sm text-[#9A8060] mt-1 mb-6">נכסים ברחבי ישראל</div>
          <div className="grid grid-cols-2 gap-3">
            {[{ num: '₪0', label: 'עמלת הזמנה' }, { num: '100%', label: 'קשר ישיר' }, { num: '4', label: 'סוגי אירוח' }, { num: '24/7', label: 'סוכן AI' }].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-3 border border-[#8B6914]/10">
                <span className="text-2xl font-bold text-[#8B6914] block">{s.num}</span>
                <span className="text-xs text-[#9A8060]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI AGENT ── */}
      <div style={{ background: 'linear-gradient(135deg,#1A3A2A 0%,#0F2518 100%)' }} className="py-14 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
          <div>
            <span className="inline-block border border-[#C9A84C]/30 bg-[#C9A84C]/10 rounded-full px-4 py-1 text-[10px] font-medium tracking-[2px] text-[#C9A84C] uppercase mb-4">חדש</span>
            <h2 className="text-xl md:text-3xl font-bold text-[#F5EDD6] leading-snug mb-4">סוכן AI אישי —<br />החופשה שלך מתחילה כאן</h2>
            <p className="text-sm text-[#F5EDD6]/70 leading-relaxed mb-3">הסוכן החכם מנתח את ההעדפות שלכם — תקציב, אזור, סגנון, מספר אורחים — ומציע את הנכס המושלם.</p>
            <p className="text-sm text-[#F5EDD6]/70 leading-relaxed">פשוט שאלו: <em className="text-[#C9A84C]">&quot;חופשה רומנטית לזוג עם ג׳קוזי עד 800₪ בגליל&quot;</em></p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-[#C9A84C]/20">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
              <div className="w-8 h-8 bg-[#8B6914] rounded-full flex items-center justify-center text-sm shrink-0">✨</div>
              <div>
                <div className="text-sm font-semibold text-[#F5EDD6]">סוכן zimmer.club</div>
                <div className="text-xs text-[#F5EDD6]/40">מחובר • עונה תוך שניות</div>
              </div>
            </div>
            <div className="space-y-2">
              {chat.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${m.role === 'user' ? 'bg-white/8 text-[#F5EDD6]/80' : 'bg-[#8B6914]/30 text-[#F5EDD6]'}`}
                    style={{ background: m.role === 'user' ? 'rgba(255,255,255,0.08)' : 'rgba(139,105,20,0.3)' }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── VALUES ── */}
      <div className="bg-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-medium tracking-[3px] text-[#8B6914] uppercase mb-2">מה שמניע אותנו</p>
            <h2 className="text-xl md:text-3xl font-bold text-[#2C2418]">שלושה ערכים. פלטפורמה אחת.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {values.map(v => (
              <div key={v.title} className="bg-[#FDFAF4] rounded-2xl p-5 md:p-7 border border-[#8B6914]/10">
                <div className="w-10 h-10 bg-[#F5EDD6] rounded-xl flex items-center justify-center text-xl mb-4">{v.icon}</div>
                <h3 className="text-base font-bold text-[#2C2418] mb-2">{v.title}</h3>
                <p className="text-xs md:text-sm text-[#5C4A28] leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div className="bg-[#F5EDD6] py-14 px-4 border-t border-[#8B6914]/15">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-medium tracking-[3px] text-[#8B6914] uppercase mb-2">לבעלי נכסים</p>
            <h2 className="text-xl md:text-3xl font-bold text-[#2C2418] mb-3">תמחור פשוט. ללא הפתעות.</h2>
            <p className="text-sm text-[#5C4A28] max-w-sm mx-auto">שמרו 100% מהתשלום מהאורח</p>
          </div>
          <div className="rounded-2xl p-8 bg-white border border-[#8B6914]/15">
            <p className="text-[10px] font-medium tracking-[2px] uppercase mb-2 text-[#9A8060]">פרסום באתר</p>
            <div className="text-4xl font-bold mb-1 text-[#2C2418]">חינם</div>
            <p className="text-xs mb-4 text-[#9A8060]">ללא עלות, לתמיד</p>
            <div className="h-px mb-4 bg-[#8B6914]/12" />
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
              {included.map(f => (
                <li key={f} className="text-xs leading-relaxed flex items-start gap-2 text-[#5C4A28]">
                  <span className="text-[#8B6914] font-bold mt-0.5">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/dashboard/properties/new"
              className="block text-center py-3 rounded-full text-sm font-bold min-h-[44px] flex items-center justify-center bg-[#8B6914] text-white">
              התחילו חינם
            </Link>
          </div>
          <p className="text-center text-xs text-[#5C4A28] mt-6">
            מחפשים חשיפה מוגברת לנכס העסקי שלכם? <Link href="/advertise" className="font-semibold underline" style={{color:'#8B6914'}}>דברו איתנו</Link> — נתאים הצעה אישית.
          </p>
        </div>
      </div>

      {/* ── QUOTE ── */}
      <div className="bg-white py-14 px-4 border-t border-[#8B6914]/15">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg md:text-2xl font-light text-[#2C2418] leading-relaxed mb-4 italic">
            &ldquo;ישראל יפה מדי מכדי לבלות אותה בצימר הלא נכון.<br />
            אנחנו כאן כדי שזה <strong className="font-bold text-[#8B6914] not-italic">לא יקרה לכם.</strong>&rdquo;
          </p>
          <p className="text-xs text-[#9A8060] tracking-wider">— הצוות של zimmer.club</p>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <p className="text-[10px] font-medium tracking-[3px] text-[#8B6914] uppercase mb-2">הצטרפו אלינו</p>
          <h2 className="text-xl md:text-3xl font-bold text-[#2C2418]">יותר מאתר הזמנות.<br />קהילה של אוהבי ארץ ישראל.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1A3A2A] rounded-2xl p-6 md:p-8">
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-white/50 mb-2">לאורחים</p>
            <h3 className="text-lg md:text-xl font-bold text-[#F5EDD6] mb-3 leading-snug">מצאו את החופשה שתזכרו לתמיד</h3>
            <p className="text-sm text-[#F5EDD6]/70 leading-relaxed mb-5">צימרים, וילות, קרוואנים ואטרקציות — מעל 1,000 נכסים מאומתים, ללא עמלות, עם סוכן AI שיעזור לכם למצוא בדיוק מה שחיפשתם.</p>
            <Link href="/search" className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full bg-[#8B6914] text-white text-sm font-bold min-h-[44px]">גלו נכסים <IconChevronLeft size={13} color="#fff" /></Link>
          </div>
          <div className="bg-[#F5EDD6] rounded-2xl p-6 md:p-8 border border-[#8B6914]/20">
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-[#9A8060] mb-2">לבעלי נכסים</p>
            <h3 className="text-lg md:text-xl font-bold text-[#2C2418] mb-3 leading-snug">הנכס שלכם ראוי לקהל שיעריך אותו</h3>
            <p className="text-sm text-[#5C4A28] leading-relaxed mb-5">צימר, וילה, קרוואן או אטרקציה — פרסמו, קבלו הזמנות ישירות, ושמרו 100% מהתשלום. מתחילים חינם.</p>
            <Link href="/dashboard/properties/new" className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full border-2 border-[#8B6914] text-[#8B6914] text-sm font-bold min-h-[44px]">פרסמו את הנכס שלכם <IconChevronLeft size={13} /></Link>
          </div>
        </div>
      </div>

      {/* ── TAGLINE ── */}
      <div className="bg-[#1A3A2A] py-12 px-4 text-center">
        <p className="text-base md:text-xl font-light text-[#F5EDD6]/90 max-w-md mx-auto leading-relaxed">
          zimmer.club נולדה מתוך אמונה פשוטה:<br />
          <strong className="font-bold text-[#C9A84C]">ישראלים ראויים לחופשה שמתחילה ברגע שמוצאים אותה</strong> — לא רק כשמגיעים.
        </p>
      </div>

    </main>
  )
}
