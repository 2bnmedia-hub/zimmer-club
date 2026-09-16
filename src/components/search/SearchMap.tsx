'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

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

const ISRAEL_CENTER: [number, number] = [31.5, 35.0]
const ISRAEL_BOUNDS: [[number, number], [number, number]] = [[29.2, 33.9], [33.5, 36.1]]

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

function formatPrice(n: number) {
  return `₪${Math.round(n).toLocaleString()}`
}

function buildPriceIcon(L: any, p: MapProperty, state: 'default' | 'hovered' | 'active') {
  const label = p.priceOnRequest || !p.price ? '📞' : formatPrice(p.price)
  const scale = state === 'default' ? 1 : 1.12
  const bg = state === 'active'
    ? 'linear-gradient(135deg,#8B6914,#5c4610)'
    : state === 'hovered'
      ? 'linear-gradient(135deg,#C8960C,#8B6914)'
      : 'linear-gradient(135deg,#a9781a,#77590f)'
  const ring = state === 'active' ? '0 0 0 3px rgba(200,150,12,0.35), 0 4px 14px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.28)'
  const html = `
    <div class="zc-marker" style="transform:scale(${scale});">
      <div class="zc-marker-pill" style="background:${bg};box-shadow:${ring};">${label}</div>
      <div class="zc-marker-tail" style="border-top-color:${state === 'active' ? '#5c4610' : '#8B6914'};"></div>
    </div>`
  const width = Math.max(46, label.length * 9 + 22)
  return L.divIcon({ html, className: 'zc-marker-wrap', iconSize: [width, 34], iconAnchor: [width / 2, 34], popupAnchor: [0, -32] })
}

function buildClusterIcon(L: any, count: number) {
  let size = 38, bg = 'linear-gradient(135deg,#F5D078,#C8960C)', color = '#5c4610', border = '2px solid #8B6914'
  if (count >= 50) { size = 54; bg = 'linear-gradient(135deg,#8B6914,#4a3709)'; color = '#fff'; border = '2px solid #3a2c07' }
  else if (count >= 10) { size = 46; bg = 'linear-gradient(135deg,#C8960C,#8B6914)'; color = '#fff'; border = '2px solid #6b4f0f' }
  const html = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:${border};color:${color};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:${count >= 100 ? 12 : 13}px;box-shadow:0 3px 12px rgba(0,0,0,0.3);font-family:inherit;">${count}</div>`
  return L.divIcon({ html, className: 'zc-cluster-wrap', iconSize: [size, size] })
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

const SearchMap = forwardRef<SearchMapHandle, Props>(function SearchMap(
  { properties, activeId, hoveredId, onMarkerClick, onMarkerHover, onUserMoved },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const LRef = useRef<any>(null)
  const clusterRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const propsMapRef = useRef<Map<string, MapProperty>>(new Map())
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
      return { north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() }
    },
    refit: () => {
      const map = mapRef.current, cluster = clusterRef.current
      if (!map || !cluster) return
      const layers = cluster.getLayers()
      if (layers.length === 0) return
      programmaticMoveRef.current = true
      map.fitBounds(cluster.getBounds(), { padding: [40, 40], maxZoom: 15, animate: !reducedMotion })
      onUserMoved?.(false)
    },
  }))

  // init map once
  useEffect(() => {
    let cancelled = false
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''
    const mapDiv = document.createElement('div')
    mapDiv.style.height = '100%'
    mapDiv.style.width = '100%'
    containerRef.current.appendChild(mapDiv)

    import('leaflet')
      .then(async (leafletMod) => {
        if (cancelled) return
        const L = leafletMod.default
        // leaflet.markercluster's bundle expects a global `L` to attach itself to
        ;(window as any).L = L
        await import('leaflet.markercluster')
        if (cancelled) return
        LRef.current = L
        delete (L.Icon.Default.prototype as any)._getIconUrl

        const map = L.map(mapDiv, {
          center: ISRAEL_CENTER, zoom: 7, minZoom: 6, maxZoom: 18,
          maxBounds: ISRAEL_BOUNDS, maxBoundsViscosity: 0.8,
          zoomControl: false,
        })
        L.control.zoom({ position: 'bottomleft' }).addTo(map)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap', subdomains: 'abc', maxZoom: 19,
        }).addTo(map)

        const cluster = (L as any).markerClusterGroup({
          maxClusterRadius: 60,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          chunkedLoading: true,
          iconCreateFunction: (c: any) => buildClusterIcon(L, c.getChildCount()),
        })
        // clicking a cluster to drill in is an expected, already-synced interaction —
        // don't treat the resulting zoom as a manual pan that should prompt "search this area"
        cluster.on('clusterclick', () => { programmaticMoveRef.current = true })
        map.addLayer(cluster)
        clusterRef.current = cluster
        mapRef.current = map

        // an in-flight animated programmatic pan (e.g. from opening a popup) can still be
        // running when the user grabs the map — a real drag always means the user has taken over
        map.on('dragstart', () => { programmaticMoveRef.current = false })
        map.on('movestart', () => {
          if (!programmaticMoveRef.current) onUserMoved?.(false)
        })
        map.on('moveend', () => {
          if (programmaticMoveRef.current) { programmaticMoveRef.current = false; return }
          onUserMoved?.(true)
        })

        setReady(true)
      })
      .catch(() => { if (!cancelled) setError(true) })

    const markers = markersRef.current
    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
      clusterRef.current = null
      markers.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // rebuild markers when the actual result set changes
  const idsKey = properties.map(p => p.id).sort().join(',')
  useEffect(() => {
    const L = LRef.current, map = mapRef.current, cluster = clusterRef.current
    if (!ready || !L || !map || !cluster) return

    cluster.clearLayers()
    markersRef.current.clear()
    propsMapRef.current.clear()

    const valid = properties.filter(p =>
      Number.isFinite(p.lat) && Number.isFinite(p.lng) &&
      p.lat >= 29.0 && p.lat <= 33.5 && p.lng >= 34.0 && p.lng <= 36.0
    )

    const leafletMarkers = valid.map(p => {
      propsMapRef.current.set(p.id, p)
      const marker = L.marker([p.lat, p.lng], { icon: buildPriceIcon(L, p, 'default') })
      marker.bindPopup(() => buildPopupHtml(p), { maxWidth: 240, className: 'zc-popup' })
      marker.on('click', () => onMarkerClick(p.id))
      if (onMarkerHover) {
        marker.on('mouseover', () => onMarkerHover(p.id))
        marker.on('mouseout', () => onMarkerHover(null))
      }
      markersRef.current.set(p.id, marker)
      return marker
    })

    if (leafletMarkers.length > 0) cluster.addLayers(leafletMarkers)

    if (idsKey !== lastFitKeyRef.current) {
      lastFitKeyRef.current = idsKey
      if (leafletMarkers.length > 0) {
        programmaticMoveRef.current = true
        if (leafletMarkers.length === 1) {
          map.setView([valid[0].lat, valid[0].lng], 13, { animate: !reducedMotion })
        } else {
          map.fitBounds(cluster.getBounds(), { padding: [40, 40], maxZoom: 15, animate: !reducedMotion })
        }
        onUserMoved?.(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, idsKey])

  // visual highlight for hover/active — no map movement
  useEffect(() => {
    const L = LRef.current
    if (!ready || !L) return
    markersRef.current.forEach((marker, id) => {
      const p = propsMapRef.current.get(id)
      if (!p) return
      const state = id === activeId ? 'active' : id === hoveredId ? 'hovered' : 'default'
      marker.setIcon(buildPriceIcon(L, p, state))
      marker.setZIndexOffset(state === 'default' ? 0 : 1000)
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
    map.panTo(marker.getLatLng(), { animate: !reducedMotion })
    marker.openPopup()
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
        .zc-marker-wrap { background: transparent; border: none; }
        .zc-marker { display:flex; flex-direction:column; align-items:center; cursor:pointer; transition: transform .15s ease; }
        .zc-marker-pill {
          color:#fff; font-weight:800; font-size:12.5px; padding:6px 10px; border-radius:999px;
          white-space:nowrap; font-family:inherit; border:1.5px solid rgba(255,255,255,0.5);
        }
        .zc-marker-tail { width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid #8B6914; margin-top:-1px; }
        .zc-cluster-wrap { background: transparent; border: none; }
        .zc-popup .leaflet-popup-content-wrapper { border-radius:16px; padding:0; overflow:hidden; box-shadow:0 8px 28px rgba(0,0,0,0.22); }
        .zc-popup .leaflet-popup-content { margin:0; width:220px !important; }
        .zc-popup .leaflet-popup-tip { background:#fff; }
        .zc-pop-card { display:flex; flex-direction:column; text-decoration:none; direction:rtl; font-family:inherit; }
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
        .leaflet-control-zoom { border:none !important; box-shadow:0 2px 10px rgba(0,0,0,0.15) !important; }
        .leaflet-control-zoom a { color:#8B6914 !important; }
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
