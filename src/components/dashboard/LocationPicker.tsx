'use client'

import { useEffect, useRef, useState } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { IconMapPin } from '@/components/icons'

const ISRAEL_CENTER = { lat: 31.5, lng: 35.0 }
const MAP_ID = 'DEMO_MAP_ID'

let googleMapsPromise: Promise<any> | null = null
function loadGoogleMaps(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (googleMapsPromise) return googleMapsPromise
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) return Promise.reject(new Error('missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'))
  setOptions({ key, language: 'iw', region: 'IL' })
  googleMapsPromise = Promise.all([importLibrary('maps'), importLibrary('marker')])
    .then(() => (window as any).google)
  return googleMapsPromise
}

type Props = {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
}

export function LocationPicker({ lat, lng, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const onChangeRef = useRef(onChange)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  // init map once, in a fresh throwaway div (same pattern as SearchMap — avoids
  // Google Maps' container-reuse issues across Strict Mode / Fast Refresh)
  useEffect(() => {
    let cancelled = false
    if (!containerRef.current) return
    containerRef.current.innerHTML = ''
    const mapDiv = document.createElement('div')
    mapDiv.style.width = '100%'
    mapDiv.style.height = '100%'
    containerRef.current.appendChild(mapDiv)

    loadGoogleMaps()
      .then((g) => {
        if (cancelled) return
        const hasCoords = lat != null && lng != null
        const center = hasCoords ? { lat, lng } : ISRAEL_CENTER
        const map = new g.maps.Map(mapDiv, {
          center, zoom: hasCoords ? 15 : 7, minZoom: 3, maxZoom: 19,
          mapId: MAP_ID,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
        })
        mapRef.current = map

        const marker = new g.maps.marker.AdvancedMarkerElement({
          map, position: center, gmpDraggable: true,
        })
        markerRef.current = marker

        marker.addListener('dragend', () => {
          const pos = marker.position
          const p = typeof pos.lat === 'function' ? { lat: pos.lat(), lng: pos.lng() } : pos
          onChangeRef.current(p.lat, p.lng)
        })
        map.addListener('click', (e: any) => {
          const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() }
          marker.position = pos
          onChangeRef.current(pos.lat, pos.lng)
        })

        setReady(true)
      })
      .catch(() => { if (!cancelled) setError(true) })

    return () => {
      cancelled = true
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // reflect external lat/lng changes (e.g. filled in by an address autocomplete)
  // onto the marker + map, without fighting the user's own drag/click updates
  useEffect(() => {
    if (!ready || !mapRef.current || !markerRef.current) return
    if (lat == null || lng == null) return
    const pos = { lat, lng }
    markerRef.current.position = pos
    mapRef.current.panTo(pos)
    if (mapRef.current.getZoom() < 14) mapRef.current.setZoom(15)
  }, [ready, lat, lng])

  if (error) {
    return (
      <div className="w-full rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1 py-8 text-center px-4" style={{ height: 240 }}>
        <IconMapPin size={20} className="text-gray-300" />
        <p className="text-xs text-gray-400">לא ניתן לטעון את המפה כרגע</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="relative w-full rounded-xl overflow-hidden border border-gray-200" style={{ height: 240 }}>
        <div ref={containerRef} className="w-full h-full" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-xs text-gray-400">
            טוען מפה...
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
        <IconMapPin size={12} />
        לחצו על המפה או גררו את הסיכה כדי לקבוע את מיקום הנכס המדויק
        {lat != null && lng != null && (
          <span className="text-gray-300 mr-auto">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
        )}
      </p>
    </div>
  )
}
