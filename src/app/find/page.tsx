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
  { key: 'occasion', text: 'שלום! אני כאן כדי למצוא לך את הנכס המושלם 🏡\n\nבשביל מה אתם מחפשים?', options: ['סוף שבוע רומנטי 💑', 'חופשה משפחתית 👨‍👩‍👧', 'חברים וכיף 🎉', 'אירוע מיוחד 🥂', 'עבודה מרחוק 💻'] },
  { key: 'region', text: 'לאיזה אזור בארץ אתם רוצים לברוח? 🗺️', options: ['הגליל 🌿', 'הכרמל 🌲', 'ים המלח 🧂', 'הנגב 🏜️', 'הגולן ⛰️', 'השרון 🌾', 'ירושלים והסביבה 🕌', 'אילת 🐠', 'כל הארץ 🇮🇱'] },
  { key: 'guests', text: 'כמה אנשים בסך הכל? 👥', options: ['2 אנשים', '3-4 אנשים', '5-6 אנשים', '7-10 אנשים', 'יותר מ-10'] },
  { key: 'budget', text: 'מה התקציב ללילה? 💰', options: ['עד ₪500', '₪500–₪1,000', '₪1,000–₪2,000', '₪2,000–₪3,500', 'ללא הגבלה ✨'] },
  { key: 'type', text: 'איזה סוג נכס מתאים לכם? 🏘️', options: ['צימר אינטימי 🛏️', 'וילה עם בריכה 🏊', 'בקתה ביער 🌳', 'כל סוג — הפתיעו אותי! 🎲'] },
  { key: 'extras', text: 'מה חשוב לכם במיוחד? ✨', options: ["ג'קוזי 🛁", 'בריכה 🏊', 'נוף מרהיב 🌄', 'פינת אש/קמין 🔥', 'ידידותי לכלבים 🐕', 'הזמנה מיידית ⚡', 'לא חשוב'] },
]

function buildFilters(answers: Record<string, string>): Filters {
  const filters: Filters = {}
  if (answers.region && !answers.region.includes('כל הארץ')) {
    const regionMap: Record<string, string> = {
      'הגליל': 'galil', 'הכרמל': 'carmel', 'ים המלח': 'dead_sea',
      'הנגב': 'negev', 'הגולן': 'golan', 'השרון': 'sharon',
      'ירושלים והסביבה': 'jerusalem', 'אילת': 'eilat',
    }
    const key = Object.keys(regionMap).find(k => answers.region.includes(k))
    if (key) filters.region = regionMap[key]
  }
  if (answers.guests) {
    if (answers.guests.includes('2')) filters.guests = 2
    else if (answers.guests.includes('3')) filters.guests = 3
    else if (answers.guests.includes('5')) filters.guests = 5
    else if (answers.guests.includes('7')) filters.guests = 7
    else filters.guests = 10
  }
  if (answers.budget) {
    if (answers.budget.includes('500') && answers.budget.startsWith('עד')) filters.maxPrice = 500
    else if (answers.budget.includes('₪500–')) { filters.minPrice = 500; filters.maxPrice = 1000 }
    else if (answers.budget.includes('₪1,000–')) { filters.minPrice = 1000; filters.maxPrice = 2000 }
    else if (answers.budget.includes('₪2,000–')) { filters.minPrice = 2000; filters.maxPrice = 3500 }
  }
  if (answers.type?.includes('צימר')) filters.category = 'zimmer'
  else if (answers.type?.includes('וילה')) filters.category = 'villa'
  if (answers.extras?.includes('מיידית')) filters.instant_book = true
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
        text: props.length > 0 ? `מצאתי ${props.length} נכסים שמתאימים לכם בול! 👇` : 'לא מצאתי נכסים מדויקים, אבל הנה כמה אפשרויות קרובות 👇'
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

  const progress = Math.min((step / QUESTIONS.length) * 100, 100)
  const currentOptions = step < QUESTIONS.length ? QUESTIONS[step].options : []

  return (
    <div className="min-h-screen flex flex-col" dir="rtl"
      style={{ background: 'linear-gradient(160deg, #0d2818 0%, #1a4a2e 30%, #2d3a1e 60%, #1c2910 100%)' }}>
      <div className="relative text-center pt-14 pb-8 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8B6914 0%, transparent 70%)' }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold mb-5 tracking-wider uppercase"
            style={{ background: 'rgba(139,105,20,0.2)', color: '#C8960C', border: '1px solid rgba(200,150,12,0.3)' }}>
            <Sparkles className="w-3.5 h-3.5" />
            חיפוש חכם מבוסס AI
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            אתרו לי{' '}
            <span style={{ background: 'linear-gradient(135deg, #C8960C, #8B6914)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              צימר
            </span>
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>ענו על 6 שאלות — ונמצא לכם את הנכס המושלם</p>
          {step > 0 && (
            <div className="max-w-xs mx-auto mt-6">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span>שאלה {Math.min(step, QUESTIONS.length)} מתוך {QUESTIONS.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div className="h-1 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #2d6a4f, #8B6914)' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 pb-6">
        <div className="space-y-4 mb-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center ml-2 flex-shrink-0 self-end mb-1"
                  style={{ background: 'linear-gradient(135deg, #1a4a2e, #2d6a4f)' }}>
                  <Sparkles className="w-4 h-4" style={{ color: '#C8960C' }} />
                </div>
              )}
              <div className={`max-w-xs lg:max-w-sm px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-lg ${msg.role === 'ai' ? 'rounded-bl-sm' : 'rounded-br-sm'}`}
                style={msg.role === 'ai'
                  ? { background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.1)' }
                  : { background: 'linear-gradient(135deg, #1a4a2e, #2d6a4f)', color: 'white', border: '1px solid rgba(45,106,79,0.5)' }
                }>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-end">
              <div className="w-8 h-8 rounded-full flex items-center justify-center ml-2 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1a4a2e, #2d6a4f)' }}>
                <Sparkles className="w-4 h-4" style={{ color: '#C8960C' }} />
              </div>
              <div className="px-5 py-4 rounded-2xl rounded-bl-sm"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-center gap-1.5">
                  {[0, 150, 300].map(delay => (
                    <div key={delay} className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: '#C8960C', animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {!done && !loading && step < QUESTIONS.length && (
          <div className="flex flex-wrap gap-2.5 justify-center mb-8">
            {currentOptions.map(option => (
              <button key={option} onClick={() => handleOption(option)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                {option}
              </button>
            ))}
          </div>
        )}

        {done && results.length > 0 && (
          <div className="space-y-3 mb-8">
            {results.map((p, idx) => (
              <Link key={p.id} href={`/properties/${p.id}`}
                className="block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <div className="flex">
                  <div className="w-36 h-32 flex-shrink-0 relative overflow-hidden">
                    {images[p.id] ? (
                      <img src={images[p.id]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl"
                        style={{ background: 'linear-gradient(135deg, #1a4a2e, #0d2818)' }}>🏡</div>
                    )}
                    {idx === 0 && (
                      <div className="absolute top-0 left-0 right-0 text-center text-xs font-bold py-1"
                        style={{ background: 'linear-gradient(135deg, #C8960C, #8B6914)', color: 'white' }}>
                        ⭐ המלצה מובילה
                      </div>
                    )}
                    {p.instant_book && (
                      <div className="absolute bottom-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(45,106,79,0.9)', color: 'white' }}>⚡ מיידי</div>
                    )}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-white text-sm leading-tight group-hover:text-yellow-300 transition-colors">{p.name}</h3>
                      {p.avg_rating > 0 && (
                        <div className="flex items-center gap-0.5 text-xs flex-shrink-0 mr-2" style={{ color: '#C8960C' }}>
                          <Star className="w-3 h-3 fill-current" />
                          {p.avg_rating}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <MapPin className="w-3 h-3" />
                      {p.city || REGIONS[p.region as keyof typeof REGIONS]?.label}
                    </div>
                    {p.short_description && <p className="text-xs mb-2 line-clamp-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.short_description}</p>}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm" style={{ color: '#C8960C' }}>₪{p.price_per_night}</span>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}> / לילה</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
          <div className="text-center py-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <p className="text-lg mb-2">לא נמצאו נכסים</p>
            <Link href="/search" className="inline-block mt-4 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #1a4a2e, #2d6a4f)' }}>
              עבור לחיפוש רגיל
            </Link>
          </div>
        )}

        {done && (
          <div className="text-center pb-10">
            <button onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <RefreshCw className="w-4 h-4" />
              חפש שוב
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
