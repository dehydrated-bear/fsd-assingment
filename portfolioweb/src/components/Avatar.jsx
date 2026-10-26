import { useEffect, useRef, useState } from 'react'

// An original SVG placeholder, not a portrait copied from the reference.
export default function Avatar({ creative }) {
  const ref = useRef(null)
  const [direction, setDirection] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!creative) return
    const track = (event) => {
      if (reducedMotion.matches || event.pointerType === 'touch') return
      const rect = ref.current.getBoundingClientRect()
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      if (Math.hypot(dx, dy) < 28) return setDirection({ x: 0, y: 0 })
      const angle =
        Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4)
      setDirection({
        x: Math.round(Math.cos(angle) * 5),
        y: Math.round(Math.sin(angle) * 5),
      })
    }
    const reset = () => setDirection({ x: 0, y: 0 })
    window.addEventListener('pointermove', track)
    document.documentElement.addEventListener('pointerleave', reset)
    reducedMotion.addEventListener('change', reset)
    return () => {
      window.removeEventListener('pointermove', track)
      document.documentElement.removeEventListener('pointerleave', reset)
      reducedMotion.removeEventListener('change', reset)
    }
  }, [creative])
  const x = creative ? direction.x : 0
  const y = creative ? direction.y : 0
  return (
    <div ref={ref} className={`avatar ${creative ? 'avatar-creative' : ''}`}>
      <svg
        viewBox="0 0 160 160"
        role="img"
        aria-label={
          creative
            ? 'Original colourful illustrated avatar that looks toward your cursor'
            : 'Monochrome illustrated placeholder portrait'
        }
      >
        <circle cx="80" cy="80" r="80" fill="#ffdc79" />
        <path d="M16 160c1-35 25-52 64-52s63 17 64 52" fill="#3b4544" />
        <path d="M65 100h30v27c-10 12-21 12-30 0z" fill="#e8a478" />
        <g
          className="avatar-face"
          style={{ transform: `translate(${x}px, ${y}px)` }}
        >
          <ellipse cx="46" cy="77" rx="9" ry="12" fill="#efb38a" />
          <ellipse cx="114" cy="77" rx="9" ry="12" fill="#efb38a" />
          <path
            d="M47 58c0-29 65-29 66 0v24c0 26-18 38-33 38S47 107 47 82z"
            fill="#f5c49c"
          />
          <path
            d="M45 72c-11-36 7-52 27-50 13-12 43 3 46 21 3 12-2 24-5 30l-6-22c-18 3-26-6-29-11-5 11-19 16-29 14z"
            fill="#292b2b"
          />
          <path
            d="M57 68q8-5 16-1M88 67q9-4 16 1"
            fill="none"
            stroke="#3c322c"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <g style={{ transform: `translate(${x * 0.45}px, ${y * 0.4}px)` }}>
            <ellipse cx="66" cy="78" rx="3" ry="4" fill="#242729" />
            <ellipse cx="96" cy="78" rx="3" ry="4" fill="#242729" />
          </g>
          <path
            d="m80 80-3 12h6"
            stroke="#cd916e"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M68 100q12 9 24-1"
            stroke="#754b3f"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
        <path d="m52 125 14-9 14 17 14-17 14 9-8 35H60z" fill="#f5f0df" />
        <path d="M80 134v26" stroke="#d5cdbb" strokeWidth="2" />
      </svg>
      <span className="avatar-spark" aria-hidden="true">
        ✦
      </span>
    </div>
  )
}
