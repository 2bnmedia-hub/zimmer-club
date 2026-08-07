import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* ── Types ── */
export type SearchType = 'property' | 'caravan' | 'attraction'

export interface SearchResult {
  id: string
  slug: string
  name: string
  image: string | null
  city: string
  region: string
  price_per_night: number
  avg_rating: number
  type: SearchType
}

interface Intent {
  type: SearchType | null
  regions: string[]
  maxPrice: number | null
  minGuests: number | null
}

/* ── Region mapping: Hebrew/English → DB slugs ── */
const REGION_MAP: [RegExp, string[]][] = [
  [/גליל עליון|upper.?galil/i,                  ['galil_upper']],
  [/גליל תחתון|lower.?galil/i,                  ['galil_lower']],
  [/גליל מערבי|west.?galil/i,                   ['galil_west']],
  [/\bגליל\b|galilee/i,                         ['galil', 'galil_upper', 'galil_lower', 'galil_west']],
  [/\bגולן\b|golan/i,                           ['golan']],
  [/כנרת|kinneret|tiberias|טבריה/i,             ['kinneret']],
  [/חרמון|hermon/i,                             ['hermon']],
  [/ים.?המלח|dead.?sea/i,                       ['dead_sea']],
  [/\bנגב\b|negev/i,                            ['negev']],
  [/\bאילת\b|eilat/i,                           ['eilat']],
  [/ירושלים|jerusalem/i,                        ['jerusalem']],
  [/כרמל|carmel/i,                              ['carmel']],
  [/מרכז|center|שרון|שפלה/i,                   ['center']],
  [/\bצפון\b|north(?:.?israel)?/i,              ['galil', 'galil_upper', 'galil_lower', 'galil_west', 'kinneret', 'hermon', 'golan']],
  [/\bדרום\b|south(?:.?israel)?/i,              ['negev', 'south', 'arava']],
]

const REGION_LABEL: Record<string, string> = {
  galil: 'גליל', galil_upper: 'גליל עליון', galil_lower: 'גליל תחתון',
  galil_west: 'גליל מערבי', golan: 'רמת הגולן', kinneret: 'כנרת',
  hermon: 'חרמון', dead_sea: 'ים המלח', negev: 'נגב', eilat: 'אילת',
  jerusalem: 'ירושלים', center: 'מרכז', north: 'צפון', south: 'דרום',
  arava: 'ערבה', carmel: 'כרמל',
}

/* ── Intent parsing ── */
function parseIntent(msg: string): Intent {
  let type: SearchType | null = null

  if (/קרוואן|גלמפינג|caravan|glamping|אוהל יוקרה/i.test(msg)) {
    type = 'caravan'
  } else if (/אטרקציה|אטרקציות|פעילות|attraction|activity|park|גן לאומי/i.test(msg)) {
    type = 'attraction'
  } else if (/צימר|וילה|בית.?נופש|סוויטה|zimmer|villa|cottage|cabin|נופש|לינה|לישון|ללון|חופשה|vacation|stay|accommodation|סוף.?שבוע|weekend/i.test(msg)) {
    type = 'property'
  }

  if (!type) return { type: null, regions: [], maxPrice: null, minGuests: null }

  let regions: string[] = []
  for (const [pattern, slugs] of REGION_MAP) {
    if (pattern.test(msg)) { regions = slugs; break }
  }

  const priceMatch = msg.match(/עד\s*(\d+)|(\d+)\s*(?:ש"ח|שקל|₪|nis)/i)
  const maxPrice = priceMatch ? parseInt(priceMatch[1] || priceMatch[2]) : null

  const guestsMatch = msg.match(/(\d+)\s*(?:אורחים|אנשים|נפשות|guests?|people|persons?)/i)
  const minGuests = guestsMatch ? parseInt(guestsMatch[1]) : null

  return { type, regions, maxPrice, minGuests }
}

function detectGenderChange(msg: string): 'female' | null {
  if (/\b(אני בחורה|אני אישה|אני נקבה|אני בת|אני גברת)\b/i.test(msg) ||
      /\bi'?m (?:a )?(?:girl|woman|female|lady)\b/i.test(msg)) {
    return 'female'
  }
  return null
}

/* ── DB helpers ── */
function pickImg(imgs: any[] | null): string | null {
  if (!imgs?.length) return null
  const primary = imgs.find(i => i.is_primary)
  if (primary) return primary.url
  return [...imgs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.url ?? null
}

async function runSearch(intent: Intent): Promise<SearchResult[]> {
  const { type, regions, maxPrice, minGuests } = intent

  if (type === 'property') {
    let q = supabase
      .from('properties')
      .select('id, slug, name, city, region, price_per_night, avg_rating, property_images(url, is_primary, "order")')
      .eq('status', 'active')
      .order('avg_rating', { ascending: false })
      .limit(4)
    if (regions.length === 1) q = q.eq('region', regions[0])
    else if (regions.length > 1) q = q.in('region', regions)
    if (maxPrice) q = q.lte('price_per_night', maxPrice)
    if (minGuests) q = q.gte('max_guests', minGuests)
    const { data } = await q
    return (data || []).map((p: any) => ({
      id: p.id, slug: p.slug, name: p.name,
      image: pickImg(p.property_images),
      city: p.city, region: REGION_LABEL[p.region] ?? p.region,
      price_per_night: p.price_per_night, avg_rating: Number(p.avg_rating) || 0,
      type: 'property' as const,
    }))
  }

  if (type === 'caravan') {
    let q = supabase
      .from('caravans')
      .select('id, slug, name, city, region, price_per_night, avg_rating, caravan_images(url, "order")')
      .eq('status', 'active')
      .order('avg_rating', { ascending: false })
      .limit(4)
    if (regions.length === 1) q = q.eq('region', regions[0])
    else if (regions.length > 1) q = q.in('region', regions)
    if (maxPrice) q = q.lte('price_per_night', maxPrice)
    if (minGuests) q = q.gte('max_guests', minGuests)
    const { data } = await q
    return (data || []).map((c: any) => ({
      id: c.id, slug: c.slug, name: c.name,
      image: pickImg(c.caravan_images),
      city: c.city, region: REGION_LABEL[c.region] ?? c.region,
      price_per_night: c.price_per_night, avg_rating: Number(c.avg_rating) || 0,
      type: 'caravan' as const,
    }))
  }

  // attraction
  let q = supabase
    .from('attractions')
    .select('id, slug, name, city, region, avg_rating, attraction_images(url, "order")')
    .eq('status', 'active')
    .order('avg_rating', { ascending: false })
    .limit(4)
  if (regions.length === 1) q = q.eq('region', regions[0])
  else if (regions.length > 1) q = q.in('region', regions)
  const { data } = await q
  return (data || []).map((a: any) => ({
    id: a.id, slug: a.slug, name: a.name,
    image: pickImg(a.attraction_images),
    city: a.city, region: REGION_LABEL[a.region] ?? a.region,
    price_per_night: 0, avg_rating: Number(a.avg_rating) || 0,
    type: 'attraction' as const,
  }))
}

/* ── System prompt ── */
function buildSystemPrompt(gender: 'male' | 'female', resultCount: number, hasSearch: boolean): string {
  const gLine = gender === 'female'
    ? 'פני למשתמשת בלשון נקבה (למשל: "את יכולה", "תמצאי", "ברוכה הבאה").'
    : 'פנה למשתמש בלשון זכר (למשל: "אתה יכול", "תמצא", "ברוך הבא").'

  const rLine = hasSearch
    ? resultCount > 0
      ? `נמצאו ${resultCount} נכסים — כתוב משפט הקדמה קצר אחד בלבד. הכרטיסים מוצגים אוטומטית, אל תפרט אותם בטקסט.`
      : 'לא נמצאו נכסים תואמים — ציין בידידותיות והצע חלופה (אזור אחר, תקציב גבוה יותר, סוג נכס שונה).'
    : ''

  return [
    'אתה זימי — עוזר ה-AI של zimmer.club, פלטפורמת הנופש המובילה בישראל.',
    gLine,
    'ענה תמיד בשפה שבה המשתמש פונה אליך (עברית, אנגלית, ערבית, רוסית וכו\').',
    'שמות נכסים, ערים ואזורים — תמיד בעברית כפי שנשמרו, גם אם השיחה בשפה אחרת.',
    rLine,
    'היה קצר וידידותי — עד 2 משפטים. אם לא קשור לנופש — "אני מתמחה בנופש ואירוח בישראל 🏡".',
  ].filter(Boolean).join('\n')
}

/* ── Handler ── */
export async function POST(req: NextRequest) {
  const { messages, gender = 'male' } = await req.json()
  const lastMsg: string = messages[messages.length - 1]?.content ?? ''

  const detectedGender = detectGenderChange(lastMsg)
  const effectiveGender: 'male' | 'female' = detectedGender ?? gender

  const intent = parseIntent(lastMsg)
  let results: SearchResult[] = []
  if (intent.type) {
    try { results = await runSearch(intent) } catch (e) {
      console.error('Zimi search error:', e)
    }
  }

  const systemPrompt = buildSystemPrompt(effectiveGender, results.length, intent.type !== null)

  // Strip non-text fields before sending to LLM
  const groqMessages = messages.map((m: any) => ({ role: m.role, content: m.content }))

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...groqMessages],
      max_tokens: 220,
      temperature: 0.4,
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ reply: 'מצטער, אני לא זמין כרגע. נסה שוב עוד רגע 😊' })
  }

  const data = await res.json()
  const reply: string = data.choices?.[0]?.message?.content ?? 'שגיאה — נסה שוב 😊'

  return NextResponse.json({
    reply,
    results: results.length ? results : undefined,
    detectedGender: detectedGender ?? undefined,
  })
}
