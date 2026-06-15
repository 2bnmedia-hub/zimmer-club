# zimmer-club — מצב פרויקט עדכני

## פרטי פרויקט
- **שם:** zimmer-club — אתר אירוח ישראלי (צימרים, וילות, אטרקציות)
- **תיקייה פעילה:** `/Users/wassimkhatib/Desktop/zimmer-club-fresh/`
- **הרצת שרת:** `cd ~/Desktop/zimmer-club-fresh && npm run dev`
- **כתובת מקומית:** http://localhost:3000
- **Next.js:** 16.2.6 (Turbopack)
- **GitHub:** `https://github.com/2bnmedia-hub/zimmer-club.git` (טוקן מאוחסן בנפרד, לא בקובץ)
- **בסיס נתונים:** Supabase (פרטים ב `.env.local`)

---

## מצב בסיס הנתונים
- **properties:** 5 נכסים פעילים (אלברקה, צימר בכפר, AVENOR RESORT, וילה wow, יער החלומות)
- **caravans:** 2 קרוואנים פעילים
- **attractions:** 1 אטרקציה פעילה
- **תמונות:** שמורות ב-Supabase Storage, עובדות תקין

### ערכי region בבסיס הנתונים:
`center`, `galil_lower`, `kinneret`, `negev`, `galil_upper`

---

## שינויים שבוצעו

### `src/app/page.tsx`
- כותרת שורה 1: `"לא מחפשים חופשה"` (fontSize: 0.85em)
- כותרת שורה 2: `"מגלים אותה"` (fontSize: 1.265em, marginTop: 0.3em)
- תיאור: `"המקומות המיוחדים ביותר לחופשה בישראל. צימרים, וילות, בתי אירוח ואטרקציות – במקום אחד."`

### `src/components/property/LatestProperties.tsx`
- section: `section-padding bg-white !pt-8`
- container: `page-container !max-w-[90rem] !px-2`
- grid: `grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4`
- תמונה: `aspect-[3/2]` יחס 3:2
- פינות קוביה: `rounded-xl`
- תווית "מיידי": גרדיאנט זהב `linear-gradient(135deg, #f5d078 0%, #d4a843 40%, #b8860b 100%)` עם צל, פינות `rounded-lg`
- padding תוכן: `p-4 sm:p-5`
- גדלי טקסט: base לכותרת, sm לתיאורים ומחיר
- כותרת "לקוחות ממש אהבו": צבע `#8B4513`, רווח מתחת `mb-6`

### `src/components/property/PropertyCard.tsx`
- תמונה: `h-[295px]`
- padding: `p-6`
- טקסטים הוגדלו ב-20% + 15%

### `src/components/search/SearchBar.tsx`
- כותרת "חיפוש לפי": `text-sm`
- רשימת אזורים (מסודרת):
  ```
  כל הצפון (north), חרמון, רמת הגולן, גליל העליון,
  גליל המערבי, גליל התחתון, כנרת, מרכז,
  ירושלים, ים המלח, דרום, אילת
  ```

### `src/components/search/GlobalSearch.tsx`
- placeholder: `"חיפוש חופשי - נכס, עיר, אזור..."`

---

## משימות שנשארו / המשך עבודה
- [ ] לוגיקת "כל הצפון" — כרגע מחפש רק `region=north`, צריך להרחיב לכלול: hermon, golan, galil_upper, galil_west, galil_lower, kinneret
- [ ] המשך עבודה על נראות דף הבית
- [ ] בדיקת דפי נכסים בודדים
- [ ] בדיקת דף חיפוש תוצאות
- [ ] בדיקת דף קרוואנים ואטרקציות
- [ ] הכנה לפרודקשן (build, deploy)

---

## פקודות שימושיות

```bash
# הרצת שרת
cd ~/Desktop/zimmer-club-fresh && npm run dev

# בדיקת נכסים ב-Supabase
source ~/Desktop/zimmer-club-fresh/.env.local && curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/properties?select=id,name,region,status" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" | python3 -m json.tool

# git push
cd ~/Desktop/zimmer-club-fresh && git add . && git commit -m "UI updates" && git push
```

---

## קבצים מרכזיים
| קובץ | תפקיד |
|------|--------|
| `src/app/page.tsx` | דף בית |
| `src/components/property/LatestProperties.tsx` | קוביות "לקוחות ממש אהבו" |
| `src/components/property/PropertyCard.tsx` | כרטיס נכס כללי |
| `src/components/search/SearchBar.tsx` | טופס חיפוש מתקדם |
| `src/components/search/GlobalSearch.tsx` | חיפוש חופשי |
| `src/components/layout/Navbar.tsx` | ניווט עליון |
| `src/components/layout/Footer.tsx` | פוטר (ירוק: #00854E) |
| `src/styles/globals.css` | סגנונות גלובליים |

---

## צבעי מותג
| שם | קוד |
|----|-----|
| זהב כהה (כפתורים) | `linear-gradient(135deg, #C8960C, #8B6914)` |
| חום (כותרות) | `#8B4513` |
| ירוק פוטר | `#00854E` |
| זהב בהיר | `#d4a843`, `#f5d078` |
