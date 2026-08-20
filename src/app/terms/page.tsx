import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'תנאי שימוש',
  description: 'תנאי השימוש של zimmer.club — הכללים וההגבלות לשימוש בפלטפורמה.',
}

export default function TermsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:underline">דף הבית</Link>
          <span className="mx-2">/</span>
          <span>תנאי שימוש</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">תנאי שימוש</h1>
        <p className="text-sm text-gray-500 mb-8">עדכון אחרון: ינואר 2025</p>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. קבלת התנאים</h2>
            <p className="text-sm">השימוש באתר zimmer.club מהווה הסכמה לתנאים אלו. אם אינכם מסכימים, אנא הפסיקו את השימוש.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. השירות</h2>
            <p className="text-sm">zimmer.club היא פלטפורמת חיבור בין אורחים לבעלי נכסי נופש. אנו <strong>לא</strong> צד בהסכם ההזמנה בין הצדדים, ואיננו נושאים באחריות לפרטי הנכסים, הזמינות, או התמחור.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. רישום ואחריות המשתמש</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>פרטי הרישום חייבים להיות מדויקים ועדכניים.</li>
              <li>אתם אחראים לשמירת סיסמתכם.</li>
              <li>חל איסור להשתמש בחשבון אחר ללא אישור.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. בעלי נכסים</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>בעל הנכס אחראי לדיוק תיאור הנכס, התמונות, המחירים והזמינות.</li>
              <li>חל איסור לפרסם נכסים שאינם בבעלותכם או בסמכותכם להשכיר.</li>
              <li>zimmer.club שומרת הזכות להסיר נכסים שאינם עומדים בסטנדרטים.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. תוכן אסור</h2>
            <p className="text-sm">חל איסור לפרסם: תוכן שקרי, מטעה, פוגעני, בלתי חוקי, או המפר זכויות קניין רוחני.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. ביטולים והחזרים</h2>
            <p className="text-sm">מדיניות הביטולים נקבעת על ידי כל בעל נכס באופן עצמאי. zimmer.club אינה מוסמכת לאכוף החזרים.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. הגבלת אחריות</h2>
            <p className="text-sm">zimmer.club לא תישא באחריות לנזקים עקיפים, תוצאתיים או מיוחדים הנובעים מהשימוש בפלטפורמה.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. קניין רוחני</h2>
            <p className="text-sm">כל התוכן הגרפי, הלוגו, והטקסטים של zimmer.club הינם קניין האתר. שכפול ללא אישור אסור.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. ברירת הדין</h2>
            <p className="text-sm">תנאים אלו כפופים לחוקי מדינת ישראל. סמכות שיפוט — בתי משפט מחוז תל אביב.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. יצירת קשר</h2>
            <p className="text-sm">לשאלות: <a href="mailto:zimmer.club.israel@gmail.com" className="text-amber-700 hover:underline">zimmer.club.israel@gmail.com</a></p>
          </section>
        </div>
      </div>
    </main>
  )
}
