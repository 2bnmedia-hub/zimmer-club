# zimmer.club — סיכום פיתוח מלא (progress7)

## Stack טכני
- **Frontend:** Next.js 16.2.6 (Turbopack), TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, DB, Storage, RLS)
- **Deploy:** Vercel (auto-deploy מ-GitHub: 2bnmedia-hub/zimmer-club)
- **Domain:** zimmer.club
- **Map:** Leaflet + react-leaflet@4.2.1 (תואם React 18)

---

## מבנה דפים (src/app)

```
src/app/
├── page.tsx                          # דף בית
├── layout.tsx                        # metadata SEO
├── globals.css
├── sitemap.ts
├── robots.ts
├── delete-data/page.tsx              # דף מחיקת נתונים (Facebook requirement)
├── search/page.tsx                   # חיפוש עם filters
├── caravans/
│   ├── page.tsx                      # רשימת קרוואנים
│   └── [slug]/page.tsx              # דף קרוואן ציבורי
├── attractions/
│   ├── page.tsx                      # רשימת אטרקציות
│   └── [slug]/page.tsx
├── properties/[slug]/page.tsx        # דף נכס ציבורי
├── auth/login/page.tsx
├── auth/register/page.tsx
├── dashboard/
│   ├── owner/page.tsx               # לוח בקרה בעל נכס
│   ├── admin/page.tsx               # לוח בקרה אדמין (charts, מפה, עוגות)
│   ├── admin/contacts/page.tsx
│   ├── profile/page.tsx
│   ├── properties/new/page.tsx
│   ├── properties/[id]/edit/page.tsx
│   ├── attractions/new/page.tsx
│   ├── attractions/[id]/edit/page.tsx
│   ├── caravans/new/page.tsx        # טופס הוספת קרוואן מלא
│   └── caravans/[id]/edit/page.tsx  # (להכין)
├── hotels/page.tsx                  # "בבנייה"
├── camping/page.tsx
├── deals/page.tsx
├── advertise/page.tsx
├── find/page.tsx
└── wishlist/page.tsx
```

---

## מבנה קומפוננטות (src/components)

```
src/components/
├── layout/
│   ├── Navbar.tsx                   # Mega menu עם אנימציה, mobile, קרוואנים
│   └── Footer.tsx
├── map/
│   └── IsraelMap.tsx                # Leaflet map עם pins אמיתיים
├── search/
│   ├── SearchBar.tsx
│   └── AdvancedSearchPanel.tsx
├── property/
│   ├── LatestProperties.tsx
│   ├── PropertyCard.tsx
│   ├── PropertyQR.tsx
│   ├── PropertyReviews.tsx
│   └── AdminReviews.tsx
└── ScrollToTop.tsx
```

---

## טבלאות Supabase

### properties
id, owner_id, name, slug, short_description, description, category[], region, city, address,
price_per_night, min_nights, max_guests, bedrooms, bathrooms, instant_book, accepts_miluim,
has_shelter, status, video_url, phone_landline, whatsapp1, whatsapp2, email1, email2,
contact_via_*, avg_rating, total_reviews, lat, lng, created_at, updated_at

### caravans (חדש)
id, owner_id, name, slug, short_description, description, caravan_type (auto/trailer/stationed/truck),
region, city, price_per_night, min_nights, pricing_type, can_relocate, manufacture_year,
sleeping_capacity, double_beds, single_beds, max_guests, phone, phone2, whatsapp, email,
instant_book, video_url, amenities (TEXT[]), status, avg_rating, total_reviews,
lat, lng, created_at, updated_at

### caravan_images
id, caravan_id, url, is_primary, order

### caravan_reviews
id, caravan_id, user_id, rating, comment, created_at

### attractions
id, owner_id, name, slug, short_description, description, region, city, address,
price_per_person, min_age, max_age, activity_type[], opening_hours (JSON),
notes, phone, whatsapp, email, website, video_url, avg_rating, total_reviews,
status, lat, lng, created_at, updated_at

### attraction_images
id, attraction_id, url, is_primary, order

### attraction_reviews
id, attraction_id, user_id, rating, comment, created_at

### property_images
id, property_id, url, is_primary, order

### blocked_dates
id, property_id, date, status (blocked/approved)

### profiles
id, full_name, role (admin/owner/guest), avatar_url

### amenities + property_amenities
### wishlists, bookings, reviews, notifications, leads, admin_contacts

---

## Storage Buckets
- `property-images` — תמונות נכסים (public)
- `avatars` — תמונות פרופיל (public)
- `attraction-images` — תמונות אטרקציות (public)
- `caravan-images` — תמונות + וידאו קרוואנים (public)

---

## RLS Policies — caravans

```sql
CREATE POLICY "caravans_select" ON caravans FOR SELECT USING (
  status = 'active' OR auth.uid() = owner_id
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "caravans_insert" ON caravans FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "caravans_update" ON caravans FOR UPDATE USING (
  auth.uid() = owner_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "caravans_delete" ON caravans FOR DELETE USING (
  auth.uid() = owner_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
```

---

## ערכי Region
```
north, galil_west, galil_upper, galil_lower, kinneret, hermon,
center, jerusalem, dead_sea, negev, eilat, golan
```

## ערכי Category (נכסים)
```
zimmer, complex, villa, caravan, hotel, camping, attraction
```

## סוגי קרוואן
```
auto, trailer, stationed, truck
```

---

## Middleware (src/middleware.ts)
נתיבים שמורים:
```
search, hotels, camping, deals, advertise, find, wishlist, auth,
dashboard, properties, attractions, caravans, api, delete-data,
_next, favicon.ico, logo.png, robots.txt, sitemap.xml
```
כל URL עם segment יחיד → מנותב ל-/properties/[slug]

---

## Navbar
- Mega menu עם אנימציה (scaleY spring effect 0.7 → 1)
- תפריטים: צימרים, וילות ובקתות, אטרקציות, קרוואנים
- כל תפריט עם 3 סקשנים (אזור / קהל יעד / זמינות)
- Mobile: accordion עם אנימציה
- CARAVAN_MENU: byType, byRegion, byFeature

---

## לוח בקרה אדמין (dashboard/admin)
- Tabs: סקירה כללית / צימרים ווילות / אטרקציות / קרוואנים / מלונות / קמפינג
- DonutChart עם Canvas API לכל קטגוריה
- KPI cards: סה"כ / פעילים / ממתינים / נדחו
- מפת ישראל Leaflet עם pins אמיתיים לפי lat/lng
- תרשים עמודות לפי אזור וסוג נכס
- טבלת ממתינים לאישור
- FullTable לכל קטגוריה עם filter / עריכה / מחיקה / תאריך

---

## לוח בקרה Owner (dashboard/owner)
- סטטיסטיקות: נכסים / קרוואנים / אטרקציות / ממתינים
- טבלאות: הנכסים שלי / הקרוואנים שלי / האטרקציות שלי
- כפתורי הוספה לכל סוג

---

## טופס הוספת קרוואן (dashboard/caravans/new)
1. שם העסק + סוג קרוואן + תיאור קצר + תיאור מורחב
2. תמונות (preview מיידי, עד 5MB לתמונה)
3. וידאו (קישור YouTube/Vimeo או העלאת קובץ)
4. מיקום האיסוף/השכרה (אזור + עיר + checkbox הצבה)
5. תמחור (החל מ + מינימום לילות + הזמנה מיידית)
6. מפרט (מיטות זוגיות + בודדות + מקס אורחים + שנת ייצור)
7. יצירת קשר (טלפון 1 + טלפון 2 + וואטסאפ + מייל)
8. שירותים (10 קטגוריות, checkboxes)

---

## שירותי קרוואן (CARAVAN_AMENITIES) — 10 קטגוריות
נוחות ואבזור פנים, מטבח, חדר רחצה, חשמל ואנרגיה,
מים ותשתיות, חוץ ופנאי, בידור ויוקרה, בטיחות, אבזור פרימיום, מתאים ל

---

## Leaflet — מניעת "Map container already initialized"
```tsx
containerRef.current.innerHTML = ''
const mapDiv = document.createElement('div')
containerRef.current.appendChild(mapDiv)
const map = L.map(mapDiv, {...})
```

---

## Next.js 16 — params בדפים דינמיים
```tsx
import { use } from 'react'
const { id } = use(params as unknown as Promise<{ id: string }>)
```

---

## פקודות שימושיות

```bash
# פיתוח
npm run dev

# Build
npm run build 2>&1 | tail -20

# Deploy
git add -A && git commit -m "message" && git push
git commit --allow-empty -m "force redeploy" && git push

# כתיבת קבצים גדולים — תמיד python3
python3 << 'PYEOF'
content = """..."""
with open('path/to/file.tsx', 'w') as f:
    f.write(content)
print("Done!")
PYEOF
```

---

## TODO עדכני

### 🔴 דחוף
- [ ] דף עריכת קרוואן (dashboard/caravans/[id]/edit)
- [ ] lat/lng אוטומטי בהוספת נכס (geocoding)

### 🟠 בהמשך
- [ ] לוח שנה זמינות לקרוואנים
- [ ] CallMeBot WhatsApp API
- [ ] מערכת הזמנות אמיתית
- [ ] דפי hotels, camping, deals
- [ ] ביקורות על נכסים (properties)
- [ ] Schema.org JSON-LD
- [ ] RLS policies לטבלת caravan_images
- [ ] Lighthouse audit
