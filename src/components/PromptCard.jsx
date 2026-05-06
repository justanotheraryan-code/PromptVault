import { useState, useRef } from 'react'
import StarRating from './StarRating'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function PromptCard({ prompt, onEdit, onDelete, onCopy, onRate, canEdit }) {
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

      <div className="prompt-card__meta-row">
        <div className="prompt-card__author">
          <span className="prompt-card__author-name">{prompt.author || '—'}</span>
          {prompt.departmentName && (
            <span className="prompt-card__dept">· {prompt.departmentName}</span>
          )}
        </div>
        <div className="prompt-card__use-count" title={`Used ${prompt.useCount} times`}>
          {prompt.useCount} {prompt.useCount === 1 ? 'use' : 'uses'}
        </div>
      </div>

      <div className="prompt-card__rating">
        <StarRating
          value={prompt.qualityScore}
          ratings={prompt.qualityRatings}
          onRate={(score) => onRate(prompt.id, score)}
        />
      </div>

      <div className="prompt-card__footer">
        <span className="prompt-card__meta">{formatDate(prompt.createdAt)}</span>
        <div className="prompt-card__actions">
          <button
            className={`btn-copy${copied ? ' btn-copy--copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {canEdit && (
            <>
              <button className="btn-icon" onClick={() => onEdit(prompt)}>
                Edit
              </button>
              <button
                className={`btn-danger${deleteConfirm ? ' btn-danger--confirm' : ''}`}
                onClick={handleDeleteClick}
              >
                {deleteConfirm ? 'Confirm?' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
