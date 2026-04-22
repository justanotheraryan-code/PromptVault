import { useState, useRef } from 'react'

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`
}

export default function PromptCard({ prompt, onEdit, onDelete, onCopy }) {
  const [copied, setCopied] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const deleteTimerRef = useRef(null)

  function handleCopy() {
    onCopy(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleDeleteClick() {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      deleteTimerRef.current = setTimeout(() => setDeleteConfirm(false), 3000)
    } else {
      clearTimeout(deleteTimerRef.current)
      onDelete(prompt.id)
    }
  }

  return (
    <div className="prompt-card">
      <div className="prompt-card__header">
        <div className="prompt-card__title">{prompt.title}</div>
        <span className={`badge badge--${prompt.category}`}>{prompt.category}</span>
      </div>

      <p className="prompt-card__body-preview">{prompt.body}</p>

      {prompt.tags.length > 0 && (
        <div className="prompt-card__tags">
          {prompt.tags.map((tag) => (
            <span key={tag} className="tag-chip" style={{ cursor: 'default' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="prompt-card__footer">
        <span className="prompt-card__meta">{formatDate(prompt.createdAt)}</span>
        <div className="prompt-card__actions">
          <button
            className={`btn-copy${copied ? ' btn-copy--copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? '> COPIED' : '[ COPY ▶ ]'}
          </button>
          <button className="btn-icon" onClick={() => onEdit(prompt)}>
            [ EDIT ]
          </button>
          <button
            className={`btn-danger${deleteConfirm ? ' btn-danger--confirm' : ''}`}
            onClick={handleDeleteClick}
          >
            {deleteConfirm ? '> CONFIRM?' : '[ DEL ]'}
          </button>
        </div>
      </div>
    </div>
  )
}
