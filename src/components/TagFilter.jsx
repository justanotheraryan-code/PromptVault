export default function TagFilter({ tags, activeTag, onSelect }) {
  if (tags.length === 0) return null

  return (
    <div className="tag-filter">
      <span className="tag-filter__label">// TAGS</span>
      {tags.map((tag) => (
        <button
          key={tag}
          className={`tag-chip${activeTag === tag ? ' tag-chip--active' : ''}`}
          onClick={() => onSelect(activeTag === tag ? null : tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
