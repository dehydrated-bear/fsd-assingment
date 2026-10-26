import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import './PaperMemories.css'

// The actual React Bits component, not a recreation of its prop interface.
const ReactBitsPaperCrumple = lazy(() => import('./vendor/PaperCrumple'))
const query = '(prefers-reduced-motion: reduce)'
function subscribe(callback) {
  const media = matchMedia(query)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

export default function PaperCrumple({
  src,
  alt = 'A print to crumple',
  width = 400,
  height = 400,
  sceneHeight = 360,
  disabled = false,
  onError,
  className = '',
  style,
  ...props
}) {
  const root = useRef(null)
  const [near, setNear] = useState(false)
  const [failedSrc, setFailedSrc] = useState(null)
  const [phase, setPhase] = useState({ src: null, value: 'loading' })
  const reduced = useSyncExternalStore(
    subscribe,
    () => matchMedia(query).matches,
    () => true,
  )
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' },
    )
    observer.observe(root.current)
    return () => observer.disconnect()
  }, [])
  const failed = failedSrc === src
  useEffect(() => {
    let active = true
    const inspect = () => {
      if (!active) return
      const value =
        root.current?.querySelector('.paper-crumple')?.dataset.status ||
        'loading'
      setPhase((current) =>
        current.src === src && current.value === value
          ? current
          : { src, value },
      )
    }
    const observer = new MutationObserver(inspect)
    observer.observe(root.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-status'],
    })
    queueMicrotask(inspect)
    return () => {
      active = false
      observer.disconnect()
    }
  }, [src])
  const status = reduced
    ? 'paused'
    : disabled
      ? 'disabled'
      : failed
        ? 'error'
        : phase.src === src
          ? phase.value
          : 'loading'
  const handleError = useCallback(
    (error) => {
      setFailedSrc(src)
      onError?.(error)
    },
    [src, onError],
  )
  const fallback = (
    <div className="paper-static" style={{ height: sceneHeight }}>
      <img
        src={src || undefined}
        alt={alt}
        width={width}
        height={height}
        style={{
          objectFit: props.imageFit || 'contain',
          transform: `rotate(${props.rotation || 0}deg)`,
        }}
      />
    </div>
  )

  return (
    <div
      ref={root}
      className={`paper-mount ${className}`}
      style={{ minHeight: sceneHeight, ...style }}
      data-paper-state={status}
    >
      {near && !reduced && !disabled && !failed ? (
        <Suspense fallback={fallback}>
          <ReactBitsPaperCrumple
            {...props}
            src={src}
            alt={alt}
            width={width}
            height={height}
            sceneHeight={sceneHeight}
            disabled={disabled}
            onError={handleError}
          />
        </Suspense>
      ) : (
        fallback
      )}
      <p className="paper-effect-status" role="status">
        {status === 'paused'
          ? 'Interaction paused: Reduce Motion is enabled.'
          : status === 'disabled'
            ? 'Static print · interaction disabled.'
            : status === 'error'
              ? 'Paper interaction unavailable. Check WebGL / hardware acceleration and the image URL.'
              : status === 'ready'
                ? props.interaction === 'hover'
                  ? 'Hover to unfold · tap on touch screens.'
                  : 'Ready · hold and drag the image.'
                : 'Loading the paper interaction…'}
      </p>
      {failed && (
        <button
          className="effect-retry"
          type="button"
          onClick={() => setFailedSrc(null)}
        >
          Retry paper effect ↗
        </button>
      )}
    </div>
  )
}
