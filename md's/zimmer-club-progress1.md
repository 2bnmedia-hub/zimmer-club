# zimmer.club - סיכום פיתוח

## פרטי פרויקט
- **Repository:** github.com/2bnmedia-hub/zimmer-club
- **Branch:** main
- **Hosting:** Vercel (auto-deploy)
- **Stack:** Next.js, TypeScript, Tailwind CSS, Supabase
- **תיקייה מקומית:** `~/zimmer-club`

---

## שינויים שבוצעו

### Navbar
- באג מגה-מנו נסגר → unified `activeMenu` state
- נאבבר `sticky top-0` (נשאר בגלילה)
- רקע שקוף `bg-white/30`

### pt-24 — כל הדפים (navbar fixed)
- `src/app/dashboard/admin/page.tsx`
- `src/app/dashboard/owner/page.tsx`
- `src/app/dashboard/properties/[id]/edit/page.tsx`
- `src/app/search/page.tsx`
- `src/app/properties/[id]/page.tsx`
- `src/app/auth/login/page.tsx`
- `src/app/auth/register/page.tsx`
- `src/app/advertise/page.tsx`
- `src/app/find/page.tsx`

### Hero Section (דף הבית)
- גובה: `min-h-[55vh]` עם `pt-24`

### SearchBar
- ולידציה: כל השדות חובה
- max date: `2030-12-31`
- הודעות שגיאה בעברית

### דף כניסה (`auth/login/page.tsx`)
- Spinner בזמן התחברות
- הודעת שגיאה ברורה עם הפניה לאיפוס סיסמה
- הודעה ירוקה לפני מעבר לדשבורד
- `window.location.href` לרענון מלא (נאבבר מתעדכן)
- אייקון Eye/EyeOff להצגת סיסמה (צד ימין)

### דף הרשמה (`auth/register/page.tsx`)
- אייקון Eye/EyeOff בשני שדות הסיסמה (צד ימין)
- Spinner בכפתור הרשמה

### מחירים — "החל מ:"
- `src/components/property/PropertyCard.tsx`
- `src/components/property/LatestProperties.tsx`
- `src/app/properties/[id]/page.tsx` (מחיר ראשי בלבד)

### מאפיינים ושירותים (Amenities) — תוקן לחלוטין
- **באג שתוקן:** הטבלה `property_amenities` משתמשת ב-`amenity_id` (לא `amenity_key`)
- **דף עריכה:** טוען amenities קיימים בפתיחה + שומר בעת לחיצה על "שמור שינויים"
- **דף נכס:** מציג amenities תחת "מה יש בנכס" עם join לטבלת `amenities`
- **Supabase RLS:** נוספו policies לאדמין ולציבור לקריאה מטבלת `amenities`

### וידאו הנכס — חדש
- נוספה עמודה `video_url` לטבלת `properties` ב-Supabase
- **דף הוספת נכס** (`dashboard/properties/new`): סקשן וידאו מתחת לתמונות
- **דף עריכת נכס** (`dashboard/properties/[id]/edit`): סקשן וידאו מתחת לתמונות
- **דף הנכס** (`properties/[id]`): מציג embed של וידאו (YouTube/Vimeo/קובץ)
- אפשרויות: העלאת קובץ וידאו עד 25MB **או** הדבקת קישור YouTube/Vimeo
- הוידאו מועלה ל-bucket `property-images` ב-Supabase Storage

---

## מבנה Supabase

### טבלאות רלוונטיות
| טבלה | עמודות מרכזיות |
|------|----------------|
| `properties` | id, owner_id, name, video_url, status, ... |
| `property_images` | id, property_id, url, is_primary, order |
| `property_amenities` | property_id, amenity_id |
| `amenities` | id, key, label_he, icon |
| `profiles` | id, full_name, role, phone |

### RLS Policies שנוצרו
- `property_amenities` — owners can manage, admins can manage all, public can read
- `amenities` — public can read

---

## קבצים מרכזיים
```
src/
├── app/
│   ├── page.tsx                          # דף בית
│   ├── layout.tsx
│   ├── auth/login/page.tsx
│   ├── auth/register/page.tsx
│   ├── dashboard/admin/page.tsx
│   ├── dashboard/owner/page.tsx
│   ├── dashboard/properties/[id]/edit/page.tsx
│   ├── dashboard/properties/new/page.tsx
│   ├── properties/[id]/page.tsx
│   ├── search/page.tsx
│   ├── advertise/page.tsx
│   └── find/page.tsx
├── components/
│   ├── layout/Navbar.tsx
│   ├── property/PropertyCard.tsx
│   ├── property/LatestProperties.tsx
│   └── search/SearchBar.tsx
└── styles/globals.css
```

---

## משתמשים ב-Supabase
| אימייל | Role |
|--------|------|
| 2bnbussiness@gmail.com | admin |
| globaly2000@gmail.com | owner |
| a.morad@onebeat.co.il | — |
| articana@gmail.com | — |
| nadinemarzuq@gmail.com | — |
| salim.haytham11@gmail.com | — |

---

## פקודות שימושיות
```bash
cd ~/zimmer-club
git add -A && git commit -m "message" && git push
```

---

## TODO
- [ ] הוסף amenities לנכסים קיימים דרך דף עריכה
- [ ] דפי hotels, camping, deals — טרם פותחו
- [ ] לבדוק איפוס סיסמה עובד תקין
- [ ] שיפורים נוספים בדף הנכס (property page)
