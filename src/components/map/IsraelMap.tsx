'use client'

import { useEffect, useRef } from 'react'

type MapPin = {
  lat: number; lng: number; name: string
  type: 'property' | 'caravan' | 'attraction'; status: string
}

const TYPE_COLORS: Record<string, string> = {
  property: '#8B6914', caravan: '#C4956A', attraction: '#16a34a',
}

export default function IsraelMap({ pins }: { pins: MapPin[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // צור div פנימי חדש בכל פעם — פותר את בעיית ה-container
    containerRef.current.innerHTML = ''
    const mapDiv = document.createElement('div')
    mapDiv.style.height = '300px'
    mapDiv.style.borderRadius = '12px'
    mapDiv.style.overflow = 'hidden'
    mapDiv.style.border = '1px solid rgba(139,105,20,0.12)'
    containerRef.current.appendChild(mapDiv)

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl

      const map = L.map(mapDiv, {
        center: [31.5, 35.0], zoom: 7, minZoom: 6, maxZoom: 13,
        zoomControl: true, scrollWheelZoom: false,
        maxBounds: [[29.3, 33.8], [33.5, 36.0]], maxBoundsViscosity: 1.0,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap', subdomains: 'abc', maxZoom: 19,
      }).addTo(map)

      pins.forEach(pin => {
        if (!pin.lat || !pin.lng) return
        const color = TYPE_COLORS[pin.type] || '#8B6914'
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:14px;height:14px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35);cursor:pointer;"></div>`,
          iconSize: [14, 14], iconAnchor: [7, 7],
        })
        const typeLabel = { property:'נכס', caravan:'קרוואן', attraction:'אטרקציה' }[pin.type]
        L.marker([pin.lat, pin.lng], { icon }).addTo(map)
          .bindPopup(`<div style="font-family:Arial,sans-serif;font-size:13px;direction:rtl;text-align:right;min-width:120px;"><strong style="color:#2D1E0F;">${pin.name}</strong><br/><span style="color:${color};font-size:11px;">${typeLabel}</span></div>`)
      })

      mapRef.current = map
    })

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [pins.length])

  return (
    <div className="relative">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div ref={containerRef} />
      <div className="flex items-center gap-4 mt-3 justify-center">
        {[
          { label:'נכסים', color:'#8B6914' },
          { label:'קרוואנים', color:'#C4956A' },
          { label:'אטרקציות', color:'#16a34a' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}
