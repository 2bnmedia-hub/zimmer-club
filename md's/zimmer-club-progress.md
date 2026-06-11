# zimmer.club - סיכום פיתוח

## פרטי פרויקט
- **Repository:** github.com/2bnmedia-hub/zimmer-club
- **Branch:** main
- **Hosting:** Vercel (auto-deploy)
- **Stack:** Next.js, TypeScript, Tailwind CSS, Supabase
- **תיקייה מקומית:** `~/zimmer-club`

---

## שינויים שבוצעו

### Navbar
- באג מגה-מנו נסגר → unified `activeMenu` state
- נאבבר `sticky top-0` (נשאר בגלילה)
- רקע שקוף `bg-white/30`
- גובה לוגו `h-16`

### pt-24 — כל הדפים (navbar fixed)
כל הדפים הבאים קיבלו `pt-24` למניעת חפיפה עם הנאבבר:
- `src/app/dashboard/admin/page.tsx`
- `src/app/dashboard/owner/page.tsx`
- `src/app/dashboard/properties/[id]/edit/page.tsx`
- `src/app/search/page.tsx`
- `src/app/properties/[id]/page.tsx`
- `src/app/auth/login/page.tsx`
- `src/app/auth/register/page.tsx`
- `src/app/advertise/page.tsx`
- `src/app/find/page.tsx`

### Hero Section (דף הבית)
- גובה: `min-h-[55vh]`
- padding עליון: `pt-24`

### SearchBar
- ולידציה: כל השדות חובה (איזור, כניסה, יציאה)
- max date: `2030-12-31`
- הודעות שגיאה בעברית
- תאריך כניסה חייב להיות עתידי

### דף כניסה (`auth/login/page.tsx`)
- Spinner מסתובב בזמן התחברות
- הודעת שגיאה ברורה עם הפניה לאיפוס סיסמה
- הודעה ירוקה לפני מעבר לדשבורד
- `window.location.href` (במקום router.push) לרענון מלא של הנאבבר
- אייקון Eye/EyeOff להצגת סיסמה ל-2 שניות (צד ימין)

### דף הרשמה (`auth/register/page.tsx`)
- אייקון Eye/EyeOff בשני שדות הסיסמה (צד ימין)
- Spinner בכפתור הרשמה

### מחירים — "החל מ:"
נוסף לפני המחיר בכל מקום באתר:
- `src/components/property/PropertyCard.tsx` (שורה 111)
- `src/components/property/LatestProperties.tsx` (שורה 90)
- `src/app/properties/[id]/page.tsx` (שורה 204 — מחיר ראשי בלבד)

---

## קבצים מרכזיים
```
src/
├── app/
│   ├── page.tsx                          # דף בית
│   ├── layout.tsx                        # layout כללי
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── admin/page.tsx
│   │   ├── owner/page.tsx
│   │   └── properties/[id]/edit/page.tsx
│   ├── properties/[id]/page.tsx          # דף נכס בודד
│   ├── search/page.tsx
│   ├── advertise/page.tsx
│   └── find/page.tsx
├── components/
│   ├── layout/Navbar.tsx
│   ├── property/
│   │   ├── PropertyCard.tsx
│   │   └── LatestProperties.tsx
│   └── search/SearchBar.tsx
└── styles/globals.css
```

---

## משתמשים ב-Supabase
| אימייל | Role |
|--------|------|
| 2bnbussiness@gmail.com | admin |
| globaly2000@gmail.com | owner |
| a.morad@onebeat.co.il | — |
| articana@gmail.com | — |
| nadinemarzuq@gmail.com | — |
| salim.haytham11@gmail.com | — |

---

## פקודות שימושיות
```bash
# כניסה לתיקייה
cd ~/zimmer-club

# commit ו-push
git add -A && git commit -m "message" && git push

# בדיקת שגיאות build מקומית
npm run build
```

---

## בעיות ידועות / TODO
- [ ] לוודא שהמחיר "החל מ:" מופיע נכון בדף הנכס הבודד (שורה 204)
- [ ] לבדוק שאיפוס סיסמה עובד תקין (resetPasswordForEmail)
- [ ] דפי hotels, camping, deals — טרם פותחו
