'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

export type MapProperty = {
  id: string
  href: string
  name: string
  city?: string
  regionLabel?: string
  lat: number
  lng: number
  price?: number | null
  priceWeekend?: number | null
  priceOnRequest?: boolean
  avgRating?: number
  totalReviews?: number
  image?: string | null
}

export type MapBounds = { north: number; south: number; east: number; west: number }

export type SearchMapHandle = {
  getBounds: () => MapBounds | null
  refit: () => void
}

type Props = {
  properties: MapProperty[]
  activeId: string | null
  hoveredId: string | null
  onMarkerClick: (id: string) => void
  onMarkerHover?: (id: string | null) => void
  onUserMoved?: (moved: boolean) => void
}

const ISRAEL_CENTER = { lat: 31.5, lng: 35.0 }
// Google-provided ID for local development / apps that don't need custom cloud styling —
// still renders AdvancedMarkerElement content correctly.
const MAP_ID = 'DEMO_MAP_ID'

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

function formatPrice(n: number) {
  return `₪${Math.round(n).toLocaleString()}`
}

// ─── Google Maps JS API loader — official loader, handles dedup/StrictMode safely ───
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

function buildPriceMarkerEl(g: any, p: MapProperty, state: 'default' | 'hovered' | 'active') {
  const label = p.priceOnRequest || !p.price ? '📞' : formatPrice(p.price)
  const scale = state === 'default' ? 1 : 1.12
  const bg = state === 'active'
    ? 'linear-gradient(135deg,#8B6914,#5c4610)'
    : state === 'hovered'
      ? 'linear-gradient(135deg,#C8960C,#8B6914)'
      : 'linear-gradient(135deg,#a9781a,#77590f)'
  const ring = state === 'active' ? '0 0 0 3px rgba(200,150,12,0.35), 0 4px 14px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.28)'
  const wrap = document.createElement('div')
  wrap.style.transform = `scale(${scale})`
  wrap.style.display = 'flex'
  wrap.style.flexDirection = 'column'
  wrap.style.alignItems = 'center'
  wrap.style.cursor = 'pointer'
  wrap.style.transition = 'transform .15s ease'
  wrap.innerHTML = `
    <div style="color:#fff;font-weight:800;font-size:12.5px;padding:6px 10px;border-radius:999px;white-space:nowrap;font-family:inherit;background:${bg};box-shadow:${ring};border:1.5px solid rgba(255,255,255,0.5);">${escapeHtml(label)}</div>
    <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${state === 'active' ? '#5c4610' : '#8B6914'};margin-top:-1px;"></div>`
  return wrap
}

function buildClusterEl(count: number) {
  let size = 38, bg = 'linear-gradient(135deg,#F5D078,#C8960C)', color = '#5c4610', border = '2px solid #8B6914'
  if (count >= 50) { size = 54; bg = 'linear-gradient(135deg,#8B6914,#4a3709)'; color = '#fff'; border = '2px solid #3a2c07' }
  else if (count >= 10) { size = 46; bg = 'linear-gradient(135deg,#C8960C,#8B6914)'; color = '#fff'; border = '2px solid #6b4f0f' }
  const el = document.createElement('div')
  el.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:${border};color:${color};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:${count >= 100 ? 12 : 13}px;box-shadow:0 3px 12px rgba(0,0,0,0.3);font-family:inherit;cursor:pointer;`
  el.textContent = String(count)
  return el
}

function buildPopupHtml(p: MapProperty) {
  const priceHtml = p.priceOnRequest || !p.price
    ? `<div class="zc-pop-price zc-pop-price--call">📞 התקשרו לבירור מחיר</div>`
    : `<div class="zc-pop-price">${formatPrice(p.price)} <span>ללילה</span></div>`
  const ratingHtml = p.avgRating && p.avgRating > 0
    ? `<span class="zc-pop-rating">⭐ ${p.avgRating}${p.totalReviews ? ` <span>(${p.totalReviews})</span>` : ''}</span>` : ''
  const imgHtml = p.image
    ? `<img src="${escapeHtml(p.image)}" alt="" class="zc-pop-img" />`
    : `<div class="zc-pop-img zc-pop-img--empty">🏡</div>`
  return `
    <a href="${escapeHtml(p.href)}" class="zc-pop-card">
      ${imgHtml}
      <div class="zc-pop-body">
        <div class="zc-pop-top">
          <span class="zc-pop-name">${escapeHtml(p.name)}</span>
          ${ratingHtml}
        </div>
        <div class="zc-pop-loc">${escapeHtml(p.city || p.regionLabel || '')}</div>
        ${priceHtml}
        <div class="zc-pop-cta">לצפייה בנכס ←</div>
      </div>
    </a>`
}

const isValid = (p: MapProperty) =>
  Number.isFinite(p.lat) && Number.isFinite(p.lng) &&
  p.lat >= 29.0 && p.lat <= 33.5 && p.lng >= 34.0 && p.lng <= 36.0

const SearchMap = forwardRef<SearchMapHandle, Props>(function SearchMap(
  { properties, activeId, hoveredId, onMarkerClick, onMarkerHover, onUserMoved },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const gRef = useRef<any>(null)
  const clustererRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const propsMapRef = useRef<Map<string, MapProperty>>(new Map())
  const infoWindowRef = useRef<any>(null)
  const programmaticMoveRef = useRef(false)
  const lastFitKeyRef = useRef<string>('')
  const prevActiveIdRef = useRef<string | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useImperativeHandle(ref, () => ({
    getBounds: () => {
      const map = mapRef.current
      if (!map) return null
      const b = map.getBounds()
      if (!b) return null
      const ne = b.getNorthEast(), sw = b.getSouthWest()
      return { north: ne.lat(), south: sw.lat(), east: ne.lng(), west: sw.lng() }
    },
    refit: () => {
      const g = gRef.current, map = mapRef.current, clusterer = clustererRef.current
      if (!g || !map || !clusterer) return
      const markers = Array.from(markersRef.current.values())
      if (markers.length === 0) return
      const bounds = new g.maps.LatLngBounds()
      markers.forEach((m: any) => bounds.extend(m.position))
      programmaticMoveRef.current = true
      map.fitBounds(bounds, 40)
      onUserMoved?.(false)
    },
  }))

  // init map once
  useEffect(() => {
    let cancelled = false
    if (!containerRef.current) return

    // always build in a fresh throwaway node — Google Maps keeps internal state keyed
    // to the container element itself, which breaks reuse across Strict Mode's
    // mount→cleanup→mount and Fast Refresh
    containerRef.current.innerHTML = ''
    const mapDiv = document.createElement('div')
    mapDiv.style.width = '100%'
    mapDiv.style.height = '100%'
    containerRef.current.appendChild(mapDiv)

    loadGoogleMaps()
      .then((g) => {
        if (cancelled) return
        gRef.current = g

        const map = new g.maps.Map(mapDiv, {
          // static zoom/center, tuned to frame Israel tightly on its own — deliberately
          // NOT computed via fitBounds: fitBounds needs the map's projection to be
          // ready, and calling it before a frame has actually rendered (which, across
          // different mount timings — a plain page vs. a modal popup — proved unreliable
          // in practice) silently falls back to a near-world zoom. A fixed value has
          // no such timing dependency, so it can't regress that way again.
          center: ISRAEL_CENTER, zoom: 7.4, minZoom: 6, maxZoom: 18,
          mapId: MAP_ID,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: { position: g.maps.ControlPosition.LEFT_BOTTOM },
          gestureHandling: 'greedy',
        })
        mapRef.current = map
        // the map's very first settle (its initial static view rendering for the
        // first time) is never a user move
        programmaticMoveRef.current = true

        infoWindowRef.current = new g.maps.InfoWindow({ maxWidth: 240 })

        const clusterer = new MarkerClusterer({
          map,
          markers: [],
          renderer: {
            render: ({ count, position }: any) =>
              new g.maps.marker.AdvancedMarkerElement({ position, content: buildClusterEl(count) }),
          },
          onClusterClick: (_e: any, cluster: any, mapInst: any) => {
            programmaticMoveRef.current = true
            mapInst.fitBounds(cluster.bounds, 40)
          },
        })
        clustererRef.current = clusterer

        // a real user drag always means the user has taken over, even if an
        // animated programmatic pan/zoom is still settling
        map.addListener('dragstart', () => {
          programmaticMoveRef.current = false
          onUserMoved?.(false)
        })
        map.addListener('idle', () => {
          if (programmaticMoveRef.current) { programmaticMoveRef.current = false; return }
          onUserMoved?.(true)
        })

        setReady(true)
      })
      .catch(() => { if (!cancelled) setError(true) })

    const markers = markersRef.current
    return () => {
      cancelled = true
      markers.clear()
      clustererRef.current?.setMap(null)
      clustererRef.current = null
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // rebuild markers when the actual result set changes
  const idsKey = properties.map(p => p.id).sort().join(',')
  useEffect(() => {
    const g = gRef.current, map = mapRef.current, clusterer = clustererRef.current
    if (!ready || !g || !map || !clusterer) return

    clusterer.clearMarkers()
    markersRef.current.clear()
    propsMapRef.current.clear()

    const valid = properties.filter(isValid)
    const markers = valid.map(p => {
      propsMapRef.current.set(p.id, p)
      const marker = new g.maps.marker.AdvancedMarkerElement({
        position: { lat: p.lat, lng: p.lng },
        content: buildPriceMarkerEl(g, p, 'default'),
      })
      marker.addListener('click', () => {
        onMarkerClick(p.id)
        infoWindowRef.current.setContent(buildPopupHtml(p))
        infoWindowRef.current.open({ anchor: marker, map })
      })
      if (onMarkerHover) {
        marker.content.addEventListener('mouseenter', () => onMarkerHover(p.id))
        marker.content.addEventListener('mouseleave', () => onMarkerHover(null))
      }
      markersRef.current.set(p.id, marker)
      return marker
    })

    if (markers.length > 0) clusterer.addMarkers(markers)

    if (idsKey !== lastFitKeyRef.current) {
      lastFitKeyRef.current = idsKey
      if (markers.length > 0) {
        programmaticMoveRef.current = true
        if (markers.length === 1) {
          if (reducedMotion) map.setCenter(markers[0].position); else map.panTo(markers[0].position)
          map.setZoom(13)
        } else {
          const bounds = new g.maps.LatLngBounds()
          markers.forEach((m: any) => bounds.extend(m.position))
          map.fitBounds(bounds, 40)
        }
        onUserMoved?.(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, idsKey])

  // visual highlight for hover/active — no map movement
  useEffect(() => {
    const g = gRef.current
    if (!ready || !g) return
    markersRef.current.forEach((marker, id) => {
      const p = propsMapRef.current.get(id)
      if (!p) return
      const state = id === activeId ? 'active' : id === hoveredId ? 'hovered' : 'default'
      marker.content = buildPriceMarkerEl(g, p, state)
      marker.zIndex = state === 'default' ? 0 : 1000
    })
  }, [ready, activeId, hoveredId, idsKey])

  // pan + open popup only on an actual selection change (click), not on hover
  useEffect(() => {
    if (!ready || activeId === prevActiveIdRef.current) { prevActiveIdRef.current = activeId; return }
    prevActiveIdRef.current = activeId
    const map = mapRef.current
    const marker = activeId ? markersRef.current.get(activeId) : null
    if (!map || !marker) return
    programmaticMoveRef.current = true
    if (reducedMotion) map.setCenter(marker.position); else map.panTo(marker.position)
    const p = propsMapRef.current.get(activeId!)
    if (p) {
      infoWindowRef.current.setContent(buildPopupHtml(p))
      infoWindowRef.current.open({ anchor: marker, map })
    }
    onUserMoved?.(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, activeId])

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#faf7f2] rounded-2xl text-center px-4">
        <span className="text-2xl">🗺️</span>
        <p className="text-sm text-gray-500 font-medium">לא ניתן לטעון את המפה כרגע</p>
        <p className="text-xs text-gray-400">רשימת הנכסים למטה עדיין זמינה במלואה</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full" role="region" aria-label="מפת נכסים בתוצאות החיפוש">
      <style>{`
        .gm-style .gm-style-iw-c { border-radius:16px !important; padding:0 !important; overflow:hidden !important; }
        .gm-style .gm-style-iw-d { overflow:hidden !important; padding:0 !important; }
        .gm-style-iw-tc::after { display:none !important; }
        .gm-ui-hover-effect { top:4px !important; }
        .zc-pop-card { display:flex; flex-direction:column; text-decoration:none; direction:rtl; font-family:inherit; width:220px; }
        .zc-pop-img { width:100%; height:110px; object-fit:cover; display:block; background:#f3f4f6; }
        .zc-pop-img--empty { display:flex; align-items:center; justify-content:center; font-size:28px; }
        .zc-pop-body { padding:10px 12px 12px; }
        .zc-pop-top { display:flex; align-items:center; justify-content:space-between; gap:6px; }
        .zc-pop-name { font-weight:800; font-size:13px; color:#111827; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .zc-pop-rating { font-size:11px; color:#8B6914; font-weight:700; white-space:nowrap; }
        .zc-pop-rating span { color:#9ca3af; font-weight:500; }
        .zc-pop-loc { font-size:11px; color:#9ca3af; margin-top:2px; }
        .zc-pop-price { margin-top:6px; font-size:13.5px; font-weight:800; color:#8B6914; }
        .zc-pop-price span { font-size:10.5px; font-weight:500; color:#9ca3af; }
        .zc-pop-price--call { font-size:12px; }
        .zc-pop-cta { margin-top:6px; font-size:11px; font-weight:700; color:#8B6914; }
      `}</style>
      <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden border border-[#e8dcc8]" />
      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#faf7f2] rounded-2xl animate-pulse">
          <span className="text-sm text-gray-400">טוען מפה...</span>
        </div>
      )}
    </div>
  )
})

export default SearchMap
