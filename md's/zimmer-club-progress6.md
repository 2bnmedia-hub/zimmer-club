# zimmer.club — סיכום פיתוח 6

## המשך מ-progress5.md

---

## Stack טכני
- **Frontend:** Next.js 15+ (Turbopack), TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, DB, Storage, RLS)
- **Deploy:** Vercel (auto-deploy מ-GitHub: 2bnmedia-hub/zimmer-club)
- **Domain:** zimmer.club

---

## מבנה דפים (src/app)

```
src/app/
├── page.tsx                          # דף בית (Ken Burns hero, SearchBar, LatestProperties, Categories)
├── layout.tsx                        # metadata SEO, viewport, themeColor
├── globals.css                       # CSS variables, mobile optimizations, safe areas
├── sitemap.ts                        # sitemap דינמי מ-Supabase
├── robots.ts                        # robots.txt
├── search/page.tsx                   # דף חיפוש עם filters
├── attractions/
│   ├── page.tsx                      # רשימת אטרקציות (טבלת attractions)
│   └── [slug]/page.tsx              # דף אטרקציה ציבורי (ביקורות, מפה, שעות)
├── properties/[slug]/page.tsx        # דף נכס ציבורי
├── auth/login/page.tsx
├── auth/register/page.tsx
├── dashboard/
│   ├── owner/page.tsx               # לוח בקרה בעל נכס (נכסים + אטרקציות)
│   ├── admin/page.tsx               # לוח בקרה אדמין (נכסים + אטרקציות + מחיקה)
│   ├── admin/contacts/page.tsx
│   ├── profile/page.tsx
│   ├── properties/
│   │   ├── new/page.tsx             # הוספת נכס
│   │   └── [id]/edit/page.tsx       # עריכת נכס
│   └── attractions/
│       ├── new/page.tsx             # הוספת אטרקציה ✅
│       └── [id]/edit/page.tsx       # עריכת אטרקציה ✅ תוקן ב-progress6
├── hotels/page.tsx                  # "בבנייה"
├── camping/page.tsx                 # "בבנייה"
├── deals/page.tsx                   # "בבנייה"
├── advertise/page.tsx
├── find/page.tsx
└── wishlist/page.tsx
```

---

## מבנה קומפוננטות (src/components)

```
src/components/
├── layout/
│   ├── Navbar.tsx                   # Mega menu, mobile, user dropdown
│   └── Footer.tsx
├── search/
│   ├── SearchBar.tsx               # Hero search (5 שדות: סוג, אזור, כניסה, יציאה, אורחים)
│   └── AdvancedSearchPanel.tsx
├── property/
│   ├── LatestProperties.tsx        # 4 נכסים אחרונים בדף הבית
│   ├── PropertyCard.tsx
│   ├── PropertyQR.tsx
│   ├── PropertyReviews.tsx
│   └── AdminReviews.tsx
└── ScrollToTop.tsx
```

---

## טבלאות Supabase

### properties
שדות עיקריים: id, owner_id, name, slug, short_description, description, category[], region, city, address, price_per_night, min_nights, max_guests, bedrooms, bathrooms, instant_book, accepts_miluim, has_shelter, status, video_url, phone_landline, whatsapp1, whatsapp2, email1, email2, contact_via_*, avg_rating, total_reviews, created_at, updated_at

### attractions ⭐
שדות: id, owner_id, name, slug, short_description, description, region, city, address, price_per_person, min_age, max_age, activity_type[], opening_hours (JSON שבועי), notes, phone, whatsapp, email, website, video_url, avg_rating, total_reviews, status, created_at, updated_at

### attraction_images ⭐
שדות: id, attraction_id, url, is_primary, order

### attraction_reviews ⭐
שדות: id, attraction_id, user_id, rating, comment, created_at

### property_images
שדות: id, property_id, url, is_primary, order

### blocked_dates
שדות: id, property_id, date, status (blocked/approved)

### profiles
שדות: id, full_name, role (admin/owner/guest), avatar_url

### amenities
שדות: id, key, label_he, icon

### property_amenities
שדות: property_id, amenity_id

### wishlists
שדות: id, user_id, property_id

### bookings, reviews, notifications, leads, admin_contacts

---

## Storage Buckets
- `property-images` — תמונות נכסים (public)
- `avatars` — תמונות פרופיל (public)
- `attraction-images` — תמונות אטרקציות (public)

---

## RLS Policies — טבלת attractions ✅ הוגדר ב-progress6

```sql
-- קריאה: כולם רואים active, בעלים רואה שלו, אדמין רואה הכל
CREATE POLICY "attractions_select" ON attractions FOR SELECT USING (
  status = 'active'
  OR auth.uid() = owner_id
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- הוספה: רק מחובר ורק על עצמו
CREATE POLICY "attractions_insert" ON attractions FOR INSERT WITH CHECK (
  auth.uid() = owner_id
);

-- עדכון: בעלים או אדמין
CREATE POLICY "attractions_update" ON attractions FOR UPDATE USING (
  auth.uid() = owner_id
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- מחיקה: בעלים או אדמין
CREATE POLICY "attractions_delete" ON attractions FOR DELETE USING (
  auth.uid() = owner_id
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
```

---

## ערכי Region (חשוב!)
```
north, galil_west, galil_upper, galil_lower, kinneret, hermon,
center, jerusalem, dead_sea, negev, eilat, golan
```

**Region Groups בחיפוש:**
- `north` כולל: north, galil, galil_upper, galil_lower, galil_west, kinneret, hermon, golan
- `negev` כולל: negev, south, arava

---

## ערכי Category (סוג נכס)
```
zimmer, complex, villa, caravan, hotel, camping, attraction
```

---

## Activity Types (אטרקציות)
```
rayzi, climbing, ezy_rider, laser_tag, horses, karting, buggy,
water_park, pool, gymboree, playground, ceramics, cooking,
archery, paintball, escape_room, zipline, hiking, nature, family
```

---

## Middleware (src/middleware.ts)
נתיבים שמורים:
```
search, hotels, camping, deals, advertise, find, wishlist, auth,
dashboard, properties, attractions, api, _next, favicon.ico,
logo.png, robots.txt, sitemap.xml
```
**חשוב:** כל URL עם segment יחיד מנותב ל-`/properties/[slug]`

---

## שינויים שבוצעו ב-progress6

### ✅ דף עריכת אטרקציה — נפתר לחלוטין
הבעיה: קובץ `src/app/dashboard/attractions/[id]/edit/page.tsx` לא עבד.

**סיבות שהתגלו ותוקנו:**
1. הקובץ לא נוצר כהלכה (build error: "not a module") — נוצר מחדש עם python3
2. RLS של Supabase חסם אדמין מלקרוא אטרקציות של אחרים — הוגדרו policies נכונות
3. Next.js 15+ שינה את אופן העבודה עם `params` — צריך `use(params)` מ-React במקום גישה ישירה

**הפתרון הסופי בקובץ:**
```tsx
import { use } from 'react'

export default function EditAttractionPage({ params }: { params: { id: string } }) {
  const { id } = use(params as unknown as Promise<{ id: string }>)
  // ...
  useEffect(() => {
    const load = async () => {
      // קודם role, אחר כך query
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const isAdmin = profile?.role === 'admin'
      const { data: attraction } = await supabase.from('attractions').select('*').eq('id', id).single()
      if (!isAdmin && attraction.owner_id !== user.id) { router.push('/dashboard/owner'); return }
    }
    load()
  }, [id])
}
```

### ✅ כפתור מחיקת אטרקציה בלוח אדמין
נוסף כפתור Trash2 לצד כפתור העריכה בטבלת האטרקציות ב-`dashboard/admin/page.tsx`

### ✅ תיקון short_description
`parseWeeklyHours()` מטפל בפרסור בטוח של JSON — מונע הצגת JSON בשדה טקסט

---

## פקודות שימושיות

### Build ובדיקה
```bash
npm run build 2>&1 | tail -20
npx tsc --noEmit 2>&1 | grep -v "validator.ts"
```

### Deploy
```bash
git add -A && git commit -m "message" && git push
git commit --allow-empty -m "force redeploy" && git push
```

### כתיבת קבצים גדולים (חשוב!)
```bash
# שיטה נכונה לקבצים גדולים — תמיד עם python3:
python3 << 'PYEOF'
content = """..."""
with open('path/to/file.tsx', 'w') as f:
    f.write(content)
print("Done!")
PYEOF
```

### בדיקת DB
```sql
SELECT name, status, region FROM attractions;
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'attractions';
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'attractions';
```

---

## נקודות חשובות לפיתוח עתידי

### Next.js 15+ — params
בדפים דינמיים `[id]` — חייב להשתמש ב-`use()` מ-React:
```tsx
import { use } from 'react'
const { id } = use(params as unknown as Promise<{ id: string }>)
```

### כתיבת קבצים
תמיד להשתמש ב-`python3` לכתיבת קבצי TSX גדולים — לא `cat << EOF`.

### RLS ב-Supabase
אם טבלה חדשה עם `rowsecurity = true` ואין policies — הכל חסום!
לבדוק עם:
```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'your_table';
```

---

## TODO רשימה עדכנית

### 🔴 דחוף
- (הכל נפתר מ-progress5 ו-6)

### 🟠 בהמשך
- [ ] CallMeBot WhatsApp API
- [ ] מערכת הזמנות אמיתית
- [ ] דפי hotels, camping, deals — עדיין "בבנייה"
- [ ] ביקורות על נכסים (יש ל-attractions, חסר ל-properties)
- [ ] מפה אינטראקטיבית עם pins בדף חיפוש
- [ ] Schema.org JSON-LD לנכסים ואטרקציות
- [ ] אופטימיזציה נוספת למובייל
- [ ] Lighthouse audit מעודכן
- [ ] RLS policies לטבלת attraction_images (לבדוק אם נדרש)
