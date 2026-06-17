export default function AboutPage() {
  return (
    <main dir="rtl" style={{ fontFamily: 'Heebo, sans-serif', background: '#FDFAF4', color: '#2C2418' }}>

      {/* HERO */}
      <section style={{ minHeight: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2C1A08 0%, #4A2E10 40%, #6B3D14 100%)', textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ maxWidth: 780 }}>
          <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: 3, color: '#C9A84C', textTransform: 'uppercase', display: 'block', marginBottom: 20 }}>הסיפור שלנו</span>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 300, color: '#F5EDD6', lineHeight: 1.3, marginBottom: 16 }}>
            נולדנו מתוך<br /><strong style={{ fontWeight: 700, color: '#C9A84C' }}>אכזבה אחת מדי</strong>
          </h1>
          <p style={{ fontSize: 'clamp(16px,2vw,19px)', color: 'rgba(245,237,214,0.75)', fontWeight: 300, maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.7 }}>
            zimmer.club נוצרה מתוך אמונה פשוטה: ישראלים ראויים לחופשה שמתחילה ברגע שמוצאים אותה — צימרים, וילות, קרוואנים ואטרקציות — במקום אחד, בשקיפות מלאה.
          </p>
          <div style={{ width: 60, height: 2, background: '#C9A84C', margin: '0 auto', opacity: 0.6 }} />
        </div>
      </section>

      {/* CATEGORIES */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: 3, color: '#8B6914', textTransform: 'uppercase', marginBottom: 12 }}>מה תמצאו אצלנו</p>
          <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 700, color: '#2C2418' }}>כל סוגי האירוח בישראל — מקום אחד</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
          {[
            { icon: '🏡', title: 'צימרים', text: 'בקתות וחדרים רומנטיים בטבע, מהגליל ועד הנגב' },
            { icon: '🏰', title: 'וילות יוקרה', text: 'וילות פרטיות עם בריכה, ג\'קוזי ונוף פנורמי' },
            { icon: '🚐', title: 'קרוואנים', text: 'מסעות ייחודיים בקרוואנים מאובזרים לכל הארץ' },
            { icon: '🎯', title: 'אטרקציות', text: 'חוויות בלתי נשכחות — קטיף, טיולים, ספא ועוד' },
          ].map((c) => (
            <div key={c.title} style={{ background: 'white', borderRadius: 16, padding: '28px 24px', border: '1px solid rgba(139,105,20,0.12)', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{c.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#2C2418', marginBottom: 8 }}>{c.title}</h3>
              <p style={{ fontSize: 14, color: '#5C4A28', lineHeight: 1.7 }}>{c.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STORY */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 64, alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: 3, color: '#8B6914', textTransform: 'uppercase', marginBottom: 12 }}>איך הכל התחיל</p>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 700, color: '#2C2418', lineHeight: 1.25, marginBottom: 24 }}>שנים של חיפוש.<br />רגע אחד של החלטה.</h2>
          <p style={{ fontSize: 17, color: '#5C4A28', lineHeight: 1.85, marginBottom: 20 }}>שנים של חיפוש אחר הצימר המושלם, הוילה הנכונה, הקרוואן המושלם — כניסה לעשרות אתרים, תשלום עמלות נסתרות, ובסוף — אכזבה. ידענו שהשוק הישראלי ראוי למשהו אחר.</p>
          <p style={{ fontSize: 17, color: '#5C4A28', lineHeight: 1.85, marginBottom: 20 }}>פלטפורמה שמכבדת הן את האורח והן את בעל הנכס, ומחברת ביניהם ישירות — <strong style={{ color: '#2C2418' }}>ללא תיווך, ללא הפתעות, ללא עמלות.</strong></p>
          <p style={{ fontSize: 17, color: '#5C4A28', lineHeight: 1.85 }}>ב-2024 החלטנו לבנות אותה בעצמנו. היום zimmer.club הוא הבית הדיגיטלי של מעל 1,000 נכסים — צימרים, וילות, קרוואנים ואטרקציות ברחבי ישראל.</p>
        </div>
        <div style={{ background: '#F5EDD6', borderRadius: 16, padding: '48px 40px', textAlign: 'center', border: '1px solid rgba(139,105,20,0.15)' }}>
          <div style={{ fontSize: 72, fontWeight: 700, color: '#8B6914', lineHeight: 1 }}>1,000+</div>
          <div style={{ fontSize: 15, color: '#9A8060', marginBottom: 32 }}>נכסים ברחבי ישראל</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[{ num: '₪0', label: 'עמלת הזמנה' }, { num: '100%', label: 'קשר ישיר עם בעל הנכס' }, { num: '4', label: 'קטגוריות אירוח' }, { num: '24/7', label: 'סוכן AI זמין' }].map((s) => (
              <div key={s.label} style={{ background: 'white', borderRadius: 10, padding: 20, border: '1px solid rgba(139,105,20,0.12)' }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#8B6914', display: 'block' }}>{s.num}</span>
                <span style={{ fontSize: 13, color: '#9A8060' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI AGENT */}
      <div style={{ background: 'linear-gradient(135deg, #1A3A2A 0%, #0F2518 100%)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 56, alignItems: 'center' }}>
          <div>
            <span style={{ display: 'inline-block', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 50, padding: '6px 18px', fontSize: 12, fontWeight: 500, letterSpacing: 2, color: '#C9A84C', textTransform: 'uppercase', marginBottom: 20 }}>חדש</span>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 700, color: '#F5EDD6', lineHeight: 1.3, marginBottom: 20 }}>סוכן AI אישי —<br />החופשה שלך מתחילה כאן</h2>
            <p style={{ fontSize: 17, color: 'rgba(245,237,214,0.75)', lineHeight: 1.85, marginBottom: 20 }}>לא יודעים מה אתם מחפשים? הסוכן החכם שלנו מנתח את ההעדפות שלכם — תקציב, אזור, סגנון, מספר אורחים — ומציע את הצימר, הוילה, הקרוואן או האטרקציה המושלמים עבורכם.</p>
            <p style={{ fontSize: 17, color: 'rgba(245,237,214,0.75)', lineHeight: 1.85 }}>פשוט שאלו: <em style={{ color: '#C9A84C' }}>"חופשה רומנטית לזוג עם ג׳קוזי עד 800₪ בגליל"</em> — והסוכן יטפל בשאר.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 28, border: '1px solid rgba(201,168,76,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: '#8B6914', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✨</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#F5EDD6' }}>סוכן zimmer.club</div>
                <div style={{ fontSize: 12, color: 'rgba(245,237,214,0.5)' }}>מחובר • עונה תוך שניות</div>
              </div>
            </div>
            {[
              { role: 'user', text: 'רוצה וילה עם בריכה פרטית לשבת הקרובה, 4 אנשים, עד 2,000₪' },
              { role: 'ai', text: 'מצאתי 3 וילות מושלמות! הכי מומלצת: וילה הגפן בגליל — בריכה פרטית, ג׳קוזי, ונוף עוצר נשימה. 1,800₪/לילה, פנויה לתאריך שלך.' },
              { role: 'user', text: 'מה עם קרוואן עם ילדים?' },
              { role: 'ai', text: 'יש לי קרוואן המלכים בנגב — מושלם למשפחות, 550₪/לילה, כולל אזור משחקים ומטבח מאובזר. רוצה שאשריין?' },
            ].map((m, i) => (
              <div key={i} style={{ marginBottom: 12, display: 'flex', justifyContent: m.role === 'user' ? 'flex-start' : 'flex-end' }}>
                <div style={{ maxWidth: '80%', background: m.role === 'user' ? 'rgba(255,255,255,0.08)' : 'rgba(139,105,20,0.3)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: m.role === 'user' ? 'rgba(245,237,214,0.8)' : '#F5EDD6', lineHeight: 1.6 }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VALUES */}
      <div style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: 3, color: '#8B6914', textTransform: 'uppercase', marginBottom: 12 }}>מה שמניע אותנו</p>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 700, color: '#2C2418' }}>שלושה ערכים. פלטפורמה אחת.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 28 }}>
            {[
              { icon: '🔍', title: 'שקיפות מוחלטת', text: 'אנחנו לא גובים עמלות הזמנה מהאורח. אפס. כשאתם מזמינים דרך zimmer.club — כל שקל הולך לבעל הנכס, ואתם יודעים בדיוק על מה אתם משלמים.' },
              { icon: '🤝', title: 'קשר ישיר ואמיתי', text: 'zimmer.club מאפשר קשר ישיר בין האורח לבין בעל הצימר, הוילה, הקרוואן או האטרקציה — כי אתם ראויים לתשובה מאדם, לא מבוט.' },
              { icon: '⭐', title: 'איכות שאפשר לסמוך עליה', text: 'כל נכס עובר תהליך אימות. הדירוגים שלנו אמיתיים, הביקורות — מאורחים שהיו שם. אנחנו לא מאפשרים לרושם ראשוני לרמות אף אחד.' },
            ].map((v) => (
              <div key={v.title} style={{ background: '#FDFAF4', borderRadius: 16, padding: '36px 28px', border: '1px solid rgba(139,105,20,0.12)' }}>
                <div style={{ width: 52, height: 52, background: '#F5EDD6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>{v.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2C2418', marginBottom: 12 }}>{v.title}</h3>
                <p style={{ fontSize: 15, color: '#5C4A28', lineHeight: 1.8 }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div style={{ background: '#F5EDD6', padding: '80px 24px', borderTop: '1px solid rgba(139,105,20,0.15)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: 3, color: '#8B6914', textTransform: 'uppercase', marginBottom: 12 }}>לבעלי נכסים</p>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 700, color: '#2C2418', marginBottom: 16 }}>תמחור פשוט. ללא הפתעות.</h2>
            <p style={{ fontSize: 17, color: '#5C4A28', maxWidth: 560, margin: '0 auto' }}>פרסמו את הצימר, הוילה, הקרוואן או האטרקציה שלכם — ושמרו 100% מהתשלום מהאורח</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
            {[
              { plan: 'בסיסי', price: 'חינם', period: 'לתמיד', color: '#2C2418', features: ['נכס אחד פעיל', 'עד 10 תמונות', 'דף נכס סטנדרטי', 'צור קשר ישיר עם אורחים'], highlight: false },
              { plan: 'מקצועי', price: '₪99', period: 'לחודש', color: '#8B6914', features: ['עד 5 נכסים פעילים', 'תמונות + וידאו ללא הגבלה', 'הופעה בולטת בחיפוש', 'לוח שנה זמינות מתקדם', 'סטטיסטיקות ובצפיות'], highlight: true },
              { plan: 'עסקי', price: '₪199', period: 'לחודש', color: '#2C2418', features: ['נכסים ללא הגבלה', 'כל פיצ\'רי המקצועי', 'מיתוג עסקי מותאם', 'תמיכה אישית עדיפות', 'גישה מוקדמת לפיצ\'רים חדשים'], highlight: false },
            ].map((p) => (
              <div key={p.plan} style={{ background: p.highlight ? '#2C2418' : 'white', borderRadius: 20, padding: '36px 32px', border: p.highlight ? 'none' : '1px solid rgba(139,105,20,0.15)', position: 'relative' }}>
                {p.highlight && <div style={{ position: 'absolute', top: -14, right: '50%', transform: 'translateX(50%)', background: '#8B6914', color: 'white', fontSize: 12, fontWeight: 600, padding: '4px 18px', borderRadius: 50 }}>הכי פופולרי</div>}
                <p style={{ fontSize: 13, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: p.highlight ? '#C9A84C' : '#9A8060', marginBottom: 12 }}>{p.plan}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 48, fontWeight: 700, color: p.highlight ? '#F5EDD6' : p.color, lineHeight: 1 }}>{p.price}</span>
                  {p.period !== 'לתמיד' && <span style={{ fontSize: 14, color: p.highlight ? 'rgba(245,237,214,0.6)' : '#9A8060' }}>{p.period}</span>}
                </div>
                {p.period === 'לתמיד' && <p style={{ fontSize: 13, color: p.highlight ? 'rgba(245,237,214,0.6)' : '#9A8060', marginBottom: 28 }}>ללא עלות, לתמיד</p>}
                <div style={{ height: 1, background: p.highlight ? 'rgba(255,255,255,0.1)' : 'rgba(139,105,20,0.12)', margin: '20px 0' }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ fontSize: 14, color: p.highlight ? 'rgba(245,237,214,0.8)' : '#5C4A28', lineHeight: 1.7, paddingBottom: 8, paddingRight: 24, position: 'relative' }}>
                      <span style={{ position: 'absolute', right: 0, color: '#8B6914' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/dashboard/properties/new" style={{ display: 'block', textAlign: 'center', padding: '12px 0', borderRadius: 50, background: p.highlight ? '#8B6914' : 'transparent', border: p.highlight ? 'none' : '2px solid #8B6914', color: p.highlight ? 'white' : '#8B6914', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
                  {p.price === 'חינם' ? 'התחילו חינם' : 'התחילו עכשיו'}
                </a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 14, color: '#9A8060', marginTop: 32 }}>* אין עמלות על הזמנות — אתם שומרים 100% מהתשלום מהאורח בכל התוכניות</p>
        </div>
      </div>

      {/* QUOTE */}
      <div style={{ background: 'white', padding: '72px 24px', borderTop: '1px solid rgba(139,105,20,0.15)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 'clamp(20px,2.8vw,28px)', fontWeight: 300, color: '#2C2418', lineHeight: 1.6, marginBottom: 24, fontStyle: 'italic' }}>
            &ldquo;ישראל יפה מדי מכדי לבלות אותה בצימר הלא נכון.<br />
            אנחנו כאן כדי שזה <strong style={{ fontWeight: 700, color: '#8B6914', fontStyle: 'normal' }}>לא יקרה לכם.</strong>&rdquo;
          </p>
          <p style={{ fontSize: 14, color: '#9A8060', letterSpacing: 1 }}>— הצוות של zimmer.club</p>
        </div>
      </div>

      {/* CTA */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: 3, color: '#8B6914', textTransform: 'uppercase', marginBottom: 12 }}>הצטרפו אלינו</p>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 700, color: '#2C2418' }}>יותר מאתר הזמנות.<br />קהילה של אוהבי ארץ ישראל.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 28 }}>
          <div style={{ background: '#1A3A2A', borderRadius: 16, padding: '44px 40px' }}>
            <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>לאורחים</p>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#F5EDD6', marginBottom: 12, lineHeight: 1.3 }}>מצאו את החופשה שתזכרו לתמיד</h3>
            <p style={{ fontSize: 15, color: 'rgba(245,237,214,0.75)', lineHeight: 1.7, marginBottom: 28 }}>צימרים, וילות, קרוואנים ואטרקציות — מעל 1,000 נכסים מאומתים, ללא עמלות, עם סוכן AI שיעזור לכם למצוא בדיוק מה שחיפשתם.</p>
            <a href="/properties" style={{ display: 'inline-block', padding: '13px 28px', borderRadius: 50, background: '#8B6914', color: 'white', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>גלו נכסים ←</a>
          </div>
          <div style={{ background: '#F5EDD6', borderRadius: 16, padding: '44px 40px', border: '1px solid rgba(139,105,20,0.2)' }}>
            <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', color: '#9A8060', marginBottom: 12 }}>לבעלי נכסים</p>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#2C2418', marginBottom: 12, lineHeight: 1.3 }}>הנכס שלכם ראוי לקהל שיעריך אותו</h3>
            <p style={{ fontSize: 15, color: '#5C4A28', lineHeight: 1.7, marginBottom: 28 }}>צימר, וילה, קרוואן או אטרקציה — פרסמו, קבלו הזמנות ישירות, ושמרו 100% מהתשלום. מתחילים חינם.</p>
            <a href="/dashboard/properties/new" style={{ display: 'inline-block', padding: '13px 28px', borderRadius: 50, background: 'transparent', border: '2px solid #8B6914', color: '#8B6914', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>פרסמו את הנכס שלכם ←</a>
          </div>
        </div>
      </div>

      {/* TAGLINE */}
      <div style={{ background: '#1A3A2A', padding: '56px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 'clamp(18px,2.5vw,26px)', fontWeight: 300, color: 'rgba(245,237,214,0.9)', maxWidth: 600, margin: '0 auto', lineHeight: 1.65 }}>
          zimmer.club נולדה מתוך אמונה פשוטה:<br />
          <strong style={{ fontWeight: 700, color: '#C9A84C' }}>ישראלים ראויים לחופשה שמתחילה ברגע שמוצאים אותה</strong> — לא רק כשמגיעים.
        </p>
      </div>

    </main>
  )
}
