import { useEffect, useRef } from 'react'

export default function DetailDialog({ title, children, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    const previousOverflow = document.body.style.overflow
    if (!dialog.open) dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])
  return (
    <dialog
      className="detail-dialog"
      ref={ref}
      aria-labelledby="dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="dialog-content">
        <button
          className="dialog-close"
          type="button"
          onClick={onClose}
          aria-label="Close details"
        >
          ×
        </button>
        <p className="eyebrow">From the notebook</p>
        <h2 id="dialog-title">{title}</h2>
        {children}
      </div>
    </dialog>
  )
}
