import { useEffect, useState } from 'react'
import { useSite } from '../data/SiteContext'
import DetailDialog from './DetailDialog'

function FocusTimer() {
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (!running) return
    const timer = setInterval(
      () =>
        setSeconds((value) => {
          if (value <= 1) {
            setRunning(false)
            return 0
          }
          return value - 1
        }),
      1000,
    )
    return () => clearInterval(timer)
  }, [running])
  return (
    <div className="timer-widget">
      <span className="widget-label">A MOMENT OF FOCUS</span>
      <span
        className="timer-digits"
        role="timer"
        aria-label={`${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds remaining`}
      >
        {String(Math.floor(seconds / 60)).padStart(2, '0')}
        <span>:</span>
        {String(seconds % 60).padStart(2, '0')}
      </span>
      <div className="timer-controls">
        <button
          type="button"
          disabled={seconds === 0}
          onClick={() => setRunning(!running)}
        >
          {running
            ? 'Pause session'
            : seconds === 0
              ? 'Session complete'
              : 'Start focusing'}{' '}
          <span aria-hidden="true">{running ? 'Ⅱ' : '▷'}</span>
        </button>
        <button
          className="timer-reset"
          type="button"
          aria-label="Reset focus timer"
          onClick={() => {
            setRunning(false)
            setSeconds(1500)
          }}
        >
          ↺
        </button>
      </div>
    </div>
  )
}

export default function Projects() {
  const {
    site: { projects },
  } = useSite()
  const [selected, setSelected] = useState(null)
  return (
    <section
      className="section projects-section"
      id="work"
      aria-labelledby="work-heading"
    >
      <div className="section-kicker">
        <span>01 / SELECTED EXPLORATIONS</span>
        <span>2026</span>
      </div>
      <h2 id="work-heading">Ideas, made tangible.</h2>
      <p className="section-description">
        Small experiments in making the everyday a little better.
      </p>
      <div className="project-list">
        {projects.map((project) => (
          <article className="project-card" key={project.id}>
            <div className={`project-preview preview-${project.kind}`}>
              {project.kind === 'image' ? (
                <img
                  className="custom-project-image"
                  src={project.image}
                  alt={`${project.name} preview`}
                />
              ) : project.kind === 'notes' ? (
                <div className="note-widget">
                  <div className="note-toolbar">
                    <span className="note-logo" aria-hidden="true">
                      m.
                    </span>
                    <span>YOUR EVERYDAY NOTEBOOK</span>
                    <span aria-hidden="true">•••</span>
                  </div>
                  <div className="note-paper">
                    <span className="note-date">A NOTE TO SELF</span>
                    <h3>
                      Leave a little
                      <br />
                      room for an idea.
                    </h3>
                    <p>
                      Not everything needs a plan.
                      <br />
                      Some things just need a beginning.
                    </p>
                    <div className="note-bottom">
                      <span>↳ A work in progress</span>
                      <span aria-hidden="true">✳</span>
                    </div>
                  </div>
                </div>
              ) : (
                <FocusTimer />
              )}
              <span className="preview-caption">
                {project.kind === 'timer'
                  ? 'INTERACTIVE DEMO · TRY IT'
                  : 'INTERFACE CONCEPT'}
              </span>
            </div>
            <div className="project-info">
              <div className="project-title-row">
                <h3>{project.name}</h3>
                <span>{project.type}</span>
                <button
                  type="button"
                  className="project-open"
                  onClick={() => setSelected(project)}
                  aria-label={`Read about ${project.name}`}
                >
                  ↗
                </button>
              </div>
              <p>{project.description}</p>
              <div className="project-stack">
                {project.stack.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
      {selected && (
        <DetailDialog title={selected.name} onClose={() => setSelected(null)}>
          <p>{selected.detail}</p>
          {selected.url && (
            <p>
              <a href={selected.url} target="_blank" rel="noopener noreferrer">
                Visit project ↗
              </a>
            </p>
          )}
          <p className="dialog-meta">Portfolio concept · {selected.year}</p>
        </DetailDialog>
      )}
    </section>
  )
}
