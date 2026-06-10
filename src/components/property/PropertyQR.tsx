'use client'
import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconStar, IconHeart, IconUser, IconPhone, IconGlobe, IconNavigation, IconArrowRight, IconZap, IconEye, IconEyeOff, IconUpload, IconTrash, IconEdit, IconPlus, IconCheck, IconMail, IconSend, IconRefresh, IconSparkles, IconBed, IconBath, IconTrendingUp, IconLoader, IconCamera, IconSave, IconAlertCircle, IconCheckCircle, IconClock, IconSliders, IconPencil, IconQr, IconShare, IconDownload, IconZoomIn, IconZoomOut, IconLogOut, IconSettings, IconMenu, IconX } from '@/components/icons'

export function PropertyQR({ slug, name, mode = 'view' }: { 
  slug: string
  name: string
  mode?: 'view' | 'edit'
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const url = `https://zimmer.club/${slug}`

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, url, {
      width: mode === 'edit' ? 200 : 160,
      margin: 2,
      color: { dark: '#1a1a1a', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
  }, [url, mode])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-${slug}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  // מצב תצוגה — רק QR
  if (mode === 'view') {
    return (
      <div className="border-t border-gray-100 pt-6 mt-6">
        <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
          <IconQr className="w-5 h-5 text-[#8B6914]" />
          כרטיס ביקור דיגיטלי
        </h2>
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 inline-block">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center mt-3">סרוק לביקור בדף הנכס</p>
      </div>
    )
  }

  // מצב עריכה — QR + כפתורים
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="font-bold text-gray-700 text-lg mb-4 flex items-center gap-2">
        <IconQr className="w-5 h-5 text-[#8B6914]" />
        כרטיס ביקור דיגיטלי
      </h2>
      <div className="bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>
        <div className="flex-1 text-center sm:text-right">
          <p className="font-semibold text-gray-900 mb-1">{name}</p>
          <p className="text-sm text-gray-500 mb-4 font-mono break-all">{url}</p>
          <p className="text-xs text-gray-400 mb-4">סרוק את הקוד עם כל סמארטפון כדי להגיע ישירות לדף הנכס</p>
          <div className="flex gap-2 justify-center sm:justify-start">
            <button onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: '#8B6914' }}>
              <IconDownload className="w-4 h-4" />
              הורד QR
            </button>
            <button onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors">
              <IconShare className="w-4 h-4" />
              {copied ? 'הועתק!' : 'העתק קישור'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
