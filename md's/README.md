# zimmer.club 🏡

פלטפורמת אירוח יוקרתית לצימרים ווילות בישראל — בנויה עם Next.js 14, Supabase, ו-Tailwind CSS.

---

## 🚀 התחלה מהירה

### דרישות מוקדמות
- Node.js 18+
- npm / yarn / pnpm
- חשבון [Supabase](https://supabase.com) (חינמי)
- חשבון [Vercel](https://vercel.com) לפריסה

---

## 📦 התקנה

```bash
# 1. התקינו dependencies
npm install

# 2. העתיקו את קובץ הסביבה
cp .env.local.example .env.local

# 3. ערכו את .env.local עם הפרטים שלכם (ראו למטה)

# 4. הפעילו את שרת הפיתוח
npm run dev
```

פתחו את [http://localhost:3000](http://localhost:3000) בדפדפן.

---

## ⚙️ הגדרת Supabase

### שלב 1 — צרו פרויקט
1. היכנסו ל-[supabase.com](https://supabase.com)
2. לחצו "New Project"
3. בחרו שם, סיסמה ואזור (Israel / Europe)

### שלב 2 — הגדרת בסיס נתונים
1. עברו ל-**SQL Editor**
2. הדביקו את כל התוכן מקובץ `supabase-schema.sql`
3. לחצו **Run**

### שלב 3 — קבלת מפתחות
עברו ל-**Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### שלב 4 — הפעלת Auth
עברו ל-**Authentication → Providers**:
- ✅ Email (מופעל כברירת מחדל)
- ✅ Google (מומלץ — צריך Client ID מ-Google Cloud)

---

## 🌐 פריסה ל-Vercel

```bash
# התקינו Vercel CLI
npm i -g vercel

# פרסו
vercel

# או — גררו את התיקייה ל-vercel.com
```

**Environment Variables ב-Vercel:**
הוסיפו את כל המשתנים מ-`.env.local.example` תחת Settings → Environment Variables.

---

## 📁 מבנה הפרויקט

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # דף הבית
│   ├── layout.tsx          # Root layout (RTL, fonts, metadata)
│   ├── auth/
│   │   ├── login/          # דף כניסה
│   │   └── register/       # דף הרשמה
│   ├── search/             # עמוד חיפוש ותוצאות
│   ├── property/[id]/      # עמוד נכס בודד
│   └── dashboard/
│       ├── owner/          # לוח בקרה לבעל נכס
│       └── admin/          # לוח ניהול
│
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── search/             # SearchBar, Filters
│   ├── property/           # PropertyCard, PropertyGallery
│   ├── booking/            # BookingForm, BookingCalendar
│   └── ui/                 # Button, Input, Modal, etc.
│
├── lib/
│   ├── supabase/           # Client & Server clients
│   ├── constants.ts        # כל הטקסטים העבריים, קטגוריות, אזורים
│   └── utils.ts            # פונקציות עזר
│
├── types/
│   └── index.ts            # TypeScript types
│
└── styles/
    └── globals.css         # CSS גלובלי + design tokens
```

---

## 🗄️ טבלאות בסיס הנתונים

| טבלה | תיאור |
|------|-------|
| `profiles` | משתמשים (מורחב מ-auth.users) |
| `properties` | נכסים — צימרים ווילות |
| `property_images` | תמונות לכל נכס |
| `amenities` | רשימת מתקנים (ג׳קוזי, בריכה...) |
| `property_amenities` | קשר נכס ↔ מתקנים |
| `blocked_dates` | תאריכים חסומים (לוח זמינות) |
| `bookings` | הזמנות |
| `reviews` | ביקורות |
| `notifications` | התראות |

---

## 🛣️ Roadmap — שלבים הבאים

- [ ] עמוד חיפוש עם פילטרים מלאים
- [ ] עמוד נכס בודד עם גלריה ולוח הזמנות
- [ ] תהליך הזמנה + תשלום (Stripe)
- [ ] לוח בקרה לבעל נכס
- [ ] לוח ניהול Admin
- [ ] מערכת ביקורות
- [ ] מפות Google
- [ ] אימיילים אוטומטיים (Resend)
- [ ] אפליקציית מובייל (React Native / Expo)

---

## 🔧 Stack טכנולוגי

| שכבה | טכנולוגיה |
|------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| עיצוב | Tailwind CSS + CSS Variables |
| בסיס נתונים | Supabase (PostgreSQL) |
| אימות | Supabase Auth |
| תשלומים | Stripe |
| תמונות | Supabase Storage |
| מפות | Google Maps API |
| פריסה | Vercel |

---

## 📞 תמיכה

לשאלות ועזרה: [support@zimmer.club](mailto:support@zimmer.club)

---

**zimmer.club** — חוויות אירוח בלתי נשכחות ברחבי ישראל 🇮🇱
