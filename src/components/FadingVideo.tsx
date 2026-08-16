'use client'

import { useState } from 'react'

const FADE_MS = 700
const FADE_START_BEFORE_END = 0.6 // seconds

export function FadingVideo({ src, className }: { src: string; className?: string }) {
  const [opacity, setOpacity] = useState(0)

  return (
    <video
      src={src}
      autoPlay
      muted
      playsInline
      controls
      preload="metadata"
      className={className}
      style={{ opacity, transition: `opacity ${FADE_MS}ms ease` }}
      onPlaying={() => setOpacity(1)}
      onTimeUpdate={(e) => {
        const v = e.currentTarget
        if (v.duration && v.duration - v.currentTime < FADE_START_BEFORE_END) setOpacity(0)
      }}
      onEnded={(e) => {
        const v = e.currentTarget
        v.currentTime = 0
        v.play().catch(() => {})
        setTimeout(() => setOpacity(1), 50)
      }}
    />
  )
}
