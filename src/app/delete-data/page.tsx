export default function DeleteDataPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-lg w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">מחיקת נתונים אישיים</h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          אם ברצונך למחוק את הנתונים האישיים שלך מ-zimmer.club, תוכל לעשות זאת באחת מהדרכים הבאות:
        </p>
        <ol className="space-y-4 text-gray-700 text-sm leading-relaxed list-decimal list-inside">
          <li>כנס לחשבונך באתר zimmer.club</li>
          <li>עבור לעמוד הפרופיל שלך</li>
          <li>לחץ על "מחק חשבון" — כל הנתונים שלך יימחקו לצמיתות</li>
        </ol>
        <p className="text-gray-500 text-sm mt-6">
          לפניות נוספות ניתן לפנות אלינו במייל:{' '}
          <a href="mailto:info@zimmer.club" className="text-yellow-700 hover:underline">
            info@zimmer.club
          </a>
        </p>
      </div>
    </div>
  )
}
