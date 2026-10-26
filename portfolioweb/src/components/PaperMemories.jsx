import { useSite } from '../data/SiteContext'
import PaperCrumple from './PaperCrumple'
import './PaperMemories.css'

export default function PaperMemories() {
  const {
    site: { keepsakes },
  } = useSite()
  return (
    <section
      className="section keepsakes-section"
      aria-labelledby="keepsakes-heading"
    >
      <div className="section-kicker">
        <span>AWAY FROM THE KEYBOARD</span>
        <span aria-hidden="true">↘</span>
      </div>
      <h2 id="keepsakes-heading">A few things worth keeping.</h2>
      <p className="section-description">
        Little moments, with a little room to play.
      </p>
      <p className="paper-instruction">
        A few folded memories. Hover to unfold, or tap on a phone.
      </p>
      <div className="paper-stage">
        {keepsakes.map((item, index) => (
          <article className="paper-slot" key={`${item.id}:${item.image}`}>
            <PaperCrumple
              src={item.image}
              alt={item.alt}
              width={400}
              height={400}
              sceneHeight={280}
              interaction="hover"
              draggable={false}
              releaseBehavior="restore"
              crumpleAmount={0.85}
              crumpleDuration={0.55}
              releaseDuration={0.4}
              foldCount={6}
              foldSharpness={0.6}
              wrinkleDepth={0.65}
              creaseStrength={0.18}
              paperColor="#f4f0e8"
              paperTexture={0.08}
              returnToOrigin
              imageFit="contain"
              roughness={0.92}
              lightIntensity={1.8}
              lightAngle={-35}
              shadow
              shadowOpacity={0.16}
              dragRotation={10}
              dragRadius={180}
              rotation={index % 2 ? 3 : -3}
              seed={7 + index}
              detail={64}
              disabled={false}
            />
            <div className="paper-caption">
              <span className="paper-slot-caption">
                <span>0{index + 1}</span>
                {item.label}
              </span>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
            </div>
          </article>
        ))}
      </div>
      {!keepsakes.length && (
        <p className="section-description">
          A little space for future memories.
        </p>
      )}
    </section>
  )
}
