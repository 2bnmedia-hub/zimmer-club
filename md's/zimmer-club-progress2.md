# zimmer.club - סיכום פיתוח 2

## המשך מ-progress1.md

---

## שינויים שבוצעו

### Auto-Logout אחרי 5 דקות idle
- `src/hooks/useIdleLogout.ts` — hook שמאזין לפעילות משתמש
- `src/components/layout/IdleLogoutProvider.tsx` — provider שעוטף את האפליקציה
- `src/app/layout.tsx` — עטיפת Navbar ו-children ב-IdleLogoutProvider
- `src/app/auth/login/page.tsx` — הודעת amber כשמגיעים עם `?reason=idle`
- Client: `@/lib/supabase/client` (לא `@supabase/auth-helpers-nextjs`)

### תיקון Amenities
- **באג:** join של `amenities(key)` נכשל בשקט → עכשיו שתי שאילתות נפרדות
- דף עריכה: `property_amenities` → ids → `amenities` לפי `in('id', ids)`
- דף נכס: אותו תיקון
- **נוספו 6 amenities חסרים ל-Supabase:** gym, baby_cot, wheelchair, shelter, heated_pool, pets
- **נוספו 18 amenities נוספים ל-Supabase:** spa, private_pool, snooker, private_jacuzzi, accessible, couples, families, groups, animals, guests, religious, suite, treehouse, cave, mobile, longstay, vacation, shelter_nearby

### לוח זמינות בדף הנכס
- קומפוננטת `AvailabilityCalendar` — read-only
- ירוק = פנוי, אדום = תפוס
- סטטוס פושט ל-2 בלבד: פנוי/תפוס (הוסר "הזמנה מאושרת")

### אמצעי תקשורת לקבלת הזמנות
- נוספו עמודות לטבלת `properties`:
  - `phone_landline`, `whatsapp1`, `whatsapp2`, `email1`, `email2`
  - `contact_via_phone_landline`, `contact_via_whatsapp1`, `contact_via_whatsapp2`, `contact_via_email1`, `contact_via_email2`
- דף עריכת נכס: סקשן "אמצעי תקשורת לקבלת הזמנות" עם checkbox לכל אמצעי
- דף הוספת נכס: אותו סקשן

### ולידציה תאריכים
- `min` = היום, `max` = 2099-12-31
- הודעות שגיאה בעברית ב-onChange
- SearchBar + דף נכס

### מפה בדף הנכס
- Google Maps Embed (ללא API key)
- מוצג בעמודה הימנית מתחת למחיר
- כפתור כחול "נווט ב-Google Maps"

### admin_contacts — אמצעי תקשורת דינמיים
- טבלת `admin_contacts` ב-Supabase (type, value, label, active)
- RLS: אדמין בלבד
- `src/app/api/contact/route.ts` — שולח לכל האימיילים הפעילים מהטבלה
- `src/app/dashboard/admin/contacts/page.tsx` — דף ניהול (הוסף/מחק/הפעל/כבה)
- כפתור "אמצעי תקשורת" בדף האדמין הראשי

### דף הוספת נכס — שיפורים
- הוסרה המילה "צימרים" מרשימת האיזורים
- עיר/יישוב וכתובת — שדות חובה
- נוספה "רמת הגולן" לרשימת האיזורים
- רשימת amenities סונכרנה עם דף העריכה (36 אפשרויות)

### AMENITY_LABELS בדף הנכס
- נוספו תרגומים לכל 36 המאפיינים

---

## מבנה Supabase — עדכונים

### טבלאות חדשות
| טבלה | עמודות |
|------|--------|
| `admin_contacts` | id, type, value, label, active, created_at |

### עמודות חדשות בטבלת `properties`
| עמודה | סוג |
|-------|-----|
| `phone_landline` | text |
| `whatsapp1` | text |
| `whatsapp2` | text |
| `email1` | text |
| `email2` | text |
| `contact_via_phone_landline` | boolean |
| `contact_via_whatsapp1` | boolean |
| `contact_via_whatsapp2` | boolean |
| `contact_via_email1` | boolean |
| `contact_via_email2` | boolean |

---

## קבצים שעודכנו/נוצרו

```
src/
├── hooks/
│   └── useIdleLogout.ts                          # חדש
├── components/layout/
│   └── IdleLogoutProvider.tsx                    # חדש
├── app/
│   ├── layout.tsx                                # עודכן
│   ├── auth/login/page.tsx                       # עודכן
│   ├── advertise/page.tsx                        # עודכן
│   ├── properties/[id]/page.tsx                  # עודכן
│   ├── dashboard/
│   │   ├── admin/page.tsx                        # עודכן
│   │   ├── admin/contacts/page.tsx               # חדש
│   │   └── properties/
│   │       ├── new/page.tsx                      # עודכן
│   │       └── [id]/edit/page.tsx                # עודכן
│   └── api/contact/route.ts                      # עודכן
```

---

## TODO
- [ ] CallMeBot WhatsApp — ממתין ל-API key
- [ ] מערכת הזמנות (כפתור "הזמן עכשיו" עדיין alert)
- [ ] דף עריכת פרופיל משתמש
- [ ] דפי hotels, camping, deals — טרם פותחו
- [ ] ביקורות על נכסים
