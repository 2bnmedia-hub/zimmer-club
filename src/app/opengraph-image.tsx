import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'zimmer.club — Luxury Vacation Rentals in Israel'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: 'linear-gradient(135deg, #0d0a02 0%, #1c1203 40%, #2a1c05 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontFamily: 'serif',
        }}
      >
        {/* Glow effects */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '20%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,150,12,0.18) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '10%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,150,12,0.1) 0%, transparent 70%)',
            transform: 'translateY(-50%)',
          }}
        />

        {/* Top badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(200,150,12,0.15)',
            border: '1px solid rgba(200,150,12,0.4)',
            borderRadius: 40,
            padding: '8px 24px',
            marginBottom: 32,
            color: '#C8960C',
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          🏡  ZIMMER.CLUB
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #f5d078 0%, #C8960C 50%, #8B6914 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '-3px',
            lineHeight: 1,
            marginBottom: 20,
            display: 'flex',
          }}
        >
          zimmer.club
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 3,
            background: 'linear-gradient(90deg, transparent, #C8960C, transparent)',
            marginBottom: 24,
            borderRadius: 2,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(245,224,180,0.9)',
            marginBottom: 16,
            fontWeight: 400,
            display: 'flex',
          }}
        >
          Luxury Vacation Rentals in Israel
        </div>

        {/* Tags row */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 16,
          }}
        >
          {['North', 'Golan Heights', 'Dead Sea', 'Jerusalem', 'Eilat'].map((tag) => (
            <div
              key={tag}
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(200,150,12,0.25)',
                borderRadius: 20,
                padding: '6px 16px',
                color: 'rgba(245,224,180,0.7)',
                fontSize: 15,
                display: 'flex',
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: 'linear-gradient(135deg, #C8960C 0%, #8B6914 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          Book directly from the owner · No commission · zimmer.club
        </div>
      </div>
    ),
    { ...size }
  )
}
