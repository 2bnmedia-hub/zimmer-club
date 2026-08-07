import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'מדיניות פרטיות',
  description: 'מדיניות הפרטיות של zimmer.club — כיצד אנו אוספים, משתמשים ומגנים על המידע שלכם.',
}

export default function PrivacyPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:underline">דף הבית</Link>
          <span className="mx-2">/</span>
          <span>מדיניות פרטיות</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">מדיניות פרטיות</h1>
        <p className="text-sm text-gray-500 mb-8">עדכון אחרון: ינואר 2025</p>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. כללי</h2>
            <p>zimmer.club (&ldquo;האתר&rdquo;, &ldquo;אנו&rdquo;) מחויבים לשמירה על פרטיות המשתמשים. מדיניות זו מסבירה אילו נתונים אנו אוספים, כיצד הם משמשים אותנו, ואיך אנו מגנים עליהם.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. מידע שאנו אוספים</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>פרטי חשבון:</strong> שם, כתובת מייל, מספר טלפון בעת הרשמה.</li>
              <li><strong>מידע נכס:</strong> פרטי הנכס שמפרסמים בעלי הנכסים (תיאור, תמונות, מיקום).</li>
              <li><strong>נתוני שימוש:</strong> עמודים שביקרתם, חיפושים שביצעתם, זמן שהייה.</li>
              <li><strong>מידע טכני:</strong> כתובת IP, סוג דפדפן, מערכת הפעלה.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. שימוש במידע</h2>
            <p className="text-sm">אנו משתמשים במידע לצורך:</p>
            <ul className="list-disc list-inside space-y-2 text-sm mt-2">
              <li>הפעלת שירות האתר ואינטראקציה בין אורחים לבעלי נכסים.</li>
              <li>שליחת עדכונים ואישורים רלוונטיים.</li>
              <li>שיפור חוויית המשתמש וניתוח ביצועים.</li>
              <li>עמידה בחוקים ותקנות.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. שיתוף מידע</h2>
            <p className="text-sm">אנו <strong>לא מוכרים</strong> את המידע האישי שלכם. מידע עשוי להיות משותף עם:</p>
            <ul className="list-disc list-inside space-y-2 text-sm mt-2">
              <li>בעלי נכסים — לצורך יצירת קשר ישיר.</li>
              <li>ספקי שירות טכני (Supabase לאחסון מסד נתונים, Resend לשליחת מיילים).</li>
              <li>גורמים רשמיים לפי דרישה חוקית.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. עוגיות (Cookies)</h2>
            <p className="text-sm">האתר משתמש בעוגיות לשמירת הגדרות, שיפור ביצועים ולניתוח תנועה. ניתן לנהל עוגיות דרך הגדרות הדפדפן.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. אבטחת מידע</h2>
            <p className="text-sm">אנו נוקטים באמצעי אבטחה מתאימים לשמירת המידע, כולל הצפנת SSL, הרשאות מוגבלות וגיבויים קבועים. עם זאת, אין אבטחה מושלמת.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. זכויות המשתמש</h2>
            <p className="text-sm">יש לכם זכות לעיין במידע האישי שלכם, לתקנו, או לבקש מחיקתו. לפנייה: <a href="mailto:privacy@zimmer.club" className="text-amber-700 hover:underline">privacy@zimmer.club</a></p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. שינויים במדיניות</h2>
            <p className="text-sm">שינויים מהותיים יפורסמו בדף זה. המשך השימוש באתר לאחר שינויים מהווה הסכמה.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. יצירת קשר</h2>
            <p className="text-sm">לשאלות בנושא פרטיות: <a href="mailto:privacy@zimmer.club" className="text-amber-700 hover:underline">privacy@zimmer.club</a></p>
          </section>
        </div>
      </div>
    </main>
  )
}
