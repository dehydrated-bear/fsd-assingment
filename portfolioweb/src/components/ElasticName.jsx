import {
  lazy,
  Suspense,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
const ElasticMesh = lazy(() => import('./vendor/ElasticMesh'))
const query = '(prefers-reduced-motion: reduce)'
function subscribe(callback) {
  const media = matchMedia(query)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

export default function ElasticName({ name }) {
  const reduced = useSyncExternalStore(
    subscribe,
    () => matchMedia(query).matches,
    () => true,
  )
  const [lost, setLost] = useState(false)
  const root = useRef(null)
  useLayoutEffect(() => {
    const node = root.current
    const fallback = () => setLost(true)
    node?.addEventListener('webglcontextlost', fallback, true)
    node?.addEventListener('elastic-unavailable', fallback)
    return () => {
      node?.removeEventListener('webglcontextlost', fallback, true)
      node?.removeEventListener('elastic-unavailable', fallback)
    }
  }, [])
  const supported = typeof window.WebGL2RenderingContext !== 'undefined'
  return (
    <div className="elastic-name" ref={root}>
      <h1 className="accessible-name">Hi, I’m {name}.</h1>
      {!reduced && !lost && supported ? (
        <div className="elastic-name-art" aria-hidden="true" data-material="balloon">
          <span className="elastic-greeting">Hi, I’m</span>
          <Suspense
            fallback={<span className="elastic-name-fallback">{name}.</span>}
          >
            <ElasticMesh
              text={name}
              material="balloon"
              color="#303b32"
              inflate={1.15}
              stiffness={0.5}
              wobble={0.6}
              shadow={0.25}
              intro={false}
              theme="light"
              dpr={1.5}
            />
          </Suspense>
          <span className="elastic-hint">
            A name with a little give. Try a gentle drag ↗
          </span>
        </div>
      ) : (
        <div className="elastic-static-group">
          <div aria-hidden="true" className="elastic-static">Hi, I’m {name}.</div>
          <p className="effect-notice">{reduced ? 'Name interaction paused: Reduce Motion is enabled in your browser or device.' : 'The name interaction needs WebGL / hardware acceleration.'}</p>
          {!reduced && supported && lost && <button className="effect-retry" type="button" onClick={() => setLost(false)}>Retry name effect ↗</button>}
        </div>
      )}
    </div>
  )
}
