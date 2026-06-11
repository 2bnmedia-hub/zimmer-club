# zimmer.club — סיכום פיתוח 5

## המשך מ-progress4.md

---

## Stack טכני
- **Frontend:** Next.js 16.2.6 (Turbopack), TypeScript, Tailwind CSS
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
│   ├── admin/page.tsx               # לוח בקרה אדמין (נכסים + אטרקציות)
│   ├── admin/contacts/page.tsx
│   ├── profile/page.tsx
│   ├── properties/
│   │   ├── new/page.tsx             # הוספת נכס
│   │   └── [id]/edit/page.tsx       # עריכת נכס
│   └── attractions/
│       ├── new/page.tsx             # הוספת אטרקציה
│       └── [id]/edit/page.tsx       # עריכת אטרקציה ⚠️ יש בעיה - קובץ לא נוצר כהלכה
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

### attractions ⭐ חדש
שדות: id, owner_id, name, slug, short_description, description, region, city, address, price_per_person, min_age, max_age, activity_type[], opening_hours (JSON), notes, phone, whatsapp, email, website, video_url, avg_rating, total_reviews, status, notes, created_at, updated_at

### attraction_images ⭐ חדש
שדות: id, attraction_id, url, is_primary, order

### attraction_reviews ⭐ חדש
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
- `attraction-images` — תמונות אטרקציות (public) ⭐ חדש

---

## ערכי Region (חשוב!)
הערכים התקניים ב-DB:
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
נתיבים שמורים (לא מנותבים ל-slug):
```
search, hotels, camping, deals, advertise, find, wishlist, auth,
dashboard, properties, attractions, api, _next, favicon.ico,
logo.png, robots.txt, sitemap.xml
```
**חשוב:** כל URL עם segment יחיד מנותב ל-`/properties/[slug]`

---

## שינויים שבוצעו ב-progress5

### מובייל — Apple HIG Standards
- Tap targets מינימום 44px
- Safe area insets לiPhone (env(safe-area-inset-bottom))
- Sticky booking bar בדף נכס במובייל
- Gallery swipe (scroll snap) במובייל
- מניעת zoom על input focus (font-size: 16px)
- Navbar 64px במובייל (85px בדסקטופ)
- 2 עמודות כרטיסים במובייל
- globals.css — mobile-first additions

### SEO
- metadata מלא (title, description, OpenGraph, themeColor)
- sitemap.xml דינמי מ-Supabase
- robots.txt
- appleWebApp

### אבטחה
- Security headers ב-next.config.js (X-Frame-Options, XSS, CSP)
- Cache-Control על dashboard routes

### Performance
- next/image במקום img (WebP אוטומטי) — רוב הדפים
- lazy loading תמונות
- הסרת Ken Burns animation (גרמה ל-LCP של 13.7s)

### ציוני PageSpeed (מובייל)
- Performance: 87 (לפני next/image), 69 (אחרי בעיית LCP)
- Accessibility: 84
- Best Practices: 96
- SEO: 100 ✅

### חיפוש ופילטור
- תיקון region values (galil→north, carmel→kinneret וכו')
- Region groups — "צפון" מחפש כל תת-אזורי הצפון
- Audience categories מחפש ב-amenities (לא ב-category)
- sync filters עם URL params כשמנווטים
- סינון תאריכים מול blocked_dates

### Constants (src/lib/constants.ts)
- ZIMMER_MENU — כל הקישורים תוקנו לערכי region נכונים
- VILLAS_MENU — הפנייה ל-/search?category=villa
- ATTRACTIONS_MENU — הפנייה ל-/attractions עם params

### אטרקציות ⭐ מודול חדש
- טבלות: attractions, attraction_images, attraction_reviews
- דף הוספת אטרקציה: /dashboard/attractions/new
- דף עריכת אטרקציה: /dashboard/attractions/[id]/edit ⚠️ בעיה פתוחה
- דף ציבורי: /attractions/[slug] (ביקורות, מפה, שעות)
- דף רשימה: /attractions
- אדמין: ניהול אטרקציות בלוח בקרה
- שדות מיוחדים: opening_hours (JSON שבועי), notes, activity_type[], price_per_person

---

## בעיות פתוחות

### 🔴 דחוף
1. **דף עריכת אטרקציה** — קובץ `src/app/dashboard/attractions/[id]/edit/page.tsx` לא נוצר כהלכה (build error: "not a module"). צריך ליצור מחדש עם `python3` ולא עם `cat << EOF`.

2. **short_description של אטרקציה** — מציג JSON של שעות פעילות (בעיה בשמירה/הצגה)

### 🟠 בהמשך
3. מערכת הזמנות אמיתית (כפתור "הזמן עכשיו" עדיין ללא פונקציה)
4. WhatsApp CallMeBot API
5. דפי camping, hotels, deals — עדיין "בבנייה"
6. ביקורות על נכסים (יש ל-attractions, חסר ל-properties)
7. מפה אינטראקטיבית עם pins בדף חיפוש

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
# שיטה נכונה לקבצים גדולים:
python3 << 'PYEOF'
content = r"""..."""
with open('path/to/file.tsx', 'w') as f:
    f.write(content)
PYEOF
```

### בדיקת DB
```sql
SELECT name, category, region, status FROM properties WHERE status = 'active';
SELECT name, status, region FROM attractions;
```

---

## TODO רשימה
- [ ] תקן דף עריכת אטרקציה (build error)
- [ ] CallMeBot WhatsApp
- [ ] מערכת הזמנות
- [ ] דפי hotels, camping, deals
- [ ] ביקורות נכסים
- [ ] מפה אינטראקטיבית בחיפוש
- [ ] Schema.org JSON-LD לנכסים
- [ ] אופטימיזציה נוספת למובייל
- [ ] Lighthouse audit מעודכן
