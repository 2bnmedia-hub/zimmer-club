# zimmer-club — מצב פרויקט עדכני (סשן 13)

## פרטי פרויקט
- **שם:** zimmer-club — אתר אירוח ישראלי (צימרים, וילות, אטרקציות)
- **תיקייה פעילה:** `/Users/wassimkhatib/Desktop/zimmer-club-fresh/`
- **הרצת שרת:** `cd ~/Desktop/zimmer-club-fresh && npm run dev`
- **כתובת מקומית:** http://localhost:3000
- **Next.js:** 16.2.6 (Turbopack)
- **GitHub:** `https://github.com/2bnmedia-hub/zimmer-club.git`
- **בסיס נתונים:** Supabase (פרטים ב `.env.local`)

---

## שינויים שבוצעו בסשן זה

### דף הוספת נכס (`/dashboard/properties/new`)
- תוקן סדר שדות כתובת/עיר — כתובת ראשון עם Google Autocomplete, עיר מתמלאת אוטומטית (readOnly)
- שדות חובה: מספר טלפון + וואטסאפ עסקי 1 (כולל סימן *)
- שם הנכס באנגלית: validation בזמן אמת — חוסם עברית מיד
- מגבלת וידאו שונתה ל-50MB
- כפתור "הוסף נכס" — גראדיאנט זהב
- שדה "שירות אחר" בסוף מאפיינים — שורה אחת עם פלייסהולדר

### דף הוספת אטרקציה (`/dashboard/attractions/new`)
- הוסף Google Places Autocomplete לשדה כתובת
- שדות חובה: טלפון + וואטסאפ
- הוסף אפשרות העלאת וידאו (עד 50MB) + קישור YouTube/Vimeo
- כפתור "הוסף אטרקציה" — גראדיאנט זהב

### דף הוספת קרוואן (`/dashboard/caravans/new`)
- שדות חובה: טלפון 1 + וואטסאפ
- הוסף שדה "שירות אחר" עם כפתור + להוספת שורות
- כפתור "שלח לאישור ופרסום" — גראדיאנט זהב

### לוח בקרה מנהל (`/dashboard/admin`)
- תוקן באג key prop ב-FullTable
- טאב משתמשים עם:
  - חיפוש חופשי (שם, אימייל, טלפון)
  - פלטור לפי תפקיד וסטטוס
  - מיון לפי כל עמודה (עולה/יורד)
  - Export ל-CSV ו-Excel (כפתורים ירוקים)
  - סטטוס משתמש נגזר מנכסים (ירוק/צהוב/אדום)
- כפתורי הוספת עסקים ידנית — מלבן מסודר
- הוסרה כותרת "לוח בקרה" מיותרת

### דף פרופיל (`/dashboard/profile`)
- עיצוב מחדש מלא — קומפקטי, נקי, Apple-style
- שדות חובה: שם מלא, טלפון, אימייל
- הוסף ניהול אמצעי תקשורת (למנהל בלבד)
- הוסר דף תקשורת נפרד

### דף הצהרת נגישות (`/accessibility`)
- נוצר דף חדש עם תוכן מלא לפי חוק
- תוקן middleware להכיר בנתיב
- עודכן רשימת דפדפנים: Chrome, Firefox, Safari, Edge, Opera

### לוח בקרה בעל נכס (`/dashboard/owner`)
- סטטיסטיקות בשורה אחת מעוצבת
- הוסרו הצעות הוספה מיותרות לפי קטגוריה
- תוקן באג: לא מציג "הוסף נכס ראשון" אם יש נכסים

### ביקורות אטרקציות
- נבנתה מחדש טבלת `attraction_reviews` עם RLS
- נוצר טריגר לעדכון `avg_rating` אוטומטי

---

## מבנה טבלאות חדש/מעודכן

### attraction_reviews
```sql
CREATE TABLE attraction_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  attraction_id uuid REFERENCES attractions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 10),
  comment text,
  reviewer_name text,
  created_at timestamptz DEFAULT now()
);
```

### טריגר avg_rating לאטרקציות
```sql
CREATE OR REPLACE FUNCTION update_attraction_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE attractions
  SET avg_rating = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM attraction_reviews
    WHERE attraction_id = COALESCE(NEW.attraction_id, OLD.attraction_id)
  )
  WHERE id = COALESCE(NEW.attraction_id, OLD.attraction_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## קבצים שעודכנו
| קובץ | שינויים |
|------|---------|
| `src/app/dashboard/properties/new/page.tsx` | Autocomplete, validation, שדות חובה |
| `src/app/dashboard/attractions/new/page.tsx` | Autocomplete, וידאו, שדות חובה |
| `src/app/dashboard/caravans/new/page.tsx` | שדות חובה, שירות אחר |
| `src/app/dashboard/admin/page.tsx` | טאב משתמשים, export, key fix |
| `src/app/dashboard/profile/page.tsx` | עיצוב מחדש, אמצעי תקשורת |
| `src/app/dashboard/owner/page.tsx` | סטטיסטיקות, הסרת הצעות מיותרות |
| `src/app/accessibility/page.tsx` | דף חדש |
| `src/middleware.ts` | הוסף נתיבים ל-RESERVED_PATHS |

---

## צבעי מותג
| שם | קוד |
|----|-----|
| זהב כהה (כפתורים) | `linear-gradient(135deg, #C8960C, #8B6914)` |
| חום (כותרות) | `#8B4513` |
| ירוק פוטר | `#00854E` |
| ירוק Export | `linear-gradient(135deg, #25D366, #128C7E)` |

---

## משימות שנשארו
- [ ] כפתור אהבתי — לתקן ולהוסיף דף מועדפים
- [ ] הכנה לפרודקשן (build, deploy)
- [ ] בדיקת דפי קרוואנים מלאה
