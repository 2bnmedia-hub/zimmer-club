# zimmer-club — מצב פרויקט עדכני

## פרטי פרויקט
- **שם:** zimmer-club — אתר אירוח ישראלי (צימרים, וילות, אטרקציות)
- **תיקייה פעילה:** `/Users/wassimkhatib/Desktop/zimmer-club-fresh/`
- **הרצת שרת:** `cd ~/Desktop/zimmer-club-fresh && npm run dev`
- **כתובת מקומית:** http://localhost:3000
- **Next.js:** 16.2.6 (Turbopack)
- **GitHub:** `https://github.com/2bnmedia-hub/zimmer-club.git`
- **בסיס נתונים:** Supabase (פרטים ב `.env.local`)

---

## מצב בסיס הנתונים
- **properties:** 5 נכסים פעילים (אלברקה, צימר בכפר, AVENOR RESORT, וילה wow, יער החלומות, שלוות הטבע)
- **caravans:** 2 קרוואנים פעילים
- **attractions:** 1 אטרקציה פעילה
- **property_units:** טבלה חדשה ליחידות במתחם
- **property_unit_images:** תמונות ליחידות
- **reviews:** טבלה נבנתה מחדש (ציונים 1-10, integer)

### ערכי region בבסיס הנתונים:
`center`, `galil_lower`, `kinneret`, `negev`, `galil_upper`, `galil_west`, `hermon`, `jerusalem`, `dead_sea`, `eilat`, `golan`

---

## שינויים שבוצעו בסשן זה

### Navbar
- הוסרה תווית/רקע מכפתור "הרשמה חינם" → טקסט רגיל
- הוסרה זכוכית מגדלת

### דף בית
- `LatestProperties` — קרוסלה עם חצים מעוצבים, כוכביות חצי עם ציון
- `NewProperties` — קרוסלה חדשה עם חצים, realtime updates

### דף נכס (`/properties/[slug]/page.tsx`)
- טאבים ליחידות במתחם מעל הגלריה
- גלריה קבועה ב-55vh (תמונות אחידות)
- כפתור שיתוף בשורת שם הנכס
- תיאור קצר מעל קטגוריה ומיקום
- כוכבים + ציון + חוות דעת בכרטיס המידע
- `PropertyReviews` — נבנה מחדש עם slider 1-10, עריכה/מחיקה למנהל ישירות בביקורת
- `AdminGenericReviews` — הוסר מדף הנכס (מאוחד עם PropertyReviews)

### ביקורות
- סקאלת slider צבעונית 1-10 (אדום→צהוב→ירוק)
- מדדים: כללי, ניקיון, שירות, מיקום, מתקנים
- Realtime עדכון avg_rating בטבלת properties
- טריגר SQL לעדכון אוטומטי

### יחידות במתחם
- טבלאות SQL: `property_units`, `property_unit_images`
- טופס הוספת נכס: סקשן יחידות עם תמונות
- דף נכס: טאבים לכל יחידה עם גלריה נפרדת

### QR Code
- לוגו favicon במרכז ה-QR (32% מגודל ה-QR)

### Google Places Autocomplete
- שדה כתובת בטופס הוספת נכס שולף אוטומטית עיר + כתובת
- `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` ב-.env.local

---

## קבצים מרכזיים
| קובץ | תפקיד |
|------|--------|
| `src/app/page.tsx` | דף בית |
| `src/app/properties/[slug]/page.tsx` | דף נכס בודד |
| `src/app/dashboard/properties/new/page.tsx` | הוספת נכס |
| `src/components/property/LatestProperties.tsx` | קרוסלה "הנצפים ביותר" |
| `src/components/property/NewProperties.tsx` | קרוסלה "נכסים חדשים" |
| `src/components/property/PropertyReviews.tsx` | ביקורות + עריכת מנהל |
| `src/components/property/PropertyQR.tsx` | QR עם לוגו |
| `src/components/AdminGenericReviews.tsx` | ניהול ביקורות (קרוואנים/אטרקציות) |
| `src/components/GenericReviews.tsx` | ביקורות קרוואנים/אטרקציות |
| `src/components/layout/Navbar.tsx` | ניווט עליון |
| `src/styles/globals.css` | סגנונות גלובליים |

---

## צבעי מותג
| שם | קוד |
|----|-----|
| זהב כהה (כפתורים) | `linear-gradient(135deg, #C8960C, #8B6914)` |
| חום (כותרות) | `#8B4513` |
| ירוק פוטר | `#00854E` |
| זהב בהיר | `#d4a843`, `#f5d078` |

---

## משימות שנשארו
- [ ] בדיקת Google Places Autocomplete (שגיאת טעינה כפולה)
- [ ] בדיקת דפי קרוואנים ואטרקציות
- [ ] הכנה לפרודקשן (build, deploy)
- [ ] לוגיקת "כל הצפון" בחיפוש
