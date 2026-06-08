'use client'
import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { QrCode, Download, Share2 } from 'lucide-react'

export function PropertyQR({ slug, name }: { slug: string; name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const url = `https://zimmer.club/${slug}`

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, url, {
      width: 200,
      margin: 2,
      color: { dark: '#1a1a1a', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
  }, [url])

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

  return (
    <div className="border-t border-gray-100 pt-6 mt-6">
      <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
        <QrCode className="w-5 h-5 text-[#8B6914]" />
        כרטיס ביקור דיגיטלי
      </h2>
      <div className="bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
        {/* QR Code */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-right">
          <p className="font-semibold text-gray-900 mb-1">{name}</p>
          <p className="text-sm text-gray-500 mb-4 font-mono break-all">{url}</p>
          <p className="text-xs text-gray-400 mb-4">סרוק את הקוד עם כל סמארטפון כדי להגיע ישירות לדף הנכס</p>
          <div className="flex gap-2 justify-center sm:justify-start">
            <button onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: '#8B6914' }}>
              <Download className="w-4 h-4" />
              הורד QR
            </button>
            <button onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors">
              <Share2 className="w-4 h-4" />
              {copied ? 'הועתק!' : 'העתק קישור'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
