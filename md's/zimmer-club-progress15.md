# zimmer.club — סיכום פיתוח (progress10)

## שינויים בסשן זה

---

## 1. לוח בקרה Owner — עיצוב מחדש (Apple Style)
**קובץ:** `src/app/dashboard/owner/page.tsx`
- עיצוב מינימליסטי ברמת Apple
- Top bar שקוף עם backdrop blur
- Hero עם ברכה אישית
- 3 KPI cards: סה"כ עסקים / פעילים / ממתינים
- כפתורי הוספה נקיים (נכס / קרוואן / אטרקציה)
- טבלאות לכל סוג עם `StatusBadge` ו-`Actions` components
- כפתור עריכה מודגש עם gradient זהב

---

## 2. פרופיל עסקי — עיצוב מחדש (Apple Style)
**קובץ:** `src/app/dashboard/profile/page.tsx`
- שדות חדשים: שם עסק, תיאור קצר, אתר אינטרנט, וואטסאפ עסקי
- Hero card עם אווטאר + שם עסק + תפקיד
- סקשנים: פרטי העסק / פרטים אישיים / אבטחה
- כפתור שמור שחור (Apple style)
- כפתור חזרה → דף הבית

---

## 3. ניווט בין נכסים בדף עריכה
**קובץ:** `src/app/dashboard/properties/[id]/edit/page.tsx`
- קומפוננט `OwnerNav` — dropdown עם כל הנכסים/קרוואנים/אטרקציות של ה-owner
- מחולק לקטגוריות עם אימוג'י
- נקודה צבעונית לפי סטטוס (ירוק/צהוב/אדום)
- `createPortal` למניעת z-index בעיות
- כפתור חזרה ללוח הבקרה

---

## 4. עריכת יחידות במתחם (property_units)
**קובץ:** `src/app/dashboard/properties/[id]/edit/page.tsx`
- טעינת יחידות קיימות מ-`property_units`
- עריכה/מחיקה/הוספה של יחידות
- גלריית תמונות נפרדת לכל יחידה (upload ל-`property_unit_images`)
- שדה וידאו (קישור YouTube/Vimeo) לכל יחידה
- הודעה "שמור נכס תחילה" ליחידות חדשות

---

## 5. מערכת וידאו מרובה — כל הדפים
**טבלאות חדשות בסופאבייס:**
```sql
property_videos (id, property_id, url, order)
caravan_videos  (id, caravan_id, url, order)
attraction_videos (id, attraction_id, url, order)
```

**דפים שעודכנו:**
- `properties/new` + `properties/[id]/edit`
- `caravans/new` + `caravans/[id]/edit`
- `attractions/new` + `attractions/[id]/edit`

**פיצ'רים:**
- עד 10 סרטונים לנכס
- כל סרטון עד 50MB
- העלאת קובץ + הדבקת קישור YouTube/Vimeo
- מחיקת סרטון בודד
- grid תצוגה 2 עמודות

---

## 6. טבלת משתמשים — Admin Dashboard
**קובץ:** `src/app/dashboard/admin/page.tsx`
- עמודה חדשה: "נכסים בבעלות החשבון" — badges צהובים עם שמות הנכסים
- תיקון `localeCompare` על ערכים לא-string
- סדר עמודות: שם / אימייל / טלפון / תפקיד / נכסים / תאריך / סטטוס
- יישור טקסט למרכז

---

## 7. דף הבית — גרידים חדשים
**קובץ:** `src/app/page.tsx`

### אטרקציות מומלצות
- 3 כרטיסים עם תמונה + tag + מחיר
- עיצוב rounded-3xl עם hover scale

### קרוואנים ומסעות
- Bento grid א-סימטרי (wide + 3 קטנים)
- תמונות overlay עם gradient
- background gradient זהב-חום

---

## 8. LatestProperties — עיצוב מחדש
**קובץ:** `src/components/property/LatestProperties.tsx`
- Bento grid: כרטיס ראשי גדול (col-span-2 row-span-2) + 4 קטנים
- ביטול scroll carousel
- כותרת: "הנכסים הנצפים ביותר"
- תמונות overlay עם שם/עיר/מחיר

---

## 9. NewProperties — עיצוב מחדש
**קובץ:** `src/components/property/NewProperties.tsx`
- Bento grid א-סימטרי עם 5 נכסים
- תא ראשי גדול (col-span-5 row-span-2)
- תא אמצע שמאל/ימין x2
- תא כהה עם overlay opacity לנכס 5
- background gradient קרם-חום

---

## 10. תיקונים שונים
- הסרת shimmer animation מכפתור "מבצעים" ב-Navbar
- הסרת hover:scale-105 מכפתור "מבצעים"
- תיקון `propertyId` scope בעריכת נכס
- תיקון `params.id` ב-caravans edit (use(params))
- הסרת כל שאריות `videoFile/videoPreview/videoAsPrimary` מ-6 דפים
- תיקון `newPropertyIdRef` ו-`newCaravanIdRef` ב-new pages

---

## Stack טכני (ללא שינוי)
- Next.js 16.2.6 (Turbopack)
- Supabase (Auth, DB, Storage, RLS)
- Vercel (auto-deploy מ-GitHub: 2bnmedia-hub/zimmer-club)
- Domain: zimmer.club

---

## TODO עדכני

### 🔴 דחוף
- [ ] lat/lng אוטומטי בעריכת נכס (geocoding)
- [ ] columns `business_name`, `business_description`, `website`, `whatsapp` ב-profiles (Supabase migration)

### 🟠 בהמשך
- [ ] דפי hotels, camping, deals
- [ ] לוח שנה זמינות לקרוואנים
- [ ] CallMeBot WhatsApp API
- [ ] Schema.org JSON-LD
- [ ] RLS policies לטבלת caravan_images
- [ ] Lighthouse audit
- [ ] מערכת הזמנות אמיתית
