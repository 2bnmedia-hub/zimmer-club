'use client'
import { useState, useRef, useEffect } from 'react'

type Option = { value: string; label: string }

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'בחר...',
  label,
}: {
  value: string
  onChange: (v: string) => void
  options: Option[]
  placeholder?: string
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div className="relative" ref={ref}>
      {label && <label className="block text-xs font-bold mb-1.5" style={{ color: '#8B6914' }}>{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full text-sm border rounded-xl px-3 py-2 bg-white flex items-center justify-between gap-2 transition-colors"
        style={{ borderColor: open || value ? '#8B6914' : '#e5e7eb', color: value ? '#374151' : '#9ca3af' }}
      >
        <span>{selected?.label || placeholder}</span>
        <span style={{ color: '#8B6914', fontSize: '10px', transition: 'transform 0.15s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
      </button>
      {open && (
        <div
          className="absolute top-full right-0 mt-1 w-full bg-white border rounded-xl shadow-lg z-50"
          style={{ borderColor: '#e5e7eb', maxHeight: '220px', overflowY: 'auto' }}
        >
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className="w-full text-right px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors block"
              style={{ color: value === o.value ? '#8B6914' : '#374151', fontWeight: value === o.value ? '700' : '400' }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
