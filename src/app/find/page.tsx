'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { REGIONS } from '@/lib/constants'
import { Sparkles, Star, MapPin, Users, RefreshCw } from 'lucide-react'

type Property = {
  id: string
  name: string
  short_description: string
  category: string[]
  region: string
  city: string
  price_per_night: number
  max_guests: number
  bedrooms: number
  avg_rating: number
  total_reviews: number
  instant_book: boolean
}

type Message = {
  role: 'ai' | 'user'
  text: string
}

type Filters = {
  category?: string
  region?: string
  maxPrice?: number
  minPrice?: number
  guests?: number
  instant_book?: boolean
}

const QUESTIONS = [
  { key: 'occasion', text: 'שלום! אני כאן כדי למצוא לך את הנכס המושלם 🏡\n\nבשביל מה אתם מחפשים?', options: ['סוף שבוע רומנטי', 'חופשה משפחתית', 'חברים וכיף', 'אירוע מיוחד', 'עבודה מרחוק'] },
  { key: 'region', text: 'לאיזה אזור בארץ אתם רוצים לברוח? 🗺️', options: ['הגליל', 'הכרמל', 'ים המלח', 'הנגב', 'הגולן', 'השרון', 'ירושלים והסביבה', 'אילת', 'כל הארץ'] },
  { key: 'guests', text: 'כמה אנשים בסך הכל? 👥', options: ['2 אנשים', '3-4 אנשים', '5-6 אנשים', '7-10 אנשים', 'יותר מ-10'] },
  { key: 'budget', text: 'מה התקציב ללילה? 💰', options: ['עד ₪500', '₪500–₪1,000', '₪1,000–₪2,000', '₪2,000–₪3,500', 'ללא הגבלה'] },
  { key: 'type', text: 'איזה סוג נכס מתאים לכם? 🏘️', options: ['צימר אינטימי', 'וילה עם בריכה', 'בקתה ביער', 'כל סוג — הפתיעו אותי!'] },
  { key: 'extras', text: 'מה חשוב לכם במיוחד? ✨', options: ['ג\'קוזי', 'בריכה', 'נוף מרהיב', 'פינת אש/קמין', 'ידידותי לכלבים', 'הזמנה מיידית', 'לא חשוב'] },
]

function buildFilters(answers: Record<string, string>): Filters {
  const filters: Filters = {}
  if (answers.region && answers.region !== 'כל הארץ') {
    const regionMap: Record<string, string> = {
      'הגליל': 'galil', 'הכרמל': 'carmel', 'ים המלח': 'dead_sea',
      'הנגב': 'negev', 'הגולן': 'golan', 'השרון': 'sharon',
      'ירושלים והסביבה': 'jerusalem', 'אילת': 'eilat',
    }
    filters.region = regionMap[answers.region]
  }
  if (answers.guests) {
    if (answers.guests === '2 אנשים') filters.guests = 2
    else if (answers.guests === '3-4 אנשים') filters.guests = 3
    else if (answers.guests === '5-6 אנשים') filters.guests = 5
    else if (answers.guests === '7-10 אנשים') filters.guests = 7
    else filters.guests = 10
  }
  if (answers.budget) {
    if (answers.budget === 'עד ₪500') filters.maxPrice = 500
    else if (answers.budget === '₪500–₪1,000') { filters.minPrice = 500; filters.maxPrice = 1000 }
    else if (answers.budget === '₪1,000–₪2,000') { filters.minPrice = 1000; filters.maxPrice = 2000 }
    else if (answers.budget === '₪2,000–₪3,500') { filters.minPrice = 2000; filters.maxPrice = 3500 }
  }
  if (answers.type === 'צימר אינטימי') filters.category = 'zimmer'
  else if (answers.type?.includes('וילה')) filters.category = 'villa'
  if (answers.extras === 'הזמנה מיידית') filters.instant_book = true
  return filters
}

export default function FindPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [step, setStep] = useState(0)
  const [results, setResults] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [images, setImages] = useState<Record<string, string>>({})
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([{ role: 'ai', text: QUESTIONS[0].text }])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, results])

  const handleOption = async (option: string) => {
    const currentQ = QUESTIONS[step]
    const newAnswers = { ...answers, [currentQ.key]: option }
    setAnswers(newAnswers)
    setMessages(prev => [...prev, { role: 'user', text: option }])
    const nextStep = step + 1
    if (nextStep < QUESTIONS.length) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: QUESTIONS[nextStep].text }])
        setStep(nextStep)
      }, 400)
    } else {
      setStep(nextStep)
      setLoading(true)
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: 'מעולה! מחפש עבורכם את הנכסים המתאימים ביותר... 🔍' }])
      }, 400)
      await fetchResults(newAnswers)
    }
  }

  const fetchResults = async (ans: Record<string, string>) => {
    const filters = buildFilters(ans)
    let query = supabase.from('properties').select('*').eq('status', 'active')
    if (filters.region) query = query.eq('region', filters.region)
    if (filters.category) query = query.contains('category', [filters.category])
    if (filters.guests) query = query.gte('max_guests', filters.guests)
    if (filters.maxPrice) query = query.lte('price_per_night', filters.maxPrice)
    if (filters.minPrice) query = query.gte('price_per_night', filters.minPrice)
    if (filters.instant_book) query = query.eq('instant_book', true)
    const { data } = await query.order('avg_rating', { ascending: false }).limit(6)
    const props = data || []
    if (props.length > 0) {
      const ids = props.map((p: Property) => p.id)
      const { data: imgData } = await supabase.from('property_images').select('property_id, url').in('property_id', ids).eq('is_primary', true)
      const imgMap: Record<string, string> = {}
      imgData?.forEach((img: { property_id: string; url: string }) => { imgMap[img.property_id] = img.url })
      setImages(imgMap)
    }
    setResults(props)
    setLoading(false)
    setDone(true)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: props.length > 0 ? `מצאתי ${props.length} נכסים שמתאימים לכם! 👇` : 'לא מצאתי נכסים מדויקים, אבל הנה כמה אפשרויות קרובות 👇'
      }])
    }, 800)
  }

  const reset = () => {
    setMessages([{ role: 'ai', text: QUESTIONS[0].text }])
    setAnswers({})
    setStep(0)
    setResults([])
    setDone(false)
    setImages({})
  }

  const currentOptions = step < QUESTIONS.length ? QUESTIONS[step].options : []

  return (
    <div className="min-h-screen flex flex-col" dir="rtl" style={{ background: 'linear-gradient(135deg, #fdf8f0 0%, #f5efe0 100%)' }}>
      <div className="text-center py-10 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: '#FDF3DC', color: '#8B6914' }}>
          <Sparkles className="w-4 h-4" />
          חיפוש חכם מבוסס AI
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">אתרו לי צימר</h1>
        <p className="text-gray-500">ענו על כמה שאלות קצרות — ונמצא לכם את הנכס המושלם</p>
      </div>
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 pb-4">
        <div className="space-y-4 mb-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-sm px-5 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${msg.role === 'ai' ? 'text-gray-800 rounded-tl-sm' : 'text-white rounded-tr-sm'}`}
                style={msg.role === 'ai' ? { backgroundColor: 'white' } : { background: 'linear-gradient(135deg, #C8960C, #8B6914)' }}>
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: '#8B6914' }} />
                    <span className="text-xs font-bold" style={{ color: '#8B6914' }}>zimmer AI</span>
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-end">
              <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#8B6914', animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#8B6914', animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#8B6914', animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        {!done && !loading && step < QUESTIONS.length && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {currentOptions.map(option => (
              <button key={option} onClick={() => handleOption(option)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all hover:scale-105 hover:shadow-md"
                style={{ borderColor: '#8B6914', color: '#8B6914', backgroundColor: 'white' }}>
                {option}
              </button>
            ))}
          </div>
        )}
        {done && results.length > 0 && (
          <div className="space-y-4 mb-8">
            {results.map(p => (
              <Link key={p.id} href={`/properties/${p.id}`}
                className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 group">
                <div className="flex">
                  <div className="w-36 h-32 flex-shrink-0 bg-gray-100 relative overflow-hidden">
                    {images[p.id] ? (
                      <img src={images[p.id]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">🏡</div>
                    )}
                    {p.instant_book && (
                      <div className="absolute top-2 right-2 bg-white text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ color: '#8B6914' }}>מיידי</div>
                    )}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-900 text-base group-hover:text-yellow-700 transition-colors leading-tight">{p.name}</h3>
                      {p.avg_rating > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0 mr-2">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {p.avg_rating}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <MapPin className="w-3 h-3" />
                      {p.city || REGIONS[p.region as keyof typeof REGIONS]?.label}
                    </div>
                    {p.short_description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{p.short_description}</p>}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900 text-sm">₪{p.price_per_night}</span>
                        <span className="text-xs text-gray-400"> / לילה</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Users className="w-3 h-3" />
                        עד {p.max_guests}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {done && results.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-lg mb-2">לא נמצאו נכסים</p>
            <Link href="/search" className="inline-block mt-4 px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: '#8B6914' }}>עבור לחיפוש</Link>
          </div>
        )}
        {done && (
          <div className="text-center pb-10">
            <button onClick={reset} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border-2 transition-all hover:scale-105" style={{ borderColor: '#8B6914', color: '#8B6914' }}>
              <RefreshCw className="w-4 h-4" />
              חפש שוב
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
