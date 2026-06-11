# zimmer.club - סיכום פיתוח 4

## המשך מ-progress3.md

---

## שינויים שבוצעו

### עריכת פרופיל משתמש
- src/app/dashboard/profile/page.tsx — דף עריכת פרופיל מלא
- תמונת פרופיל עם crop/zoom (react-image-crop)
- עדכון שם מלא, טלפון, אימייל, סיסמה
- העלאת תמונה ל-Supabase Storage (bucket: avatars)
- toast notifications להצלחה/שגיאה
- badge תפקיד (מנהל/בעל נכס/גולש)

### סנכרון תמונת פרופיל בזמן אמת
- src/contexts/ProfileContext.tsx — Context גלובלי חדש
- עדכון Navbar מיידי אחרי שינוי תמונה ללא רענון דף
- תמונת פרופיל מוקטנת בתפריט המשתמש

### Navbar — שדרוגים
- הוסף "עריכת פרופיל" לתפריט (דסקטופ + מובייל)
- header עם שם ותפקיד בתפריט המשתמש
- תמונת פרופיל מוקטנת ליד שם המשתמש
- src/components/layout/Navbar.tsx — הקובץ הנכון עודכן

### SQL שהורץ ב-Supabase
- CREATE bucket avatars (Storage)
- RLS policies על bucket avatars
- ALTER TABLE properties ADD COLUMN slug TEXT UNIQUE
- UPDATE properties SET slug = ... (slugs אוטומטיים לנכסים קיימים)

### URLs נקיים לנכסים (Slug System)
- כל נכס נגיש דרך zimmer.club/שם-הנכס
- src/middleware.ts — middleware שמנתב slugs לדף הנכס
- src/app/properties/[slug]/page.tsx — דף נכס לפי slug
- בעת הוספת נכס: שדה "שם נכס באנגלית" → slug אוטומטי
- תצוגה בזמן אמת: zimmer.club/שם-שהוקלד
- בדיקת ייחודיות slug לפני שמירה
- Middleware מגן על נתיבים שמורים ועל קבצים סטטיים

### QR Code
- src/components/property/PropertyQR.tsx
- mode="view" — רק QR (דף נכס ציבורי)
- mode="edit" — QR + הורדה + העתק קישור (דף עריכה)
- ספריית qrcode + @types/qrcode
- QR מוביל ל-zimmer.club/slug

### דף נכס — שינויי עיצוב
- פריסה דו-עמודית בראש הדף: מידע (30%) + תמונה (70%)
- כרטיס מידע: שם, תיאור קצר, קטגוריה, אורחים, חדרים, כתובת
- מפה בתחתית כרטיס המידע עם כפתור ניווט
- מפה בגוון grayscale עם כיתוב "להצגת הנכס על המפה"
- כפתור "חזרה" בצד ימין בלבד
- תמונה ראשית max-h-[55vh]
- תמונות ממוזערות מתחת
- QR בתחתית עמוד

### אנימציות דף בית
- globals.css — keyframes: kenBurns, heroFadeUp
- תמונת רקע: Ken Burns (זום איטי 18 שניות)
- טקסט hero: fade in מלמטה

### תיקוני רווחים
- הוסרו pt-24/pt-20/pt-16 מכל הדפים (חוץ מדף בית)
- הוחלפו ב-pt-4

---

## קבצים שעודכנו/נוצרו

```
src/
├── middleware.ts                                    # חדש
├── contexts/
│   └── ProfileContext.tsx                          # חדש
├── components/
│   ├── layout/
│   │   └── Navbar.tsx                              # עודכן
│   └── property/
│       └── PropertyQR.tsx                          # חדש
├── app/
│   ├── page.tsx                                    # עודכן (Ken Burns)
│   ├── dashboard/
│   │   └── profile/
│   │       └── page.tsx                            # חדש
│   │   └── properties/
│   │       ├── new/page.tsx                        # עודכן (slug field)
│   │       └── [id]/edit/page.tsx                  # עודכן (QR)
│   └── properties/
│       └── [slug]/
│           └── page.tsx                            # חדש (החליף [id])
└── styles/
    └── globals.css                                 # עודכן (keyframes)
```

---

## TODO
- [ ] CallMeBot WhatsApp — ממתין ל-API key
- [ ] מערכת הזמנות (כפתור "הזמן עכשיו" עדיין alert)
- [ ] דפי hotels, camping, caravans, deals — טרם פותחו
- [ ] ביקורות על נכסים
- [ ] אופטימיזציה למובייל
- [ ] Lighthouse audit
- [ ] slug בדף עריכת נכס — עדכון slug קיים
