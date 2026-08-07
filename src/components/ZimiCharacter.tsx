'use client'

export type ZimiState = 'idle' | 'wave' | 'talk' | 'listen'

/**
 * Image is 1536×1024. Character occupies the center.
 * Display scale in a 190×220 card (cover-by-height): 0.2148
 * Resulting display size: 330×220, cropped 70px each side horizontally.
 *
 * Eye positions in image → display coords in 190×220 card:
 *   Left eye:  image(~630, ~300) → display(65, 64)
 *   Right eye: image(~900, ~300) → display(123, 64)
 *   Eye dims:  ~19×13px in display
 */

const SKIN = '#F4C2A2'

export function ZimiCharacter({
  state,
  size = 190,
  headOnly = false,
}: {
  state: ZimiState
  size?: number
  headOnly?: boolean
}) {
  const talking = state === 'talk'
  const cardH = headOnly ? size : Math.round(size * 220 / 190)
  const scale = size / 190

  // Eye positions scaled relative to base 190-wide card
  const lx = 65.3 * scale
  const rx = 123.3 * scale
  const ey = (headOnly ? 64.4 * 1.05 : 64.4) * scale
  const ew = 10.5 * scale   // half-width of eyelid
  const eh = 7.5 * scale    // half-height of eyelid

  return (
    <div
      style={{ width: size, height: cardH, position: 'relative', overflow: 'hidden', flexShrink: 0 }}
      className={talking ? 'zc-nod' : 'zc-float'}
    >
      <img
        src="/luci.png"
        alt="זימי"
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          userSelect: 'none',
          pointerEvents: 'none',
          display: 'block',
        }}
      />

      {/* Blink overlay — eyelids */}
      <svg
        className="zc-blink-lid"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox={`0 0 ${size} ${cardH}`}
      >
        <ellipse cx={lx} cy={ey} rx={ew} ry={eh} fill={SKIN} />
        <ellipse cx={rx} cy={ey} rx={ew} ry={eh} fill={SKIN} />
      </svg>
    </div>
  )
}
