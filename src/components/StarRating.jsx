import { useState } from 'react'

export default function StarRating({ value = 0, ratings = 0, onRate, readOnly = false, size = 'sm' }) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  function star(i) {
    const filled = display >= i
    const half = !filled && display >= i - 0.5
    return (
      <span
        key={i}
        className={`star-rating__star${filled ? ' star-rating__star--filled' : ''}${
          half ? ' star-rating__star--half' : ''
        }`}
        onMouseEnter={() => !readOnly && setHover(i)}
        onMouseLeave={() => !readOnly && setHover(0)}
        onClick={() => !readOnly && onRate?.(i)}
        role={readOnly ? undefined : 'button'}
        aria-label={readOnly ? undefined : `Rate ${i} stars`}
      >
        ★
      </span>
    )
  }

  return (
    <div className={`star-rating star-rating--${size}${readOnly ? ' star-rating--readonly' : ''}`}>
      <div className="star-rating__stars">{[1, 2, 3, 4, 5].map(star)}</div>
      {ratings > 0 ? (
        <span className="star-rating__count">
          {value.toFixed(1)} <span className="star-rating__count-muted">({ratings})</span>
        </span>
      ) : !readOnly ? (
        <span className="star-rating__count star-rating__count-muted">Rate quality</span>
      ) : (
        <span className="star-rating__count star-rating__count-muted">Unrated</span>
      )}
    </div>
  )
}
