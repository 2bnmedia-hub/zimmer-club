# zimmer.club — מסמך הקשר לפיתוח

## פרטי הפרויקט

**שם הפרויקט:** zimmer.club  
**סוג:** אתר הזמנת צימרים ונכסי אירוח בישראל  
**כתובת live:** https://www.zimmer.club  
**כתובת Vercel:** https://zimmer-club.vercel.app  

---

## סטאק טכנולוגי

| טכנולוגיה | גרסה |
|---|---|
| Next.js | 16.2.6 (Turbopack) |
| React | 18.3.1 |
| TypeScript | כן |
| Tailwind CSS | 3.4.6 |
| Supabase | @supabase/ssr ^0.4.0 |
| Lucide React | 0.408.0 |

---

## תשתיות

| שירות | פרטים |
|---|---|
| Hosting | Vercel (Hobby plan) |
| Database | Supabase |
| Storage | Supabase Storage (bucket: property-images, public) |
| Domain Registrar | GoDaddy |
| Repository | GitHub — github.com/2bnmedia-hub/zimmer-club |
| Branch ראשי | main |

---

## מבנה הפרויקט

```
zimmer-club/
├── public/
│   ├── logo.png                          # לוגו האתר
│   └── hero-bg.png                       # תמונת רקע דף הבית
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # דף הבית + LatestProperties
│   │   ├── search/
│   │   │   └── page.tsx                  # דף חיפוש עם פילטרים + תמונות
│   │   ├── properties/
│   │   │   └── [id]/
│   │   │       └── page.tsx              # דף נכס בודד + גלריה
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── dashboard/
│   │       ├── admin/page.tsx            # לוח בקרה אדמין
│   │       ├── owner/page.tsx            # לוח בקרה בעל נכס
│   │       └── properties/
│   │           ├── new/page.tsx          # הוספת נכס
│   │           └── [id]/edit/page.tsx    # עריכת נכס + ניהול גלריה
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx                # תפריט + מגה מנו + מצב התחברות
│   │   │   └── Footer.tsx
│   │   ├── property/
│   │   │   ├── PropertyCard.tsx
│   │   │   └── LatestProperties.tsx      # נכסים אחרונים לדף הבית
│   │   └── search/
│   │       └── SearchBar.tsx
│   ├── lib/
│   │   ├── constants.ts                  # ZIMMER_MENU, VILLAS_MENU, ATTRACTIONS_MENU, REGIONS, CATEGORIES
│   │   ├── utils.ts
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── server.ts
│   ├── styles/globals.css
│   └── types/index.ts
├── package.json
├── tailwind.config.ts
└── next.config.js
```

---

## משתני סביבה (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## תפריט ניווט (Navbar)

**מגה מנו:**
- צימרים — `ZIMMER_MENU` (byRegion, byAudience, byAvailability)
- וילות ובקתות — `VILLAS_MENU` (byRegion, byAudience, byFeatures)
- אטרקציות — `ATTRACTIONS_MENU` (byRegion, byAudience, popular)

**פריטים רגילים:** מלונות, קמפינג, מבצעים (badge ברונז #8B6914), פרסמו אצלנו, מצא לי זימר

**מצב התחברות:**
- מחובר: שם משתמש + תפריט נפתח (לוח בקרה / הוסף נכס / התנתק)
- לא מחובר: כניסה + הרשמה חינם

---

## מסד הנתונים (Supabase)

### טבלאות:
| טבלה | תיאור |
|---|---|
| `properties` | נכסים |
| `property_images` | תמונות (id, property_id, url, is_primary, order, created_at) |
| `property_amenities` | מאפיינים |
| `blocked_dates` | תאריכים חסומים |
| `bookings` | הזמנות |
| `reviews` | ביקורות |
| `notifications` | התראות |
| `profiles` | משתמשים (id, email, full_name, phone, role) |
| `amenities` | רשימת מאפיינים |

### שדות properties:
id, owner_id, name, description, short_description, category (ARRAY), region, city, address, lat, lng, price_per_night, min_nights, max_guests, bedrooms, bathrooms, status, instant_book, avg_rating, total_reviews, created_at, updated_at

### סטטוסים לנכס:
- `pending` — ממתין לאישור
- `active` — פעיל
- `inactive` — לא פעיל
- `rejected` — נדחה

### RLS:
כל הטבלאות הבאות מושבת עליהן RLS:
- `properties`, `property_images`, `property_amenities`

### Storage:
- Bucket: `property-images` (public)
- נתיב: `{property_id}/{timestamp}.{ext}`
- Policies: allow_select, allow_insert, allow_delete

---

## רמות הרשאה

| תפקיד | הרשאות |
|---|---|
| `admin` | גישה מלאה, אישור/דחיית נכסים, שינוי סטטוס |
| `owner` | גישה לנכסים שלו, עריכה + גלריה |
| `guest` | חיפוש בלבד |

**להגדרת אדמין:**
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'EMAIL@example.com';
```

**מנהלים קיימים:**
- articana@gmail.com
- 2bnbussiness@gmail.com

---

## דפי Dashboard

| נתיב | תיאור |
|---|---|
| `/dashboard/admin` | כל הנכסים, פילטרים, אישור/דחייה |
| `/dashboard/owner` | נכסי המשתמש, סטטיסטיקות |
| `/dashboard/properties/new` | הוספת נכס |
| `/dashboard/properties/[id]/edit` | עריכה + ניהול גלריה (תמונה ראשית, מחיקה) |

---

## דף חיפוש (/search)

- טעינת תמונה ראשית מ-`property_images`
- פילטרים: קטגוריה, איזור, מחיר מינ/מקס, אורחים, הזמנה מיידית
- Suspense wrapper

---

## דף נכס בודד (/properties/[id])

- גלריה עם חיצי ניווט + תמונות ממוזערות
- מאפיינים משולבים מ-`property_amenities`
- טופס הזמנה עם חישוב מחיר

---

## DNS (GoDaddy)

| Type | Name | Value |
|---|---|---|
| A | @ | 216.198.79.1 |
| CNAME | www | d846c583f9139333.vercel-dns-017.com |

---

## פיתוח מקומי

```bash
git clone https://github.com/2bnmedia-hub/zimmer-club.git
cd zimmer-club
npm install
# צור .env.local עם מפתחות Supabase
npm run dev
```

**חשוב:** אל תשתמש ב-TextEdit — שומר כ-RTF. השתמש ב-VSCode או כתוב מהטרמינל בלבד.

---

## פריסה

```bash
git add .
git commit -m "תיאור"
git push
# Vercel פורס אוטומטית תוך ~2 דקות
```

---

## עיצוב

- `#8B6914` — ברונז (כפתורים ראשיים)
- `text-charcoal` — כותרות
- `text-taupe` — טקסט משני
- `text-gold` / `text-gold-deep` — זהב
- `bg-cream-50` — רקע בהיר
- `bg-espresso` — footer

---

## בעל הפרויקט

Wassim Khatib | 2bnmedia.com
