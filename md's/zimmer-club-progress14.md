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

## שני חוקים מרכזיים לשיחה הבאה
1. כל הפקודות יהיו פקודות לטרמינל
2. אל תנחש — שלח רק פקודות סופיות

---

## שינויים שבוצעו בסשן זה

### Google Places Autocomplete
- תוקן `.env.local` — שורת RESEND הייתה שבורה
- סדר שדות: כתובת (עם Autocomplete) → עיר (readOnly, מתמלאת אוטומטית)

### דף הוספת נכס (`/dashboard/properties/new`)
- שדות חובה: מספר טלפון + וואטסאפ עסקי 1
- שם באנגלית: validation בזמן אמת, חוסם עברית
- מגבלת וידאו: 50MB
- כפתור גראדיאנט זהב
- שדה "שירות אחר" בסוף מאפיינים

### דף הוספת אטרקציה (`/dashboard/attractions/new`)
- Google Places Autocomplete
- שדות חובה: טלפון + וואטסאפ
- העלאת וידאו עד 50MB
- כפתור גראדיאנט זהב

### דף הוספת קרוואן (`/dashboard/caravans/new`)
- שדות חובה: טלפון 1 + וואטסאפ
- שדה "שירות אחר" עם + להוספת שורות
- כפתור גראדיאנט זהב

### לוח בקרה מנהל (`/dashboard/admin`)
- טאב משתמשים 👥: חיפוש, פלטור, מיון, Export CSV/Excel
- סטטוס: ירוק=פעיל, צהוב=ממתין, אדום=לא פעיל
- כפתורי הוספה ידנית — מלבן מסודר

### דף פרופיל (`/dashboard/profile`)
- עיצוב מחדש Apple-style
- ניהול אמצעי תקשורת מוטמע (מנהל בלבד)

### דף הצהרת נגישות (`/accessibility`)
- דף חדש לפי חוק
- middleware מעודכן

### לוח בקרה בעל נכס (`/dashboard/owner`)
- סטטיסטיקות בשורה אחת
- הוסרו הצעות מיותרות

### ביקורות אטרקציות
- טבלת `attraction_reviews` נבנתה מחדש עם RLS
- טריגר לעדכון `avg_rating`

### פוטר
- הועבר ל-`layout.tsx` — גלובלי בכל הדפים

### ניתוק אוטומטי
- `ProfileContext.tsx` — ניתוק אחרי 15 דקות חוסר פעילות

---

## SQL שבוצע בסופאבייס

```sql
DROP TABLE IF EXISTS attraction_reviews CASCADE;

CREATE TABLE attraction_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  attraction_id uuid REFERENCES attractions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 10),
  comment text,
  reviewer_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE attraction_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_all" ON attraction_reviews FOR SELECT USING (true);
CREATE POLICY "insert_authenticated" ON attraction_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own" ON attraction_reviews FOR DELETE USING (auth.uid() = user_id);

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

CREATE TRIGGER trigger_update_attraction_avg_rating
AFTER INSERT OR UPDATE OR DELETE ON attraction_reviews
FOR EACH ROW EXECUTE FUNCTION update_attraction_avg_rating();
```

---

## קבצים שעודכנו
| קובץ | שינויים |
|------|---------|
| `src/app/dashboard/properties/new/page.tsx` | Autocomplete, validation, שדות חובה |
| `src/app/dashboard/attractions/new/page.tsx` | Autocomplete, וידאו, שדות חובה |
| `src/app/dashboard/caravans/new/page.tsx` | שדות חובה, שירות אחר |
| `src/app/dashboard/admin/page.tsx` | טאב משתמשים |
| `src/app/dashboard/profile/page.tsx` | עיצוב מחדש + תקשורת |
| `src/app/dashboard/owner/page.tsx` | סטטיסטיקות |
| `src/app/accessibility/page.tsx` | דף חדש |
| `src/app/layout.tsx` | Footer גלובלי |
| `src/contexts/ProfileContext.tsx` | ניתוק 15 דקות |
| `src/middleware.ts` | נתיבים שמורים |

---

## צבעי מותג
| שם | קוד |
|----|-----|
| זהב כהה | `linear-gradient(135deg, #C8960C, #8B6914)` |
| חום | `#8B4513` |
| ירוק פוטר | `#00854E` |
| ירוק Export | `linear-gradient(135deg, #25D366, #128C7E)` |

---

## משימות שנשארו
- [ ] כפתור אהבתי — תיקון + דף מועדפים
- [ ] הכנה לפרודקשן
- [ ] לוגיקת "כל הצפון" בחיפוש
