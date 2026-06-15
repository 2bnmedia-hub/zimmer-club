# zimmer.club — סיכום פיתוח מלא (progress10)

## Stack טכני
- **Frontend:** Next.js 16.2.6 (Turbopack), TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, DB, Storage, RLS)
- **Deploy:** Vercel (auto-deploy מ-GitHub: 2bnmedia-hub/zimmer-club)
- **Domain:** zimmer.club
- **Map:** Leaflet + react-leaflet@4.2.1 (תואם React 18)

---

## מיקום הפרויקט
```
~/Desktop/zimmer-club
```

## פקודת הרצה (כל פעם בטרמינל חדש)
```bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && cd ~/Desktop/zimmer-club && npm run dev
```

## פקודת Deploy
```bash
cd ~/Desktop/zimmer-club && git add -A && git commit -m "message" && git push
```

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
│   ├── SearchBar.tsx                # Custom dropdowns עם createPortal
│   ├── AdvancedSearchPanel.tsx      # Custom dropdowns עם CustomSelect
│   └── GlobalSearch.tsx            # ✅ חדש — חיפוש טקסט חופשי מעל SearchBar
├── property/
│   ├── LatestProperties.tsx
│   ├── PropertyCard.tsx
│   ├── PropertyQR.tsx
│   ├── PropertyReviews.tsx
│   └── AdminReviews.tsx
├── CustomSelect.tsx                 # קומפוננט dropdown מותאם (לסרגלי חיפוש)
└── ScrollToTop.tsx
```

---

## טבלאות Supabase

### properties
id, owner_id, name, slug, short_description, description, category[], region, city, address,
price_per_night, min_nights, max_guests, bedrooms, bathrooms, instant_book, accepts_miluim,
has_shelter, status, video_url, phone_landline, whatsapp1, whatsapp2, email1, email2,
contact_via_*, avg_rating, total_reviews, lat, lng, created_at, updated_at

### caravans
id, owner_id, name, slug, short_description, description, caravan_type (auto/trailer/stationed/truck),
region, city, price_per_night, min_nights, pricing_type, can_relocate, manufacture_year,
sleeping_capacity, double_beds, single_beds, max_guests, phone, phone2, whatsapp, email,
instant_book, video_url, amenities (TEXT[]), status, avg_rating, total_reviews,
lat, lng, created_at, updated_at

### caravan_images / attraction_images / property_images
id, [entity]_id, url, is_primary, order

### attractions
id, owner_id, name, slug, short_description, description, region, city, address,
price_per_person, min_age, max_age, activity_type[], opening_hours (JSON),
notes, phone, whatsapp, email, website, video_url, avg_rating, total_reviews,
status, lat, lng, created_at, updated_at

### profiles
id, full_name, role (admin/owner/guest), avatar_url

### wishlists, bookings, reviews, notifications, leads, admin_contacts, blocked_dates

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

---

## Navbar
- Mega menu עם אנימציה (scaleY spring effect 0.7 → 1)
- תפריטים: צימרים, וילות ובקתות, אטרקציות, קרוואנים
- כל תפריט עם 3 סקשנים (אזור / קהל יעד / זמינות)
- Mobile: accordion עם אנימציה
- **z-index: z-[99999]** על ה-header וה-mega menu

---

## כפתורים — עיצוב אחיד (✅ בוצע ב-progress10)

כל הכפתורים הזהובים באתר משתמשים ב:
```css
.btn-gold {
  padding: 0.5rem 1rem;
  height: 34px;
  border-radius: 9999px;  /* rounded-full */
  font-size: 0.875rem;    /* text-sm */
  font-weight: 700;       /* font-bold */
  color: white;
  background: linear-gradient(135deg, #C8960C 0%, #8B6914 50%, #C8960C 100%);
  background-size: 200% auto;
  animation: shimmer 2s linear infinite;
  box-shadow: 0 2px 8px rgba(139,105,20,0.4);
}
```

**4 כפתורים שאוחדו:**
1. "הרשמה חינם" — Navbar.tsx שורה ~338
2. "מבצעים" — Navbar.tsx שורה ~237
3. "חיפוש" — GlobalSearch.tsx (btn-gold)
4. "חיפוש" — SearchBar.tsx (btn-gold)

---

## Custom Dropdowns — ארכיטקטורה

### SearchBar.tsx — Drop component
- משתמש ב-`createPortal` לרינדור ישירות על ה-`body`
- `position: fixed` עם חישוב מיקום דינמי מ-`getBoundingClientRect()`

### CustomSelect.tsx
- `position: absolute` + `z-index: 9999`
- סגירה אוטומטית בלחיצה מחוץ (mousedown listener)

### היררכיית z-index
```
Navbar header + mega menu  → z-[99999]
SearchBar Drop (portal)    → z-[999999] (fixed על body)
CustomSelect dropdown      → z-[9999]
SearchBar wrapper          → z-[50]
```

---

## GlobalSearch.tsx — קומפוננט חדש (progress10)
```
src/components/search/GlobalSearch.tsx
```
- חיפוש טקסט חופשי לפי שם/עיר/אזור
- מנווט ל: `/search?q=QUERY`
- מוצב מעל SearchBar ב-page.tsx
- כפתור חיפוש עם btn-gold (אחיד עם שאר האתר)

---

## תיקונים שבוצעו ב-progress10

### ✅ שגיאות Build שתוקנו
- `GlobalSearch` חסר → נוצר הקובץ + הוחזר ל-page.tsx
- `qrcode` package חסר → `npm install qrcode @types/qrcode`

### ✅ תיקוני מובייל
- `mobile-booking-bar` overflow → נוספו `width: 100%`, `max-width: 100vw`, `box-sizing: border-box`

### ✅ עיצוב
- כל 4 הכפתורים הזהובים → אחיד: 34px גובה, btn-gold class, shimmer animation
- "הרשמה חינם" — עודכן מ-backgroundColor סטטי ל-gradient + animation

---

## Packages שהותקנו ב-progress10
```bash
npm install qrcode @types/qrcode
```

---

## Next.js 16 — params בדפים דינמיים
```tsx
import { use } from 'react'
const { id } = use(params as unknown as Promise<{ id: string }>)
```

---

## Leaflet — מניעת "Map container already initialized"
```tsx
containerRef.current.innerHTML = ''
const mapDiv = document.createElement('div')
containerRef.current.appendChild(mapDiv)
const map = L.map(mapDiv, {...})
```

---

## פקודות שימושיות
```bash
# פיתוח
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && cd ~/Desktop/zimmer-club && npm run dev

# Build
npm run build 2>&1 | tail -20

# Deploy
git add -A && git commit -m "message" && git push

# כתיבת קבצים גדולים — תמיד python3
python3 << 'PYEOF'
content = """..."""
with open('path/to/file.tsx', 'w') as f:
    f.write(content)
print("Done!")
PYEOF
```

---

## כללי עבודה חשובים
- **לא לשלוח deploy לפני אישור** שהפקודה הצליחה
- **לפני כל deploy** לוודא build תקין: `npm run build`
- **dropdown בעיות z-index** — להשתמש תמיד ב-`createPortal` על ה-`body`
- **select נייטיב בטפסים dashboard** — לא לשנות, רק בסרגלי חיפוש
- **לא לחלק משימות** — לבצע א-ת בפקודה אחת
- **לפני שינוי קוד** — תמיד לקרוא את הקובץ הנוכחי קודם

---

## TODO עדכני

### 🔴 דחוף
- [ ] דף עריכת קרוואן (dashboard/caravans/[id]/edit)
- [ ] lat/lng אוטומטי בהוספת נכס (geocoding)
- [ ] Build check לפני deploy (npm run build)

### 🟠 בהמשך
- [ ] CustomSelect לא נסגר בלחיצה בחוץ (דף אטרקציות)
- [ ] LCP warning — תמונה ראשית צריכה `loading="eager"` ב-LatestProperties
- [ ] לוח שנה זמינות לקרוואנים
- [ ] CallMeBot WhatsApp API
- [ ] מערכת הזמנות אמיתית
- [ ] דפי hotels, camping, deals
- [ ] ביקורות על נכסים (properties)
- [ ] Schema.org JSON-LD
- [ ] RLS policies לטבלת caravan_images
- [ ] Lighthouse audit
