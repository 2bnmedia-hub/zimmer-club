# zimmer.club - סיכום פיתוח 3

## המשך מ-progress2.md

---

## שינויים שבוצעו

### פיצ'ר Wishlist / מועדפים
- src/hooks/useWishlist.tsx — Context גלובלי עם localStorage + Supabase sync
- src/app/wishlist/page.tsx — דף מועדפים עם גריד נכסים וכפתור הסרה
- לב + badge מספרי ב-Navbar
- משתמש לא רשום: localStorage בלבד
- משתמש רשום: סנכרון עם Supabase (טבלת wishlists)
- ניקוי wishlist בהתנתקות אוטומטי

### טבלאות Supabase חדשות
- wishlists: id, user_id, property_id, created_at, UNIQUE(user_id, property_id)

### ניתוב אחרי כניסה
- כל המשתמשים (אדמין/אונר/גולש) מנותבים לדף הבית אחרי כניסה

### Navbar
- הוסף אייקון לב עם badge מספרי
- תוקן מיקום פריטים לשורה אחת (whitespace-nowrap)
- עודכן סדר פריטים: צימרים, וילות ובקתות, מלונות, קמפינג, קרוואנים, אטרקציות, מבצעים, תמצאו לי צימר, פרסמו באתר
- נוסף קרוואנים כקטגוריה חדשה

### שדות חדשים בטבלת properties
- accepts_miluim (boolean) — מקבלים שובר מילואים
- has_shelter (boolean) — קיים מרחב מוגן

### SQL שהורץ ב-Supabase
- CREATE TABLE wishlists עם RLS
- ALTER TABLE properties ADD COLUMN accepts_miluim boolean default false
- ALTER TABLE properties ADD COLUMN has_shelter boolean default false
- ALTER TABLE properties ALTER COLUMN price_per_night SET DEFAULT 0
- ALTER TABLE properties ALTER COLUMN price_per_night DROP NOT NULL

### Badges על תמונת הנכס
- מקבלים שובר מילואים — ירוק (#25D366) + אמוג'י קסדה
- קיים מרחב מוגן — כתום (#F97316) + אמוג'י מגן
- מוצגים גם בדף החיפוש

### דף הוספת/עריכת נכס
- נוספו checkboxes: מקבלים שובר מילואים, קיים מרחב מוגן
- הוסרה חובת מחיר לילה (NOT NULL בוטל ב-Supabase)
- כשאין מחיר — מוצג "מחיר בתיאום"

### חיפוש מתקדם
- src/app/search/page.tsx — עיצוב מחדש מלא (2026 UI)
- src/components/search/AdvancedSearchPanel.tsx — פאנל inline בדף הבית
- פילטרים: סוג נכס, איזור, אורחים, טווח מחיר (סקאלה כפולה מותאמת), 36 amenities, קהל יעד, הזמנה מיידית, שובר מילואים, מרחב מוגן
- כפתור חיפוש מתקדם באותה שורה של כפתור החיפוש ב-SearchBar
- checkboxes מעוצבים במקום input רגיל

### צבעי לוגו — עדכון CSS Variables
- --bronze: #C4956A (ברונזה ראשי)
- --bronze-dark: #8B5E3C (ברונזה כהה)
- --bronze-light: #D4A876 (ברונזה בהיר)
- --green-dark: #1B5E3B (ירוק כהה)
- --green-mid: #2D7A52 (ירוק בינוני)
- --green-light: #4A9B6F (ירוק בהיר)
- --cream: #FAF7F2 (אופ-וויט)

### כפתורי תקשורת בדף הנכס
- וואטסאפ 1 — ירוק (#25D366)
- וואטסאפ 2 — ירוק כהה (#128C7E)
- חייג עכשיו — אפור כהה (#4B5563)
- מוצגים רק אם השדות מוגדרים ו-contact_via_* מסומן

### SearchBar
- הוסף מרווח בין label לשדה (mt-2)
- כפתור חיפוש מתקדם בשורת הכפתורים

---

## קבצים שעודכנו/נוצרו

```
src/
├── hooks/
│   └── useWishlist.tsx                          # חדש (Context גלובלי)
├── components/
│   └── search/
│       ├── SearchBar.tsx                        # עודכן
│       └── AdvancedSearchPanel.tsx              # חדש
├── app/
│   ├── page.tsx                                 # עודכן
│   ├── layout.tsx                               # עודכן (WishlistProvider)
│   ├── wishlist/
│   │   └── page.tsx                             # חדש
│   ├── search/
│   │   └── page.tsx                             # עודכן מלא
│   ├── auth/login/page.tsx                      # עודכן (redirect לבית)
│   └── dashboard/
│       └── properties/
│           ├── new/page.tsx                     # עודכן
│           └── [id]/edit/page.tsx               # עודכן
├── styles/
│   └── globals.css                              # עודכן צבעים + shimmer
└── types/
    └── index.ts                                 # עודכן
```

---

## TODO
- [ ] CallMeBot WhatsApp — ממתין ל-API key
- [ ] מערכת הזמנות (כפתור "הזמן עכשיו" עדיין alert)
- [ ] דף עריכת פרופיל משתמש
- [ ] דפי hotels, camping, caravans, deals — טרם פותחו
- [ ] ביקורות על נכסים
- [ ] אופטימיזציה למובייל
- [ ] Lighthouse audit
